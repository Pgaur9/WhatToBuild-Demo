'use client';

import React from 'react';
import { Activity } from 'lucide-react';

interface ContributionGraphProps {
  data: number[];
  username: string;
  totalContributions: number;
}

export default function ContributionGraph({ data, username, totalContributions }: ContributionGraphProps) {
  // Generate GitHub-style grid data (52 weeks * 7 days = 364 days)
  const weeks = 52;
  const daysPerWeek = 7;
  const gridData = [];
  
  // Ensure we have enough data, pad with zeros if needed
  const paddedData = [...data];
  while (paddedData.length < weeks * daysPerWeek) {
    paddedData.unshift(0);
  }
  
  // Take the last 364 days
  const recentData = paddedData.slice(-364);
  
  // Organize into weeks
  for (let week = 0; week < weeks; week++) {
    const weekData = [];
    for (let day = 0; day < daysPerWeek; day++) {
      const dayIndex = week * daysPerWeek + day;
      weekData.push(recentData[dayIndex] || 0);
    }
    gridData.push(weekData);
  }

  // Calculate max for color intensity
  const maxContributions = Math.max(...recentData);
  
  // Calculate weekly data for the line chart
  const weeklyData = [];
  for (let i = 0; i < gridData.length; i++) {
    const weekTotal = gridData[i].reduce((sum, day) => sum + day, 0);
    weeklyData.push(weekTotal);
  }
  
  // Calculate trend and stats
  const maxWeekly = Math.max(...weeklyData, 1); // Prevent division by zero
  const firstHalf = weeklyData.slice(0, Math.floor(weeklyData.length / 2));
  const secondHalf = weeklyData.slice(Math.floor(weeklyData.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  const trend = secondHalfAvg - firstHalfAvg;
  
  // Get color intensity based on contribution count
  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    if (maxContributions === 0) return 1;
    return Math.min(1, count / (maxContributions * 0.8));
  };

  // Get color for contribution level
  const getColor = (count: number) => {
    const intensity = getIntensity(count);
    if (intensity === 0) return 'rgb(22, 27, 34)'; // Dark gray for no contributions
    if (intensity <= 0.25) return 'rgb(14, 68, 41)'; // Light green
    if (intensity <= 0.5) return 'rgb(0, 109, 50)'; // Medium green
    if (intensity <= 0.75) return 'rgb(38, 166, 65)'; // Bright green
    return 'rgb(57, 211, 83)'; // Brightest green
  };

  const avgContributions = totalContributions / recentData.length;

  return (
    <div className="bg-white/5 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm font-medium">Contributions</span>
        </div>
        <div className="text-white/60 text-sm">
          {totalContributions.toLocaleString()} total
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white font-bold text-lg">{totalContributions.toLocaleString()}</div>
          <div className="text-white/60 text-sm">Total</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white font-bold text-lg">{avgContributions.toFixed(1)}</div>
          <div className="text-white/60 text-sm">Avg/Day</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-white font-bold text-lg">{maxContributions}</div>
          <div className="text-white/60 text-sm">Max Day</div>
        </div>
      </div>

      {/* GitHub-style contribution grid */}
      <div className="space-y-2">
        <div className="flex gap-2 text-xs text-white/40 pl-12">
          <div className="w-8">Jan</div>
          <div className="w-8">Mar</div>
          <div className="w-8">May</div>
          <div className="w-8">Jul</div>
          <div className="w-8">Sep</div>
          <div className="w-8">Nov</div>
        </div>
        
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 text-xs text-white/40 w-10">
            <div className="h-2"></div>
            <div className="text-right">Mon</div>
            <div className="h-2"></div>
            <div className="text-right">Wed</div>
            <div className="h-2"></div>
            <div className="text-right">Fri</div>
            <div className="h-2"></div>
          </div>
          
          {/* Contribution squares */}
          <div className="flex gap-1 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30" 
               style={{
                 scrollbarWidth: 'thin',
                 scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
               }}>
            {gridData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1 flex-shrink-0">
                {week.map((contributions, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-2.5 h-2.5 rounded-sm border border-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: getColor(contributions)
                    }}
                    title={`${contributions} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
          
          <style jsx>{`
            .scrollbar-thin::-webkit-scrollbar {
              height: 4px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
              background: transparent;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
              background-color: rgba(255, 255, 255, 0.2);
              border-radius: 2px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
              background-color: rgba(255, 255, 255, 0.3);
            }
          `}</style>
        </div>
      </div>



      {/* Legend and Trend */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="text-xs text-white/60">
            Trend: 
            <span className={`ml-1 font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}
            </span>
          </div>
        </div>
        
        {/* Activity Level Legend */}
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="w-2.5 h-2.5 rounded-sm border border-white/10"
                style={{
                  backgroundColor: level === 0 ? 'rgb(22, 27, 34)' : 
                    level === 1 ? 'rgb(14, 68, 41)' :
                    level === 2 ? 'rgb(0, 109, 50)' :
                    level === 3 ? 'rgb(38, 166, 65)' : 'rgb(57, 211, 83)'
                }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}