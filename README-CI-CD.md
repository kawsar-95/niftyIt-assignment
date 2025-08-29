# 🚀 Dev Portal CI/CD Pipeline

Automated testing pipeline that triggers when changes are detected on `https://dev.portal.denowatts.com` and sends reports to Slack.

## ⚡ Quick Start

```bash
# 1. Run setup script
npm run setup

# 2. Set environment variables
export GITHUB_TOKEN="your_github_token"
export SLACK_WEBHOOK_URL="your_slack_webhook_url"

# 3. Test the setup
npm run webhook:test

# 4. Start monitoring
npm run monitor:start
```

## 🔧 Manual Triggers

```bash
# Trigger tests manually
npm run webhook:trigger

# Test webhook functionality
npm run webhook:test

# Start local monitoring
npm run monitor:start
```

## 📊 Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `monitor-dev-portal.yml` | Scheduled (30min) + Manual | Monitor dev portal changes |
| `webhook-trigger.yml` | Repository dispatch | Webhook-triggered testing |
| `ci.yml` | Push/PR | Standard CI for code changes |

## 🔐 Required Secrets

Add these to GitHub repository secrets:

- `GITHUB_TOKEN` - GitHub Personal Access Token
- `SLACK_WEBHOOK_URL` - Slack Incoming Webhook URL
- `TEST_USER_EMAIL` - Test user email
- `TEST_USER_PASSWORD` - Test user password

## 📱 Slack Notifications

Channel: `#denowatts-automation`

Notifications for:
- ✅ Test success after portal changes
- ❌ Test failures
- ⚠️ Monitor errors
- ℹ️ No changes detected

## 📈 Monitoring Dashboard

- **Workflow Runs**: https://github.com/kawsar-95/niftyIt-assignment/actions
- **Test Artifacts**: Available in each workflow run
- **Slack Channel**: `#denowatts-automation`

## 🛠️ Troubleshooting

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

## 📚 Documentation

For detailed setup instructions, see: `docs/CI-CD-SETUP.md`

## 🎯 Architecture

```
Dev Portal Changes → Monitor Script → GitHub Webhook → GitHub Actions → Test Execution → Slack Notification
```

---

**Status**: ✅ Ready for deployment
**Last Updated**: $(date)
**Repository**: https://github.com/kawsar-95/niftyIt-assignment
