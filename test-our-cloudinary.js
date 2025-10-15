const https = require('https');

const apiKey = '9ed11e892b19798118cbe9610c0bea7c';
const cloudinaryUrl = 'https://res.cloudinary.com/dvskpqqvv/image/upload/v1759584075/sora-inputs/qpkbfmhuogimxjarypfd.png';

const data = JSON.stringify({
  'model': 'sora-2-image-to-video',
  'input': {
    'prompt': 'Camera slowly zooms in',
    'image_urls': [cloudinaryUrl],
    'aspect_ratio': 'landscape',
    'quality': 'standard'
  }
});

console.log('Testing with OUR Cloudinary URL:', cloudinaryUrl);
console.log('\nRequest:', JSON.parse(data));

const options = {
  hostname: 'api.kie.ai',
  path: '/api/v1/jobs/createTask',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Bearer ' + apiKey
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => {
    console.log('\nStatus:', res.statusCode);
    console.log('Response:', body);
    try {
      const json = JSON.parse(body);
      console.log('\nParsed:', JSON.stringify(json, null, 2));
      if (json.code !== 200) {
        console.log('\n❌ THIS IS THE REAL ERROR FROM SORA API:');
        console.log('Error Code:', json.code);
        console.log('Error Message:', json.msg);
      } else {
        console.log('\n✅ SUCCESS - Our Cloudinary URL works!');
        console.log('Task ID:', json.data.taskId);
      }
    } catch(e) { 
      console.error('Parse error:', e); 
    }
  });
});

req.on('error', error => { 
  console.error('Request error:', error); 
});

req.write(data);
req.end();
