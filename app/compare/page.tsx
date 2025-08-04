'use client';

import React, { useState } from 'react';
import GlassShineAnimation from './animation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Users, Star, Download, Trophy, Code, Flame, RotateCcw } from 'lucide-react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
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
  totalCommits: number;
  languageStats: Record<string, { count: number; percentage: number }>;
  topRepos: Array<{
    name: string;
    stars: number;
    language: string;
    description: string | null;
    updated_at: string;
    daysSinceUpdate: number;
    commitCount: number;
    url: string;
  }>;
}

interface GitHubSuggestion {
  login: string;
  avatar_url: string;
  type: string;
  score: number;
}

export default function ComparePage() {

  // State declarations (move above useEffect to avoid 'used before initialization' error)
  const [showResults, setShowResults] = useState(false);
  const [roastText, setRoastText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [username1, setUsername1] = useState('');
  const [username2, setUsername2] = useState('');
  const [user1Data, setUser1Data] = useState<GitHubUser | null>(null);
  const [user2Data, setUser2Data] = useState<GitHubUser | null>(null);
  const [user1Stats, setUser1Stats] = useState<GitHubStats | null>(null);
  const [user2Stats, setUser2Stats] = useState<GitHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [battleStats, setBattleStats] = useState<{
    totalCommitsCompared: number;
    totalStarsClashed: number;
    totalReposJudged: number;
    totalContributions: number;
  } | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [suggestions1, setSuggestions1] = useState<GitHubSuggestion[]>([]);
  const [suggestions2, setSuggestions2] = useState<GitHubSuggestion[]>([]);
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);
  const [searchTimeout1, setSearchTimeout1] = useState<NodeJS.Timeout | null>(null);
  const [searchTimeout2, setSearchTimeout2] = useState<NodeJS.Timeout | null>(null);

  // Search GitHub users function
  const searchGitHubUsers = async (query: string): Promise<GitHubSuggestion[]> => {
    if (query.trim().length < 2) return [];
    
    try {
      const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=8`);
      if (!response.ok) return [];
      
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.items?.map((user: any) => ({
        login: user.login,
        avatar_url: user.avatar_url,
        type: user.type,
        score: user.score
      })) || [];
    } catch (error) {
      console.error('Error searching GitHub users:', error);
      return [];
    }
  };

  // Handle username input with debounced search
  const handleUsernameChange = async (value: string, isFirstInput: boolean) => {
    if (isFirstInput) {
      setUsername1(value);
      
      // Clear previous timeout
      if (searchTimeout1) {
        clearTimeout(searchTimeout1);
      }
      
      // Set new timeout for search
      const timeout = setTimeout(async () => {
        if (value.trim().length >= 2) {
          const results = await searchGitHubUsers(value);
          setSuggestions1(results);
          setShowSuggestions1(true);
        } else {
          setSuggestions1([]);
          setShowSuggestions1(false);
        }
      }, 300);
      
      setSearchTimeout1(timeout);
    } else {
      setUsername2(value);
      
      // Clear previous timeout
      if (searchTimeout2) {
        clearTimeout(searchTimeout2);
      }
      
      // Set new timeout for search
      const timeout = setTimeout(async () => {
        if (value.trim().length >= 2) {
          const results = await searchGitHubUsers(value);
          setSuggestions2(results);
          setShowSuggestions2(true);
        } else {
          setSuggestions2([]);
          setShowSuggestions2(false);
        }
      }, 300);
      
      setSearchTimeout2(timeout);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (username: string, isFirstInput: boolean) => {
    if (isFirstInput) {
      setUsername1(username);
      setShowSuggestions1(false);
      setSuggestions1([]);
    } else {
      setUsername2(username);
      setShowSuggestions2(false);
      setSuggestions2([]);
    }
  };

  // Trigger confetti when results are shown
  React.useEffect(() => {
    if (showResults && roastText) {
      setShowConfetti(true);
      // Hide confetti after 3 seconds
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showResults, roastText]);

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

      // Sort top repos by stars for better display
      if (user1Result.stats.topRepos) {
        user1Result.stats.topRepos.sort((a: { stars: number }, b: { stars: number }) => b.stars - a.stars);
      }
      if (user2Result.stats.topRepos) {
        user2Result.stats.topRepos.sort((a: { stars: number }, b: { stars: number }) => b.stars - a.stars);
      }

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
        setBattleStats(roastData.battleStats);
        
        // Determine winner based on multiple factors
        const user1Score = user1Result.stats.totalStars + user1Result.user.followers + user1Result.stats.contributions;
        const user2Score = user2Result.stats.totalStars + user2Result.user.followers + user2Result.stats.contributions;
        setWinner(user1Score > user2Score ? user1Result.user.login : user2Result.user.login);
      } else {
        console.error('Failed to generate roast:', roastResponse.status);
        // Set a fallback roast if the API fails
        setRoastText(`🔥 **${user1Result.user.login}** vs **${user2Result.user.login}** 
        
The battle data has been analyzed! Check out the brutal comparison above! 💀`);
        
        // Calculate fallback battle stats
        setBattleStats({
          totalCommitsCompared: (user1Result.stats.totalCommits || 0) + (user2Result.stats.totalCommits || 0),
          totalStarsClashed: user1Result.stats.totalStars + user2Result.stats.totalStars,
          totalReposJudged: user1Result.user.public_repos + user2Result.user.public_repos,
          totalContributions: user1Result.stats.contributions + user2Result.stats.contributions,
        });
        
        const user1Score = user1Result.stats.totalStars + user1Result.user.followers + user1Result.stats.contributions;
        const user2Score = user2Result.stats.totalStars + user2Result.user.followers + user2Result.stats.contributions;
        setWinner(user1Score > user2Score ? user1Result.user.login : user2Result.user.login);
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
    if (!element) return;

    try {
      const dataUrl = await toPng(element, { 
        cacheBust: true, 
        quality: 0.95,
        backgroundColor: '#000000',
      });
      saveAs(dataUrl, `github-battle-${username1}-vs-${username2}.png`);
    } catch (error) {
      console.error('oops, something went wrong!', error);
      alert('Failed to generate image. Please try again.');
    }
  };

  const shareToTwitter = async () => {
    const element = document.getElementById('comparison-card');
    if (!element) return;

    try {
      const blob = await toPng(element, { 
        cacheBust: true, 
        quality: 0.95,
        backgroundColor: '#000000',
      }).then(dataUrl => fetch(dataUrl).then(res => res.blob()));

      const file = new File([blob], `github-battle-${username1}-vs-${username2}.png`, { type: 'image/png' });

      const shareData = {
        title: 'GitHub Battle',
        text: `🔥 EPIC GitHub Battle: @${username1} vs @${username2}!\n\nThe roast is ABSOLUTELY SAVAGE! 💀\n\nWho's the better dev? The results will shock you! 👑\n\n#GitHubBattle #DevRoast #CodingShowdown #GitHubWarriors`,
        files: [file],
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that do not support navigator.share
        const text = `🔥 BRUTAL GitHub Battle: @${username1} vs @${username2}! The roast is SAVAGE! 💀 Who's the better dev? 👑 #GitHubBattle #DevRoast #CodingShowdown`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        alert('Sharing not supported on this browser. Opened Twitter in a new tab.');
      }
    } catch (error) {
      console.error('oops, something went wrong!', error);
      alert('Failed to generate image for sharing. Please try again.');
    }
  };

  const resetBattle = () => {
    setShowResults(false);
    setUser1Data(null);
    setUser2Data(null);
    setUser1Stats(null);
    setUser2Stats(null);
    setRoastText('');
    setBattleStats(null);
    setWinner(null);
    setUsername1('');
    setUsername2('');
    setError('');
    // Clear suggestions
    setSuggestions1([]);
    setSuggestions2([]);
    setShowSuggestions1(false);
    setShowSuggestions2(false);
    // Clear timeouts
    if (searchTimeout1) clearTimeout(searchTimeout1);
    if (searchTimeout2) clearTimeout(searchTimeout2);
  };

  const getBadge = (user: GitHubUser, stats: GitHubStats) => {
    if (stats.totalStars > 1000) return { icon: Star, text: 'Star Hunter', color: 'text-yellow-400' };
    if (user.followers > 500) return { icon: Users, text: 'Influencer', color: 'text-blue-400' };
    if (user.public_repos > 50) return { icon: Code, text: 'Code Machine', color: 'text-green-400' };
    if (stats.contributions > 500) return { icon: Flame, text: 'Commit Beast', color: 'text-red-400' };
    return { icon: Trophy, text: 'Rising Star', color: 'text-orange-400' };
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden custom-scrollbar pt-28">
      {/* Pearl Mist Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(226, 232, 240, 0.15), transparent 70%), #000000",
        }}
      />
      {/* Rye font import for header and Rubik Doodle Shadow for input */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rye&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Germania+One&display=swap');
        .rye-regular { font-family: "Rye", serif; font-weight: 400; font-style: normal; }
        .germania-one-regular { font-family: "Germania One", system-ui; font-weight: 400; font-style: normal; }
        
        /* Enhanced 3D glassmorphism and premium interactions */
        .glass-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .glass-card:hover {
          transform: translateY(-8px) scale(1.02) rotateX(2deg);
          box-shadow: 
            0 35px 80px rgba(0,0,0,0.6), 
            0 0 40px rgba(255,255,255,0.15),
            inset 0 2px 0 rgba(255,255,255,0.2);
        }
        
        .repo-card:hover {
          transform: translateY(-4px) scale(1.03) rotateX(1deg);
          box-shadow: 
            0 20px 50px rgba(0,0,0,0.4), 
            0 0 20px rgba(255,255,255,0.1),
            inset 0 1px 0 rgba(255,255,255,0.15);
        }
        
        .language-badge:hover {
          transform: scale(1.1) translateZ(10px);
          box-shadow: 0 0 20px currentColor, 0 8px 20px rgba(0,0,0,0.3);
        }
        
        .stat-card:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%);
          box-shadow: 
            inset 0 2px 0 rgba(255,255,255,0.2), 
            0 8px 25px rgba(0,0,0,0.4),
            0 0 15px rgba(255,255,255,0.1);
          transform: translateY(-2px) scale(1.02);
        }
        
        /* Enhanced 3D button effects */
        .premium-btn {
          background: linear-gradient(145deg, rgba(30,30,35,0.95) 0%, rgba(15,15,20,0.98) 100%);
          border: 2px solid rgba(255,255,255,0.15);
          box-shadow: 
            0 8px 32px rgba(0,0,0,0.6),
            inset 0 2px 0 rgba(255,255,255,0.1),
            inset 0 -2px 0 rgba(0,0,0,0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        
        .premium-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 
            0 15px 50px rgba(0,0,0,0.8),
            inset 0 3px 0 rgba(255,255,255,0.15),
            inset 0 -3px 0 rgba(0,0,0,0.4),
            0 0 25px rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.25);
        }
        
        .premium-btn:active {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 
            0 8px 25px rgba(0,0,0,0.6),
            inset 0 2px 0 rgba(0,0,0,0.2),
            inset 0 -1px 0 rgba(255,255,255,0.1);
        }
        
        /* Premium roast section 3D effects */
        .roast-section {
          background: linear-gradient(145deg, rgba(8,8,12,0.98) 0%, rgba(3,3,8,0.96) 100%);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 
            0 25px 80px rgba(0,0,0,0.9),
            0 0 60px rgba(239,68,68,0.1),
            inset 0 2px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(239,68,68,0.05);
          transition: all 0.4s ease;
          transform-style: preserve-3d;
        }
        
        .roast-section:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 35px 100px rgba(0,0,0,0.95),
            0 0 80px rgba(239,68,68,0.15),
            inset 0 3px 0 rgba(255,255,255,0.12),
            inset 0 -2px 0 rgba(239,68,68,0.08);
        }
        
        /* Premium battle verdict section */
        .battle-verdict {
          background: linear-gradient(145deg, rgba(8,8,12,0.98) 0%, rgba(3,3,8,0.96) 100%);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 
            0 30px 100px rgba(0,0,0,0.9),
            0 0 60px rgba(147,51,234,0.1),
            inset 0 2px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(147,51,234,0.05);
          transition: all 0.4s ease;
          transform-style: preserve-3d;
        }
        
        .battle-verdict:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 40px 120px rgba(0,0,0,0.95),
            0 0 80px rgba(147,51,234,0.15),
            inset 0 3px 0 rgba(255,255,255,0.12),
            inset 0 -2px 0 rgba(147,51,234,0.08);
        }
        
        /* Enhanced winner crown animation */
        .winner-crown {
          animation: crown-float 3s ease-in-out infinite;
          filter: drop-shadow(0 0 15px rgba(255,215,0,0.6));
        }
        
        @keyframes crown-float {
          0%, 100% { 
            transform: translateY(0px) scale(1) rotate(0deg);
            filter: drop-shadow(0 0 15px rgba(255,215,0,0.6));
          }
          50% { 
            transform: translateY(-5px) scale(1.05) rotate(2deg);
            filter: drop-shadow(0 5px 25px rgba(255,215,0,0.8));
          }
        }
        
        /* Ultra premium winner card */
        .winner-premium {
          background: linear-gradient(145deg, rgba(25,25,30,0.98) 0%, rgba(15,15,22,0.96) 100%);
          border: 2px solid rgba(255,215,0,0.4);
          box-shadow: 
            0 40px 120px rgba(0,0,0,0.9),
            0 0 80px rgba(255,215,0,0.3),
            inset 0 3px 0 rgba(255,215,0,0.2),
            inset 0 -2px 0 rgba(255,215,0,0.1);
          animation: winner-glow 4s ease-in-out infinite;
        }
        
        @keyframes winner-glow {
          0%, 100% {
            box-shadow: 
              0 40px 120px rgba(0,0,0,0.9),
              0 0 80px rgba(255,215,0,0.3),
              inset 0 3px 0 rgba(255,215,0,0.2),
              inset 0 -2px 0 rgba(255,215,0,0.1);
          }
          50% {
            box-shadow: 
              0 50px 150px rgba(0,0,0,0.95),
              0 0 120px rgba(255,215,0,0.5),
              inset 0 4px 0 rgba(255,215,0,0.3),
              inset 0 -3px 0 rgba(255,215,0,0.15);
          }
        }
        
        /* Enhanced avatar glow effects */
        .avatar-active { 
          border: 3px solid #10b981; 
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.5), 0 8px 25px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }
        .avatar-active:hover {
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.7), 0 12px 35px rgba(0,0,0,0.4);
          transform: scale(1.05);
        }
        
        .avatar-rising { 
          border: 3px solid #f59e0b; 
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.5), 0 8px 25px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }
        .avatar-rising:hover {
          box-shadow: 0 0 40px rgba(245, 158, 11, 0.7), 0 12px 35px rgba(0,0,0,0.4);
          transform: scale(1.05);
        }
        
        .avatar-niche { 
          border: 3px solid #3b82f6; 
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), 0 8px 25px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }
        .avatar-niche:hover {
          box-shadow: 0 0 40px rgba(59, 130, 246, 0.7), 0 12px 35px rgba(0,0,0,0.4);
          transform: scale(1.05);
        }
        
        /* Premium loading animation */
        .premium-loading {
          background: linear-gradient(90deg, 
            rgba(255,255,255,0.1) 0%, 
            rgba(255,255,255,0.3) 50%, 
            rgba(255,255,255,0.1) 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        /* Ultra-smooth scrolling */
        .custom-scrollbar {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar for suggestions - Hidden */
        .suggestions-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        
        .suggestions-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        
        /* Enhanced winner frost animation - more elegant */
        .winner-frost {
          animation: winner-elegant-lift 4s ease-in-out infinite;
          position: relative;
          transform-style: preserve-3d;
        }
        
        .winner-frost:hover {
          transform: translateY(-6px) scale(1.03) rotateX(2deg);
        }
        
        @keyframes winner-elegant-lift {
          0%, 100% { 
            transform: translateY(-3px) scale(1.01) rotateX(1deg);
            box-shadow: 
              0 30px 80px 0 rgba(0,0,0,0.99),
              0 0 100px 25px rgba(0,0,0,0.5),
              inset 0 2px 0 rgba(255,255,255,0.15),
              0 0 0 2px rgba(255,255,255,0.2);
          }
          50% { 
            transform: translateY(-5px) scale(1.015) rotateX(1.5deg);
            box-shadow: 
              0 40px 100px 0 rgba(0,0,0,0.99),
              0 0 130px 30px rgba(0,0,0,0.55),
              inset 0 3px 0 rgba(255,255,255,0.18),
              0 0 0 2px rgba(255,255,255,0.25);
          }
        }
      `}</style>
      {/* Confetti Canvas Overlay */}
      {showConfetti && (
        <ConfettiOverlay />
      )}
      <div className="container mx-auto px-4 pt-24 pb-8 relative z-10">
        {!showResults ? (
          <div className="text-center mb-12">
            <div className="flex flex-col items-center justify-center" style={{ minHeight: '220px' }}>
              <h1 className="text-6xl font-bold mb-4 rye-regular text-center" style={{ lineHeight: 1.1 }}>
                <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                  GitHub Battle Arena
                </span>
              </h1>
              <p className="text-xl text-white/80 mb-8 text-center">
                Compare two GitHub warriors and watch the sparks fly! 🔥
              </p>
            </div>
            {/* Input Section */}
            <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-14 max-w-4xl mx-auto shadow-2xl" style={{ minHeight: '340px' }}>
              {/* Enhanced glassmorphic effect: inner shadow, increased blur, faint white border with glow, and animated glass shine */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl z-0">
                {/* Animated Glass Shine Overlay */}
                <GlassShineAnimation />
                {/* Removed blurred gradient overlay under the box to eliminate shadow/reflection */}
                {/* Soft inner shadow for depth */}
                <div className="w-full h-full rounded-2xl" style={{
                  boxShadow: 'inset 0 2px 24px 0 rgba(255,255,255,0.18), inset 0 1px 8px 0 rgba(255,255,255,0.10)',
                  pointerEvents: 'none',
                }} />
                {/* Faint white border with glow */}
                <div className="absolute inset-0 rounded-2xl" style={{
                  border: '2px solid rgba(255,255,255,0.18)',
                  boxShadow: '0 0 16px 2px rgba(255,255,255,0.10)',
                  pointerEvents: 'none',
                }} />
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-10">
                <div className="flex-1 relative">
                  <label className="flex text-white/80 text-lg font-bold mb-4 items-center gap-3">
                    <Github className="w-5 h-5 text-white/80" />
                    <span className="font-bold text-xl rye-regular">Dev I</span>
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="octocat"
                      value={username1}
                      onChange={(e) => handleUsernameChange(e.target.value, true)}
                      onFocus={() => username1.length >= 2 && setShowSuggestions1(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions1(false), 200)}
                      className="bg-black/40 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/60 focus:border-white/40 text-2xl py-8 px-10 rounded-2xl shadow-xl transition-all"
                    />
                    
                    {/* Suggestions Dropdown for Dev I */}
                    {showSuggestions1 && suggestions1.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto suggestions-scrollbar"
                        style={{
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.25) 80%, rgba(0,0,0,0.35) 100%)',
                          backdropFilter: 'blur(25px) saturate(150%)',
                          boxShadow: '0 25px 50px rgba(0,0,0,0.9), inset 0 2px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.12)',
                        }}>
                        {/* Liquid glass overlay effects */}
                        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                          {/* Top highlight */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                            borderTopLeftRadius: 'inherit',
                            borderTopRightRadius: 'inherit',
                          }} />
                          {/* Glass refraction effect */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '40px',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                            borderTopLeftRadius: 'inherit',
                            borderTopRightRadius: 'inherit',
                            opacity: 0.8,
                          }} />
                          {/* Curved glass highlight */}
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            left: '15%',
                            width: '70%',
                            height: '30px',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, transparent 100%)',
                            borderRadius: '50% 50% 0 0',
                            opacity: 0.6,
                          }} />
                        </div>
                        
                        {suggestions1.map((suggestion) => (
                          <div
                            key={suggestion.login}
                            onClick={() => handleSuggestionSelect(suggestion.login, true)}
                            className="relative flex items-center gap-4 p-4 cursor-pointer transition-all duration-300 first:rounded-t-2xl last:rounded-b-2xl border-b border-white/8 last:border-b-0 hover:bg-gradient-to-r hover:from-white/12 hover:to-white/6"
                            style={{
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            <img 
                              src={suggestion.avatar_url} 
                              alt={suggestion.login}
                              className="w-10 h-10 rounded-full border-2 border-white/25 shadow-lg"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzNzQxNTEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IiM5Q0E5QjQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjOUNBOUI0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+';
                              }}
                            />
                            <div className="flex-1">
                              <div className="text-white font-semibold text-lg" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{suggestion.login}</div>
                              <div className="text-white/70 text-sm capitalize font-medium">{suggestion.type}</div>
                            </div>
                            <div className="text-white/50 text-xs font-medium bg-white/10 px-2 py-1 rounded-md">
                              {Math.round(suggestion.score)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-end justify-center">
                  <div
                    className={`text-white/70 font-bold text-[7rem] germania-one-regular transition-all ${username1 && username2 ? 'animate-pulse-vs' : ''}`}
                    style={{
                      display: 'inline-block',
                      padding: '0 2rem',
                      letterSpacing: '0.08em',
                      textShadow: '0 2px 16px rgba(255,255,255,0.18)',
                    }}
                  >
                    VS
                  </div>
                </div>
                <div className="flex-1 relative">
                  <label className="flex text-white/80 text-lg font-bold mb-4 items-center gap-3">
                    <Github className="w-5 h-5 text-white/80" />
                    <span className="font-bold text-xl rye-regular">Dev II</span>
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="torvalds"
                      value={username2}
                      onChange={(e) => handleUsernameChange(e.target.value, false)}
                      onFocus={() => username2.length >= 2 && setShowSuggestions2(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions2(false), 200)}
                      className="bg-black/40 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/60 focus:border-white/40 text-2xl py-8 px-10 rounded-2xl shadow-xl transition-all"
                    />
                    
                    {/* Suggestions Dropdown for Dev II */}
                    {showSuggestions2 && suggestions2.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto suggestions-scrollbar"
                        style={{
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.25) 80%, rgba(0,0,0,0.35) 100%)',
                          backdropFilter: 'blur(25px) saturate(150%)',
                          boxShadow: '0 25px 50px rgba(0,0,0,0.9), inset 0 2px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.12)',
                        }}>
                        {/* Liquid glass overlay effects */}
                        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                          {/* Top highlight */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                            borderTopLeftRadius: 'inherit',
                            borderTopRightRadius: 'inherit',
                          }} />
                          {/* Glass refraction effect */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '40px',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                            borderTopLeftRadius: 'inherit',
                            borderTopRightRadius: 'inherit',
                            opacity: 0.8,
                          }} />
                          {/* Curved glass highlight */}
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            left: '15%',
                            width: '70%',
                            height: '30px',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, transparent 100%)',
                            borderRadius: '50% 50% 0 0',
                            opacity: 0.6,
                          }} />
                        </div>
                        
                        {suggestions2.map((suggestion) => (
                          <div
                            key={suggestion.login}
                            onClick={() => handleSuggestionSelect(suggestion.login, false)}
                            className="relative flex items-center gap-4 p-4 cursor-pointer transition-all duration-300 first:rounded-t-2xl last:rounded-b-2xl border-b border-white/8 last:border-b-0 hover:bg-gradient-to-r hover:from-white/12 hover:to-white/6"
                            style={{
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            <img 
                              src={suggestion.avatar_url} 
                              alt={suggestion.login}
                              className="w-10 h-10 rounded-full border-2 border-white/25 shadow-lg"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzNzQxNTEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIiBzdHJva2U9IiM5Q0E5QjQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjOUNBOUI0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPC9zdmc+';
                              }}
                            />
                            <div className="flex-1">
                              <div className="text-white font-semibold text-lg" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{suggestion.login}</div>
                              <div className="text-white/70 text-sm capitalize font-medium">{suggestion.type}</div>
                            </div>
                            <div className="text-white/50 text-xs font-medium bg-white/10 px-2 py-1 rounded-md">
                              {Math.round(suggestion.score)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleCompare}
                disabled={isLoading}
                className="mx-auto flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-bold text-2xl py-6 px-12 rounded-full border border-white/30 shadow-[0_2px_24px_0_rgba(255,255,255,0.18),0_1px_8px_0_rgba(255,255,255,0.10)] hover:border-white/40 transition-all mt-16 relative overflow-visible max-w-xs min-w-[120px]"
              >
                {/* Enhanced glass shine and 3D liquid glass effect */}
                <span className="absolute inset-0 rounded-full pointer-events-none z-0" style={{
                  background: 'linear-gradient(120deg, rgba(255,255,255,0.22) 10%, rgba(255,255,255,0.10) 40%, rgba(255,255,255,0.00) 70%)',
                  opacity: 0.7,
                  mixBlendMode: 'screen',
                  boxShadow: '0 0 32px 8px rgba(255,255,255,0.10), 0 2px 24px 0 rgba(255,255,255,0.18)',
                }} />
              
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Preparing...
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2 rye-regular text-4xl font-bold">
                    
                    Battle
                  </span>
                )}
              </Button>
              {error && (
                <div className="mt-6 px-6 py-4 bg-gradient-to-r from-red-500/30 via-black/40 to-orange-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-lg text-red-200 text-base font-semibold flex items-center gap-3 animate-fade-in relative overflow-hidden">
                  <span className="absolute inset-0 pointer-events-none rounded-2xl z-0" style={{
                    background: 'linear-gradient(120deg, rgba(255,255,255,0.10) 10%, rgba(255,255,255,0.00) 70%)',
                    opacity: 0.5,
                    mixBlendMode: 'screen',
                  }} />
                  <span className="flex items-center justify-center z-10">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="mr-3 text-red-400 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {error}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div id="comparison-card" className="space-y-6 max-w-7xl mx-auto">
            {/* Only show current battle results, no previous results/history */}
            {/* Header - Centered with Action Buttons */}
            <div className="flex flex-col items-center justify-center mb-6 gap-4">
              <div className="relative">
                <h1 className="text-5xl font-bold mb-2 relative">
                  <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text rye-regular text-transparent relative z-10">
                    Battle Results
                  </span>
                  {/* Glitch effect background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-sm animate-pulse opacity-30" />
                </h1>
              </div>
              
              {/* Action Buttons - Premium 3D Design */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center print:hidden">
                <Button
                  onClick={resetBattle}
                  className="premium-btn text-white font-bold py-3 px-8 rounded-xl transition-all text-sm relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Battle
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </Button>
                <Button
                  onClick={downloadAsImage}
                  className="premium-btn text-white font-bold py-3 px-8 rounded-xl transition-all text-sm relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download Battle
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </Button>
                <Button
                  onClick={shareToTwitter}
                  className="premium-btn text-white font-bold py-3 px-8 rounded-xl transition-all text-sm relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Share on X
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </div>
            </div>
            {/* Roast Section - Premium 3D Design */}
            {/* Clean Roast Section */}
            {roastText && (
              <div className="roast-section backdrop-blur-xl rounded-xl p-5 relative overflow-hidden"
                style={{
                  boxShadow: '0 15px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}>
                {/* Clean glass overlays */}
                <div className="absolute inset-0 pointer-events-none rounded-xl">
                  {/* Simple top highlight */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    borderTopLeftRadius: 'inherit',
                    borderTopRightRadius: 'inherit',
                  }} />
                  {/* Clean gradient overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '40px',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
                    borderTopLeftRadius: 'inherit',
                    borderTopRightRadius: 'inherit',
                    opacity: 0.7,
                  }} />
                </div>
                
                {/* Clean header with battle stats */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <Flame className="w-6 h-6 text-red-400" />
                    <h2 className="text-xl font-bold text-white">The Brutal Roast 🔥</h2>
                  </div>
                  
                  {/* Clean battle stats */}
                  {battleStats && (
                    <div className="flex items-center gap-3 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.20) 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
                      }}>
                      <div className="flex items-center gap-1.5 text-xs relative z-10">
                        <span className="text-red-400 text-sm">⚔️</span>
                        <span className="text-white/80 font-medium">{battleStats.totalCommitsCompared.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs relative z-10">
                        <span className="text-yellow-400 text-sm">⭐</span>
                        <span className="text-white/80 font-medium">{battleStats.totalStarsClashed.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs relative z-10">
                        <span className="text-blue-400 text-sm">📦</span>
                        <span className="text-white/80 font-medium">{battleStats.totalReposJudged}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Clean readable roast text */}
                <div className="text-sm text-white/95 leading-relaxed relative z-10 font-medium">
                  {roastText.split(/\n{2,}/).map((block, i) => {
                    // Check if this block contains key player mentions
                    const isKeyPlayerBlock = block.includes('WINNER:') || block.includes('Winner:') || block.includes('🏆') || block.includes('👑');
                    
                    if (isKeyPlayerBlock) {
                      return (
                        <div key={i} className="mb-4 p-4 rounded-lg relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.25) 100%)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.15), 0 8px 25px rgba(0,0,0,0.4)',
                            border: '1px solid rgba(255,255,255,0.12)',
                          }}>
                          {/* Liquid glass 3D effect */}
                          <div className="absolute inset-0 rounded-lg pointer-events-none">
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '2px',
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                              borderTopLeftRadius: 'inherit',
                              borderTopRightRadius: 'inherit',
                            }} />
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '30px',
                              background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
                              borderTopLeftRadius: 'inherit',
                              borderTopRightRadius: 'inherit',
                              opacity: 0.8,
                            }} />
                          </div>
                          <div className="relative z-10">
                            <span dangerouslySetInnerHTML={{
                              __html: block
                                .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                                .replace(/\*([^*]+)\*/g, '<em class="text-white/90">$1</em>')
                                .replace(/\n/g, '<br />')
                                .replace(/(🔥|🏆|🥇|💀|😈|😱|😳|😎|😡|😅|😬|😆|😢|😂|😜|🤡|👑|😤|😏|😲|😐|😴|😵)/g, '<span class="inline-block align-middle text-lg">$1</span>')
                            }} />
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={i} className="mb-3 p-2">
                          <span dangerouslySetInnerHTML={{
                            __html: block
                              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                              .replace(/\*([^*]+)\*/g, '<em class="text-white/85">$1</em>')
                              .replace(/\n/g, '<br />')
                              .replace(/(🔥|💀|😈|😱|😳|😎|😡|😅|😬|😆|😢|😂|😜|🤡|😤|😏|😲|😐|😴|😵)/g, '<span class="inline-block align-middle">$1</span>')
                          }} />
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
            {/* User Comparison Cards */}
            {user1Data && user2Data && user1Stats && user2Stats && winner && (
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 w-full">
                <div className="w-full lg:w-1/2 flex flex-col">
                  <UserComparisonCard 
                    user={user1Data} 
                    stats={user1Stats} 
                    badge={getBadge(user1Data, user1Stats)}
                    winner={winner}
                  />
                </div>
                <div className="w-full lg:w-1/2 flex flex-col">
                  <UserComparisonCard 
                    user={user2Data} 
                    stats={user2Stats} 
                    badge={getBadge(user2Data, user2Stats)}
                    winner={winner}
                  />
                </div>
              </div>
            )}
            
            
            {/* Clean Battle Verdict Section */}
            {user1Data && user2Data && user1Stats && user2Stats && winner && (
              <div className="backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(15,15,18,0.99) 0%, rgba(8,8,10,0.97) 60%, rgba(3,3,5,0.95) 100%)',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.9), inset 0 2px 0 rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}>
                {/* Clean glass overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-2xl">
                  {/* Simple top highlight */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    borderTopLeftRadius: 'inherit',
                    borderTopRightRadius: 'inherit',
                  }} />
                  {/* Clean gradient overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
                    borderTopLeftRadius: 'inherit',
                    borderTopRightRadius: 'inherit',
                    opacity: 0.7,
                  }} />
                </div>
                
                <div className="flex items-center gap-4 mb-6 relative z-20">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <h2 className="text-3xl font-bold text-white">Battle Verdict</h2>
                </div>
                
                <div className="relative z-20">
                  <div className="grid md:grid-cols-2 gap-8 mb-6">
                    {/* Clean Category Winners */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white/95 mb-4">Category Champions</h3>
                      {[
                        { 
                          category: 'Stars', 
                          winner: user1Stats.totalStars > user2Stats.totalStars ? user1Data.login : user2Data.login,
                          value1: user1Stats.totalStars,
                          value2: user2Stats.totalStars,
                          icon: '⭐'
                        },
                        { 
                          category: 'Followers', 
                          winner: user1Data.followers > user2Data.followers ? user1Data.login : user2Data.login,
                          value1: user1Data.followers,
                          value2: user2Data.followers,
                          icon: '👥'
                        },
                        { 
                          category: 'Repos', 
                          winner: user1Data.public_repos > user2Data.public_repos ? user1Data.login : user2Data.login,
                          value1: user1Data.public_repos,
                          value2: user2Data.public_repos,
                          icon: '📦'
                        },
                        { 
                          category: 'Contributions', 
                          winner: user1Stats.contributions > user2Stats.contributions ? user1Data.login : user2Data.login,
                          value1: user1Stats.contributions,
                          value2: user2Stats.contributions,
                          icon: '🔥'
                        }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.20) 100%)',
                            backdropFilter: 'blur(15px)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 15px rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}>
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-white/90 font-semibold">{item.category}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-white/70 text-sm font-medium">
                              {item.value1.toLocaleString()} vs {item.value2.toLocaleString()}
                            </span>
                            <span className="text-green-400 font-bold text-sm bg-green-400/10 px-2 py-1 rounded-md">@{item.winner}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Clean Overall Winner */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white/95 mb-4">Overall Victor</h3>
                      {/* Winner Card - Enhanced Text Clarity */}
                      <div className="p-6 rounded-xl relative overflow-hidden"
                        style={{
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.15) 100%)',
                          backdropFilter: 'blur(15px)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 20px rgba(0,0,0,0.4)',
                          transform: 'translateY(-4px) scale(1.02)',
                        }}>
                        {/* Golden touch from top */}
                        <div className="absolute inset-0 rounded-xl pointer-events-none">
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.6) 50%, transparent 100%)',
                            borderTopLeftRadius: 'inherit',
                            borderTopRightRadius: 'inherit',
                          }} />
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '20px',
                            background: 'linear-gradient(180deg, rgba(255,215,0,0.08) 0%, transparent 100%)',
                            borderTopLeftRadius: 'inherit',
                            borderTopRightRadius: 'inherit',
                            opacity: 0.7,
                          }} />
                        </div>
                        
                        <div className="relative z-20 text-center">
                          <div className="text-5xl mb-3">👑</div>
                          <div className="text-2xl font-bold mb-2 text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>@{winner}</div>
                          <div className="text-white text-sm font-semibold mb-4" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Dominates the battlefield!</div>
                        </div>
                      </div>
                      
                      {/* AI Summary - Enhanced Text Clarity */}
                      <div className="p-5 rounded-lg relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.15) 100%)',
                          backdropFilter: 'blur(15px)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 15px rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.12)',
                        }}>
                        <div className="text-white text-sm leading-relaxed font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                          <strong className="text-white font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>@{winner}</strong> emerges victorious with superior {
                            user1Stats.totalStars + user1Data.followers > user2Stats.totalStars + user2Data.followers 
                              ? user1Data.login === winner ? 'star power and community influence' : 'overall development metrics'
                              : user2Data.login === winner ? 'star power and community influence' : 'overall development metrics'
                          }. {
                            winner === user1Data.login 
                              ? `${user1Data.login}'s ${user1Stats.totalStars > user2Stats.totalStars ? 'stellar repositories' : 'consistent contributions'} showcase technical excellence.`
                              : `${user2Data.login}'s ${user2Stats.totalStars > user1Stats.totalStars ? 'stellar repositories' : 'consistent contributions'} showcase technical excellence.`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}

// Simple confetti overlay component
function ConfettiOverlay() {
  const [opacity, setOpacity] = React.useState(1);
  const opacityRef = React.useRef(1);
  React.useEffect(() => {
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    const confettiColors = ['#f1e05a', '#2b7489', '#ffac45', '#f34b7d', '#00ADD8', '#dea584', '#4F5D95', '#701516', '#ffac45', '#fff', '#e53e3e', '#38bdf8', '#fbbf24'];
    const particles = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      r: 6 + Math.random() * 8,
      d: Math.random() * 80,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      tilt: Math.random() * 10,
      tiltAngle: Math.random() * Math.PI * 2,
      tiltAngleInc: 0.05 + Math.random() * 0.07
    }));
    let frame = 0;
    let fadeStarted = false;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = opacityRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r, p.r * 0.6, p.tiltAngle, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85 * opacityRef.current;
        ctx.fill();
        ctx.globalAlpha = opacityRef.current;
        // Animate
        p.y += 3 + Math.sin(frame / 10 + p.d) * 1.5;
        p.x += Math.sin(frame / 20 + p.d) * 2;
        p.tiltAngle += p.tiltAngleInc;
        if (p.y > H + 20) {
          p.y = Math.random() * -40;
          p.x = Math.random() * W;
        }
      }
      ctx.restore();
      frame++;
      if (frame < 90) {
        requestAnimationFrame(draw);
      } else if (!fadeStarted) {
        fadeStarted = true;
        // Fade out over 0.5s
        let fadeFrame = 0;
        function fade() {
          fadeFrame++;
          opacityRef.current = 1 - fadeFrame / 30;
          setOpacity(opacityRef.current);
          if (fadeFrame < 30) {
            requestAnimationFrame(fade);
          } else {
            opacityRef.current = 0;
            setOpacity(0);
          }
        }
        fade();
      }
    }
    draw();
    // Clean up
    return () => {
      if (ctx) ctx.clearRect(0, 0, W, H);
    };
  }, []);
  return (
    <canvas id="confetti-canvas" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 50,
      opacity,
      transition: 'opacity 0.5s',
    }} />
  );
}

