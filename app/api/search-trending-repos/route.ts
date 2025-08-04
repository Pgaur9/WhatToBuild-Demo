import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';
import { GeminiService } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'good first issue';
    const languageParam = searchParams.get('language');
    const language = languageParam === null ? undefined : languageParam;
    const page = parseInt(searchParams.get('page') || '1');
    
    // Create search query based on filter
    let query = filter;
    if (language) {
      query += ` language:${language}`;
    }
    
    // Split query into keywords
    const keywords = query.split(' ').filter(Boolean);
    
    // Search for repositories
    const githubService = new GitHubService();
    const repos = await githubService.searchRepositories(keywords, language, 100, page);
    
    // Use Gemini to rank repositories if we have results
    if (repos.length > 0) {
      try {
        const geminiService = new GeminiService();
        const rankedRepos = await geminiService.rankRepositories(repos, query);
        
        // Return ranked repositories
        return NextResponse.json({
          items: rankedRepos,
          has_more: repos.length === 10 // Assume there are more if we got a full page
        });
      } catch (rankError) {
        console.error('Error ranking repositories:', rankError);
        // Fall back to unranked repositories
        return NextResponse.json({
          items: repos,
          has_more: repos.length === 10
        });
      }
    } else {
      // No repositories found
      return NextResponse.json({
        items: [],
        has_more: false
      });
    }
  } catch (error) {
    console.error('Error searching trending repositories:', error);
    return NextResponse.json({ error: 'Failed to search trending repositories' }, { status: 500 });
  }
}