'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GitHubRepo } from '@/lib/github';

interface RepositoryTableRowProps {
  repo: GitHubRepo;
}

export default function RepositoryTableRow({ repo }: RepositoryTableRowProps) {
  const router = useRouter();

  return (
    <tr className="hover:bg-gray-800/30 transition-colors group">
      <td className="py-4 px-6">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
            {repo.full_name}
          </h3>
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
            {repo.description || 'No description available'}
          </p>
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {repo.topics.slice(0, 3).map((topic) => (
                <span key={topic} className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-xs">
                  {topic}
                </span>
              ))}
              {repo.topics.length > 3 && (
                <span className="text-gray-500 text-xs px-2 py-1">
                  +{repo.topics.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
          <span className="text-gray-300 text-sm">
            {repo.language || 'Unknown'}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center text-yellow-400">
          <span className="mr-1">⭐</span>
          <span className="text-white font-medium">
            {repo.stargazers_count.toLocaleString()}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        {repo.relevance_score ? (
          <div className="flex items-center">
            <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${repo.relevance_score * 100}%` }}
              ></div>
            </div>
            <span className="text-purple-300 text-sm font-medium">
              {Math.round(repo.relevance_score * 100)}%
            </span>
          </div>
        ) : (
          <span className="text-gray-500 text-sm">-</span>
        )}
      </td>
      <td className="py-4 px-6">
        <div className="flex space-x-2 justify-end">
          <button
            onClick={() => router.push(`/visualize?repo=${encodeURIComponent(repo.full_name)}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
            title="Generate Architecture Diagram"
          >
            <span>📊</span>
            <span>Visualize</span>
          </button>
          <button
            onClick={() => router.push(`/analyze?repo=${encodeURIComponent(repo.full_name)}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
            title="Analyze Repository Structure"
          >
            <span>🔍</span>
            <span>Analyze</span>
          </button>
          <a
            href={`https://github.com/${repo.full_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
            title="View on GitHub"
          >
            <span>🔗</span>
            <span>GitHub</span>
          </a>
        </div>
      </td>
    </tr>
  );
}
