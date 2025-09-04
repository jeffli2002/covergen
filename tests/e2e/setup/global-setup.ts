import { FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  // Load test environment variables
  const testEnvPath = path.resolve(__dirname, '../.env.test');
  dotenv.config({ path: testEnvPath });

  console.log('🧪 Setting up Creem test environment...');
  
  // Validate required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_CREEM_TEST_MODE',
    'NEXT_PUBLIC_CREEM_PUBLIC_KEY',
    'CREEM_SECRET_KEY',
    'NEXT_PUBLIC_APP_URL'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.log('💡 Please copy .env.test.example to .env.test and fill in the values');
    process.exit(1);
  }

  // Verify we're in test mode
  if (process.env.NEXT_PUBLIC_CREEM_TEST_MODE !== 'true') {
    console.error('❌ NEXT_PUBLIC_CREEM_TEST_MODE must be set to "true" for tests');
    process.exit(1);
  }

  console.log('✅ Creem test mode enabled');
  console.log(`📍 Base URL: ${config.projects[0].use?.baseURL || 'http://localhost:3000'}`);
  
  // You could add additional setup here like:
  // - Creating test database
  // - Seeding test data
  // - Starting mock servers
  
  return async () => {
    console.log('🧹 Cleaning up test environment...');
    // Cleanup code here
  };
}

export default globalSetup;