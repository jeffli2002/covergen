const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateLogoPNG() {
  try {
    // Read the SVG file
    const svgPath = path.join(__dirname, '../public/logo.svg');
    const outputPath = path.join(__dirname, '../public/logo.png');
    
    // Convert SVG to PNG using sharp
    await sharp(svgPath)
      .resize(600, 160) // 2x size for better quality
      .png()
      .toFile(outputPath);
    
    console.log('Logo PNG generated successfully at:', outputPath);
    
    // Also create a smaller version
    const outputPathSmall = path.join(__dirname, '../public/logo-small.png');
    await sharp(svgPath)
      .resize(300, 80)
      .png()
      .toFile(outputPathSmall);
    
    console.log('Small logo PNG generated successfully at:', outputPathSmall);
  } catch (error) {
    console.error('Error generating PNG:', error);
    
    // Fallback: create using canvas if sharp fails
    console.log('\nTrying alternative method with canvas...');
    await generateWithCanvas();
  }
}

async function generateWithCanvas() {
  try {
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(300, 80);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 300, 80);
    
    // Create gradient for icon background
    const iconGradient = ctx.createLinearGradient(10, 20, 50, 60);
    iconGradient.addColorStop(0, '#2563eb');
    iconGradient.addColorStop(1, '#9333ea');
    
    // Draw icon background
    ctx.fillStyle = iconGradient;
    ctx.beginPath();
    ctx.roundRect(10, 20, 40, 40, 10);
    ctx.fill();
    
    // Draw sparkles (simplified)
    ctx.fillStyle = 'white';
    // Center star
    ctx.save();
    ctx.translate(30, 40);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(2, -2);
    ctx.lineTo(8, 0);
    ctx.lineTo(2, 2);
    ctx.lineTo(0, 8);
    ctx.lineTo(-2, 2);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-2, -2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Text gradient
    const textGradient = ctx.createLinearGradient(65, 0, 200, 0);
    textGradient.addColorStop(0, '#2563eb');
    textGradient.addColorStop(1, '#9333ea');
    
    // App name
    ctx.fillStyle = textGradient;
    ctx.font = 'bold 24px Arial';
    ctx.fillText('CoverGen', 65, 45);
    
    // Tagline
    ctx.fillStyle = '#4B5563';
    ctx.font = '14px Arial';
    ctx.fillText('Powered by Nano Banana*', 65, 65);
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(__dirname, '../public/logo-canvas.png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log('Logo PNG generated with canvas at:', outputPath);
  } catch (canvasError) {
    console.error('Canvas method also failed:', canvasError);
    console.log('\nPlease install required dependencies:');
    console.log('npm install sharp');
    console.log('or');
    console.log('npm install canvas');
  }
}

// Run the generator
generateLogoPNG();