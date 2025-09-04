// Keyword Merger - Combines platform keywords with Google Trends data
import { PLATFORM_KEYWORDS, getPlatformKeywords, getAllKeywords } from './platform-keywords';
import { TRENDING_KEYWORDS, KeywordData } from './enhanced-keywords';

export interface MergedKeywordData extends KeywordData {
  platform?: string;
  category?: string;
  isCore?: boolean;
  isTrending?: boolean;
}

// Merge all keywords with deduplication and enrichment
export function mergeAllKeywords(): MergedKeywordData[] {
  const mergedKeywords: Map<string, MergedKeywordData> = new Map();
  
  // 1. Add all platform keywords
  Object.entries(PLATFORM_KEYWORDS).forEach(([category, data]) => {
    if (Array.isArray(data)) {
      // Direct platform arrays (youtube, tiktok, etc.)
      data.forEach(keyword => {
        const key = keyword.toLowerCase().trim();
        if (!mergedKeywords.has(key)) {
          mergedKeywords.set(key, {
            keyword,
            platform: category,
            category: 'platform-specific',
            isCore: category === 'core',
          });
        }
      });
    } else if (typeof data === 'object') {
      // Nested platform objects (chinese, other, ecommerce, professional)
      Object.entries(data).forEach(([platform, keywords]) => {
        if (Array.isArray(keywords)) {
          keywords.forEach(keyword => {
            const key = keyword.toLowerCase().trim();
            if (!mergedKeywords.has(key)) {
              mergedKeywords.set(key, {
                keyword,
                platform,
                category,
                isCore: false,
              });
            }
          });
        }
      });
    }
  });
  
  // 2. Enrich with trending keyword data
  TRENDING_KEYWORDS.forEach(trendingKeyword => {
    const key = trendingKeyword.keyword.toLowerCase().trim();
    const existing = mergedKeywords.get(key);
    
    if (existing) {
      // Merge data
      mergedKeywords.set(key, {
        ...existing,
        ...trendingKeyword,
        isTrending: true,
      });
    } else {
      // Add new trending keyword
      mergedKeywords.set(key, {
        ...trendingKeyword,
        isTrending: true,
        category: 'trending',
      });
    }
  });
  
  return Array.from(mergedKeywords.values());
}

// Get platform-specific keywords with metrics
export function getPlatformKeywordsWithMetrics(platform: string): MergedKeywordData[] {
  const platformKeywords = getPlatformKeywords(platform);
  const mergedData = mergeAllKeywords();
  
  return mergedData.filter(k => 
    k.platform === platform || 
    platformKeywords.some(pk => pk.toLowerCase() === k.keyword.toLowerCase())
  );
}

// Get keywords by competition level
export function getKeywordsByCompetition(maxKD: number = 30): MergedKeywordData[] {
  return mergeAllKeywords()
    .filter(k => k.kd && k.kd <= maxKD)
    .sort((a, b) => (a.kd || 100) - (b.kd || 100));
}

// Get high-opportunity keywords (low competition + high volume)
export function getHighOpportunityKeywords(): MergedKeywordData[] {
  return mergeAllKeywords()
    .filter(k => k.kd && k.searchVolume && k.kd < 20 && k.searchVolume > 1000)
    .sort((a, b) => {
      // Sort by opportunity score (volume / difficulty)
      const scoreA = (a.searchVolume || 0) / (a.kd || 100);
      const scoreB = (b.searchVolume || 0) / (b.kd || 100);
      return scoreB - scoreA;
    });
}

// Get keywords for content planning
export function getContentPlanKeywords() {
  const merged = mergeAllKeywords();
  
  return {
    // Phase 1: Quick wins (KD < 15)
    quickWins: merged
      .filter(k => k.kd && k.kd < 15)
      .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
      .slice(0, 20),
    
    // Phase 2: AI and trending (high growth)
    trending: merged
      .filter(k => k.isTrending && k.trend && parseInt(k.trend.replace(/[+%]/g, '')) > 100)
      .sort((a, b) => {
        const growthA = parseInt(a.trend?.replace(/[+%]/g, '') || '0');
        const growthB = parseInt(b.trend?.replace(/[+%]/g, '') || '0');
        return growthB - growthA;
      })
      .slice(0, 20),
    
    // Phase 3: Platform-specific
    platformSpecific: {
      youtube: getPlatformKeywordsWithMetrics('youtube').slice(0, 10),
      tiktok: getPlatformKeywordsWithMetrics('tiktok').slice(0, 10),
      instagram: getPlatformKeywordsWithMetrics('instagram').slice(0, 10),
      spotify: getPlatformKeywordsWithMetrics('spotify').slice(0, 10),
    },
    
    // Phase 4: Core keywords
    core: merged
      .filter(k => k.isCore)
      .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0)),
  };
}

