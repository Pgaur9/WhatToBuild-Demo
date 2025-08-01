interface Repo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

// Generate mock contribution data (in a real app, you'd use GitHub's GraphQL API for accurate data)
function generateMockContributions(baseActivity: number): number[] {
  const days = 365;
  const data = [];
  const intensity = Math.max(0.1, baseActivity / 100);
  
  for (let i = 0; i < days; i++) {
    // Generate realistic contribution patterns
    const dayOfWeek = i % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseContributions = isWeekend ? 0.3 : 1.0;
    
    const contributions = Math.floor(
      Math.random() * 10 * intensity * baseContributions + 
      (Math.random() > 0.8 ? Math.random() * 5 : 0)
    );
    
    data.push(Math.min(contributions, 20)); // Cap at 20 contributions per day
  }
  
  return data;
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = await userResponse.json();

    // Fetch user's repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=100`, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const repos: Repo[] = await reposResponse.json();

    // Fetch contribution data (last year)
    const contributionResponse = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    let contributionData = [];
    if (contributionResponse.ok) {
      const events = await contributionResponse.json();
      // Generate mock contribution data for visualization (in a real app, you'd use GitHub's GraphQL API)
      contributionData = generateMockContributions(events.length);
    } else {
      contributionData = generateMockContributions(0);
    }

    // Calculate stats
    const stats = {
      totalStars: repos.reduce((sum: number, repo: Repo) => sum + repo.stargazers_count, 0),
      totalForks: repos.reduce((sum: number, repo: Repo) => sum + repo.forks_count, 0),
      languages: repos.reduce((langs: Record<string, number>, repo: Repo) => {
        if (repo.language) {
          langs[repo.language] = (langs[repo.language] || 0) + 1;
        }
        return langs;
      }, {}),
      contributions: contributionData.reduce((sum: number, day: number) => sum + day, 0),
      contributionData,
      topRepos: repos
        .sort((a: Repo, b: Repo) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
        .map((repo: Repo) => ({
          name: repo.name,
          stars: repo.stargazers_count,
          language: repo.language || 'Unknown',
        })),
    };

    return NextResponse.json({ user, stats });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
