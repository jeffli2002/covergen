#!/usr/bin/env node

/**
 * Automated Payment Auth Tests
 * This script tests the payment auth wrapper implementation
 * without requiring a full Next.js runtime
 */

const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ ${message}`, colors.blue);
}

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  warnings: []
};

// Test 1: Check auth-wrapper file exists and has correct structure
function testAuthWrapperStructure() {
  info('\nTest 1: Checking PaymentAuthWrapper structure...');
  
  const filePath = path.join(__dirname, '../src/services/payment/auth-wrapper.tsx');
  
  if (!fs.existsSync(filePath)) {
    error('auth-wrapper.tsx file not found');
    testResults.failed++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for required methods
  const requiredMethods = [
    'getAuthContext',
    'isSessionValidForPayment', 
    'getPaymentAuthHeaders',
    'needsReauthForPayment',
    'getMinSessionValidityMinutes'
  ];
  
  let allMethodsFound = true;
  requiredMethods.forEach(method => {
    if (content.includes(`static async ${method}`) || content.includes(`static ${method}`)) {
      success(`Found method: ${method}`);
    } else {
      error(`Missing method: ${method}`);
      allMethodsFound = false;
    }
  });
  
  if (allMethodsFound) {
    success('All required methods found in PaymentAuthWrapper');
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Test 2: Check for forbidden auth operations
function testNoAuthStateModification() {
  info('\nTest 2: Checking for forbidden auth operations...');
  
  const filePath = path.join(__dirname, '../src/services/payment/auth-wrapper.tsx');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Forbidden operations that modify auth state
  const forbiddenOperations = [
    'refreshSession',
    'setSession',
    'signOut',
    'signIn',
    'updateUser',
    'resetPassword'
  ];
  
  let foundForbidden = false;
  forbiddenOperations.forEach(op => {
    // Check if the operation is called (not just mentioned in comments)
    const regex = new RegExp(`\\.${op}\\s*\\(`, 'g');
    if (regex.test(content)) {
      error(`Found forbidden operation: ${op}`);
      foundForbidden = true;
    }
  });
  
  if (!foundForbidden) {
    success('No forbidden auth state modifications found');
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Test 3: Check Creem service integration
function testCreemServiceIntegration() {
  info('\nTest 3: Checking Creem service integration...');
  
  const filePath = path.join(__dirname, '../src/services/payment/creem.ts');
  
  if (!fs.existsSync(filePath)) {
    error('creem.ts file not found');
    testResults.failed++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for auth wrapper usage
  if (content.includes('PaymentAuthWrapper')) {
    success('Creem service imports PaymentAuthWrapper');
    
    // Check specific methods are used
    if (content.includes('PaymentAuthWrapper.getAuthContext')) {
      success('Uses getAuthContext method');
    }
    if (content.includes('PaymentAuthWrapper.isSessionValidForPayment')) {
      success('Uses isSessionValidForPayment method');
    }
    if (content.includes('PaymentAuthWrapper.getPaymentAuthHeaders')) {
      success('Uses getPaymentAuthHeaders method');
    }
    
    testResults.passed++;
  } else {
    error('Creem service does not use PaymentAuthWrapper');
    testResults.failed++;
  }
  
  // Check for removed auth service direct usage
  const hasDirectAuthRefresh = content.includes('authService.refreshSession');
  const hasDirectEnsureValid = content.includes('authService.ensureValidSession');
  
  if (hasDirectAuthRefresh || hasDirectEnsureValid) {
    error('Creem service still has direct auth state modifications');
    testResults.failed++;
  } else {
    success('No direct auth state modifications in Creem service');
    testResults.passed++;
  }
}

// Test 4: Check webhook handlers
function testWebhookHandlers() {
  info('\nTest 4: Checking webhook handlers...');
  
  const webhookPath = path.join(__dirname, '../src/app/api/webhooks/creem/route.ts');
  
  if (!fs.existsSync(webhookPath)) {
    warning('Webhook handler not found at expected path');
    return;
  }
  
  const content = fs.readFileSync(webhookPath, 'utf8');
  
  // Check for admin client usage
  if (content.includes('createAdminSupabaseClient') || content.includes('SERVICE_ROLE_KEY')) {
    success('Webhook uses admin/service role client');
    testResults.passed++;
  } else {
    warning('Webhook might not be using admin client');
  }
  
  // Check for no user session manipulation
  if (content.includes('auth.setSession') || content.includes('auth.refreshSession')) {
    error('Webhook manipulates user sessions - CRITICAL');
    testResults.failed++;
  } else {
    success('Webhook does not manipulate user sessions');
    testResults.passed++;
  }
}

// Test 5: Check payment page implementation
function testPaymentPageIntegration() {
  info('\nTest 5: Checking payment page integration...');
  
  const pagePath = path.join(__dirname, '../src/app/[locale]/payment/page-client.tsx');
  
  if (!fs.existsSync(pagePath)) {
    warning('Payment page client not found');
    return;
  }
  
  const content = fs.readFileSync(pagePath, 'utf8');
  
  // Check for auth wrapper usage
  if (content.includes('PaymentAuthWrapper')) {
    success('Payment page imports PaymentAuthWrapper');
    
    if (content.includes('PaymentAuthWrapper.isSessionValidForPayment')) {
      success('Payment page checks session validity correctly');
      testResults.passed++;
    }
  } else {
    warning('Payment page might not use PaymentAuthWrapper');
  }
  
  // Check for removed direct session refresh
  if (content.includes('authService.refreshSession')) {
    error('Payment page still tries to refresh sessions');
    testResults.failed++;
  } else {
    success('Payment page does not refresh sessions');
    testResults.passed++;
  }
}

// Test 6: Check for multiple client warnings
function testNoMultipleClients() {
  info('\nTest 6: Checking for multiple client instance prevention...');
  
  // Check auth wrapper doesn't create new Supabase clients
  const authWrapperPath = path.join(__dirname, '../src/services/payment/auth-wrapper.tsx');
  const content = fs.readFileSync(authWrapperPath, 'utf8');
  
  // Check for createClient usage
  if (content.includes('createClient(')) {
    // Check if it's only in the webhook validation method
    const lines = content.split('\n');
    let inWebhookMethod = false;
    let createClientInWebhook = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('validateWebhookSession')) {
        inWebhookMethod = true;
      }
      if (lines[i].includes('createClient(') && inWebhookMethod) {
        createClientInWebhook = true;
        // Check for proper safeguards
        if (content.includes("typeof window !== 'undefined'") && 
            content.includes('throw new Error') &&
            content.includes('webhook handlers')) {
          success('Webhook validation method has proper client-side prevention');
          testResults.passed++;
        } else {
          error('Webhook validation method lacks proper safeguards');
          testResults.failed++;
        }
        break;
      }
    }
    
    if (!createClientInWebhook) {
      error('PaymentAuthWrapper creates new Supabase client outside webhooks - CRITICAL');
      testResults.failed++;
    } else {
      warning('Admin client creation is isolated to webhook-only method');
    }
  } else {
    success('PaymentAuthWrapper does not create new Supabase clients');
    testResults.passed++;
  }
  
  // Check it only imports from existing instances
  if (content.includes("from '@/lib/supabase-simple'") || content.includes("from '@/services/authService'")) {
    success('Uses existing auth service/client instances');
    testResults.passed++;
  }
}

// Run all tests
function runAllTests() {
  log('\n=== Payment Auth Automated Tests ===\n', colors.blue);
  
  testAuthWrapperStructure();
  testNoAuthStateModification();
  testCreemServiceIntegration();
  testWebhookHandlers();
  testPaymentPageIntegration();
  testNoMultipleClients();
  
  // Summary
  log('\n=== Test Summary ===\n', colors.blue);
  
  const total = testResults.passed + testResults.failed;
  log(`Total tests: ${total}`);
  log(`Passed: ${testResults.passed}`, colors.green);
  log(`Failed: ${testResults.failed}`, colors.red);
  
  if (testResults.warnings.length > 0) {
    log(`\nWarnings:`, colors.yellow);
    testResults.warnings.forEach(w => warning(`  - ${w}`));
  }
  
  // Overall result
  if (testResults.failed === 0) {
    log('\n✅ All tests passed! Payment auth integration is properly isolated.', colors.green);
    return 0;
  } else {
    log('\n❌ Some tests failed. Please fix the issues before proceeding.', colors.red);
    return 1;
  }
}

// Execute tests
const exitCode = runAllTests();
process.exit(exitCode);