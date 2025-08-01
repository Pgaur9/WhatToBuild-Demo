'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Users, Star, GitFork, Download, Share, Zap, Trophy, Code, Flame, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import Image from 'next/image';
import { LucideIcon } from 'lucide-react';
import ContributionGraph from '@/components/ContributionGraph';
import './page.css';

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
  contributionData: number[];
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
  const [showResults, setShowResults] = useState(false);

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
      } else {
        console.error('Failed to generate roast:', roastResponse.status);
        // Set a fallback roast if the API fails
        setRoastText(`🔥 **${user1Result.user.login}** vs **${user2Result.user.login}** 
        
The battle data has been analyzed! Check out the brutal comparison above! 💀`);
      }

      setShowResults(true);

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
      try {
        // Create a temporary wrapper for better image composition
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          padding: 40px;
          border-radius: 24px;
          width: fit-content;
          max-width: 1200px;
          margin: 0 auto;
          font-family: system-ui, -apple-system, sans-serif;
        `;
        
        // Clone the content
        const clonedElement = element.cloneNode(true) as HTMLElement;
        clonedElement.style.background = 'transparent';
        wrapper.appendChild(clonedElement);
        
        // Temporarily add to document for measurement
        document.body.appendChild(wrapper);
        
        const canvas = await html2canvas(wrapper, {
          backgroundColor: '#000000',
          scale: 2,
          width: wrapper.scrollWidth,
          height: wrapper.scrollHeight,
          useCORS: true,
          allowTaint: false,
          foreignObjectRendering: false,
          removeContainer: true,
          logging: false,
        });
        
        // Remove temporary element
        document.body.removeChild(wrapper);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `github-battle-${username1}-vs-${username2}.png`;
        link.href = canvas.toDataURL('image/png', 0.95);
        link.click();
      } catch (error) {
        console.error('Failed to generate image:', error);
        // Fallback to simple screenshot
        const canvas = await html2canvas(element, {
          backgroundColor: '#000000',
          scale: 2,
        });
        const link = document.createElement('a');
        link.download = `github-battle-${username1}-vs-${username2}.png`;
        link.href = canvas.toDataURL('image/png', 0.95);
        link.click();
      }
    }
  };

  const shareToTwitter = async () => {
    const element = document.getElementById('comparison-card');
    if (element) {
      try {
        // Generate image for sharing
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          padding: 40px;
          border-radius: 24px;
          width: fit-content;
          max-width: 1200px;
          margin: 0 auto;
          font-family: system-ui, -apple-system, sans-serif;
        `;
        
        const clonedElement = element.cloneNode(true) as HTMLElement;
        clonedElement.style.background = 'transparent';
        wrapper.appendChild(clonedElement);
        document.body.appendChild(wrapper);
        
        const canvas = await html2canvas(wrapper, {
          backgroundColor: '#000000',
          scale: 2,
          width: wrapper.scrollWidth,
          height: wrapper.scrollHeight,
        });
        
        document.body.removeChild(wrapper);
        
        // Convert to blob and create object URL
        canvas.toBlob((blob) => {
          if (blob) {
            const imageUrl = URL.createObjectURL(blob);
            
            // For now, just share the text with a call to action to visit the site
            const text = `🔥 BRUTAL GitHub Battle: @${username1} vs @${username2}! 

The roast is ABSOLUTELY SAVAGE! 💀 

Who's the better dev? The results will shock you! 👑

#GitHubBattle #DevRoast #CodingShowdown #GitHubWarriors

Check out the full battle at:`;
            
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
            
            // Clean up the object URL after a delay
            setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
          }
        }, 'image/png', 0.95);
        
      } catch (error) {
        console.error('Failed to prepare image for sharing:', error);
        // Fallback to text-only sharing
        const text = `🔥 BRUTAL GitHub Battle: @${username1} vs @${username2}! The roast is SAVAGE! 💀 Who's the better dev? 👑 #GitHubBattle #DevRoast #CodingShowdown`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    }
  };

  const resetBattle = () => {
    setShowResults(false);
    setUser1Data(null);
    setUser2Data(null);
    setUser1Stats(null);
    setUser2Stats(null);
    setRoastText('');
    setUsername1('');
    setUsername2('');
    setError('');
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
    return colors[language] || '#64748b';
  };

  const getBadge = (user: GitHubUser, stats: GitHubStats) => {
    if (stats.totalStars > 1000) return { icon: Star, text: 'Star Hunter', color: 'text-yellow-400' };
    if (user.followers > 500) return { icon: Users, text: 'Influencer', color: 'text-blue-400' };
    if (user.public_repos > 50) return { icon: Code, text: 'Code Machine', color: 'text-green-400' };
    if (stats.contributions > 500) return { icon: Flame, text: 'Commit Beast', color: 'text-red-400' };
    return { icon: Trophy, text: 'Rising Star', color: 'text-orange-400' };
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden custom-scrollbar">
      {/* Background gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #000000 40%, #1a1a1a 100%)",
        }}
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {!showResults ? (
          /* Initial Input Section */
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                GitHub Battle Arena
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Compare two GitHub warriors and watch the sparks fly! 🔥
            </p>
            
            {/* Input Section */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none rounded-2xl" />
              <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-10">
                <div className="flex-1">
                  <label className="block text-white/80 text-sm font-medium mb-2">GitHub Username 1</label>
                  <Input
                    placeholder="octocat"
                    value={username1}
                    onChange={(e) => setUsername1(e.target.value)}
                    className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
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
                    className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleCompare}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 rounded-xl border border-white/20 hover:border-white/30 transition-all"
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
        ) : (
          /* Results Section */
          <div id="comparison-card" className="space-y-6 max-w-7xl mx-auto">
            {/* Header with Reset Button */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                  Battle Results
                </span>
              </h1>
              <Button
                onClick={resetBattle}
                className="bg-black/30 backdrop-blur-xl border border-white/20 text-white hover:bg-white/10 transition-all print:hidden"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Battle
              </Button>
            </div>

            {/* Roast Section */}
            {roastText && (
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 pointer-events-none rounded-2xl" />
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <Flame className="w-6 h-6 text-red-400" />
                  <h2 className="text-2xl font-bold text-white">The Brutal Roast 🔥</h2>
                </div>
                
                <div className="text-base text-white/90 leading-relaxed relative z-10 font-medium whitespace-pre-line">
                  {roastText}
                </div>
              </div>
            )}

            {/* User Comparison Cards */}
            {user1Data && user2Data && user1Stats && user2Stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 print:hidden">
              <Button
                onClick={downloadAsImage}
                className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 hover:border-white/30 transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Battle
              </Button>
              
              <Button
                onClick={shareToTwitter}
                className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 hover:border-white/30 transition-all"
              >
                <Share className="w-5 h-5 mr-2" />
                Share on X
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
    <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden group hover:border-white/30 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Header - More Compact */}
        <div className="flex items-center gap-3 mb-4">
          <Image
            src={user.avatar_url}
            alt={user.name || user.login}
            width={60}
            height={60}
            className="w-15 h-15 rounded-full border-2 border-white/20"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white truncate">{user.name || user.login}</h3>
            <p className="text-white/70 text-sm">@{user.login}</p>
            <div className={`flex items-center gap-1 mt-1 ${badge.color}`}>
              <BadgeIcon className="w-3 h-3" />
              <span className="text-xs font-medium">{badge.text}</span>
            </div>
          </div>
        </div>

        {/* Bio - Compact */}
        {user.bio && (
          <p className="text-white/80 mb-4 text-sm leading-relaxed line-clamp-2">{user.bio}</p>
        )}

        {/* Stats Grid - More Compact */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Github className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">Repos</span>
            </div>
            <div className="text-lg font-bold text-white">{user.public_repos}</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Users className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">Followers</span>
            </div>
            <div className="text-lg font-bold text-white">{user.followers}</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">Stars</span>
            </div>
            <div className="text-lg font-bold text-white">{stats.totalStars}</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-2">
            <div className="flex items-center gap-1 mb-1">
              <GitFork className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">Forks</span>
            </div>
            <div className="text-lg font-bold text-white">{stats.totalForks}</div>
          </div>
        </div>

        {/* Contribution Graph */}
        <div className="mb-4">
          <ContributionGraph 
            data={stats.contributionData} 
            username={user.login}
            totalContributions={stats.contributions}
          />
        </div>

        {/* Languages - Compact */}
        <div className="mb-4">
          <h4 className="text-white font-medium mb-2 text-sm">Languages</h4>
          <div className="flex flex-wrap gap-1">
            {Object.entries(stats.languages).slice(0, 4).map(([lang]) => (
              <div
                key={lang}
                className="px-2 py-1 rounded-md text-xs font-medium text-white bg-white/10 border border-white/20"
                style={{ backgroundColor: getLanguageColor(lang) + '20', borderColor: getLanguageColor(lang) + '40' }}
              >
                {lang}
              </div>
            ))}
          </div>
        </div>

        {/* Top Repos - More Compact */}
        <div>
          <h4 className="text-white font-medium mb-2 text-sm">Top Repos</h4>
          <div className="space-y-2">
            {stats.topRepos.slice(0, 2).map((repo, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-2 flex justify-between items-center">
                <div className="min-w-0 flex-1">
                  <div className="text-white font-medium text-sm truncate">{repo.name}</div>
                  <div className="text-white/60 text-xs">{repo.language}</div>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 ml-2">
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
