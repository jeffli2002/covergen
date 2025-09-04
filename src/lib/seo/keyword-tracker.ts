// Keyword Performance Tracking System
import { MergedKeywordData, mergeAllKeywords } from './keyword-merger';

export interface KeywordPerformance {
  keyword: string;
  platform?: string;
  category?: string;
  kd?: number;
  searchVolume?: number;
  currentRank?: number;
  previousRank?: number;
  rankChange?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  conversionRate?: number;
  revenue?: number;
  lastChecked?: Date;
  trend?: string;
  targetUrl?: string;
  competitorRanks?: Record<string, number>;
}

export interface TrackingReport {
  period: string;
  totalKeywords: number;
  trackedKeywords: number;
  topPerformers: KeywordPerformance[];
  biggestGains: KeywordPerformance[];
  biggestLosses: KeywordPerformance[];
  opportunities: KeywordPerformance[];
  summary: {
    avgRank: number;
    avgCTR: number;
    totalImpressions: number;
    totalClicks: number;
    totalRevenue: number;
  };
}

// Mock tracking data - in production, this would connect to real analytics
const mockTrackingData: Map<string, Partial<KeywordPerformance>> = new Map([
  ['ai thumbnail maker', { currentRank: 5, previousRank: 8, impressions: 15420, clicks: 1234, ctr: 8.0 }],
  ['youtube thumbnail maker', { currentRank: 12, previousRank: 15, impressions: 45200, clicks: 2260, ctr: 5.0 }],
  ['free thumbnail maker', { currentRank: 7, previousRank: 10, impressions: 22100, clicks: 1768, ctr: 8.0 }],
  ['tiktok cover maker', { currentRank: 3, previousRank: 5, impressions: 8900, clicks: 890, ctr: 10.0 }],
  ['wattpad cover maker free', { currentRank: 1, previousRank: 2, impressions: 1900, clicks: 285, ctr: 15.0 }],
]);

export class KeywordTracker {
  private keywords: MergedKeywordData[];
  
  constructor() {
    this.keywords = mergeAllKeywords();
  }
  
  // Track keyword performance
  trackKeyword(keyword: string, data: Partial<KeywordPerformance>): void {
    mockTrackingData.set(keyword.toLowerCase(), data);
  }
  
  // Get performance data for a keyword
  getKeywordPerformance(keyword: string): KeywordPerformance | null {
    const keywordData = this.keywords.find(k => 
      k.keyword.toLowerCase() === keyword.toLowerCase()
    );
    
    if (!keywordData) return null;
    
    const trackingData = mockTrackingData.get(keyword.toLowerCase()) || {};
    
    return {
      keyword: keywordData.keyword,
      platform: keywordData.platform,
      category: keywordData.category,
      kd: keywordData.kd,
      searchVolume: keywordData.searchVolume,
      ...trackingData,
      rankChange: trackingData.currentRank && trackingData.previousRank 
        ? trackingData.previousRank - trackingData.currentRank 
        : 0,
      lastChecked: new Date(),
    };
  }
  
  // Get keywords that need attention (dropping ranks)
  getKeywordsNeedingAttention(): KeywordPerformance[] {
    return Array.from(mockTrackingData.entries())
      .map(([keyword, data]) => {
        const perf = this.getKeywordPerformance(keyword);
        if (!perf) return null;
        
        const rankDrop = (data.previousRank || 0) - (data.currentRank || 0);
        if (rankDrop < -3) return perf; // Dropped more than 3 positions
        
        return null;
      })
      .filter((p): p is KeywordPerformance => p !== null);
  }
  
  // Get high opportunity keywords to target
  getOpportunityKeywords(): KeywordPerformance[] {
    return this.keywords
      .filter(k => {
        const perf = this.getKeywordPerformance(k.keyword);
        return (
          k.kd && k.kd < 20 && 
          k.searchVolume && k.searchVolume > 1000 &&
          (!perf || !perf.currentRank || perf.currentRank > 10)
        );
      })
      .map(k => ({
        keyword: k.keyword,
        platform: k.platform,
        category: k.category,
        kd: k.kd,
        searchVolume: k.searchVolume,
        currentRank: undefined,
        lastChecked: new Date(),
      }))
      .slice(0, 20);
  }
  
