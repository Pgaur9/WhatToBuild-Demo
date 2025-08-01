'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Users, Star, GitFork, Download, Share, Zap, Trophy, Code, Flame } from 'lucide-react';
import html2canvas from 'html2canvas';
import Image from 'next/image';
import { LucideIcon } from 'lucide-react';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  location: string;
  blog: string;
  company: string;
}

interface GitHubStats {
  totalStars: number;
  totalForks: number;
  languages: Record<string, number>;
  contributions: number;
  topRepos: Array<{
    name: string;
    stars: number;
    language: string;
  }>;
}

export default function ComparePage() {
  const [username1, setUsername1] = useState('');
  const [username2, setUsername2] = useState('');
  const [user1Data, setUser1Data] = useState<GitHubUser | null>(null);
  const [user2Data, setUser2Data] = useState<GitHubUser | null>(null);
  const [user1Stats, setUser1Stats] = useState<GitHubStats | null>(null);
  const [user2Stats, setUser2Stats] = useState<GitHubStats | null>(null);
  const [roastText, setRoastText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!username1.trim() || !username2.trim()) {
      setError('Please enter both usernames');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Fetch both users' data
      const [user1Response, user2Response] = await Promise.all([
        fetch(`/api/github-user?username=${username1.trim()}`),
        fetch(`/api/github-user?username=${username2.trim()}`)
      ]);

      if (!user1Response.ok || !user2Response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const user1Result = await user1Response.json();
      const user2Result = await user2Response.json();

      setUser1Data(user1Result.user);
      setUser2Data(user2Result.user);
      setUser1Stats(user1Result.stats);
      setUser2Stats(user2Result.stats);

      // Generate roast comparison
      const roastResponse = await fetch('/api/generate-roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1: user1Result,
          user2: user2Result
        })
      });

      if (roastResponse.ok) {
        const roastData = await roastResponse.json();
        setRoastText(roastData.roast);
      }

    } catch (err) {
      setError('Failed to fetch user data. Please check the usernames.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsImage = async () => {
    const element = document.getElementById('comparison-card');
    if (element) {
      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2
      });
      const link = document.createElement('a');
      link.download = `github-comparison-${username1}-vs-${username2}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    }
  };

  const shareToTwitter = () => {
    const text = `I just compared @${username1} vs @${username2} and the roast is real! 🔥 Who's the better dev? 🧠💻 #GitHubRoast #DevBattle`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      Go: '#00ADD8',
      Rust: '#dea584',
      PHP: '#4F5D95',
      Ruby: '#701516',
      Swift: '#ffac45',
    };
    return colors[language] || '#8b5cf6';
  };

  const getBadge = (user: GitHubUser, stats: GitHubStats) => {
    if (stats.totalStars > 1000) return { icon: Star, text: 'Star Hunter', color: 'text-yellow-400' };
    if (user.followers > 500) return { icon: Users, text: 'Influencer', color: 'text-purple-400' };
    if (user.public_repos > 50) return { icon: Code, text: 'Code Machine', color: 'text-blue-400' };
    if (stats.contributions > 500) return { icon: Flame, text: 'Commit Beast', color: 'text-red-400' };
    return { icon: Trophy, text: 'Rising Star', color: 'text-green-400' };
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #000000 40%, #2b092b 100%)",
        }}
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              GitHub Battle Arena
            </span>
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Compare two GitHub warriors and watch the sparks fly! 🔥
          </p>
          
          {/* Input Section */}
          <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 pointer-events-none rounded-2xl" />
            <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-10">
              <div className="flex-1">
                <label className="block text-white/80 text-sm font-medium mb-2">GitHub Username 1</label>
                <Input
                  placeholder="octocat"
                  value={username1}
                  onChange={(e) => setUsername1(e.target.value)}
                  className="bg-black/40 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="flex items-end justify-center">
                <div className="text-white/60 font-bold text-2xl">VS</div>
              </div>
              <div className="flex-1">
                <label className="block text-white/80 text-sm font-medium mb-2">GitHub Username 2</label>
                <Input
                  placeholder="torvalds"
                  value={username2}
                  onChange={(e) => setUsername2(e.target.value)}
                  className="bg-black/40 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>
            
            <Button
              onClick={handleCompare}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Preparing the Battle...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Start the Battle!
                </div>
              )}
            </Button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Comparison Results */}
        {user1Data && user2Data && user1Stats && user2Stats && (
          <div id="comparison-card" className="space-y-8">
            {/* Roast Section */}
            {roastText && (
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 pointer-events-none rounded-2xl" />
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-orange-500/30 to-red-500/20 blur-2xl opacity-40 -z-10 rounded-2xl" />
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <Flame className="w-8 h-8 text-red-400" />
                  <h2 className="text-3xl font-bold text-white">The Roast 🔥</h2>
                </div>
                
                <div className="text-lg text-white/90 leading-relaxed relative z-10 font-medium">
                  {roastText}
                </div>
              </div>
            )}

            {/* User Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User 1 Card */}
              <UserComparisonCard 
                user={user1Data} 
                stats={user1Stats} 
                badge={getBadge(user1Data, user1Stats)}
                getLanguageColor={getLanguageColor}
              />
              
              {/* User 2 Card */}
              <UserComparisonCard 
                user={user2Data} 
                stats={user2Stats} 
                badge={getBadge(user2Data, user2Stats)}
                getLanguageColor={getLanguageColor}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={downloadAsImage}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl"
              >
                <Download className="w-5 h-5 mr-2" />
                Download as Image
              </Button>
              
              <Button
                onClick={shareToTwitter}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl"
              >
                <Share className="w-5 h-5 mr-2" />
                Share on X (Twitter)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface UserComparisonCardProps {
  user: GitHubUser;
  stats: GitHubStats;
  badge: { icon: LucideIcon; text: string; color: string };
  getLanguageColor: (language: string) => string;
}

function UserComparisonCard({ user, stats, badge, getLanguageColor }: UserComparisonCardProps) {
  const BadgeIcon = badge.icon;
  
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden group hover:border-white/30 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/20 to-pink-500/10 blur-2xl opacity-30 -z-10 rounded-2xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Image
            src={user.avatar_url}
            alt={user.name || user.login}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full border-2 border-white/20"
          />
          <div>
            <h3 className="text-2xl font-bold text-white">{user.name || user.login}</h3>
            <p className="text-white/70">@{user.login}</p>
            <div className={`flex items-center gap-2 mt-2 ${badge.color}`}>
              <BadgeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-white/80 mb-6 text-sm leading-relaxed">{user.bio}</p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Github className="w-4 h-4 text-white/60" />
              <span className="text-white/60 text-xs">Repositories</span>
            </div>
            <div className="text-xl font-bold text-white">{user.public_repos}</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-white/60" />
              <span className="text-white/60 text-xs">Followers</span>
            </div>
            <div className="text-xl font-bold text-white">{user.followers}</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-white/60" />
              <span className="text-white/60 text-xs">Total Stars</span>
            </div>
            <div className="text-xl font-bold text-white">{stats.totalStars}</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <GitFork className="w-4 h-4 text-white/60" />
              <span className="text-white/60 text-xs">Total Forks</span>
            </div>
            <div className="text-xl font-bold text-white">{stats.totalForks}</div>
          </div>
        </div>

        {/* Languages */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Top Languages</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.languages).slice(0, 5).map(([lang]) => (
              <div
                key={lang}
                className="px-3 py-1 rounded-full text-xs font-medium text-white bg-white/10 border border-white/20"
                style={{ backgroundColor: getLanguageColor(lang) + '20', borderColor: getLanguageColor(lang) + '40' }}
              >
                {lang}
              </div>
            ))}
          </div>
        </div>

        {/* Top Repos */}
        <div>
          <h4 className="text-white font-medium mb-3">Top Repositories</h4>
          <div className="space-y-2">
            {stats.topRepos.slice(0, 3).map((repo, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="text-white font-medium text-sm">{repo.name}</div>
                  <div className="text-white/60 text-xs">{repo.language}</div>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3 h-3" />
                  <span className="text-xs">{repo.stars}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
