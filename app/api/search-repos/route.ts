import { NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = searchParams.get('page');

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const githubService = new GitHubService();
    const keywords = query.split(' ').filter(Boolean);
    const pageNumber = page ? parseInt(page, 10) : 1;
    const repos = await githubService.searchRepositories(keywords, undefined, 100, pageNumber);

    // The GitHub API doesn't directly tell us if there are more pages,
    // but we can assume there are more if we get a full page of results.
    const has_more = repos.length === 10;

    return NextResponse.json({ items: repos, has_more });
  } catch (error) {
    console.error('Error searching repositories:', error);
    return NextResponse.json({ error: 'Failed to search repositories' }, { status: 500 });
  }
}