  // Generate performance report
  generateReport(period: '7d' | '30d' | '90d' = '30d'): TrackingReport {
    const trackedKeywords = Array.from(mockTrackingData.entries())
      .map(([keyword]) => this.getKeywordPerformance(keyword))
      .filter((p): p is KeywordPerformance => p !== null);
    
    // Calculate top performers (best CTR)
    const topPerformers = [...trackedKeywords]
      .sort((a, b) => (b.ctr || 0) - (a.ctr || 0))
      .slice(0, 10);
    
    // Calculate biggest gains
    const biggestGains = [...trackedKeywords]
      .filter(k => k.rankChange && k.rankChange > 0)
      .sort((a, b) => (b.rankChange || 0) - (a.rankChange || 0))
      .slice(0, 10);
    
    // Calculate biggest losses
    const biggestLosses = [...trackedKeywords]
      .filter(k => k.rankChange && k.rankChange < 0)
      .sort((a, b) => (a.rankChange || 0) - (b.rankChange || 0))
      .slice(0, 10);
    
    // Get opportunities
    const opportunities = this.getOpportunityKeywords();
    
    // Calculate summary metrics
    const summary = {
      avgRank: trackedKeywords.reduce((sum, k) => sum + (k.currentRank || 0), 0) / trackedKeywords.length,
      avgCTR: trackedKeywords.reduce((sum, k) => sum + (k.ctr || 0), 0) / trackedKeywords.length,
      totalImpressions: trackedKeywords.reduce((sum, k) => sum + (k.impressions || 0), 0),
      totalClicks: trackedKeywords.reduce((sum, k) => sum + (k.clicks || 0), 0),
      totalRevenue: trackedKeywords.reduce((sum, k) => sum + (k.revenue || 0), 0),
    };
    
    return {
      period,
      totalKeywords: this.keywords.length,
      trackedKeywords: trackedKeywords.length,
      topPerformers,
      biggestGains,
      biggestLosses,
      opportunities,
      summary,
    };
  }
  
  // Get keywords by phase for implementation
  getKeywordsByPhase(phase: 1 | 2 | 3 | 4): MergedKeywordData[] {
    switch (phase) {
      case 1: // Ultra-low competition (KD < 15)
        return this.keywords
          .filter(k => k.kd && k.kd < 15)
          .sort((a, b) => (a.kd || 100) - (b.kd || 100));
      
      case 2: // AI & trending (KD 15-20, high growth)
        return this.keywords
          .filter(k => 
            k.kd && k.kd >= 15 && k.kd < 20 && 
            k.trend && parseInt(k.trend.replace(/[+%]/g, '')) > 100
          )
          .sort((a, b) => {
            const growthA = parseInt(a.trend?.replace(/[+%]/g, '') || '0');
            const growthB = parseInt(b.trend?.replace(/[+%]/g, '') || '0');
            return growthB - growthA;
          });
      
      case 3: // Platform-specific (KD 20-25)
        return this.keywords
          .filter(k => k.kd && k.kd >= 20 && k.kd < 25 && k.platform)
          .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0));
      
      case 4: // Core competition (KD 25-30)
        return this.keywords
          .filter(k => k.kd && k.kd >= 25 && k.kd <= 30 && k.isCore)
          .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0));
      
      default:
        return [];
    }
  }
  
  // Export tracking data for analysis
  exportTrackingData(): Record<string, any> {
    const report = this.generateReport('30d');
    const phases = {
      phase1: this.getKeywordsByPhase(1).length,
      phase2: this.getKeywordsByPhase(2).length,
      phase3: this.getKeywordsByPhase(3).length,
      phase4: this.getKeywordsByPhase(4).length,
    };
    
    return {
      timestamp: new Date().toISOString(),
      report,
      phases,
      needsAttention: this.getKeywordsNeedingAttention(),
      totalKeywords: this.keywords.length,
      keywordsWithMetrics: this.keywords.filter(k => k.kd && k.searchVolume).length,
    };
  }
}

// Singleton instance
export const keywordTracker = new KeywordTracker();

// Helper function to format report for display
export function formatTrackingReport(report: TrackingReport): string {
  return `
## Keyword Performance Report (${report.period})

### Overview
- Total Keywords: ${report.totalKeywords}
- Tracked Keywords: ${report.trackedKeywords}
- Average Rank: ${report.summary.avgRank.toFixed(1)}
- Average CTR: ${report.summary.avgCTR.toFixed(1)}%
- Total Impressions: ${report.summary.totalImpressions.toLocaleString()}
- Total Clicks: ${report.summary.totalClicks.toLocaleString()}

### Top Performers (by CTR)
${report.topPerformers.map(k => 
  `- ${k.keyword}: Rank #${k.currentRank}, CTR: ${k.ctr}%`
).join('\n')}

### Biggest Gains
${report.biggestGains.map(k => 
  `- ${k.keyword}: ${k.previousRank} → ${k.currentRank} (↑${k.rankChange})`
).join('\n')}

### Opportunities (Low Competition, High Volume)
${report.opportunities.slice(0, 10).map(k => 
  `- ${k.keyword}: KD ${k.kd}, Volume: ${k.searchVolume?.toLocaleString()}`
).join('\n')}
  `.trim();
}