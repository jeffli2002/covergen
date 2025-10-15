#!/usr/bin/env node

/**
 * Test the full image-to-video flow and see the REAL Sora API error
 * This simulates exactly what the frontend does
 */

const https = require('https');
const fs = require('path');

const API_KEY = process.env.KIE_API_KEY || '9ed11e892b19798118cbe9610c0bea7c';

// Use the Cloudinary URL we just successfully uploaded
const cloudinaryUrl = 'https://res.cloudinary.com/dvskpqqvv/image/upload/v1759584075/sora-inputs/qpkbfmhuogimxjarypfd.png';

async function createTask() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      'model': 'sora-2-image-to-video',
      'input': {
        'prompt': 'Camera slowly zooms in, cinematic lighting, smooth motion',
        'image_urls': [cloudinaryUrl],
        'aspect_ratio': 'landscape',
        'quality': 'standard'
      }
    });

    console.log('Creating Sora task with Cloudinary URL...');
    console.log('URL:', cloudinaryUrl);

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
        try {
          const json = JSON.parse(body);
          if (json.code !== 200) {
            console.log('\n❌ Task creation failed:');
            console.log('Error Code:', json.code);
            console.log('Error Message:', json.msg);
            reject(new Error(json.msg));
          } else {
            console.log('✅ Task created successfully');
            console.log('Task ID:', json.data.taskId);
            resolve(json.data.taskId);
          }
        } catch(e) { 
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function queryTask(taskId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.kie.ai',
      path: `/api/v1/jobs/recordInfo?taskId=${taskId}`,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + API_KEY
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', d => { body += d; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.code !== 200) {
            reject(new Error(json.msg));
          } else {
            resolve(json.data);
          }
        } catch(e) { 
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function pollTask(taskId, maxAttempts = 60) {
  console.log('\nPolling task status (max', maxAttempts, 'attempts)...');
  
  for (let i = 1; i <= maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const taskInfo = await queryTask(taskId);
    console.log(`Attempt ${i}/${maxAttempts}: State = ${taskInfo.state}`);
    
    if (taskInfo.state === 'success') {
      console.log('\n✅ Generation succeeded!');
      const result = JSON.parse(taskInfo.resultJson);
      console.log('Video URL:', result.resultUrls[0]);
      return { success: true, result };
    } else if (taskInfo.state === 'fail') {
      console.log('\n❌ Generation failed!');
      console.log('\n=== THIS IS THE REAL ERROR FROM SORA API ===');
      console.log('Fail Code:', taskInfo.failCode);
      console.log('Fail Message:', taskInfo.failMsg);
      console.log('\nRequest parameters sent to Sora:');
      console.log(taskInfo.param);
      console.log('=============================================\n');
      return { success: false, error: taskInfo };
    }
  }
  
  throw new Error('Polling timeout');
}

async function main() {
  console.log('='.repeat(80));
  console.log('Full Image-to-Video Flow Test');
  console.log('='.repeat(80));
  
  try {
    const taskId = await createTask();
    const result = await pollTask(taskId);
    
    console.log('\n' + '='.repeat(80));
    if (result.success) {
      console.log('✅ TEST PASSED - Full flow works!');
    } else {
      console.log('❌ TEST FAILED - See error details above');
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
