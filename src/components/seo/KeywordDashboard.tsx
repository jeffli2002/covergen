'use client';

import { useEffect, useState } from 'react';
import { keywordTracker, formatTrackingReport } from '@/lib/seo/keyword-tracker';
import { getKeywordStatistics } from '@/lib/seo/keyword-merger';

export function KeywordDashboard() {
  const [report, setReport] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    // Generate report and stats
    const trackingReport = keywordTracker.generateReport('30d');
    const keywordStats = getKeywordStatistics();
    
    setReport(trackingReport);
    setStats(keywordStats);
  }, []);
  
  if (!report || !stats) {
    return <div>Loading keyword data...</div>;
  }
  
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">SEO Keyword Performance Dashboard</h2>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Keywords</h3>
          <p className="text-2xl font-bold">{stats.totalKeywords}</p>
          <p className="text-xs text-gray-400">815 platform + 100 trending</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Low Competition</h3>
          <p className="text-2xl font-bold">{stats.lowCompetition}</p>
          <p className="text-xs text-gray-400">KD &lt; 20</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">High Volume</h3>
          <p className="text-2xl font-bold">{stats.highVolume}</p>
          <p className="text-xs text-gray-400">&gt; 10K searches/month</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg Difficulty</h3>
          <p className="text-2xl font-bold">{stats.averageKD?.toFixed(1) || 'N/A'}</p>
          <p className="text-xs text-gray-400">Lower is better</p>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Top Performers</h3>
          <ul className="space-y-1">
            {report.topPerformers.slice(0, 5).map((k: any) => (
              <li key={k.keyword} className="text-sm">
                <span className="font-medium">{k.keyword}</span>
                <span className="text-gray-500 ml-2">CTR: {k.ctr}%</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Biggest Gains</h3>
          <ul className="space-y-1">
            {report.biggestGains.slice(0, 5).map((k: any) => (
              <li key={k.keyword} className="text-sm">
                <span className="font-medium">{k.keyword}</span>
                <span className="text-green-600 ml-2">↑{k.rankChange}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Opportunities</h3>
          <ul className="space-y-1">
            {report.opportunities.slice(0, 5).map((k: any) => (
              <li key={k.keyword} className="text-sm">
                <span className="font-medium">{k.keyword}</span>
                <span className="text-gray-500 ml-2">KD: {k.kd}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Phase Implementation Progress */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Implementation Phases</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(phase => {
            const phaseKeywords = keywordTracker.getKeywordsByPhase(phase as any);
            const phaseNames = [
              'Quick Wins (KD < 15)',
              'AI & Trending (KD 15-20)',
              'Platform-Specific (KD 20-25)',
              'Core Competition (KD 25-30)'
            ];
            
            return (
              <div key={phase} className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Phase {phase}: {phaseNames[phase - 1]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {phaseKeywords.length} keywords
                  </p>
                </div>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, phase * 25)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Platform Coverage */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-2">Platform Coverage</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {stats.platforms?.slice(0, 8).map((platform: string) => (
            <div key={platform} className="text-sm">
              <span className="capitalize">{platform}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Total: {stats.platforms?.length || 0} platforms
        </p>
      </div>
    </div>
  );
}