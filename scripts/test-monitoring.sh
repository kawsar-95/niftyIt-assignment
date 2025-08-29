#!/bin/bash

# Test script for monitoring setup
echo "🧪 Testing Enhanced Monitoring Setup..."

# Test 1: Check if all required files exist
echo "1. Checking required files..."
required_files=(
    "package.json"
    "playwright.config.ts"
    "scripts/enhanced-monitor.js"
    ".github/workflows/enhanced-monitor.yml"
    "tests/quote-creation.spec.ts"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
    fi
done

# Test 2: Check if dependencies are installed
echo ""
echo "2. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
else
    echo "   ❌ node_modules missing (run: npm ci)"
fi

# Test 3: Check if Playwright is installed
echo ""
echo "3. Checking Playwright..."
if npx playwright --version >/dev/null 2>&1; then
    echo "   ✅ Playwright is installed"
else
    echo "   ❌ Playwright not found (run: npx playwright install --with-deps)"
fi

# Test 4: Check environment variables
echo ""
echo "4. Checking environment variables..."
if [ -n "$GITHUB_TOKEN" ]; then
    echo "   ✅ GITHUB_TOKEN is set"
else
    echo "   ⚠️  GITHUB_TOKEN not set (will be disabled)"
fi

if [ -n "$SLACK_WEBHOOK_URL" ]; then
    echo "   ✅ SLACK_WEBHOOK_URL is set"
else
    echo "   ⚠️  SLACK_WEBHOOK_URL not set (Slack notifications disabled)"
fi

# Test 5: Check if dev portal is accessible
echo ""
echo "5. Testing dev portal accessibility..."
if curl -s -o /dev/null -w "%{http_code}" "https://dev.portal.denowatts.com" | grep -q "200"; then
    echo "   ✅ Dev portal is accessible"
else
    echo "   ⚠️  Dev portal might not be accessible"
fi

echo ""
echo "🎯 Setup test completed!"
