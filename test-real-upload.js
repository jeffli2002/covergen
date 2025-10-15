#!/usr/bin/env node

/**
 * Test script to debug the actual Sora API error
 * This uploads an image to Cloudinary and then tries to use it with Sora API
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.KIE_API_KEY || '9ed11e892b19798118cbe9610c0bea7c';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(imagePath) {
  return new Promise((resolve, reject) => {
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file', fs.createReadStream(imagePath));
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    form.append('folder', 'sora-inputs');
    
    console.log('Uploading to Cloudinary...');
    
    form.submit(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, (err, res) => {
      if (err) return reject(err);
      
      let body = '';
      res.on('data', d => { body += d; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          console.log('Cloudinary response:', {
            secure_url: data.secure_url,
            format: data.format,
            width: data.width,
            height: data.height,
            bytes: data.bytes
          });
          resolve(data.secure_url);
        } catch (e) {
          reject(e);
        }
      });
    });
  });
}

async function testSoraApi(imageUrl) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      'model': 'sora-2-image-to-video',
      'input': {
        'prompt': 'Camera slowly zooms in, cinematic lighting',
        'image_urls': [imageUrl],
        'aspect_ratio': 'landscape',
        'quality': 'standard'
      }
    });

    console.log('\nTesting Sora API with Cloudinary URL...');
    console.log('Image URL:', imageUrl);
    console.log('Request:', JSON.parse(data));

    const options = {
      hostname: 'api.kie.ai',
      path: '/api/v1/jobs/createTask',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': 'Bearer ' + API_KEY
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', d => { body += d; });
      res.on('end', () => {
        console.log('\nSora API Response:');
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Body:', body);
        
        try {
          const json = JSON.parse(body);
          console.log('\nParsed:', JSON.stringify(json, null, 2));
          
          if (json.code !== 200) {
            console.log('\n❌ SORA API ERROR DETAILS:');
            console.log('Error Code:', json.code);
            console.log('Error Message:', json.msg);
            console.log('\nThis is the ACTUAL error from Sora API!');
            resolve({ success: false, error: json });
          } else {
            console.log('\n✅ SUCCESS - Task created:', json.data.taskId);
            resolve({ success: true, taskId: json.data.taskId });
          }
        } catch(e) { 
          console.error('Parse error:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', error => { 
      console.error('Request error:', error); 
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('='.repeat(80));
  console.log('Real Cloudinary Upload → Sora API Test');
  console.log('='.repeat(80));
  
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.error('❌ Missing Cloudinary credentials in environment');
    process.exit(1);
  }
  
  const testImagePath = path.join(__dirname, 'images/wechatdemo.png');
  if (!fs.existsSync(testImagePath)) {
    console.error('❌ Test image not found:', testImagePath);
    process.exit(1);
  }
  
  try {
    // Step 1: Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(testImagePath);
    
    // Step 2: Wait for CDN propagation
    console.log('\nWaiting 3 seconds for CDN propagation...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Verify image is accessible
    console.log('\nVerifying image URL is accessible...');
    await new Promise((resolve, reject) => {
      https.get(imageUrl, (res) => {
        console.log('Image check status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        if (res.statusCode === 200) {
          console.log('✅ Image is accessible');
          resolve();
        } else {
          reject(new Error(`Image not accessible: ${res.statusCode}`));
        }
      }).on('error', reject);
    });
    
    // Step 4: Test with Sora API
    await new Promise(resolve => setTimeout(resolve, 2000));
    const result = await testSoraApi(imageUrl);
    
    console.log('\n' + '='.repeat(80));
    if (result.success) {
      console.log('✅ TEST PASSED - Sora API accepted the Cloudinary URL');
    } else {
      console.log('❌ TEST FAILED - Sora API rejected the Cloudinary URL');
      console.log('The error details above show the REAL reason for failure');
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main().catch(console.error);
