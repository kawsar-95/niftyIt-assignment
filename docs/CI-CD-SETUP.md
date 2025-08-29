# CI/CD Pipeline Setup Guide

This guide explains how to set up automated testing that triggers when changes are detected on `https://dev.portal.denowatts.com` and sends reports to Slack.

## 🏗️ Architecture Overview

```
Dev Portal Changes → Monitor Script → GitHub Webhook → GitHub Actions → Test Execution → Slack Notification
```

## 📋 Prerequisites

1. **GitHub Repository**: `https://github.com/kawsar-95/niftyIt-assignment`
2. **GitHub Personal Access Token** with `repo` scope
3. **Slack Webhook URL** for notifications
4. **Node.js** (v18+) for running the monitor script

## 🔧 Setup Instructions

### 1. GitHub Secrets Configuration

Add these secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxxxxxxxxxx` |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL | `https://hooks.slack.com/services/...` |
| `TEST_USER_EMAIL` | Test user email | `nuruddinkawsar1995@gmail.com` |
| `TEST_USER_PASSWORD` | Test user password | `Test@1234` |
| `DEV_PORTAL_URL` | Dev portal URL | `https://dev.portal.denowatts.com` |

### 2. Slack Channel Setup

1. Create a Slack app at https://api.slack.com/apps
2. Enable "Incoming Webhooks"
3. Create a webhook for your channel (e.g., `#denowatts-automation`)
4. Copy the webhook URL to GitHub secrets

### 3. GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope
3. Copy the token to GitHub secrets as `GITHUB_TOKEN`

## 🚀 Running the Monitor

### Option 1: Local Monitoring (Recommended for Development)

```bash
# Install dependencies
npm install

# Set environment variables
export GITHUB_TOKEN="your_github_token"
export SLACK_WEBHOOK_URL="your_slack_webhook_url"

# Start the monitor
npm run monitor:start
```

### Option 2: GitHub Actions Scheduled Monitoring

The workflow `.github/workflows/monitor-dev-portal.yml` runs automatically:
- Every 30 minutes during business hours (6 AM - 6 PM UTC, Mon-Fri)
- Every 2 hours on weekends
- Can be triggered manually via GitHub Actions UI

### Option 3: Manual Webhook Trigger

```bash
# Trigger tests manually
npm run webhook:trigger
```

## 📊 Workflow Files

### 1. `monitor-dev-portal.yml`
- **Purpose**: Scheduled monitoring of dev portal
- **Triggers**: Cron schedule + manual dispatch
- **Features**: 
  - Website change detection
  - Automated test execution
  - Slack notifications
  - Test result artifacts

### 2. `webhook-trigger.yml`
- **Purpose**: Webhook-triggered testing
- **Triggers**: Repository dispatch events
- **Features**:
  - Immediate test execution
  - Detailed Slack reporting
  - Webhook payload tracking

### 3. `ci.yml`
- **Purpose**: Standard CI for code changes
- **Triggers**: Push/PR to main branches
- **Features**:
  - Quick test execution
  - Linting and type checking

## 🔍 Monitor Script Details

The monitor script (`scripts/monitor-dev-portal.js`) performs:

1. **Website Monitoring**: Fetches dev portal content every 5 minutes
2. **Change Detection**: Compares SHA256 hashes of website content
3. **Webhook Triggering**: Sends GitHub repository dispatch events
4. **Slack Notifications**: Reports status changes and errors
5. **Hash Persistence**: Stores last known hash in `.website-hash`

## 📱 Slack Notifications

The system sends notifications for:

- ✅ **Success**: All tests passed after portal changes
- ❌ **Failure**: Tests failed after portal changes
- ⚠️ **Errors**: Monitor script errors or webhook failures
- ℹ️ **Info**: No changes detected (periodic status)

### Notification Format

```
🔄 Dev Portal Changes Detected

Changes have been detected on https://dev.portal.denowatts.com
Automated tests have been triggered.

🔗 View Workflow Runs
```

## 🛠️ Troubleshooting

### Common Issues

1. **Webhook Not Triggering**
   - Check `GITHUB_TOKEN` has `repo` scope
   - Verify repository name in monitor script
   - Check GitHub API rate limits

2. **Slack Notifications Not Working**
   - Verify `SLACK_WEBHOOK_URL` is correct
   - Check Slack app permissions
   - Ensure channel exists and bot has access

3. **Tests Failing**
   - Check test credentials in secrets
   - Verify dev portal is accessible
   - Review test artifacts for screenshots/traces

4. **Monitor Script Errors**
   - Check network connectivity
   - Verify Node.js version (v18+)
   - Review error logs in console

### Debug Commands

```bash
# Test webhook manually
npm run webhook:trigger

# Check monitor script
npm run monitor:test

# View test results
npm run report

# Clean and reinstall
npm run test:clean
```

## 🔄 Workflow Triggers

### Automatic Triggers
- **Scheduled**: Every 30 minutes (business hours)
- **Website Changes**: When dev portal content changes
- **Code Changes**: Push/PR to main branches

### Manual Triggers
- **GitHub Actions UI**: Manual workflow dispatch
- **CLI Command**: `npm run webhook:trigger`
- **API Call**: Direct GitHub API webhook

## 📈 Monitoring Dashboard

Access test results and artifacts:
- **Workflow Runs**: https://github.com/kawsar-95/niftyIt-assignment/actions
- **Test Artifacts**: Available in each workflow run
- **Slack Channel**: `#denowatts-automation`

## 🔐 Security Considerations

1. **Token Security**: Never commit tokens to code
2. **Webhook Validation**: Consider adding webhook signature validation
3. **Rate Limiting**: Monitor GitHub API usage
4. **Access Control**: Limit who can trigger manual workflows

## 📝 Customization

### Modify Check Interval
Edit `CONFIG.checkInterval` in `scripts/monitor-dev-portal.js`:
```javascript
checkInterval: 5 * 60 * 1000, // 5 minutes
```

### Change Slack Channel
Update the channel in workflow files:
```yaml
channel: '#your-channel-name'
```

### Add More Test Scripts
Add new test commands to `package.json`:
```json
"test:custom": "playwright test --grep=\"YourPattern\""
```

## 🎯 Next Steps

1. Set up GitHub secrets
2. Configure Slack webhook
3. Test the monitor script locally
4. Deploy to production server (optional)
5. Monitor and adjust as needed

## 📞 Support

For issues or questions:
1. Check GitHub Actions logs
2. Review Slack notifications
3. Examine test artifacts
4. Contact the development team
