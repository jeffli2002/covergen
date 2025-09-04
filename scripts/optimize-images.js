#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration for image optimization
const IMAGE_CONFIG = {
  youtube: {
    width: 1280,
    height: 720,
    quality: 85
  },
  tiktok: {
    width: 1080,
    height: 1920,
    quality: 85
  },
  instagram: {
    width: 1080,
    height: 1080,
    quality: 85
  },
  spotify: {
    width: 640,
    height: 640,
    quality: 85
  },
  twitch: {
    width: 1200,
    height: 600,
    quality: 85
  },
  linkedin: {
    width: 1584,
    height: 396,
    quality: 85
  }
};

async function optimizeImage(inputPath, outputPath, config) {
  try {
    await sharp(inputPath)
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: config.quality, progressive: true })
      .toFile(outputPath.replace('.jpg', '-optimized.jpg'));

    // Also create WebP version for better performance
    await sharp(inputPath)
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: config.quality })
      .toFile(outputPath.replace('.jpg', '.webp'));

    // Create a tiny placeholder for blur effect
    await sharp(inputPath)
      .resize(20, Math.round(20 * config.height / config.width), {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 20 })
      .toFile(outputPath.replace('.jpg', '-placeholder.jpg'));

    const originalStats = await fs.stat(inputPath);
    const optimizedStats = await fs.stat(outputPath.replace('.jpg', '-optimized.jpg'));
    const webpStats = await fs.stat(outputPath.replace('.jpg', '.webp'));
    
    console.log(`✅ ${path.basename(inputPath)}:`);
    console.log(`   Original: ${(originalStats.size / 1024).toFixed(2)} KB`);
    console.log(`   Optimized JPG: ${(optimizedStats.size / 1024).toFixed(2)} KB (${((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1)}% reduction)`);
    console.log(`   WebP: ${(webpStats.size / 1024).toFixed(2)} KB (${((1 - webpStats.size / originalStats.size) * 100).toFixed(1)}% reduction)`);
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
  }
}

async function processDirectory(dir, platform) {
  const files = await fs.readdir(dir);
  const config = IMAGE_CONFIG[platform];
  
  if (!config) {
    console.error(`No configuration found for platform: ${platform}`);
    return;
  }

  console.log(`\n📷 Optimizing ${platform} images...`);
  
  for (const file of files) {
    if (file.startsWith('original-') && file.endsWith('.jpg')) {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, file);
      await optimizeImage(inputPath, outputPath, config);
    }
  }
}

async function main() {
  const baseDir = path.join(__dirname, '..', 'public', 'platform-examples');
  
  try {
    // Check if sharp is installed
    try {
      require.resolve('sharp');
    } catch (e) {
      console.error('❌ Sharp is not installed. Please run: npm install sharp');
      process.exit(1);
    }

    const platforms = ['youtube', 'tiktok', 'instagram', 'spotify', 'twitch', 'linkedin'];
    
    for (const platform of platforms) {
      const platformDir = path.join(baseDir, platform);
      try {
        await fs.access(platformDir);
        await processDirectory(platformDir, platform);
      } catch (error) {
        console.log(`⚠️  Skipping ${platform}: directory not found`);
      }
    }
    
    console.log('\n✨ Image optimization complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Update the platform-showcases.ts file to use the optimized images');
    console.log('2. Import and use PlatformShowcaseOptimized component instead of PlatformShowcase');
    console.log('3. Consider implementing a CDN for even better performance');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();