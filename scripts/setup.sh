#!/bin/bash

# Dev Portal CI/CD Setup Script
# This script helps set up the automated testing pipeline

set -e

echo "🚀 Dev Portal CI/CD Setup Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js v18 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Install Playwright browsers
install_browsers() {
    print_status "Installing Playwright browsers..."
    npx playwright install --with-deps
    print_success "Playwright browsers installed successfully"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    local missing_vars=()
    
    if [ -z "$GITHUB_TOKEN" ]; then
        missing_vars+=("GITHUB_TOKEN")
    else
        print_success "GITHUB_TOKEN is set"
    fi
    
    if [ -z "$SLACK_WEBHOOK_URL" ]; then
        missing_vars+=("SLACK_WEBHOOK_URL")
        print_warning "SLACK_WEBHOOK_URL is not set (optional)"
    else
        print_success "SLACK_WEBHOOK_URL is set"
    fi
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_warning "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        print_status "Please set these variables before running the monitor:"
        echo "  export GITHUB_TOKEN=\"your_github_token\""
        echo "  export SLACK_WEBHOOK_URL=\"your_slack_webhook_url\" (optional)"
    fi
}

# Test webhook functionality
test_webhooks() {
    print_status "Testing webhook functionality..."
    
    if [ -z "$GITHUB_TOKEN" ]; then
        print_warning "Skipping webhook tests (GITHUB_TOKEN not set)"
        return
    fi
    
    npm run webhook:test
}

# Show next steps
show_next_steps() {
    echo ""
    echo "🎯 Next Steps:"
    echo "=============="
    echo ""
    echo "1. Set up GitHub Secrets:"
    echo "   - Go to https://github.com/kawsar-95/niftyIt-assignment/settings/secrets/actions"
    echo "   - Add the following secrets:"
    echo "     * GITHUB_TOKEN (GitHub Personal Access Token)"
    echo "     * SLACK_WEBHOOK_URL (Slack Incoming Webhook URL)"
    echo "     * TEST_USER_EMAIL (Test user email)"
    echo "     * TEST_USER_PASSWORD (Test user password)"
    echo ""
    echo "2. Test the setup:"
    echo "   npm run webhook:test"
    echo ""
    echo "3. Start monitoring:"
    echo "   npm run monitor:start"
    echo ""
    echo "4. Manual webhook trigger:"
    echo "   npm run webhook:trigger"
    echo ""
    echo "5. View documentation:"
    echo "   cat docs/CI-CD-SETUP.md"
    echo ""
}

# Main setup function
main() {
    echo "Starting setup process..."
    echo ""
    
    check_nodejs
    check_npm
    install_dependencies
    install_browsers
    check_env_vars
    
    echo ""
    print_status "Running webhook tests..."
    test_webhooks
    
    show_next_steps
    
    print_success "Setup completed successfully!"
    echo ""
    print_status "Your automation pipeline is ready to use!"
}

# Run main function
main "$@"
