#!/usr/bin/env node

/**
 * Migration script to update platform and tool pages with SEO and performance optimizations
 */

const fs = require('fs').promises;
const path = require('path');

const PLATFORMS = [
  'youtube', 'tiktok', 'instagram', 'spotify', 'twitch', 
  'linkedin', 'wechat', 'rednote'
];

const TOOLS = [
  'spotify-playlist-cover', 'social-media-poster', 'youtube-thumbnail-maker',
  'anime-poster-maker', 'bilibili-video-cover', 'book-cover-creator',
  'event-poster-designer', 'facebook-event-cover', 'game-cover-art',
  'music-album-cover', 'webinar-poster-maker'
];

const OPTIMIZATIONS = {
  // Import additions
  imports: `import { generatePlatformMetadata, generateEnhancedSchema } from '@/lib/seo/enhanced-metadata'
import { CRITICAL_CSS, generateResourceHints } from '@/lib/seo/performance-optimizer'
import { OptimizedPlatformLayout, OptimizedImage } from '@/components/seo/OptimizedPlatformLayout'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'`,

  // Lazy loading pattern
  lazyLoadPattern: `// Lazy load heavy components
const {COMPONENT} = dynamic(() => import('{PATH}'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})`,

  // Schema generation
  schemaGeneration: `// Generate enhanced schema
const schema = generateEnhancedSchema('{TYPE}', {
  {CONFIG}
})`,

  // Performance wrapper
  performanceWrapper: `<OptimizedPlatformLayout platform="{PLATFORM}" criticalCSS={CRITICAL_CSS}>
  {/* Schema markup */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
  
  {children}
</OptimizedPlatformLayout>`,

  // Image optimization
  imageOptimization: {
    from: /<Image\s+src=["']([^"']+)["']/g,
    to: '<OptimizedImage src="$1"'
  },

  // Suspense boundaries
  suspenseBoundary: `<Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
  {COMPONENT}
</Suspense>`
};

async function migrateFile(filePath, type) {
  try {
    console.log(`Processing: ${filePath}`);
    
    let content = await fs.readFile(filePath, 'utf8');
    
    // Check if already optimized
    if (content.includes('OptimizedPlatformLayout')) {
      console.log(`✓ Already optimized: ${filePath}`);
      return;
    }
    
    // Add imports
    if (!content.includes('generatePlatformMetadata')) {
      const importIndex = content.lastIndexOf('import');
      const importEndIndex = content.indexOf('\n', importIndex);
      content = content.slice(0, importEndIndex + 1) + 
                '\n' + OPTIMIZATIONS.imports + '\n' + 
                content.slice(importEndIndex + 1);
    }
    
    // Update metadata generation
    content = content.replace(
      /export async function generateMetadata\([^)]+\)[^{]*{[^}]+}/,
      (match) => {
        const platformMatch = filePath.match(/platforms\/([^/]+)/);
        const toolMatch = filePath.match(/tools\/([^/]+)/);
        const name = platformMatch ? platformMatch[1] : toolMatch ? toolMatch[1] : 'unknown';
        
        return `export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return generate${type === 'platform' ? 'Platform' : 'Tool'}Metadata({
    ${type}: '${name}',
    locale,
    title: '${name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${type === 'platform' ? 'Cover Maker' : ''}',
    description: 'AI-powered ${name.replace(/-/g, ' ')} generator with perfect dimensions and instant results.',
    ${type === 'tool' ? `keywords: [/* Add relevant keywords */],` : ''}
  })
}`;
      }
    );
    
    // Add lazy loading for components
    const componentMatches = content.match(/import\s+(\w+)\s+from\s+['"]\.\/([^'"]+)['"]/g) || [];
    componentMatches.forEach(match => {
      const [, componentName, componentPath] = match.match(/import\s+(\w+)\s+from\s+['"]\.\/([^'"]+)['"]/) || [];
      if (componentName && componentPath && componentName.includes('Client')) {
        content = content.replace(match, '');
        content = content.replace(
          /export default/,
          OPTIMIZATIONS.lazyLoadPattern
            .replace('{COMPONENT}', componentName)
            .replace('{PATH}', `./${componentPath}`) + '\n\nexport default'
        );
      }
    });
    
    // Optimize images
    content = content.replace(OPTIMIZATIONS.imageOptimization.from, OPTIMIZATIONS.imageOptimization.to);
    
    // Add Suspense boundaries around heavy components
    content = content.replace(
      /<(PlatformShowcase|EnhancedContent|FAQSection)[^>]*\/>/g,
      (match, componentName) => {
        return OPTIMIZATIONS.suspenseBoundary.replace('{COMPONENT}', match);
      }
    );
    
    // Save optimized file
    const optimizedPath = filePath.replace('.tsx', '-optimized.tsx');
    await fs.writeFile(optimizedPath, content);
    
    console.log(`✓ Created optimized version: ${optimizedPath}`);
    
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

async function findAndMigratePages() {
  const srcDir = path.join(process.cwd(), 'src', 'app', '[locale]');
  
  // Process platform pages
  console.log('\n🔧 Processing Platform Pages...\n');
  for (const platform of PLATFORMS) {
    const pagePath = path.join(srcDir, 'platforms', platform, 'page.tsx');
    try {
      await migrateFile(pagePath, 'platform');
    } catch (error) {
      console.log(`⚠️  Platform ${platform} not found`);
    }
  }
  
  // Process tool pages
  console.log('\n🔧 Processing Tool Pages...\n');
  for (const tool of TOOLS) {
    const pagePath = path.join(srcDir, 'tools', tool, 'page.tsx');
    try {
      await migrateFile(pagePath, 'tool');
    } catch (error) {
      console.log(`⚠️  Tool ${tool} not found`);
    }
  }
  
  console.log('\n✅ Migration complete! Review the -optimized.tsx files and rename them when ready.\n');
}

// Run migration
findAndMigratePages().catch(console.error);