// Generate keyword clusters for topic modeling
export function generateKeywordClusters() {
  const merged = mergeAllKeywords();
  
  const clusters = {
    'Free Tools': merged.filter(k => 
      k.keyword.toLowerCase().includes('free') || 
      k.keyword.toLowerCase().includes('no watermark') ||
      k.keyword.toLowerCase().includes('no signup')
    ),
    
    'AI-Powered': merged.filter(k => 
      k.keyword.toLowerCase().includes('ai') || 
      k.keyword.toLowerCase().includes('artificial intelligence') ||
      k.keyword.toLowerCase().includes('machine learning')
    ),
    
    'Platform-Specific': {
      youtube: merged.filter(k => k.keyword.toLowerCase().includes('youtube')),
      tiktok: merged.filter(k => k.keyword.toLowerCase().includes('tiktok')),
      instagram: merged.filter(k => k.keyword.toLowerCase().includes('instagram')),
      spotify: merged.filter(k => k.keyword.toLowerCase().includes('spotify')),
    },
    
    'Mobile': merged.filter(k => 
      k.keyword.toLowerCase().includes('app') || 
      k.keyword.toLowerCase().includes('mobile') ||
      k.keyword.toLowerCase().includes('android') ||
      k.keyword.toLowerCase().includes('iphone')
    ),
    
    'Templates': merged.filter(k => 
      k.keyword.toLowerCase().includes('template') || 
      k.keyword.toLowerCase().includes('design')
    ),
    
    'Gaming': merged.filter(k => 
      k.keyword.toLowerCase().includes('gaming') || 
      k.keyword.toLowerCase().includes('minecraft') ||
      k.keyword.toLowerCase().includes('fortnite') ||
      k.keyword.toLowerCase().includes('roblox')
    ),
  };
  
  return clusters;
}

// Export statistics
export function getKeywordStatistics() {
  const merged = mergeAllKeywords();
  const withMetrics = merged.filter(k => k.searchVolume && k.kd);
  
  return {
    totalKeywords: merged.length,
    keywordsWithMetrics: withMetrics.length,
    platformKeywords: merged.filter(k => k.platform).length,
    trendingKeywords: merged.filter(k => k.isTrending).length,
    lowCompetition: merged.filter(k => k.kd && k.kd < 20).length,
    highVolume: merged.filter(k => k.searchVolume && k.searchVolume > 10000).length,
    averageKD: withMetrics.reduce((sum, k) => sum + (k.kd || 0), 0) / withMetrics.length,
    averageVolume: withMetrics.reduce((sum, k) => sum + (k.searchVolume || 0), 0) / withMetrics.length,
    platforms: [...new Set(merged.filter(k => k.platform).map(k => k.platform))],
  };
}

// Generate SEO action items
export function generateSEOActionItems() {
  const contentPlan = getContentPlanKeywords();
  const clusters = generateKeywordClusters();
  
  return {
    immediate: [
      {
        action: 'Create landing pages for top 10 quick-win keywords',
        keywords: contentPlan.quickWins.slice(0, 10).map(k => k.keyword),
        estimatedImpact: 'High',
        timeframe: '1-2 weeks',
      },
      {
        action: 'Optimize existing pages with AI keywords',
        keywords: clusters['AI-Powered'].slice(0, 5).map(k => k.keyword),
        estimatedImpact: 'Very High',
        timeframe: '1 week',
      },
    ],
    
    shortTerm: [
      {
        action: 'Build platform-specific tutorial content',
        platforms: ['youtube', 'tiktok', 'instagram'],
        estimatedImpact: 'High',
        timeframe: '2-4 weeks',
      },
      {
        action: 'Create comparison pages for "free" cluster',
        keywords: clusters['Free Tools'].slice(0, 10).map(k => k.keyword),
        estimatedImpact: 'Medium-High',
        timeframe: '2-3 weeks',
      },
    ],
    
    longTerm: [
      {
        action: 'Develop comprehensive template library',
        keywords: clusters['Templates'].slice(0, 20).map(k => k.keyword),
        estimatedImpact: 'Medium',
        timeframe: '1-2 months',
      },
      {
        action: 'Build mobile app to target app-specific keywords',
        keywords: clusters['Mobile'].slice(0, 15).map(k => k.keyword),
        estimatedImpact: 'High',
        timeframe: '3-6 months',
      },
    ],
  };
}