'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GitHubRepo } from '@/lib/github';
import { BarChart3, Search, ExternalLink, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RepositoryTableProps {
  repositories: GitHubRepo[];
  onViewDetails?: (repo: GitHubRepo) => void;
}

export default function RepositoryTable({ repositories, onViewDetails }: RepositoryTableProps) {
  const router = useRouter();

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-lg relative group animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <Table>
        <TableHeader>
          <TableRow className="bg-black/50 border-b border-white/10 hover:bg-black/50">
            <TableHead className="text-left py-4 px-6 text-sm font-semibold text-white/90 uppercase tracking-wider w-2/5">
              Repository
            </TableHead>
            <TableHead className="text-left py-4 px-4 text-sm font-semibold text-white/90 uppercase tracking-wider hidden sm:table-cell w-1/6">
              Language
            </TableHead>
            <TableHead className="text-left py-4 px-4 text-sm font-semibold text-white/90 uppercase tracking-wider hidden sm:table-cell w-1/6">
              Stars
            </TableHead>
            <TableHead className="text-left py-4 px-4 text-sm font-semibold text-white/90 uppercase tracking-wider hidden md:table-cell w-1/6">
              Relevance
            </TableHead>
            <TableHead className="text-right py-4 px-6 text-sm font-semibold text-white/90 uppercase tracking-wider w-1/4">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-white/10">
          {repositories.map((repo, index) => (
            <TableRow key={repo.id || index} className="hover:bg-white/5 transition-all duration-300 group border-b border-white/10 backdrop-blur-sm relative overflow-hidden animate-in fade-in slide-in-from-left-2 duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              
              <TableCell className="py-4 px-6 w-2/5">
                <div className="flex flex-col max-w-full">
                  <h3 
                    className="text-lg font-semibold text-white group-hover:text-white/90 transition-colors cursor-pointer hover:underline truncate"
                    onClick={() => onViewDetails && onViewDetails(repo)}
                  >
                    {repo.full_name || repo.name}
                  </h3>
                  <p className="text-white/70 text-sm mt-1 line-clamp-2 max-w-full overflow-hidden">
                    {repo.description ? 
                      (repo.description.length > 80 ? `${repo.description.substring(0, 80)}...` : repo.description) 
                      : 'No description available'
                    }
                  </p>
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 max-w-full overflow-hidden">
                      {repo.topics.slice(0, 2).map((topic) => (
                        <span key={topic} className="bg-white/10 backdrop-blur-xl border border-white/20 text-white/80 px-2 py-0.5 rounded-full text-xs shadow-sm hover:bg-white/15 hover:border-white/30 transition-all duration-300">
                          {topic}
                        </span>
                      ))}
                      {repo.topics.length > 2 && (
                        <span className="text-white/50 text-xs px-2 py-0.5">
                          +{repo.topics.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-4 hidden sm:table-cell w-1/6">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-white/60 mr-2 shadow-sm"></span>
                  <span className="text-white/80 text-sm">
                    {repo.language || 'Unknown'}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-4 hidden sm:table-cell w-1/6">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span className="text-white font-medium">
                    {repo.stargazers_count.toLocaleString()}
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="py-4 px-4 hidden md:table-cell w-1/6">
                {repo.relevance_score ? (
                  <div className="flex items-center">
                    <div className="w-16 bg-white/20 rounded-full h-2 mr-2 backdrop-blur-sm border border-white/10">
                      <div 
                        className="bg-gradient-to-r from-white/60 to-white/80 h-2 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${repo.relevance_score * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white/90 text-sm font-medium">
                      {Math.round(repo.relevance_score * 100)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-white/50 text-sm">-</span>
                )}
              </TableCell>
              
              <TableCell className="py-4 px-6 text-right w-1/4">
                <div className="flex gap-2 justify-end items-center">
                  <button
                    onClick={() => router.push(`/visualize?repo=${encodeURIComponent(repo.full_name)}`)}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 text-white/80 hover:bg-white/15 hover:border-white/30 hover:text-white px-3 py-1.5 rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium flex items-center space-x-1 shadow-sm"
                    title="Generate Architecture Diagram"
                  >
                    <BarChart3 className="w-4 h-4 text-white/70 hidden sm:inline" />
                    <span>Visualize</span>
                  </button>
                  <button
                    onClick={() => router.push(`/analyze?repo=${encodeURIComponent(repo.full_name)}`)}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 text-white/80 hover:bg-white/15 hover:border-white/30 hover:text-white px-3 py-1.5 rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium flex items-center space-x-1 shadow-sm"
                    title="Analyze Repository Structure"
                  >
                    <Search className="w-4 h-4 text-white/70 hidden sm:inline" />
                    <span>Analyze</span>
                  </button>
                  <a
                    href={`https://github.com/${repo.full_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 backdrop-blur-xl border border-white/20 text-white/80 hover:bg-white/15 hover:border-white/30 hover:text-white px-3 py-1.5 rounded-xl transition-all duration-300 text-xs sm:text-sm font-medium flex items-center space-x-1 shadow-sm"
                    title="View on GitHub"
                  >
                    <ExternalLink className="w-4 h-4 text-white/70 hidden sm:inline" />
                    <span>GitHub</span>
                  </a>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
