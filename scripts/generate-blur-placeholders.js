const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateBlurDataURL(imagePath) {
  try {
    const buffer = await sharp(imagePath)
      .resize(10, 10, { fit: 'inside' })
      .blur()
      .jpeg({ quality: 50 })
      .toBuffer();
    
    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error(`Error generating blur for ${imagePath}:`, error);
    return null;
  }
}

async function processDirectory(dirPath, outputFile) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const blurData = {};
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      const subData = await processDirectory(fullPath, null);
      Object.assign(blurData, subData);
    } else if (entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
      const relativePath = path.relative(path.join(__dirname, '..', 'public'), fullPath);
      const publicPath = '/' + relativePath.replace(/\\/g, '/');
      
      console.log(`Generating blur for: ${publicPath}`);
      const dataURL = await generateBlurDataURL(fullPath);
      
      if (dataURL) {
        blurData[publicPath] = dataURL;
      }
    }
  }
  
  if (outputFile) {
    const output = `// Auto-generated blur placeholders for images
export const blurPlaceholders: Record<string, string> = ${JSON.stringify(blurData, null, 2)};
`;
    await fs.writeFile(outputFile, output);
    console.log(`\n✅ Generated blur placeholders for ${Object.keys(blurData).length} images`);
    console.log(`📄 Output saved to: ${outputFile}`);
  }
  
  return blurData;
}

async function main() {
  console.log('🖼️  Generating blur placeholders for platform example images...\n');
  
  const platformExamplesDir = path.join(__dirname, '..', 'public', 'platform-examples');
  const outputPath = path.join(__dirname, '..', 'src', 'lib', 'blur-placeholders.ts');
  
  try {
    await processDirectory(platformExamplesDir, outputPath);
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