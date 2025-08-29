#!/bin/bash

# Load Environment Variables Script
# This script loads environment variables from .env file

if [ -f ".env" ]; then
    echo "🔧 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded successfully!"
    echo ""
    echo "📋 Current environment variables:"
    echo "   GITHUB_TOKEN: ${GITHUB_TOKEN:0:10}..."
    echo "   TEST_USER_EMAIL: $TEST_USER_EMAIL"
    echo "   TEST_USER_PASSWORD: $TEST_USER_PASSWORD"
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        echo "   SLACK_WEBHOOK_URL: ${SLACK_WEBHOOK_URL:0:30}..."
    else
        echo "   SLACK_WEBHOOK_URL: Not set"
    fi
    echo ""
else
    echo "❌ .env file not found!"
    echo "Please run 'npm run set-env' to create the .env file first."
    exit 1
fi
