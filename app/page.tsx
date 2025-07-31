'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { ArrowRight, BrainCircuit, GitGraph, FileText } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              Unlock Open-Source Intelligence
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
              Stop guessing. Start analyzing. Find relevant GitHub repositories by concept, visualize their architecture, and understand their codebase with the power of AI.
            </p>
            <Link href="/search" passHref>
              <Button size="lg" className="mt-8 bg-cyan-600 hover:bg-cyan-700 text-white text-lg px-8 py-6">
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why You'll Love This Tool</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BrainCircuit className="w-12 h-12 text-cyan-400" />}
                title="AI-Powered Ranking"
                description="Find the most relevant projects for your needs. Our AI ranks repositories based on your conceptual query, not just keywords."
              />
              <FeatureCard
                icon={<GitGraph className="w-12 h-12 text-purple-400" />}
                title="Architecture Visualization"
                description="Instantly generate and edit interactive architecture diagrams from a repository's README. Understand complex systems at a glance."
              />
              <FeatureCard
                icon={<FileText className="w-12 h-12 text-green-400" />}
                title="Codebase Analysis"
                description="Get a high-level overview of any repository. Our tool provides AI-generated summaries for each key file, explaining its purpose."
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
