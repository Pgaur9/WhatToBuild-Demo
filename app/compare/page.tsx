'use client';

import React, { useState } from 'react';
import { BackgroundParticles } from './animation';
import GlassShineAnimation from './animation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Users, Star, Download, Share, Zap, Trophy, Code, Flame, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import Image from 'next/image';
import { LucideIcon } from 'lucide-react';
import LocationFlag from '@/components/LocationFlag';
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
      <BackgroundParticles />
      {/* Rye font import for header */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rye&display=swap');
        .rye-regular { font-family: "Rye", serif; font-weight: 400; font-style: normal; }
      `}</style>
      {/* Confetti Canvas Overlay */}
      {showConfetti && (
        <ConfettiOverlay />
      )}
      {/* Background gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #000000 40%, #1a1a1a 100%)",
        }}
      />
      <div className="container mx-auto px-4 py-8 relative z-10">
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
                <div className="flex-1">
                  <label className="block text-white/80 text-lg font-bold mb-4 flex items-center gap-3">
                    <Github className="w-5 h-5 text-white/80" />
                    Dev 1
                  </label>
                  <Input
                    placeholder="octocat"
                    value={username1}
                    onChange={(e) => setUsername1(e.target.value)}
                    className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 text-xl py-6 px-7 rounded-2xl"
                  />
                </div>
                <div className="flex items-end justify-center">
                  <div
                    className={`text-white/60 font-bold text-2xl transition-all ${username1 && username2 ? 'animate-pulse-vs' : ''}`}
                    style={{
                      display: 'inline-block',
                    }}
                  >
                    VS
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-white/80 text-lg font-bold mb-4 flex items-center gap-3">
                    <Github className="w-5 h-5 text-white/80" />
                    Dev 2
                  </label>
                  <Input
                    placeholder="torvalds"
                    value={username2}
                    onChange={(e) => setUsername2(e.target.value)}
                    className="bg-black/40 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 text-xl py-6 px-7 rounded-2xl"
                  />
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
            {/* Header with Reset Button */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text rye-regular text-transparent">
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
                  <h2 className="text-2xl font-bold text-white">The Brutal Roast <span className='align-middle'>🔥</span></h2>
                </div>
                <div className="text-base text-white/90 leading-relaxed relative z-10 font-medium whitespace-pre-line">
                  {roastText.split(/\n{2,}/).map((block, i) => (
                    <div key={i} className="mb-3">
                      <span dangerouslySetInnerHTML={{
                        __html: block
                          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                          .replace(/\n/g, '<br />')
                          .replace(/(🔥|🏆|🥇|💀|😈|😱|😳|😎|😡|😅|😬|😆|😢|😂|😜|🤡|👑|😤|😏|😲|😐|😴|😵|😱|😳|😎|😡|😅|😬|😆|😢|😂|😜|🤡|👑|😤|😏|😲|😐|😴|😵)/g, '<span class="inline-block align-middle">$1</span>')
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* User Comparison Cards */}
            {user1Data && user2Data && user1Stats && user2Stats && (
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 w-full">
                <div className="w-full lg:w-1/2 flex flex-col">
                  <UserComparisonCard 
                    user={user1Data} 
                    stats={user1Stats} 
                    badge={getBadge(user1Data, user1Stats)}
                    getLanguageColor={getLanguageColor}
                  />
                </div>
                <div className="w-full lg:w-1/2 flex flex-col">
                  <UserComparisonCard 
                    user={user2Data} 
                    stats={user2Stats} 
                    badge={getBadge(user2Data, user2Stats)}
                    getLanguageColor={getLanguageColor}
                  />
                </div>
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

interface UserComparisonCardProps {
  user: GitHubUser;
  stats: GitHubStats;
  badge: { icon: LucideIcon; text: string; color: string };
  getLanguageColor: (language: string) => string;
}

function UserComparisonCard({ user, stats, badge, getLanguageColor }: UserComparisonCardProps) {
  const BadgeIcon = badge.icon;
  
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.32),0_1.5px_8px_0_rgba(0,0,0,0.18)] relative overflow-visible group transition-all duration-300 w-full hover:-translate-y-2 hover:scale-[1.025] hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.38),0_2px_12px_0_rgba(0,0,0,0.22)]"
      style={{ minWidth: 0, touchAction: 'manipulation', zIndex: 2 }}>
      {/* Glass shine effect */}
      <div className="absolute inset-0 pointer-events-none rounded-xl z-0">
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: 'inherit',
          background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 10%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.00) 70%)',
          opacity: 0.7,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }} />
        {/* Existing glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="relative z-10">
        {/* Header - Compact with GitHub icon link */}
        <div className="flex items-center gap-3 mb-4">
          <Image
            src={user.avatar_url}
            alt={user.name || user.login}
            width={56}
            height={56}
            className="w-14 h-14 rounded-full border-2 border-white/20"
            style={{ touchAction: 'manipulation' }}
          />
        <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-white truncate">{user.name || user.login}</h3>
            <p className="text-white/70 text-xs sm:text-sm">@{user.login}</p>
            {/* Location and flag, if available */}
            <LocationFlag location={user.location} />
            <div className={`flex items-center gap-2 mt-1 ${badge.color} transition-all duration-200 hover:brightness-125 hover:scale-105 cursor-pointer`}>
              <BadgeIcon className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">{badge.text}</span>
            </div>
          </div>
          <a
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-white/70 hover:text-white transition-colors"
            title="View GitHub Profile"
            style={{ touchAction: 'manipulation' }}
          >
            <Github className="w-7 h-7" />
          </a>
        </div>

        

        {/* Stats Grid - Ultra Compact, touch-friendly */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-2 text-center shadow-md">
            <div className="text-white/80 text-xs font-semibold mb-0.5">Repos</div>
            <div className="text-lg font-bold text-white/90 tracking-wide">{user.public_repos}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-2 text-center shadow-md">
            <div className="text-white/80 text-xs font-semibold mb-0.5">Followers</div>
            <div className="text-lg font-bold text-white/90 tracking-wide">{user.followers}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-2 text-center shadow-md">
            <div className="text-white/80 text-xs font-semibold mb-0.5">Stars</div>
            <div className="text-lg font-bold text-white/90 tracking-wide">{stats.totalStars}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-2 text-center shadow-md">
            <div className="text-white/80 text-xs font-semibold mb-0.5">Forks</div>
            <div className="text-lg font-bold text-white/90 tracking-wide">{stats.totalForks}</div>
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

        {/* Languages - Liquid Glass Capsules with Authentic Color, header and capsules inline */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h4 className="text-lg font-bold tracking-tight text-white/80 mb-0">Languages</h4>
          <div className="flex flex-wrap gap-1">
            {Object.keys(stats.languages).slice(0, 3).map((lang: string) => (
              <span
                key={lang}
                className="px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold inline-block shadow"
                style={{
                  background: 'rgba(30,41,59,0.6)',
                  color: getLanguageColor(lang),
                  border: `1.5px solid ${getLanguageColor(lang)}`,
                  backdropFilter: 'blur(8px)',
                  letterSpacing: '0.01em',
                  fontWeight: 500,
                  transition: 'box-shadow 0.2s',
                }}
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Top Repos - Liquid Glass Dark Theme, Compact, Language with actual color, side by side on large, stacked on mobile */}
        <div>
          <h4 className="text-lg font-bold mb-2 tracking-tight text-white/80">Top Repos</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            {stats.topRepos.slice(0, 2).map((repo, index) => (
              <div
                key={index}
                className="bg-black/40 backdrop-blur-lg border border-white/15 rounded-xl px-4 py-3 flex-1 flex justify-between items-center shadow-md transition-all duration-200 hover:border-yellow-400 hover:shadow-xl hover:-translate-y-1 hover:bg-black/60 cursor-pointer"
                style={{ minWidth: 0, touchAction: 'manipulation' }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-white font-semibold text-sm sm:text-base truncate">{repo.name}</div>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold inline-block shadow transition-all duration-200 hover:brightness-125 hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor: getLanguageColor(repo.language || 'Unknown') + '22',
                      color: getLanguageColor(repo.language || 'Unknown'),
                    }}
                  >
                    {repo.language || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400 ml-2">
                  <Star className="w-5 h-5" />
                  <span className="text-base sm:text-lg font-bold">{repo.stars}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
