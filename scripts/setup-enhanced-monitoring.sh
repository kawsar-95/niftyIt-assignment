#!/bin/bash

# Enhanced Dev Portal Monitoring Setup Script
# This script sets up the complete monitoring system for dev.portal.denowatts.com

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="kawsar-95/niftyIt-assignment"
DEV_PORTAL_URL="https://dev.portal.denowatts.com"
SLACK_CHANNEL="#denowatts-automation"

echo -e "${BLUE}🚀 Enhanced Dev Portal Monitoring Setup${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running in the correct directory
if [ ! -f "package.json" ] || [ ! -f "playwright.config.ts" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "Project structure verified"

# Check Node.js and npm
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js $(node -v) and npm $(npm -v) verified"

# Install dependencies
print_info "Installing project dependencies..."
npm ci

print_status "Dependencies installed"

# Install Playwright browsers
print_info "Installing Playwright browsers..."
npx playwright install --with-deps

print_status "Playwright browsers installed"

# Create necessary directories
print_info "Creating necessary directories..."
mkdir -p test-results
mkdir -p screenshots
mkdir -p .github/workflows

print_status "Directories created"

# Make scripts executable
print_info "Making scripts executable..."
chmod +x scripts/*.sh
chmod +x scripts/*.js

print_status "Scripts made executable"

# Environment setup
print_info "Setting up environment variables..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Dev Portal Monitoring Configuration
DEV_PORTAL_URL=${DEV_PORTAL_URL}
TEST_USER_EMAIL=nuruddinkawsar1995@gmail.com
TEST_USER_PASSWORD=Test@1234

# GitHub Configuration (Set these in GitHub Secrets)
# GITHUB_TOKEN=your_github_token_here

# Slack Configuration (Set these in GitHub Secrets)
# SLACK_WEBHOOK_URL=your_slack_webhook_url_here

# Monitoring Configuration
MONITOR_CHECK_INTERVAL=300000
MONITOR_MAX_RETRIES=3
MONITOR_RETRY_DELAY=30000
EOF
    print_status ".env file created"
else
    print_warning ".env file already exists"
fi

# Create .gitignore entries if not present
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dependencies
node_modules/

# Test results
test-results/
playwright-report/
screenshots/

# Environment files
.env
.env.local

# Monitoring files
.website-hash

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
EOF
    print_status ".gitignore file created"
else
    # Check if monitoring entries exist
    if ! grep -q ".website-hash" .gitignore; then
        echo "" >> .gitignore
        echo "# Monitoring files" >> .gitignore
        echo ".website-hash" >> .gitignore
        print_status "Added monitoring entries to .gitignore"
    fi
fi

# GitHub Secrets setup instructions
print_info "GitHub Secrets Configuration Required:"
echo ""
echo -e "${YELLOW}You need to set up the following secrets in your GitHub repository:${NC}"
echo ""
echo -e "${BLUE}1. GITHUB_TOKEN${NC}"
echo "   - Go to GitHub Settings > Developer settings > Personal access tokens"
echo "   - Generate a new token with 'repo' permissions"
echo "   - Add it to your repository secrets"
echo ""
echo -e "${BLUE}2. SLACK_WEBHOOK_URL${NC}"
echo "   - Go to your Slack workspace"
echo "   - Create a new app or use existing one"
echo "   - Add 'Incoming Webhooks' feature"
echo "   - Create a webhook for channel: ${SLACK_CHANNEL}"
echo "   - Add the webhook URL to your repository secrets"
echo ""
echo -e "${BLUE}3. TEST_USER_EMAIL and TEST_USER_PASSWORD${NC}"
echo "   - Add your test credentials to repository secrets"
echo "   - These are used for automated testing"
echo ""

# Test the setup
print_info "Testing the setup..."

# Test if the enhanced monitor script works
if node scripts/enhanced-monitor.js --test 2>/dev/null; then
    print_status "Enhanced monitor script test passed"
else
    print_warning "Enhanced monitor script test failed (this is normal if tokens are not set)"
fi

# Test if the dev portal is accessible
print_info "Testing dev portal accessibility..."
if curl -s -o /dev/null -w "%{http_code}" "${DEV_PORTAL_URL}" | grep -q "200"; then
    print_status "Dev portal is accessible"
else
    print_warning "Dev portal might not be accessible (check your internet connection)"
fi

# Create a test script
cat > scripts/test-monitoring.sh << 'EOF'
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
EOF

chmod +x scripts/test-monitoring.sh
print_status "Test script created"

# Create a quick start guide
cat > MONITORING_SETUP.md << EOF
# Enhanced Dev Portal Monitoring Setup

## 🚀 Quick Start

### 1. Set up GitHub Secrets
Go to your GitHub repository: https://github.com/${REPO_NAME}/settings/secrets/actions

Add these secrets:
- \`GITHUB_TOKEN\`: Your GitHub personal access token with 'repo' permissions
- \`SLACK_WEBHOOK_URL\`: Your Slack webhook URL for notifications
- \`TEST_USER_EMAIL\`: Test user email for automation
- \`TEST_USER_PASSWORD\`: Test user password for automation

### 2. Test the Setup
\`\`\`bash
./scripts/test-monitoring.sh
\`\`\`

### 3. Start Local Monitoring
\`\`\`bash
# Start enhanced monitoring
npm run monitor:enhanced

# Or run the script directly
node scripts/enhanced-monitor.js
\`\`\`

### 4. Manual Test Trigger
\`\`\`bash
# Trigger tests manually
npm run webhook:trigger

# Or trigger specific test suite
curl -X POST -H "Authorization: token \$GITHUB_TOKEN" \\
  -H "Accept: application/vnd.github.v3+json" \\
  https://api.github.com/repos/${REPO_NAME}/dispatches \\
  -d '{"event_type":"manual-test-trigger","client_payload":{"test_suite":"quick"}}'
\`\`\`

## 📋 Available Commands

### Monitoring
- \`npm run monitor:enhanced\`: Start enhanced monitoring
- \`npm run monitor:start\`: Start basic monitoring
- \`npm run monitor:test\`: Test webhook functionality

### Testing
- \`npm run test:quick\`: Run quick test suite
- \`npm run test:parallel\`: Run parallel tests
- \`npm run test:all\`: Run all tests
- \`npm run test:monofacial\`: Run monofacial tests only
- \`npm run test:bifacial\`: Run bifacial tests only

### Webhooks
- \`npm run webhook:trigger\`: Trigger manual webhook
- \`npm run webhook:test\`: Test webhook functionality

## 🔧 Configuration

### Environment Variables
- \`DEV_PORTAL_URL\`: The URL to monitor (default: https://dev.portal.denowatts.com)
- \`MONITOR_CHECK_INTERVAL\`: Check interval in milliseconds (default: 300000 = 5 minutes)
- \`MONITOR_MAX_RETRIES\`: Maximum retry attempts (default: 3)
- \`MONITOR_RETRY_DELAY\`: Delay between retries in milliseconds (default: 30000)

### GitHub Actions
The enhanced monitoring workflow (\`.github/workflows/enhanced-monitor.yml\`) will:
1. Monitor the dev portal every 15 minutes during business hours
2. Detect changes using comprehensive hashing
3. Trigger automated tests when changes are detected
4. Send detailed Slack notifications with test results
5. Upload test artifacts and reports

## 📊 Slack Notifications

The system will send notifications to the \`${SLACK_CHANNEL}\` channel with:
- ✅ Success notifications when tests pass
- ⚠️ Warning notifications when tests fail
- 🚨 Error notifications for monitoring issues
- 📊 Detailed test reports and metrics

## 🛠️ Troubleshooting

### Common Issues
1. **GitHub Token Issues**: Ensure your token has 'repo' permissions
2. **Slack Webhook Issues**: Verify the webhook URL and channel permissions
3. **Test Failures**: Check test credentials and dev portal accessibility
4. **Monitoring Failures**: Verify network connectivity and dev portal status

### Debug Commands
\`\`\`bash
# Check monitor status
node scripts/enhanced-monitor.js --status

# Test webhook manually
npm run webhook:test

# Run tests locally
npm run test:quick
\`\`\`

## 📈 Monitoring Dashboard

View your monitoring results at:
- GitHub Actions: https://github.com/${REPO_NAME}/actions
- Test Reports: Available as artifacts in each workflow run
- Slack Channel: ${SLACK_CHANNEL}

## 🔄 Automation Flow

1. **Monitoring**: Enhanced monitor checks dev portal every 5 minutes
2. **Detection**: Changes are detected using SHA256 hashing of content + headers
3. **Trigger**: GitHub webhook is triggered with change metadata
4. **Testing**: Comprehensive test suite runs automatically
5. **Reporting**: Detailed reports are generated and uploaded
6. **Notification**: Slack notification sent with test results and links

## 🎯 Success Criteria

Your monitoring system is working correctly when:
- ✅ Dev portal changes trigger automated tests
- ✅ Test results are reported to Slack
- ✅ Test artifacts are uploaded to GitHub
- ✅ Monitoring runs continuously without errors
- ✅ Failed tests are properly reported and investigated

---

*Last updated: $(date)*
EOF

print_status "Setup guide created (MONITORING_SETUP.md)"

# Update package.json scripts
print_info "Updating package.json scripts..."

# Check if the enhanced monitor script is already in package.json
if ! grep -q "monitor:enhanced" package.json; then
    # Add the new script to package.json
    sed -i.bak 's/"monitor:start": "node scripts\/monitor-dev-portal.js",/"monitor:start": "node scripts\/monitor-dev-portal.js",\n    "monitor:enhanced": "node scripts\/enhanced-monitor.js",/' package.json
    print_status "Added enhanced monitor script to package.json"
else
    print_warning "Enhanced monitor script already exists in package.json"
fi

# Final summary
echo ""
echo -e "${GREEN}🎉 Enhanced Dev Portal Monitoring Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Set up GitHub Secrets (see MONITORING_SETUP.md)"
echo "2. Test the setup: ./scripts/test-monitoring.sh"
echo "3. Start monitoring: npm run monitor:enhanced"
echo "4. View the setup guide: cat MONITORING_SETUP.md"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "- Make sure to set up GitHub Secrets before running the monitor"
echo "- The enhanced workflow will run automatically every 15 minutes"
echo "- Slack notifications will be sent to ${SLACK_CHANNEL}"
echo ""
echo -e "${GREEN}Your enhanced monitoring system is ready! 🚀${NC}"
