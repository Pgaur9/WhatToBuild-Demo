import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';
import { GeminiService } from '@/lib/gemini';

// List of common source code extensions to prioritize for analysis
const SOURCE_CODE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', // JavaScript/TypeScript
  '.py', // Python
  '.go', // Go
  '.java', // Java
  '.cs', // C#
  '.rb', // Ruby
  '.php', // PHP
  '.rs', // Rust
  '.c', '.cpp', '.h', '.hpp', // C/C++
  '.swift', // Swift
  '.kt', '.kts', // Kotlin
  'Dockerfile',
  'Makefile',
  '.yml', '.yaml', // Config files
  '.json',
  '.md' // Markdown files
];

const MAX_FILES_TO_ANALYZE = 25;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repoFullName = searchParams.get('repo');

  if (!repoFullName) {
    return NextResponse.json({ error: 'Repository name is required' }, { status: 400 });
  }

  const [owner, repo] = repoFullName.split('/');
  const github = new GitHubService();
  const gemini = new GeminiService();

  try {
    // 1. Get the full file tree
    const fileTree = await github.getFullFileTree(repoFullName);

    // 2. Filter for relevant source code files and limit the count
    const relevantFiles = fileTree
      .filter(file => SOURCE_CODE_EXTENSIONS.some(ext => file.path.endsWith(ext)))
      .slice(0, MAX_FILES_TO_ANALYZE);

    if (relevantFiles.length === 0) {
      return NextResponse.json({ summaries: [], message: 'No relevant source code files were found to analyze.' });
    }

    // 3. Fetch content for each relevant file
    const filesWithContent = await Promise.all(
      relevantFiles.map(async (file) => {
        try {
          const content = await github.getFileContent(owner, repo, file.path);
          // Return null for empty files so they can be filtered out
          if (content === null) return null;
          return { path: file.path, content };
        } catch (error) {
          console.warn(`Could not fetch content for ${file.path}, skipping.`);
          return null; // Skip files that fail to fetch
        }
      })
    );

    const validFiles = filesWithContent.filter(f => f !== null) as { path: string; content: string }[];

    if (validFiles.length === 0) {
      throw new Error('Could not fetch content for any of the relevant files.');
    }

    // 4. Use Gemini to summarize the files
    const summaries = await gemini.summarizeFiles(validFiles);

    return NextResponse.json({ summaries });

  } catch (error) {
    console.error(`[ANALYZE_REPO_API] Error analyzing ${repoFullName}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
    return NextResponse.json({ error: `Failed to analyze repository: ${errorMessage}` }, { status: 500 });
  }
}
