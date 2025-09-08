const { Creem } = require('creem');
require('dotenv').config({ path: '.env.local' });

async function listCreemProducts() {
  console.log('🔍 Listing Creem Products...\n');
  
  const apiKey = process.env.CREEM_SECRET_KEY || process.env.CREEM_API_KEY;
  if (!apiKey) {
    console.error('❌ No Creem API key found in environment variables');
    process.exit(1);
  }
  
  const isTestKey = apiKey.startsWith('creem_test_');
  console.log(`Using ${isTestKey ? 'TEST' : 'PRODUCTION'} API key: ${apiKey.substring(0, 20)}...`);
  
  const creem = new Creem({
    serverIdx: isTestKey ? 1 : 0
  });
  
  try {
    console.log('\n📋 Fetching products from Creem...');
    const products = await creem.searchProducts({
      xApiKey: apiKey
    });
    
    if (!products.items || products.items.length === 0) {
      console.log('\n❌ No products found in your Creem account!');
      console.log('\nYou need to either:');
      console.log('1. Run: node scripts/create-creem-test-products.js');
      console.log('2. Or create products manually in the Creem dashboard');
      return;
    }
    
    console.log(`\n✅ Found ${products.items.length} products:\n`);
    
    products.items.forEach((product, index) => {
      console.log(`Product ${index + 1}:`);
      console.log(`  Name: ${product.name}`);
      console.log(`  ID: ${product.id}`);
      console.log(`  Price: $${(product.price / 100).toFixed(2)}`);
      console.log(`  Currency: ${product.currency}`);
      console.log(`  Status: ${product.status || 'active'}`);
      console.log(`  Billing: ${product.billingType} (${product.billingPeriod})`);
      console.log('');
    });
    
    console.log('\n📝 TO FIX YOUR PAYMENT ISSUE:');
    console.log('\n1. Update your .env.local file with the correct product IDs:');
    console.log('   (Choose the products that match your Pro and Pro+ plans)\n');
    console.log('   CREEM_PRO_PLAN_ID=<copy_pro_product_id_from_above>');
    console.log('   CREEM_PRO_PLUS_PLAN_ID=<copy_pro_plus_product_id_from_above>');
    console.log('\n2. Restart your Next.js server (Ctrl+C and npm run dev)');
    console.log('\n3. Try the payment flow again');
    
    // Try to guess which products are Pro and Pro+
    console.log('\n💡 SUGGESTED MAPPING:');
    const proProduct = products.items.find(p => 
      p.name.toLowerCase().includes('pro') && 
      !p.name.toLowerCase().includes('plus') &&
      p.price === 900
    );
    const proPlusProduct = products.items.find(p => 
      (p.name.toLowerCase().includes('pro+') || p.name.toLowerCase().includes('pro plus')) &&
      p.price === 1900
    );
    
    if (proProduct) {
      console.log(`   CREEM_PRO_PLAN_ID=${proProduct.id}`);
    }
    if (proPlusProduct) {
      console.log(`   CREEM_PRO_PLUS_PLAN_ID=${proPlusProduct.id}`);
    }
    
    if (!proProduct || !proPlusProduct) {
      console.log('\n   Could not automatically identify Pro/Pro+ products.');
      console.log('   Please manually select the correct product IDs based on the list above.');
    }
    
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    if (error.status === 401) {
      console.error('\n   Your API key may be invalid or expired.');
    }
  }
}

listCreemProducts().catch(console.error);