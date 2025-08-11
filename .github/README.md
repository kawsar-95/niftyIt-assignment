# GitHub Actions Workflows

This repository includes several GitHub Actions workflows for automated testing and maintenance:

## 🔄 Workflows Overview

### 1. **Playwright Tests** (`playwright-tests.yml`)
**Triggers:** Push to main/master/develop, PR, daily at 2 AM UTC, manual dispatch
- Runs comprehensive Playwright tests across 4 parallel groups
- Supports different test types via manual dispatch (all, quick, parallel, small, large, monofacial, bifacial)
- Merges test reports from all groups
- Optional deployment to GitHub Pages
- Artifacts retention: Reports (30 days), Results (7 days), Screenshots (7 days on failure)

### 2. **Quick CI Check** (`quick-ci.yml`)
**Triggers:** Push/PR to main/master
- Fast smoke tests for immediate feedback
- TypeScript compilation check
- Runs only quick test suite
- Artifacts retention: 3 days on failure

### 3. **Nightly Comprehensive Tests** (`nightly-tests.yml`)
**Triggers:** Daily at 1 AM UTC, manual dispatch
- Full test suite execution
- Browser selection support (chromium, firefox, webkit, all)
- Capacity filtering (all, small, large)
- Extended artifacts retention
- Failure notifications

### 4. **Security & Dependency Checks** (`security-checks.yml`)
**Triggers:** Push/PR to main/master, weekly on Mondays
- npm audit for security vulnerabilities
- Dependency version checks
- License compliance verification

## 🚀 Manual Workflow Dispatch

### Playwright Tests
Navigate to **Actions > Playwright Tests > Run workflow** and select:
- **Test Type:** `all`, `quick`, `parallel`, `small`, `large`, `monofacial`, `bifacial`

### Nightly Tests
Navigate to **Actions > Nightly Comprehensive Tests > Run workflow** and select:
- **Browser:** `chromium`, `firefox`, `webkit`, `all`
- **Capacity Filter:** `all`, `small`, `large`

## 📊 Test Reports

### HTML Reports
- Available as artifacts after test completion
- Automatically deployed to GitHub Pages (if enabled)
- Merged reports from parallel executions

### Screenshots & Videos
- Captured on test failures
- Available as downloadable artifacts
- Organized by test group/browser

## 🔧 Configuration

### Environment Variables
- `CI=true` - Enables CI-specific configurations
- `PLAYWRIGHT_GROUP` - Used for test group distribution

### Timeouts
- **Quick CI:** 30 minutes
- **Main Tests:** 120 minutes  
- **Nightly Tests:** 180 minutes

### Workers
- **CI Environment:** 2 workers (resource constrained)
- **Local Development:** 4 workers
- **Parallel Tests:** Up to 8 workers for full suite

## 📈 Artifacts

| Workflow | Artifact | Retention |
|----------|----------|-----------|
| Playwright Tests | HTML Reports | 30 days |
| Playwright Tests | Test Results | 7 days |
| Playwright Tests | Screenshots | 7 days (failures only) |
| Quick CI | Test Results | 3 days (failures only) |
| Nightly Tests | All Artifacts | 7-30 days |

## 🔐 GitHub Pages Setup (Optional)

To enable automatic report deployment:

1. Go to **Settings > Pages**
2. Source: **GitHub Actions**
3. The workflow will automatically deploy merged reports

## 💡 Best Practices

### For Contributors
- **Quick CI** runs on every PR for fast feedback
- Use **manual dispatch** for specific test scenarios
- Check artifacts for detailed failure analysis

### For Maintainers
- Monitor **nightly tests** for regression detection
- Review **security checks** weekly
- Update dependencies based on audit results

## 🔍 Troubleshooting

### Common Issues
1. **Timeout Errors:** Increase timeout values in workflow files
2. **Resource Constraints:** Reduce worker count for CI
3. **Flaky Tests:** Enable retries in Playwright config
4. **Large Artifacts:** Implement cleanup strategies

### Debugging
- Enable debug mode: Add `debug: true` to test steps
- Use headed mode: Modify test commands with `--headed`
- Check runner logs for detailed error information

## 📱 Notifications

### Current Setup
- Job summaries in GitHub Actions UI
- Artifact upload notifications
- Failure status in PR checks

### Optional Enhancements
- Slack/Teams integration (requires webhook setup)
- Email notifications via GitHub settings
- Custom dashboard integration
