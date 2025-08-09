"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { default as ReactMarkdown } from "react-markdown";
import {
  Github,
  FileText,
  Eye,
  Pencil,
  KeyRound,
  Copy,
  Download,
  RefreshCw,
  Loader2,
  Info,
} from "lucide-react";

export default function ReadmePage() {
  const [repo, setRepo] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [markdown, setMarkdown] = useState<string>("\n# README\n\nStart by generating a README from your repository, then edit here. ✨\n");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [githubToken, setGithubToken] = useState<string>("");

  // Load token from localStorage for convenience
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wtb_github_token");
      if (saved) setGithubToken(saved);
    } catch {}
  }, []);

  const handleSaveToken = () => {
    try {
      if (githubToken) localStorage.setItem("wtb_github_token", githubToken);
      else localStorage.removeItem("wtb_github_token");
    } catch {}
    setShowTokenDialog(false);
  };

  const handleGenerate = async () => {
    if (!repo.trim()) {
      setError("Please enter a GitHub repo URL or owner/repo.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-readme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, githubToken: githubToken || undefined, userNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate README");
      setMarkdown(data.markdown || "");
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 pt-24 md:pt-32">
      {/* Ambient background effects to match search page */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-60 pointer-events-none" />

      <header className="text-center mt-24 md:mt-32 mb-8 md:mb-12">
        <div className="relative inline-block">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Generate a Great README
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 blur-xl opacity-50 -z-10"></div>
        </div>
        <p className="mt-4 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Paste a GitHub repository URL or owner/repo. Analyze the codebase and draft a polished README. Edit and preview live.
        </p>
      </header>

      <main>
        {/* Repo input */}
        <div className="relative max-w-3xl mx-auto mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-black/30 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/20 group transition-all duration-300 hover:border-white/30 hover:bg-black/40 focus-within:border-white/40 focus-within:bg-black/50">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
            <div className="flex items-center gap-2 p-1">
              <Github className="w-5 h-5 text-white/60 ml-3" />
              <Input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="e.g., facebook/react or https://github.com/facebook/react"
                className="flex-grow p-6 text-lg bg-transparent border-0 text-white/90 placeholder:text-white/40 focus-visible:ring-0 focus-visible:outline-none"
              />
              <Button
                onClick={() => setShowTokenDialog(true)}
                className="m-2 bg-black/50 hover:bg-black/70 text-white/90 font-medium border border-white/20 hover:border-white/30 backdrop-blur-xl px-4"
                type="button"
              >
                <KeyRound className="w-4 h-4 mr-2" /> Private
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="m-2 bg-black/50 hover:bg-black/70 text-white/90 font-medium border border-white/20 hover:border-white/30 backdrop-blur-xl px-6"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" /> Generate
                  </>
                )}
              </Button>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/10 to-white/0 blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 -z-10"></div>
          </div>
          <div className="text-center mt-3 text-sm text-white/50">
            Repos that are private require a GitHub token with repo read access. We never send your token to the client API provider; it is only used server-side to read your repo.
          </div>
        </div>

        {/* Optional notes to guide README */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="rounded-2xl bg-black/30 backdrop-blur-2xl border border-white/20 p-4">
            <label className="block text-sm text-white/60 mb-2">Optional notes or preferences</label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Anything specific to include (badges, tech stack, deployment steps, screenshots, etc.)"
              className="w-full min-h-24 resize-y bg-transparent text-white/90 placeholder:text-white/40 outline-none"
            />
          </div>
        </div>

        {/* Editor + Preview */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="relative rounded-2xl bg-black/30 backdrop-blur-2xl border border-white/20 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white/80">
                <Pencil className="w-4 h-4" />
                <span className="text-sm font-medium">Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-white/70 hover:text-white" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-1" /> Copy
                </Button>
                <Button variant="ghost" className="text-white/70 hover:text-white" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-1" /> Download
                </Button>
              </div>
            </div>
            <Separator className="bg-white/10 mb-3" />
            {isGenerating ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-2/3 bg-white/10" />
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-11/12 bg-white/10" />
                <Skeleton className="h-4 w-5/6 bg-white/10" />
                <Skeleton className="h-64 md:h-[28rem] w-full bg-white/10" />
              </div>
            ) : (
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="flex-1 w-full resize-none min-h-[420px] md:min-h-[620px] bg-transparent text-white/90 placeholder:text-white/40 outline-none"
                placeholder="# Your Awesome Project\n\nWrite your README here..."
              />
            )}
          </div>

          <div className="relative rounded-2xl bg-black/30 backdrop-blur-2xl border border-white/20 p-4 overflow-auto">
            <div className="flex items-center gap-2 text-white/80 mb-3">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Preview</span>
            </div>
            <Separator className="bg-white/10 mb-3" />
            {isGenerating ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/2 bg-white/10" />
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-10/12 bg-white/10" />
                <Skeleton className="h-4 w-9/12 bg-white/10" />
                <Skeleton className="h-64 md:h-[28rem] w-full bg-white/10" />
              </div>
            ) : (
              <article className="prose prose-invert max-w-none">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </article>
            )}
          </div>
        </section>

        {error && (
          <div className="max-w-3xl mx-auto mt-6 text-center text-sm text-red-400">
            {error}
          </div>
        )}
      </main>

      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Ambient overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />

          {/* Floating glow orbs */}
          <div className="absolute w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl -top-10 -left-10 animate-pulse" />
          <div className="absolute w-72 h-72 rounded-full bg-purple-500/20 blur-3xl bottom-10 right-10 animate-pulse" />

          {/* Glass card */}
          <div className="relative mx-4 md:mx-0 w-full max-w-md rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Animated border shimmer */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -inset-[1px] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.15),transparent)] animate-spin-slow" />
            </div>

            <div className="relative p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/5">
                <Loader2 className="h-6 w-6 text-white/90 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-white">Analyzing Repository</h3>
              <p className="mt-1 text-sm text-white/70">Reading project structure and drafting a polished README…</p>
              <div className="mt-6 flex items-center gap-2 justify-center text-xs text-white/60">
                <div className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce" />
                <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
                <div className="h-1.5 w-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Token dialog */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent className="bg-black/70 backdrop-blur-xl border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Connect GitHub (Private Repos)</DialogTitle>
            <DialogDescription className="text-white/60">
              Provide a GitHub Personal Access Token with read access to the repository. We use it server-side only to fetch your code for analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-sm text-white/70">Personal Access Token</label>
            <Input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_************************************"
              className="bg-black/40 border-white/20 text-white"
            />
            <div className="text-xs text-white/50">
              Create a token at Settings → Developer settings → Personal access tokens. Scope required: repo (read). You can remove it after use.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" className="text-white/80" onClick={() => setShowTokenDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 text-white" onClick={handleSaveToken}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

