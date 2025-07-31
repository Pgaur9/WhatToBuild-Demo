'use client';

import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { GitHubRepo } from '@/lib/github';
import { useRouter } from 'next/navigation';
import RepositoryTableRow from '@/components/RepositoryTableRow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import RepositoryCard from '@/components/RepositoryCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState('relevance');

  const sortedRepositories = useMemo(() => {
    const sorted = [...repositories];
    if (sortOrder === 'relevance') {
      sorted.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
    } else if (sortOrder === 'stars') {
      sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
    }
    return sorted;
  }, [repositories, sortOrder]);

  const fetchAndRankRepos = async (searchQuery: string, searchPage: number) => {
    try {
      // Step 1: Fetch repositories from GitHub
      console.log(`Fetching page ${searchPage} for query: "${searchQuery}"`);
      const searchResponse = await axios.get('/api/search-repos', {
        params: { query: searchQuery, page: searchPage },
      });
      console.log('[/api/search-repos] Response:', searchResponse.data);

      const newRepos: GitHubRepo[] = searchResponse.data.items;
      setHasMore(searchResponse.data.has_more);

      if (newRepos.length === 0) {
        if (searchPage === 1) {
            setRepositories([]);
        }
        return;
      }
      
      // Update state with initial search results
      setRepositories(prev => searchPage === 1 ? newRepos : [...prev, ...newRepos]);
      
      // Step 2: Rank the newly fetched repositories
      setIsRanking(true);
      console.log('Sending to /api/rank-repos:', newRepos.map(r => r.full_name));
      const rankResponse = await axios.post('/api/rank-repos', {
        repos: newRepos,
        query: searchQuery,
      });
      console.log('[/api/rank-repos] Response:', rankResponse.data);
      const rankedRepos: GitHubRepo[] = rankResponse.data;

      // Step 3: Merge ranked results back into the main list
      setRepositories(prev => {
        const repoMap = new Map(prev.map(repo => [repo.id, repo]));
        rankedRepos.forEach(rankedRepo => repoMap.set(rankedRepo.id, rankedRepo));
        const updatedRepos = Array.from(repoMap.values());
        console.log('Final merged and updated repos:', updatedRepos);
        // Sort the entire list by relevance score
        return updatedRepos.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
      });

    } catch (err) {
      console.error('Error in fetchAndRankRepos:', err);
      setError('Failed to fetch or rank repositories. Please check your API keys and try again.');
    } finally {
      setIsRanking(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setPage(1);
    setRepositories([]);
    setIsLoading(true);
    setError(null);

    await fetchAndRankRepos(query, 1);

    setIsLoading(false);
  };

  const handleLoadMore = async () => {
    if (!query || isLoading || isLoadingMore) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);

    await fetchAndRankRepos(query, nextPage);

    setPage(nextPage);
    setIsLoadingMore(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center my-8 md:my-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          Find Your Next Project
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Enter a concept to discover and analyze relevant open-source projects.
        </p>
      </header>

      <main>
        <form onSubmit={handleSearch} className="flex items-center max-w-2xl mx-auto mb-12">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'a chat app with react'"
            className="flex-grow p-4 text-lg bg-gray-800 border-gray-700 text-white focus:ring-cyan-500"
          />
          <Button type="submit" size="lg" className="ml-2 bg-cyan-600 hover:bg-cyan-700">
            <Search className="w-6 h-6 mr-2" />
            Search
          </Button>
        </form>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {sortedRepositories.length > 0 && (
          <div className="flex justify-end mb-4">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Sort by Relevance</SelectItem>
                <SelectItem value="stars">Sort by Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Repository Results Table */}
        {sortedRepositories.length > 0 && (
          <div className="bg-gray-900/30 border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50 border-b border-gray-700">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Repository
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Stars
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Match
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {sortedRepositories.map((repo) => (
                    <RepositoryTableRow key={repo.id} repo={repo} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(isLoading || isLoadingMore) && (
          <div className="text-center py-8">
            <p className="text-lg text-gray-400">Loading...</p>
          </div>
        )}

        {hasMore && !isLoading && !isLoadingMore && (
          <div className="text-center mt-8">
            <Button onClick={handleLoadMore} variant="outline" size="lg">
              Load More
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
