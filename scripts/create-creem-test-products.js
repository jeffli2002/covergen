const { Creem } = require('creem');
require('dotenv').config({ path: '.env.local' });

async function createTestProducts() {
  console.log('🚀 Creating Creem Test Products...\n');
  
  const apiKey = process.env.CREEM_SECRET_KEY || process.env.CREEM_API_KEY;
  if (!apiKey) {
    console.error('❌ No Creem API key found in environment variables');
    process.exit(1);
  }
  
  const isTestKey = apiKey.startsWith('creem_test_');
  console.log(`Using ${isTestKey ? 'TEST' : 'PRODUCTION'} API key: ${apiKey.substring(0, 20)}...`);
  
  if (!isTestKey) {
    console.error('❌ This script requires a test API key (starting with "creem_test_")');
    console.error('   Your current key appears to be a production key.');
    process.exit(1);
  }
  
  const creem = new Creem({
    serverIdx: 1 // Test mode
  });
  
  try {
    // First, list existing products
    console.log('\n📋 Checking existing products...');
    const existingProducts = await creem.searchProducts({
      xApiKey: apiKey
    });
    
    console.log(`Found ${existingProducts.items?.length || 0} existing products:`);
    existingProducts.items?.forEach(product => {
      console.log(`- ${product.name} (${product.id})`);
    });
    
    // Create Pro product
    console.log('\n🔨 Creating Pro product...');
    try {
      const proProduct = await creem.createProduct({
        xApiKey: apiKey,
        createProductRequestEntity: {
          name: 'CoverGen Pro',
          description: 'Professional plan with 120 covers per month and priority support',
          price: 900, // $9.00 in cents
          currency: 'USD',
          billingType: 'recurring',
          billingPeriod: 'monthly',
          trialPeriodDays: 7
        }
      });
      
      console.log('✅ Pro product created successfully!');
      console.log(`   ID: ${proProduct.id}`);
      console.log(`   Name: ${proProduct.name}`);
    } catch (error) {
      console.error('❌ Failed to create Pro product:', error.message);
    }
    
    // Create Pro+ product
    console.log('\n🔨 Creating Pro+ product...');
    try {
      const proPlusProduct = await creem.createProduct({
        xApiKey: apiKey,
        createProductRequestEntity: {
          name: 'CoverGen Pro+',
          description: 'Premium plan with 300 covers per month, commercial license, and dedicated support',
          price: 1900, // $19.00 in cents
          currency: 'USD',
          billingType: 'recurring',
          billingPeriod: 'monthly',
          trialPeriodDays: 7
        }
      });
      
      console.log('✅ Pro+ product created successfully!');
      console.log(`   ID: ${proPlusProduct.id}`);
      console.log(`   Name: ${proPlusProduct.name}`);
    } catch (error) {
      console.error('❌ Failed to create Pro+ product:', error.message);
    }
    
    // List all products again
    console.log('\n📋 Final product list:');
    const finalProducts = await creem.searchProducts({
      xApiKey: apiKey
    });
    
    console.log(`Total products: ${finalProducts.items?.length || 0}`);
    finalProducts.items?.forEach(product => {
      console.log(`- ${product.name} (${product.id})`);
    });
    
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Update your .env.local file with the new product IDs:');
    console.log('   CREEM_PRO_PLAN_ID=<pro_product_id_from_above>');
    console.log('   CREEM_PRO_PLUS_PLAN_ID=<pro_plus_product_id_from_above>');
    console.log('\n2. Restart your Next.js development server');
    console.log('\n3. Try the payment flow again');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestProducts().catch(console.error);