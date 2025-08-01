'use client';

import React, { useState, useMemo } from 'react';
import { Activity, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ContributionGraphProps {
  data: number[];
  username: string;
  totalContributions: number;
}

export default function ContributionGraph({ data, username, totalContributions }: ContributionGraphProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Process data for chart
  const chartData = useMemo(() => {
    const paddedData = [...data];
    while (paddedData.length < 365) {
      paddedData.unshift(0);
    }
    const recentData = paddedData.slice(-365);

    if (viewMode === 'daily') {
      // Show last 30 days for daily view
      return recentData.slice(-30).map((count, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          date: date.toISOString().split('T')[0],
          contributions: count,
          displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      });
    } else if (viewMode === 'weekly') {
      // Group by weeks (52 weeks)
      const weeklyData = [];
      for (let i = 0; i < 52; i++) {
        const weekStart = i * 7;
        const weekEnd = Math.min(weekStart + 7, recentData.length);
        const weekContributions = recentData.slice(weekStart, weekEnd).reduce((sum, day) => sum + day, 0);
        const weekDate = new Date();
        weekDate.setDate(weekDate.getDate() - (52 - i) * 7);
        weeklyData.push({
          period: `W${i + 1}`,
          date: weekDate.toISOString().split('T')[0],
          contributions: weekContributions,
          displayDate: weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
      return weeklyData.slice(-26); // Show last 26 weeks (6 months)
    } else {
      // Group by months (12 months)
      const monthlyData = [];
      for (let i = 0; i < 12; i++) {
        const monthStart = i * 30;
        const monthEnd = Math.min(monthStart + 30, recentData.length);
        const monthContributions = recentData.slice(monthStart, monthEnd).reduce((sum, day) => sum + day, 0);
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (12 - i));
        monthlyData.push({
          period: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          date: monthDate.toISOString().split('T')[0],
          contributions: monthContributions,
          displayDate: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        });
      }
      return monthlyData;
    }
  }, [data, viewMode]);

  // Calculate stats
  const stats = useMemo(() => {
    const recentData = data.slice(-365);
    const maxDaily = Math.max(...recentData);
    const avgDaily = totalContributions / recentData.length;
    const maxPeriod = Math.max(...chartData.map(d => d.contributions));
    
    // Calculate trend
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.contributions, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.contributions, 0) / secondHalf.length;
    const trend = secondHalfAvg - firstHalfAvg;

    return {
      maxDaily,
      avgDaily,
      maxPeriod,
      trend,
      isPositiveTrend: trend >= 0
    };
  }, [data, chartData, totalContributions]);

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.displayDate}</p>
          <p className="text-green-400">
            <span className="font-bold">{payload[0].value}</span> contributions
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative bg-black/50 backdrop-blur-2xl border border-white/30 rounded-2xl p-3 shadow-2xl overflow-hidden">
      {/* Liquid glass overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 pointer-events-none rounded-2xl opacity-80" />
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/20 to-pink-500/10 blur-2xl opacity-40 -z-10 rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none rounded-2xl" />
      <div className="relative z-10">
        {/* Header with View Toggle - Compact */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-white font-semibold text-sm">Contributions</span>
          </div>
          <div className="flex bg-white/10 rounded-full p-0.5 border border-white/20">
            {['daily', 'weekly', 'monthly'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as 'daily' | 'weekly' | 'monthly')}
                className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-all ${
                  viewMode === mode
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow'
                    : 'text-white/60 hover:text-white/80'
                }`}
                style={{ minWidth: 48 }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats - More Compact */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-0.5 py-0.5 text-center border border-white/20">
            <div className="text-white font-bold text-sm leading-tight">{totalContributions.toLocaleString()}</div>
            <div className="text-white/60 text-xs leading-tight">Total</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-0.5 py-0.5 text-center border border-white/20">
            <div className="text-white font-bold text-sm leading-tight">{stats.avgDaily.toFixed(1)}</div>
            <div className="text-white/60 text-xs leading-tight">Avg/Day</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-0.5 py-0.5 text-center border border-white/20">
            <div className="text-white font-bold text-sm leading-tight">{stats.maxDaily}</div>
            <div className="text-white/60 text-xs leading-tight">Max Day</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-0.5 py-0.5 text-center flex items-center justify-center border border-white/20">
            <div className="flex items-center gap-1">
              {stats.isPositiveTrend ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={`text-xs font-bold ${
                stats.isPositiveTrend ? 'text-green-400' : 'text-red-400'
              }`}>
                {Math.abs(stats.trend).toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Bar Chart - Compact */}
        <div className="h-24 w-full mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis 
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 9 }}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="contributions" 
                fill="url(#contributionGradient)"
                radius={[2, 2, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
              <defs>
                <linearGradient id="contributionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0.3} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Level Indicator - Compact */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-1">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Calendar className="w-3 h-3" />
            <span>
              {viewMode === 'daily' && 'Last 30 days'}
              {viewMode === 'weekly' && 'Last 6 months'}
              {viewMode === 'monthly' && 'Last year'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>Less</span>
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: level === 0 ? 'rgba(255,255,255,0.1)' : 
                      level === 1 ? 'rgba(34,197,94,0.3)' :
                      level === 2 ? 'rgba(34,197,94,0.5)' :
                      level === 3 ? 'rgba(34,197,94,0.7)' : 'rgba(34,197,94,0.9)'
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}