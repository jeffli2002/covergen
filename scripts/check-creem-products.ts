import { Creem } from 'creem'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

async function checkCreemProducts() {
  console.log('🔍 Checking Creem Configuration...\n')
  
  const apiKey = process.env.CREEM_SECRET_KEY || ''
  const isTestKey = apiKey.startsWith('creem_test_')
  
  console.log('API Key Info:')
  console.log(`- Type: ${isTestKey ? 'TEST' : 'PRODUCTION'}`)
  console.log(`- Key prefix: ${apiKey.substring(0, 15)}...`)
  console.log(`- Server: ${isTestKey ? 'Test Mode' : 'Production'}\n`)
  
  // Initialize Creem client
  const creem = new Creem({
    serverIdx: isTestKey ? 1 : 0 // 0: production, 1: test-mode
  })
  
  console.log('Configured Product IDs:')
  console.log(`- Pro: ${process.env.CREEM_PRO_PLAN_ID || 'prod_7aQWgvmz1JHGafTEGZtz9g'}`)
  console.log(`- Pro+: ${process.env.CREEM_PRO_PLUS_PLAN_ID || 'prod_3yWSn216dKFHKZJ0Z2Jrcp'}\n`)
  
  // Try to retrieve the products
  console.log('Attempting to retrieve products...\n')
  
  const productIds = [
    process.env.CREEM_PRO_PLAN_ID || 'prod_7aQWgvmz1JHGafTEGZtz9g',
    process.env.CREEM_PRO_PLUS_PLAN_ID || 'prod_3yWSn216dKFHKZJ0Z2Jrcp'
  ]
  
  for (const productId of productIds) {
    try {
      console.log(`Checking product: ${productId}`)
      const product = await creem.retrieveProduct({
        productId: productId,
        xApiKey: apiKey
      })
      console.log(`✅ SUCCESS: Product "${product.name}" found`)
      console.log(`   - ID: ${product.id}`)
      console.log(`   - Status: ${product.status || 'active'}`)
      console.log(`   - Mode: ${product.mode || 'N/A'}\n`)
    } catch (error: any) {
      console.log(`❌ ERROR: Could not retrieve product ${productId}`)
      console.log(`   - Status: ${error.status || 'Unknown'}`)
      console.log(`   - Message: ${error.message || 'Unknown error'}`)
      if (error.status === 403) {
        console.log(`   - This product may not exist in your ${isTestKey ? 'test' : 'production'} account`)
      }
      console.log()
    }
  }
  
  // Try to list all available products
  console.log('\nAttempting to list all available products...')
  try {
    const products = await creem.searchProducts({
      xApiKey: apiKey
    })
    
    console.log(`\nFound ${products.items?.length || 0} products in your account:`)
    if (products.items && products.items.length > 0) {
      products.items.forEach((product: any) => {
        console.log(`- ${product.name} (${product.id})`)
      })
    } else {
      console.log('No products found. You may need to create products in your Creem dashboard.')
    }
  } catch (error: any) {
    console.log('❌ ERROR: Could not list products')
    console.log(`   - Status: ${error.status || 'Unknown'}`)
    console.log(`   - Message: ${error.message || 'Unknown error'}`)
  }
  
  console.log('\n\n📋 RECOMMENDATIONS:')
  console.log('1. If the product IDs are not found, you need to:')
  console.log('   - Log into your Creem dashboard')
  console.log('   - Create the products with the exact IDs shown above')
  console.log('   - Or update your environment variables with the correct product IDs')
  console.log('\n2. Make sure you\'re using:')
  console.log('   - Test API key with test mode enabled')
  console.log('   - Products created under the same account as your API key')
  console.log('\n3. If you see different product IDs in the list above, update your .env files')
}

// Run the check
checkCreemProducts().catch(console.error)