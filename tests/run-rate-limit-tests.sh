#!/bin/bash

# Rate Limit and Payment Flow Test Runner
# This script runs all tests related to rate limiting, trial upgrades, and payment conversions

echo "========================================"
echo "Running Rate Limit & Payment Flow Tests"
echo "========================================"
echo ""

# Set test environment variables
export NODE_ENV=test
export NEXT_PUBLIC_PRO_TRIAL_DAYS=7
export NEXT_PUBLIC_PRO_PLUS_TRIAL_DAYS=7
export NEXT_PUBLIC_CREEM_TEST_MODE=true

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run a test file
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo -e "${YELLOW}Running $test_name...${NC}"
    
    if npm test -- "$test_file" --passWithNoTests 2>/dev/null; then
        echo -e "${GREEN}✓ $test_name passed${NC}"
        return 0
    else
        echo -e "${RED}✗ $test_name failed${NC}"
        return 1
    fi
}

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Run individual test suites
echo "1. Testing Rate Limiting Service..."
if run_test "tests/integration/rate-limiting.test.ts" "Rate Limiting Service"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi
echo ""

echo "2. Testing Trial Upgrade Flow..."
if run_test "tests/integration/trial-upgrade-flow.test.ts" "Trial Upgrade Flow"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi
echo ""

echo "3. Testing Payment Conversion..."
if run_test "tests/integration/payment-conversion.test.ts" "Payment Conversion"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
fi
echo ""

# Summary
echo "========================================"
echo "Test Summary"
echo "========================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

# Manual Testing Checklist
echo "========================================"
echo "Manual Testing Checklist"
echo "========================================"
echo ""
echo "Please manually verify the following scenarios:"
echo ""
echo "[ ] Free Tier User Flow:"
echo "    - Create new account"
echo "    - Generate 3 covers (should work)"
echo "    - Try 4th cover (should show daily limit modal)"
echo "    - Modal shows 'Upgrade to Pro' and countdown timer"
echo "    - Click 'Try tomorrow' dismisses modal"
echo "    - Click 'Upgrade Now' goes to payment page"
echo ""
echo "[ ] Trial User Flow:"
echo "    - Start Pro trial from payment page"
echo "    - Verify account shows '🎉 Free trial active'"
echo "    - Generate 4 covers for Pro trial (should work)"
echo "    - Try 5th cover (should show trial daily limit modal)"
echo "    - Modal shows 'Start Subscription' button"
echo "    - Click 'Start subscription now' in account page"
echo "    - Redirects to Creem checkout"
echo ""
echo "[ ] Trial Conversion Flow:"
echo "    - During trial, click 'Start subscription now'"
echo "    - Complete Creem checkout"
echo "    - Return to account page"
echo "    - Verify trial badge is gone"
echo "    - Verify no more daily limits"
echo "    - Can generate covers without daily restriction"
echo ""
echo "[ ] Rate Limit Reset:"
echo "    - Use up daily limit"
echo "    - Wait for midnight UTC (or change system time)"
echo "    - Verify limit resets"
echo "    - Can generate covers again"
echo ""
echo "[ ] Environment Variable Testing:"
echo "    - Set NEXT_PUBLIC_PRO_TRIAL_DAYS=14"
echo "    - Start new Pro trial"
echo "    - Verify trial shows 14 days"
echo "    - Set NEXT_PUBLIC_PRO_TRIAL_DAYS=0"
echo "    - New signups go straight to paid"
echo ""

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All automated tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please check the output above.${NC}"
    exit 1
fi