import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repoFullName = searchParams.get('repo');
  const labels = searchParams.get('labels');
  const state = searchParams.get('state') as 'open' | 'closed' | 'all' || 'open';
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || '10');

  if (!repoFullName) {
    return NextResponse.json({ error: 'Repository name is required' }, { status: 400 });
  }

  try {
    const githubService = new GitHubService();
    
    // Get a larger sample first to get a better total count estimate
    const issues = await githubService.getRepositoryIssues(
      repoFullName, 
      state, 
      perPage, 
      page,
      labels || undefined
    );

    // For now, if we got a full page of results, estimate there might be more
    // This is a limitation of GitHub API - we can't get exact total count without
    // fetching all pages, which would be expensive
    let estimatedTotal = issues.length;
    if (issues.length === perPage) {
      // If we got a full page, there might be more - make a rough estimate
      estimatedTotal = Math.max(issues.length, perPage * 2);
    }
    
    return NextResponse.json({ 
      issues,
      total: estimatedTotal,
      page,
      perPage,
      hasMore: issues.length === perPage
    });
  } catch (error) {
    console.error('Error fetching repository issues with labels:', error);
    return NextResponse.json({ error: 'Failed to fetch repository issues' }, { status: 500 });
  }
}