const sharp = require('sharp');
const path = require('path');

async function makeLogoTransparent() {
  try {
    const inputPath = path.join(__dirname, '../public/blueLogo.png');
    const outputPath = path.join(__dirname, '../public/blueLogoTransparent.png');
    
    console.log('Converting logo to transparent background...');
    
    // Read the image and remove white background
    await sharp(inputPath)
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } }) // Make white transparent
      .removeAlpha() // Remove alpha channel first
      .ensureAlpha() // Add alpha channel back
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Process pixel by pixel to make white pixels transparent
        const pixels = new Uint8ClampedArray(data);
        const pixelCount = info.width * info.height;
        
        for (let i = 0; i < pixelCount; i++) {
          const idx = i * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          
          // If pixel is white or near-white, make it transparent
          if (r > 240 && g > 240 && b > 240) {
            pixels[idx + 3] = 0; // Set alpha to 0 (transparent)
          }
        }
        
        // Write the processed image
        return sharp(pixels, {
          raw: {
            width: info.width,
            height: info.height,
            channels: 4
          }
        })
        .png()
        .toFile(outputPath);
      });
    
    console.log('Transparent logo created successfully at:', outputPath);
    
    // Also create a version with just the blue text on transparent background
    await sharp(inputPath)
      .threshold(240) // Convert near-white to white
      .negate({ alpha: false }) // Invert colors except alpha
      .threshold(15) // Convert near-black to black
      .negate({ alpha: false }) // Invert back
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(__dirname, '../public/blueLogoClean.png'));
      
    console.log('Clean version also created at:', path.join(__dirname, '../public/blueLogoClean.png'));
    
  } catch (error) {
    console.error('Error creating transparent logo:', error);
    
    // Alternative method using canvas if sharp fails
    console.log('\nTrying alternative method with canvas...');
    await createTransparentWithCanvas();
  }
}

async function createTransparentWithCanvas() {
  try {
    const { createCanvas, loadImage } = require('canvas');
    const fs = require('fs');
    
    const inputPath = path.join(__dirname, '../public/blueLogo.png');
    const outputPath = path.join(__dirname, '../public/blueLogoTransparent.png');
    
    // Load the image
    const image = await loadImage(inputPath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the image
    ctx.drawImage(image, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    
    // Make white pixels transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is white or near-white
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0; // Set alpha to 0
      }
    }
    
    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log('Transparent logo created with canvas at:', outputPath);
  } catch (canvasError) {
    console.error('Canvas method also failed:', canvasError);
    console.log('\nTo make the logo transparent, you can:');
    console.log('1. Install sharp: npm install sharp');
    console.log('2. Or install canvas: npm install canvas');
    console.log('3. Or use an online tool to remove the white background manually');
  }
}

// Run the converter
makeLogoTransparent();