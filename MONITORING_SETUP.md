# Enhanced Dev Portal Monitoring Setup

## 🚀 Quick Start

### 1. Set up GitHub Secrets
Go to your GitHub repository: https://github.com/kawsar-95/niftyIt-assignment/settings/secrets/actions

Add these secrets:
- `GITHUB_TOKEN`: Your GitHub personal access token with 'repo' permissions
- `SLACK_WEBHOOK_URL`: Your Slack webhook URL for notifications
- `TEST_USER_EMAIL`: Test user email for automation
- `TEST_USER_PASSWORD`: Test user password for automation

### 2. Test the Setup
```bash
./scripts/test-monitoring.sh
```

### 3. Start Local Monitoring
```bash
# Start enhanced monitoring
npm run monitor:enhanced

# Or run the script directly
node scripts/enhanced-monitor.js
```

### 4. Manual Test Trigger
```bash
# Trigger tests manually
npm run webhook:trigger

# Or trigger specific test suite
curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/kawsar-95/niftyIt-assignment/dispatches \
  -d '{"event_type":"manual-test-trigger","client_payload":{"test_suite":"quick"}}'
```

## 📋 Available Commands

### Monitoring
- `npm run monitor:enhanced`: Start enhanced monitoring
- `npm run monitor:start`: Start basic monitoring
- `npm run monitor:test`: Test webhook functionality

### Testing
- `npm run test:quick`: Run quick test suite
- `npm run test:parallel`: Run parallel tests
- `npm run test:all`: Run all tests
- `npm run test:monofacial`: Run monofacial tests only
- `npm run test:bifacial`: Run bifacial tests only

### Webhooks
- `npm run webhook:trigger`: Trigger manual webhook
- `npm run webhook:test`: Test webhook functionality

## 🔧 Configuration

### Environment Variables
- `DEV_PORTAL_URL`: The URL to monitor (default: https://dev.portal.denowatts.com)
- `MONITOR_CHECK_INTERVAL`: Check interval in milliseconds (default: 300000 = 5 minutes)
- `MONITOR_MAX_RETRIES`: Maximum retry attempts (default: 3)
- `MONITOR_RETRY_DELAY`: Delay between retries in milliseconds (default: 30000)

### GitHub Actions
The enhanced monitoring workflow (`.github/workflows/enhanced-monitor.yml`) will:
1. Monitor the dev portal every 15 minutes during business hours
2. Detect changes using comprehensive hashing
3. Trigger automated tests when changes are detected
4. Send detailed Slack notifications with test results
5. Upload test artifacts and reports

## 📊 Slack Notifications

The system will send notifications to the `#denowatts-automation` channel with:
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
```bash
# Check monitor status
node scripts/enhanced-monitor.js --status

# Test webhook manually
npm run webhook:test

# Run tests locally
npm run test:quick
```

## 📈 Monitoring Dashboard

View your monitoring results at:
- GitHub Actions: https://github.com/kawsar-95/niftyIt-assignment/actions
- Test Reports: Available as artifacts in each workflow run
- Slack Channel: #denowatts-automation

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

*Last updated: Fri Aug 29 12:05:49 +06 2025*
