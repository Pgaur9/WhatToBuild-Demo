import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';
import { GeminiService } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repoFullName = searchParams.get('repo');

  if (!repoFullName) {
    return NextResponse.json({ error: 'Repository name is required' }, { status: 400 });
  }

  try {
    const githubService = new GitHubService();
    const readmeContent = await githubService.getReadme(repoFullName);
    
    const geminiService = new GeminiService();
    const { diagram, prompt } = await geminiService.generateArchitectureDiagram(readmeContent, repoFullName);

    return NextResponse.json({ diagram, prompt });
  } catch (error) {
    console.error(`Error visualizing repository ${repoFullName}:`, error);
    return NextResponse.json({ error: 'Failed to visualize repository' }, { status: 500 });
  }
}