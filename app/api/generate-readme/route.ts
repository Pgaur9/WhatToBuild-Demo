import { NextRequest, NextResponse } from 'next/server';

// Helper: parse owner/repo from URL or raw string
function parseRepo(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  // Match full GitHub URL
  const urlMatch = trimmed.match(/https?:\/\/github\.com\/(?:#?@)?([^\/?#]+)\/([^\/?#]+)(?:\.git)?/i);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };

  // Match owner/repo format
  const simpleMatch = trimmed.match(/^([^\s\/]+)\/([^\s\/]+)$/);
  if (simpleMatch) return { owner: simpleMatch[1], repo: simpleMatch[2] };

  return null;
}

// GitHub API helpers
async function githubRequest<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'WhatToBuild-Readme-Generator'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(`https://api.github.com${path}`, { headers, ...init });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GitHub API ${resp.status}: ${text}`);
  }
  return resp.json() as Promise<T>;
}

// Fetch a list of candidate file paths using git trees API (recursive)
async function getCandidateFiles(owner: string, repo: string, token?: string): Promise<Array<{ path: string; size?: number }>> {
  // Get default branch
  const repoInfo = await githubRequest<{ default_branch: string }>(`/repos/${owner}/${repo}` , token);
  const branch = repoInfo.default_branch || 'main';

  // Get tree recursively
  const tree = await githubRequest<{ tree: Array<{ path: string; type: string; size?: number }> }>(
    `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    token
  );

  // Filter files of interest and limit count/size
  const exts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go', '.rb', '.java', '.cs', '.php', '.kt', '.swift', '.md', '.json', '.yml', '.yaml'];
  const importantNames = ['README.md', 'readme.md', 'package.json', 'requirements.txt', 'pyproject.toml', 'Cargo.toml', 'go.mod', 'pom.xml', 'composer.json', 'Makefile', 'Dockerfile', 'docker-compose.yml', 'pnpm-lock.yaml', 'yarn.lock'];

  const files = tree.tree.filter(n => n.type === 'blob').map(n => ({ path: n.path, size: n.size }))
    .filter(f => importantNames.includes(f.path.split('/').pop() || '') || exts.some(e => f.path.endsWith(e)));

  // Prioritize docs and root files
  const scored = files.map(f => {
    let score = 0;
    const p = f.path.toLowerCase();
    if (p === 'readme.md') score += 100;
    if (p.includes('readme')) score += 20;
    if (p.startsWith('docs/')) score += 30;
    if (!p.includes('/')) score += 25; // root files
    if (p.endsWith('.md')) score += 15;
    if (p.endsWith('package.json')) score += 40;
    if (p.endsWith('dockerfile')) score += 20;
    if (p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js') || p.endsWith('.jsx')) score += 5;
    return { ...f, score };
  })
  .sort((a, b) => b.score - a.score);

  // Limit total files and cumulative size to keep prompt manageable
  const MAX_FILES = 40;
  const MAX_TOTAL_BYTES = 600_000; // ~600KB
  const selected: Array<{ path: string; size?: number }> = [];
  let total = 0;
  for (const f of scored) {
    const size = f.size ?? 0;
    if (selected.length >= MAX_FILES) break;
    if (size > 150_000) continue; // skip very large files
    if (total + size > MAX_TOTAL_BYTES) continue;
    selected.push({ path: f.path, size });
    total += size;
  }
  return selected;
}

async function getFileContent(owner: string, repo: string, path: string, token?: string): Promise<string> {
  // Use contents API which returns base64 for blobs
  const data = await githubRequest<{ content?: string; encoding?: string; download_url?: string; type: string }>(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    token
  );
  if (data.type !== 'file') return '';
  if (data.content && data.encoding === 'base64') {
    try {
      // Node at edge runtime may not have Buffer; use atob polyfill alternative
      const buff = Buffer.from(data.content, 'base64');
      return buff.toString('utf-8');
    } catch {
      // Fallback to direct download
      if (data.download_url) {
        const resp = await fetch(data.download_url);
        return await resp.text();
      }
    }
  }
  if (data.download_url) {
    const resp = await fetch(data.download_url);
    return await resp.text();
  }
  return '';
}

function buildPrompt(repoFullName: string, repoMeta: any, files: Array<{ path: string; content: string }>) {
  const metaSnippet = `Repository: ${repoFullName}\nDescription: ${repoMeta?.description ?? ''}\nStars: ${repoMeta?.stargazers_count ?? 'N/A'}\nLanguage: ${repoMeta?.language ?? 'N/A'}`;
  const fileSummaries = files.map(f => `---\nPath: ${f.path}\n\n${f.content.substring(0, 4000)}`).join('\n\n');

  return `You are an expert open-source maintainer. Generate a comprehensive, professional README.md for the repository below.\n\nRequirements:\n- Clear title and short description\n- Badges (e.g., build, license, npm/pypi if applicable)\n- Table of Contents\n- Features\n- Architecture overview\n- Tech stack\n- Getting Started (installation, prerequisites)\n- Configuration (env variables)\n- Usage with code examples\n- Project structure\n- Roadmap or TODO\n- Contributing\n- Testing\n- License\n- Acknowledgements\n\nWrite in Markdown, use headings and code fences. Prefer concise, actionable content. Derive details from the provided files and metadata. If something is unknown, suggest sensible defaults and placeholders.\n\n${metaSnippet}\n\nProject files (samples):\n${fileSummaries}`;
}

export async function POST(req: NextRequest) {
  try {
    const { repo, githubToken, userNotes } = await req.json();
    if (!repo || typeof repo !== 'string') {
      return NextResponse.json({ error: 'Missing repo parameter' }, { status: 400 });
    }

    const parsed = parseRepo(repo);
    if (!parsed) return NextResponse.json({ error: 'Invalid GitHub repo. Use URL or owner/repo.' }, { status: 400 });

    const { owner, repo: repoName } = parsed;

    // Basic repo metadata (also validates private access if token provided)
    const repoMeta = await githubRequest<any>(`/repos/${owner}/${repoName}`, githubToken);

    // Collect candidate files and fetch contents
    const candidates = await getCandidateFiles(owner, repoName, githubToken);
    const files: Array<{ path: string; content: string }> = [];
    for (const f of candidates) {
      try {
        const content = await getFileContent(owner, repoName, f.path, githubToken);
        if (content) files.push({ path: f.path, content });
      } catch (e) {
        // Skip unreadable files
      }
    }

    // Build prompt
    const basePrompt = buildPrompt(`${owner}/${repoName}`, repoMeta, files);
    const finalPrompt = userNotes && typeof userNotes === 'string' && userNotes.trim().length
      ? `${basePrompt}\n\nAdditional author notes/preferences:\n${userNotes}`
      : basePrompt;

    // Call Gemini server-side using env key
    const apiKey = process.env.GEMINI_API_KEY_SECOND;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server misconfigured: GEMINI_API_KEY_SECOND missing' }, { status: 500 });
    }

    const geminiResp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: finalPrompt }] }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096
        }
      })
    });

    if (!geminiResp.ok) {
      const text = await geminiResp.text();
      return NextResponse.json({ error: `Gemini error ${geminiResp.status}: ${text}` }, { status: 500 });
    }

    const data = await geminiResp.json();
    // Extract text from Gemini response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      return NextResponse.json({ error: 'Empty response from Gemini' }, { status: 500 });
    }

    return NextResponse.json({ markdown: text });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}
