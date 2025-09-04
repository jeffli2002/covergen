#!/bin/bash

# Creem Payment Integration E2E Test Runner

echo "🧪 Creem Payment Integration Test Runner"
echo "========================================"
echo ""

# Check if .env.test exists
if [ ! -f "tests/e2e/.env.test" ]; then
    echo "❌ Error: tests/e2e/.env.test not found!"
    echo "📝 Please copy tests/e2e/.env.test.example to tests/e2e/.env.test"
    echo "   and fill in your Creem test API keys."
    exit 1
fi

# Load test environment variables
export $(cat tests/e2e/.env.test | grep -v '^#' | xargs)

# Verify Creem test mode is enabled
if [ "$NEXT_PUBLIC_CREEM_TEST_MODE" != "true" ]; then
    echo "❌ Error: NEXT_PUBLIC_CREEM_TEST_MODE must be set to 'true'"
    exit 1
fi

# Check if required keys are set
if [ -z "$NEXT_PUBLIC_CREEM_PUBLIC_KEY" ] || [ -z "$CREEM_SECRET_KEY" ]; then
    echo "❌ Error: Creem test API keys not configured!"
    echo "   Please add your test keys to tests/e2e/.env.test"
    exit 1
fi

echo "✅ Creem test mode enabled"
echo "🔑 Using test public key: ${NEXT_PUBLIC_CREEM_PUBLIC_KEY:0:15}..."
echo ""

# Install Playwright browsers if needed
if [ ! -d "node_modules/@playwright/test/node_modules/.cache" ]; then
    echo "📦 Installing Playwright browsers..."
    npm run test:install
fi

# Start the development server in the background
echo "🚀 Starting development server..."
npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
while ! curl -s http://localhost:3000 > /dev/null; do
    sleep 1
done
echo "✅ Server is ready!"
echo ""

# Run the tests
echo "🧪 Running E2E tests..."
echo "========================"

# You can pass arguments to this script to run specific tests
# e.g., ./run-tests.sh payment-flow.spec.ts
if [ $# -eq 0 ]; then
    # Run all tests
    npm run test:e2e
else
    # Run specific test file
    npx playwright test "tests/e2e/$1"
fi

TEST_EXIT_CODE=$?

# Clean up
echo ""
echo "🧹 Cleaning up..."
kill $DEV_PID 2>/dev/null

# Exit with test exit code
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed. Check the report above."
fi

exit $TEST_EXIT_CODE