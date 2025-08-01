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

    const repos = await reposResponse.json();

    // Calculate stats
    const stats = {
      totalStars: repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0),
      totalForks: repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0),
      languages: repos.reduce((langs: Record<string, number>, repo: any) => {
        if (repo.language) {
          langs[repo.language] = (langs[repo.language] || 0) + 1;
        }
        return langs;
      }, {}),
      contributions: Math.floor(Math.random() * 1000) + 100, // Placeholder for contribution count
      topRepos: repos
        .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
        .map((repo: any) => ({
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
