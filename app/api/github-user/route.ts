interface Repo {
  name: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

// Fetch real contribution data using GitHub GraphQL API
async function fetchRealContributions(username: string, githubToken: string): Promise<number[]> {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { login: username } }),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch contribution data');
  }
  const result = await response.json();
  const weeks = result?.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
  // Flatten the weeks into a single array of days
  const days = weeks.flatMap((week: any) => week.contributionDays);
  // Get the last 365 days (GitHub returns 53 weeks sometimes)
  const last365 = days.slice(-365);
  return last365.map((day: any) => day.contributionCount);
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

    // Fetch real contribution data using GraphQL API
    let contributionData: number[] = [];
    try {
      contributionData = await fetchRealContributions(username, process.env.GITHUB_TOKEN!);
    } catch (e) {
      // fallback to empty array if error
      contributionData = [];
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
