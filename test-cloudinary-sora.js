const https = require('https');

const apiKey = process.env.KIE_API_KEY || '9ed11e892b19798118cbe9610c0bea7c';

// Test with a Cloudinary demo image (publicly available)
const cloudinaryTestUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

const data = JSON.stringify({
  'model': 'sora-2-image-to-video',
  'input': {
    'prompt': 'Camera slowly zooms in',
    'image_urls': [cloudinaryTestUrl],
    'aspect_ratio': 'landscape',
    'quality': 'standard'
  }
});

console.log('Testing with Cloudinary URL:', cloudinaryTestUrl);
console.log('Request:', JSON.parse(data));

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
        console.log('\n❌ ERROR:');
        console.log('Code:', json.code);
        console.log('Message:', json.msg);
      } else {
        console.log('\n✅ SUCCESS - Cloudinary URLs work with Sora API');
      }
    } catch(e) { 
      console.error('Parse error:', e.message); 
    }
  });
});

req.on('error', error => { 
  console.error('Request error:', error); 
});

req.write(data);
req.end();
