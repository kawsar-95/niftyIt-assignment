#!/bin/bash

# Environment Variables Setup Script
# This script helps set up environment variables for local testing

echo "🔧 Setting up environment variables for local testing..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Please enter the following values:${NC}"
echo ""

# GitHub Token
echo -e "${YELLOW}1. GitHub Personal Access Token:${NC}"
echo "   - Go to: https://github.com/settings/tokens"
echo "   - Generate new token with 'repo' scope"
echo "   - Copy the token and paste it below"
echo ""
read -p "Enter your GitHub token: " GITHUB_TOKEN

# Slack Webhook URL
echo ""
echo -e "${YELLOW}2. Slack Webhook URL (optional):${NC}"
echo "   - Go to: https://api.slack.com/apps"
echo "   - Create app and enable Incoming Webhooks"
echo "   - Copy the webhook URL and paste it below"
echo "   - Press Enter to skip if you don't have one"
echo ""
read -p "Enter your Slack webhook URL (or press Enter to skip): " SLACK_WEBHOOK_URL

# Test user credentials (using defaults)
TEST_USER_EMAIL="nuruddinkawsar1995@gmail.com"
TEST_USER_PASSWORD="Test@1234"

echo ""
echo -e "${GREEN}Setting environment variables...${NC}"

# Export variables for current session
export GITHUB_TOKEN="$GITHUB_TOKEN"
export SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL"
export TEST_USER_EMAIL="$TEST_USER_EMAIL"
export TEST_USER_PASSWORD="$TEST_USER_PASSWORD"

# Create .env file for future use
cat > .env << EOF
# Environment variables for Dev Portal CI/CD
GITHUB_TOKEN=$GITHUB_TOKEN
SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL
TEST_USER_EMAIL=$TEST_USER_EMAIL
TEST_USER_PASSWORD=$TEST_USER_PASSWORD
EOF

echo -e "${GREEN}✅ Environment variables set successfully!${NC}"
echo ""
echo "📋 Current environment variables:"
echo "   GITHUB_TOKEN: ${GITHUB_TOKEN:0:10}..."
echo "   SLACK_WEBHOOK_URL: ${SLACK_WEBHOOK_URL:0:30}..."
echo "   TEST_USER_EMAIL: $TEST_USER_EMAIL"
echo "   TEST_USER_PASSWORD: $TEST_USER_PASSWORD"
echo ""
echo "💡 To use these variables in future sessions, run:"
echo "   source .env"
echo ""
echo "🧪 Now you can test the webhook:"
echo "   npm run webhook:test"
echo ""
echo -e "${BLUE}Note: These variables are only set for the current terminal session.${NC}"
echo "For permanent setup, add them to your shell profile (.bashrc, .zshrc, etc.)"
