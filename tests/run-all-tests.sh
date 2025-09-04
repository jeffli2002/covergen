#!/bin/bash

# Creem Payment Integration - Comprehensive Test Runner
# This script runs all unit, integration, and E2E tests for the payment system

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Starting Creem Payment Integration Tests"
echo "=========================================="

# Check if required environment variables are set
check_env_vars() {
    echo -e "${YELLOW}Checking environment variables...${NC}"
    
    required_vars=(
        "NEXT_PUBLIC_CREEM_PUBLIC_KEY"
        "CREEM_SECRET_KEY"
        "CREEM_WEBHOOK_SECRET"
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=($var)
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}Error: Missing required environment variables:${NC}"
        printf '%s\n' "${missing_vars[@]}"
        echo ""
        echo "Please set these variables in your .env.test file"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All required environment variables are set${NC}"
}

# Run unit tests
run_unit_tests() {
    echo ""
    echo -e "${YELLOW}Running unit tests...${NC}"
    npm run test:unit -- --coverage
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Unit tests passed${NC}"
    else
        echo -e "${RED}✗ Unit tests failed${NC}"
        exit 1
    fi
}

# Run integration tests
run_integration_tests() {
    echo ""
    echo -e "${YELLOW}Running integration tests...${NC}"
    npm run test:integration
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Integration tests passed${NC}"
    else
        echo -e "${RED}✗ Integration tests failed${NC}"
        exit 1
    fi
}

# Run E2E tests
run_e2e_tests() {
    echo ""
    echo -e "${YELLOW}Running E2E tests...${NC}"
    
    # Install Playwright browsers if not already installed
    npx playwright install chromium
    
    # Run E2E tests
    npm run test:e2e
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ E2E tests passed${NC}"
    else
        echo -e "${RED}✗ E2E tests failed${NC}"
        echo "To view the test report, run: npx playwright show-report"
        exit 1
    fi
}

# Generate test report
generate_report() {
    echo ""
    echo -e "${YELLOW}Generating test report...${NC}"
    
    # Create test report directory
    mkdir -p test-reports
    
    # Copy coverage reports
    if [ -d "coverage" ]; then
        cp -r coverage test-reports/
    fi
    
    # Copy Playwright report
    if [ -d "playwright-report" ]; then
        cp -r playwright-report test-reports/
    fi
    
    echo -e "${GREEN}✓ Test reports generated in test-reports/ directory${NC}"
}

# Main execution
main() {
    # Parse command line arguments
    if [ "$1" == "--unit" ]; then
        check_env_vars
        run_unit_tests
    elif [ "$1" == "--integration" ]; then
        check_env_vars
        run_integration_tests
    elif [ "$1" == "--e2e" ]; then
        check_env_vars
        run_e2e_tests
    elif [ "$1" == "--help" ]; then
        echo "Usage: ./run-all-tests.sh [options]"
        echo ""
        echo "Options:"
        echo "  --unit          Run only unit tests"
        echo "  --integration   Run only integration tests"
        echo "  --e2e          Run only E2E tests"
        echo "  --help         Show this help message"
        echo ""
        echo "Without options, all tests will be run"
    else
        # Run all tests
        check_env_vars
        
        echo ""
        echo "Running all test suites..."
        echo ""
        
        run_unit_tests
        run_integration_tests
        run_e2e_tests
        generate_report
        
        echo ""
        echo "=========================================="
        echo -e "${GREEN}✅ All tests passed successfully!${NC}"
        echo "=========================================="
        echo ""
        echo "Test Summary:"
        echo "- Unit tests: ✓"
        echo "- Integration tests: ✓"
        echo "- E2E tests: ✓"
        echo ""
        echo "Reports available in test-reports/ directory"
    fi
}

# Run main function
main "$@"