'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileCode2 } from 'lucide-react';

interface FileSummary {
  path: string;
  summary: string;
}

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const repoFullName = searchParams.get('repo');

  const [summaries, setSummaries] = useState<FileSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (repoFullName) {
      const fetchAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get(`/api/analyze-repo?repo=${repoFullName}`);
          setSummaries(response.data.summaries);
        } catch (err) {
          console.error('Failed to fetch analysis:', err);
          setError('Could not analyze the repository. It may be private, empty, or an unexpected error occurred.');
        }
        setIsLoading(false);
      };

      fetchAnalysis();
    }
  }, [repoFullName]);

  if (!repoFullName) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-500">Error: Repository not specified.</h1>
        <p>Please go back and select a repository to analyze.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">File Analysis: <span className="text-green-400">{repoFullName}</span></h1>
      <p className="text-lg text-gray-400 mb-8">
        AI-generated summaries for key files in the repository.
      </p>

      <div className="w-full">
        {isLoading && (
          <div className="border-2 border-dashed border-gray-700 bg-gray-900/20 rounded-lg min-h-[500px] flex items-center justify-center p-8">
            <p className="text-gray-400 text-xl animate-pulse">AI is analyzing the repository files...</p>
          </div>
        )}
        {error && <p className="text-red-500 text-center p-8 bg-red-900/20 rounded-lg">{error}</p>}
        {!isLoading && !error && (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {summaries.map((file, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-gray-900/50 border border-gray-700 rounded-lg px-4">
                <AccordionTrigger className="text-lg font-mono text-left hover:no-underline">
                  <div className="flex items-center gap-3">
                    <FileCode2 className="w-5 h-5 text-cyan-400" />
                    {file.path}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base pl-8 pt-2 pb-4">
                  {file.summary}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </main>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-xl">Loading Repository...</div>}> 
      <AnalyzePageContent />
    </Suspense>
  );
}
