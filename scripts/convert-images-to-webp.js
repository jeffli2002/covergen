const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function convertToWebP(inputPath, outputPath, quality = 85) {
  try {
    await sharp(inputPath)
      .webp({ quality })
      .toFile(outputPath);
    
    const originalSize = (await fs.stat(inputPath)).size;
    const webpSize = (await fs.stat(outputPath)).size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(2);
    
    console.log(`✅ Converted: ${path.basename(inputPath)}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)}KB → WebP: ${(webpSize / 1024).toFixed(2)}KB (${savings}% smaller)`);
    
    return { originalSize, webpSize, savings };
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error.message);
    return null;
  }
}

async function processDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  let totalOriginal = 0;
  let totalWebP = 0;
  let fileCount = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively process subdirectories
      const subResults = await processDirectory(fullPath);
      totalOriginal += subResults.totalOriginal;
      totalWebP += subResults.totalWebP;
      fileCount += subResults.fileCount;
    } else if (entry.isFile() && /\.(jpg|jpeg|png)$/i.test(entry.name)) {
      // Convert image files
      const webpPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // Skip if WebP already exists
      try {
        await fs.access(webpPath);
        console.log(`⏭️  Skipping ${entry.name} (WebP already exists)`);
        continue;
      } catch {}
      
      const result = await convertToWebP(fullPath, webpPath);
      if (result) {
        totalOriginal += result.originalSize;
        totalWebP += result.webpSize;
        fileCount++;
      }
    }
  }
  
  return { totalOriginal, totalWebP, fileCount };
}

async function main() {
  console.log('🖼️  Converting platform example images to WebP format...\n');
  
  const platformExamplesDir = path.join(__dirname, '..', 'public', 'platform-examples');
  
  try {
    const results = await processDirectory(platformExamplesDir);
    
    console.log('\n📊 Conversion Summary:');
    console.log(`   Files converted: ${results.fileCount}`);
    console.log(`   Total original size: ${(results.totalOriginal / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Total WebP size: ${(results.totalWebP / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Total savings: ${((results.totalOriginal - results.totalWebP) / results.totalOriginal * 100).toFixed(2)}%`);
  } catch (error) {
    console.error('Error processing directory:', error);
    process.exit(1);
  }
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  main();
} catch (error) {
  console.error('❌ sharp is not installed. Please run: npm install --save-dev sharp');
  process.exit(1);
}