// Move UserComparisonCard and its props outside ConfettiOverlay so it is in scope for ComparePage
interface UserComparisonCardProps {
  user: GitHubUser;
  stats: GitHubStats;
  badge: { icon: LucideIcon; text: string; color: string };
  winner: string | null;
}

function UserComparisonCard({ user, stats, badge, winner }: UserComparisonCardProps) {
  const BadgeIcon = badge.icon;
  
  // Determine avatar glow based on profile type
  const getAvatarGlow = (user: GitHubUser, stats: GitHubStats) => {
    if (stats.contributions > 1000) return 'avatar-active'; // Green for active contributor
    if (stats.totalStars > 500 || user.followers > 200) return 'avatar-rising'; // Yellow for rising dev
    return 'avatar-niche'; // Blue for niche language user
  };
  
  // Get language colors
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
      'C#': '#239120',
      Kotlin: '#7F52FF',
      Dart: '#0175C2',
      Scala: '#DC322F',
    };
    return colors[language] || '#64748b';
  };
  
  // Format time ago
  const formatTimeAgo = (days: number) => {
    if (days === 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  // Generate contribution traits (mock for now - can be enhanced with AI)
  const generateContributionTraits = (user: GitHubUser, stats: GitHubStats) => {
    const traits = [];
    
    // Analyze contribution patterns
    if (stats.contributions > 1000) {
      traits.push("Heavy contributor with consistent activity");
    } else if (stats.contributions > 500) {
      traits.push("Regular contributor with steady progress");
    } else {
      traits.push("Selective contributor with focused commits");
    }
    
    // Analyze repo count vs stars
    if (stats.totalStars / user.public_repos > 10) {
      traits.push("Quality over quantity - high star ratio");
    } else if (user.public_repos > 50) {
      traits.push("Prolific creator with many projects");
    }
    
    return traits.slice(0, 2); // Keep it compact
  };

  // Generate unique dev title
  const generateDevTitle = (user: GitHubUser, stats: GitHubStats) => {
    const locations = user.location ? user.location.split(',')[0] : 'Digital';
    const titles = [
      `The Code Architect of ${locations}`,
      `Shadow Committer of ${locations}`,
      `Digital Craftsperson from ${locations}`,
      `Code Virtuoso of ${locations}`,
      `The Silent Builder of ${locations}`,
    ];
    
    if (stats.totalStars > 1000) return `Star Collector of ${locations}`;
    if (user.public_repos > 50) return `Project Maestro of ${locations}`;
    if (stats.contributions > 1000) return `Commit Champion of ${locations}`;
    
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const traits = generateContributionTraits(user, stats);
  const devTitle = generateDevTitle(user, stats);
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
  
  const avatarGlow = getAvatarGlow(user, stats);
  const isWinner = winner === user.login;
  return (
    <div
      data-github-card
      className={`glass-card backdrop-blur-3xl backdrop-saturate-200 border rounded-2xl p-6 relative overflow-hidden group transition-all duration-500 w-full ${
        isWinner 
          ? 'winner-frost' 
          : ''
      }`}
      style={{ 
        minWidth: 0, 
        touchAction: 'manipulation', 
        zIndex: 2,
        background: isWinner 
          ? 'linear-gradient(135deg, rgba(12,12,15,0.98) 80%, rgba(8,8,12,0.96) 100%)'
          : 'linear-gradient(135deg, rgba(8,8,10,0.98) 80%, rgba(3,3,5,0.96) 100%)',
        boxShadow: isWinner 
          ? '0 24px 60px 0 rgba(0,0,0,0.99), 0 0 80px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.18)'
          : '0 16px 48px 0 rgba(0,0,0,0.99), 0 0 60px 16px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.06)',
        border: isWinner ? 'none' : '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(40px) saturate(200%)',
        transform: isWinner ? 'translateY(-2px) scale(1.008)' : 'none',
      }}>
      {/* Enhanced liquid glass overlays */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl z-0">
        {/* Enhanced top highlight for winner */}
        {isWinner && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.25) 25%, rgba(255,255,255,0.4) 50%, rgba(255,215,0,0.25) 75%, transparent 100%)',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
          }} />
        )}
        {/* Regular top glass highlight */}
        {!isWinner && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
          }} />
        )}
        {/* Subtle top gradient for liquid glass effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: isWinner 
            ? 'linear-gradient(180deg, rgba(255,215,0,0.05) 0%, rgba(255,255,255,0.12) 20%, rgba(255,255,255,0.04) 50%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
          borderTopLeftRadius: 'inherit',
          borderTopRightRadius: 'inherit',
          opacity: 0.6,
          pointerEvents: 'none',
        }} />
        {/* Glass reflection - more pronounced */}
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '15%',
          width: '70%',
          height: '35%',
          background: isWinner
            ? 'linear-gradient(135deg, rgba(255,215,0,0.12) 0%, rgba(255,255,255,0.16) 20%, rgba(255,255,255,0.05) 40%, transparent 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 40%, transparent 100%)',
          borderRadius: '50% 50% 0 0',
          opacity: 0.4,
          pointerEvents: 'none',
        }} />
        {/* Inner glow */}
        <div style={{
          position: 'absolute',
          inset: '1px',
          borderRadius: 'calc(1rem - 1px)',
          background: isWinner
            ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />
      </div>
      <div className="relative z-10">
        {/* Winner Crown */}
        {/* Winner badge removed as requested */}
        
        {/* Header - Compact design */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative group">
            <Image
              src={user.avatar_url}
              alt={user.name || user.login}
              width={48}
              height={48}
              className={`w-12 h-12 rounded-xl transition-all duration-300 ${avatarGlow}`}
              style={{ 
                touchAction: 'manipulation',
                // Removed grayscale filter to show original color
              }}
            />
            {/* Glass overlay on avatar */}
            <div className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent" />
            
            {/* Avatar tooltip removed as requested */}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white/95 truncate">{user.name || user.login}</h3>
            <p className="text-white/50 text-xs mb-1">@{user.login}</p>
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <BadgeIcon className="w-3 h-3" />
              <span>{badge.text}</span>
              <span>•</span>
              <span>Joined {joinDate}</span>
            </div>
          </div>
          <a
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 transition-colors p-1 rounded-lg hover:bg-white/5"
            title="View GitHub Profile"
            style={{ touchAction: 'manipulation' }}
          >
            <Github className="w-4 h-4" />
          </a>
        </div>

        {/* Dev Title - Fire themed colors to match the vibe */}
        <div className="mb-3 p-3 rounded-lg border border-white/8 relative group"
          style={{
            background: isWinner 
              ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.22) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.20) 100%)',
            boxShadow: isWinner 
              ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 3px 8px rgba(0,0,0,0.4)'
              : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 6px rgba(0,0,0,0.3)',
            transform: isWinner ? 'translateY(-1px)' : 'translateY(-0.5px)',
          }}>
          <p className="text-xs font-bold italic text-center bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:via-orange-400 group-hover:to-red-500 transition-all duration-500"
            style={{
              textShadow: '0 0 20px rgba(251, 146, 60, 0.5)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}>
            &quot;{devTitle}&quot;
          </p>
          {/* Animated glow effect - fire themed */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(45deg, rgba(251,146,60,0.1), rgba(239,68,68,0.1), rgba(245,158,11,0.1))',
              filter: 'blur(8px)',
            }} />
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Repos', value: user.public_repos, gradient: 'from-blue-500/15 to-blue-600/5' },
            { label: 'Followers', value: user.followers, gradient: 'from-green-500/15 to-green-600/5' },
            { label: 'Stars', value: stats.totalStars, gradient: 'from-yellow-500/15 to-yellow-600/5' },
            { label: 'Forks', value: stats.totalForks, gradient: 'from-purple-500/15 to-purple-600/5' }
          ].map((stat) => (
            <div
              key={stat.label}
              className={`stat-card text-center py-2 px-1 rounded-lg border border-white/8 relative transition-all duration-300 bg-gradient-to-br ${stat.gradient}`}
              style={{
                backdropFilter: 'blur(10px)',
                boxShadow: isWinner 
                  ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 12px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.10), 0 3px 8px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.2)',
                background: isWinner
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.18) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(0,0,0,0.16) 100%)',
                transform: isWinner ? 'translateY(-1px) scale(1.02)' : 'translateY(-0.5px) scale(1.01)',
              }}
            >
              <div className="text-base font-bold text-white/95 leading-tight">{stat.value.toLocaleString()}</div>
              <div className="text-white/60 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contribution Graph - Compact */}
        <div className="mb-3">
          <ContributionGraph 
            data={stats.contributionData} 
            username={user.login}
            totalContributions={stats.contributions}
          />
        </div>

        {/* Contribution Traits */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-white/75 mb-2">Traits</h4>
          <div className="space-y-1.5">
            {traits.map((trait, index) => (
              <div key={index} className="text-xs text-white/70 flex items-center gap-2 p-2 rounded-md border border-white/6"
                style={{
                  background: isWinner 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.12) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.11) 100%)',
                  boxShadow: isWinner 
                    ? 'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 6px rgba(0,0,0,0.3)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 4px rgba(0,0,0,0.25)',
                  transform: isWinner ? 'translateY(-0.5px)' : 'translateY(-0.25px)',
                }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                {trait}
              </div>
            ))}
          </div>
        </div>

        {/* Languages - With original colors, inline, hover effects */}
        <div className="mb-3 flex items-center">
          <h4 className="text-sm font-medium text-white/75 mr-2">Languages</h4>
          <div className="flex flex-row gap-1.5">
            {Object.entries(stats.languageStats || {}).slice(0, 3).map(([lang, langStats]) => (
              <div key={lang} className="relative">
                <span
                  className="language-badge px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300 cursor-default"
                  style={{
                    backgroundColor: getLanguageColor(lang) + '15',
                    color: getLanguageColor(lang),
                    borderColor: getLanguageColor(lang) + '30',
                    background: `linear-gradient(135deg, ${getLanguageColor(lang)}15 0%, rgba(0,0,0,0.10) 100%)`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                  tabIndex={0}
                  onMouseEnter={e => {
                    const tooltip = e.currentTarget.nextSibling as HTMLElement;
                    if (tooltip) tooltip.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    const tooltip = e.currentTarget.nextSibling as HTMLElement;
                    if (tooltip) tooltip.style.opacity = '0';
                  }}
                  onFocus={e => {
                    const tooltip = e.currentTarget.nextSibling as HTMLElement;
                    if (tooltip) tooltip.style.opacity = '1';
                  }}
                  onBlur={e => {
                    const tooltip = e.currentTarget.nextSibling as HTMLElement;
                    if (tooltip) tooltip.style.opacity = '0';
                  }}
                >
                  {lang}
                </span>
                {/* Language usage tooltip */}
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg opacity-0 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl border border-white/10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(8,8,10,0.98) 80%, rgba(3,3,5,0.96) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.40)',
                    color: '#fff',
                    fontSize: '11px',
                    opacity: 0,
                  }}
                >
                  <div className="font-medium">{lang}</div>
                  <div className="text-white/80 mt-1">
                    {typeof langStats.percentage === 'number' 
                      ? `${langStats.percentage.toFixed(1)}%` 
                      : `${parseFloat(langStats.percentage || '0').toFixed(1)}%`
                    } of repositories
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    {langStats.count} {langStats.count === 1 ? 'repository' : 'repositories'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Repos - Enhanced cards with more info */}
        <div>
          <h4 className="text-sm font-medium text-white/75 mb-2">Top Repos</h4>
          <div className="flex flex-row gap-2.5">
            {stats.topRepos.slice(0, 2).map((repo, index) => (
              <a
                key={index}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="repo-card p-3.5 rounded-lg border border-white/8 flex-1 min-w-0 transition-all duration-300 hover:border-white/15 group"
                style={{
                  background: isWinner
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.16) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.15) 100%)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: isWinner
                    ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 3px 10px rgba(0,0,0,0.3), 0 1px 6px rgba(0,0,0,0.2)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.25)',
                  transform: isWinner ? 'translateY(-0.5px)' : 'translateY(-0.25px)',
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-white/90 font-medium text-sm truncate group-hover:text-white transition-colors">
                        {repo.name}
                      </div>
                      {repo.description && (
                        <div className="text-white/50 text-xs mt-1 line-clamp-2">
                          {repo.description.length > 40 ? repo.description.substring(0, 40) + '...' : repo.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-white/60 ml-2">
                      <Star className="w-3 h-3" />
                      <span className="text-sm font-medium">{repo.stars.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className="px-1.5 py-0.5 rounded text-xs font-medium transition-all duration-300"
                      style={{
                        backgroundColor: getLanguageColor(repo.language || 'Unknown') + '20',
                        color: getLanguageColor(repo.language || 'Unknown'),
                        border: `1px solid ${getLanguageColor(repo.language || 'Unknown')}40`,
                      }}
                    >
                      {repo.language || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span>{repo.commitCount.toLocaleString()} commits</span>
                      <span>•</span>
                      <span>{formatTimeAgo(repo.daysSinceUpdate)}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


