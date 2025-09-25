#!/usr/bin/env node

/**
 * Script to check platform page URLs and verify they're accessible
 * This will help diagnose if platform pages are incorrectly routed
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'spotify', 'twitch', 'linkedin', 'bilibili', 'rednote', 'wechat'];

async function checkUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual' // Don't follow redirects automatically
    });
    
    return {
      url,
      status: response.status,
      location: response.headers.get('location'),
      isRedirect: [301, 302, 307, 308].includes(response.status)
    };
  } catch (error) {
    return {
      url,
      error: error.message
    };
  }
}

async function checkPlatformUrls() {
  console.log('🔍 Checking Platform URLs');
  console.log('Base URL:', BASE_URL);
  console.log('');

  // Check each platform URL
  for (const platform of PLATFORMS) {
    console.log(`\n📱 Platform: ${platform}`);
    
    // Check correct URL
    const correctUrl = `${BASE_URL}/en/platforms/${platform}`;
    const correctResult = await checkUrl(correctUrl);
    console.log(`✅ Correct URL: ${correctUrl}`);
    console.log(`   Status: ${correctResult.status}`);
    if (correctResult.isRedirect) {
      console.log(`   ⚠️  Redirects to: ${correctResult.location}`);
    }
    
    // Check incorrect URL (the one user mentioned)
    const incorrectUrl = `${BASE_URL}/pricing/platforms/${platform}`;
    const incorrectResult = await checkUrl(incorrectUrl);
    console.log(`❌ Incorrect URL: ${incorrectUrl}`);
    console.log(`   Status: ${incorrectResult.status}`);
    if (incorrectResult.isRedirect) {
      console.log(`   ⚠️  Redirects to: ${incorrectResult.location}`);
    }
    
    // Also check without locale
    const noLocaleUrl = `${BASE_URL}/platforms/${platform}`;
    const noLocaleResult = await checkUrl(noLocaleUrl);
    console.log(`🌐 No locale URL: ${noLocaleUrl}`);
    console.log(`   Status: ${noLocaleResult.status}`);
    if (noLocaleResult.isRedirect) {
      console.log(`   ⚠️  Redirects to: ${noLocaleResult.location}`);
    }
  }

  // Check the main platforms page
  console.log('\n📄 Main Platforms Page');
  const mainUrl = `${BASE_URL}/en/platforms`;
  const mainResult = await checkUrl(mainUrl);
  console.log(`URL: ${mainUrl}`);
  console.log(`Status: ${mainResult.status}`);
  if (mainResult.isRedirect) {
    console.log(`⚠️  Redirects to: ${mainResult.location}`);
  }
}

// Run the check
checkPlatformUrls().then(() => {
  console.log('\n✅ URL check completed');
  console.log('\nIf you see any URLs with /pricing/platforms/ that return 200 OK, there might be an issue.');
  console.log('If all /pricing/platforms/ URLs return 404, the routing is correct.');
}).catch((error) => {
  console.error('\n❌ Error:', error);
});