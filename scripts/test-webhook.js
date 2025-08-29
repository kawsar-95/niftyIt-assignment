#!/usr/bin/env node

const https = require('https');

// Configuration
const CONFIG = {
  githubToken: process.env.GITHUB_TOKEN,
  githubRepo: 'kawsar-95/niftyIt-assignment',
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL
};

async function testGitHubWebhook() {
  console.log('🧪 Testing GitHub Webhook...');
  
  if (!CONFIG.githubToken) {
    console.error('❌ GITHUB_TOKEN not set');
    return false;
  }

  const webhookData = {
    event_type: 'dev-portal-changed',
    client_payload: {
      reason: 'Test webhook trigger',
      sender: 'TestScript',
      timestamp: new Date().toISOString(),
      portal_url: 'https://dev.portal.denowatts.com'
    }
  };

  return new Promise((resolve) => {
    const data = JSON.stringify(webhookData);
    
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${CONFIG.githubRepo}/dispatches`,
      method: 'POST',
      headers: {
        'Authorization': `token ${CONFIG.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'TestScript/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ GitHub webhook test successful');
          console.log(`📊 Response: ${res.statusCode}`);
          resolve(true);
        } else {
          console.error(`❌ GitHub webhook test failed: ${res.statusCode}`);
          console.error(`📄 Response: ${responseData}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error testing GitHub webhook:', error.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

async function testSlackWebhook() {
  console.log('🧪 Testing Slack Webhook...');
  
  if (!CONFIG.slackWebhookUrl) {
    console.log('ℹ️ SLACK_WEBHOOK_URL not set. Skipping Slack test.');
    return true;
  }

  const slackData = {
    text: '🧪 *Webhook Test*\n\nThis is a test message from the webhook test script.\n\n✅ If you see this, Slack integration is working!',
    icon_emoji: ':test_tube:'
  };

  return new Promise((resolve) => {
    const data = JSON.stringify(slackData);
    
    const url = new URL(CONFIG.slackWebhookUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Slack webhook test successful');
          resolve(true);
        } else {
          console.log(`⚠️ Slack webhook test failed: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error testing Slack webhook:', error.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

async function testDevPortalAccess() {
  console.log('🧪 Testing Dev Portal Access...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'dev.portal.denowatts.com',
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'TestScript/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Dev portal accessible: ${res.statusCode}`);
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });

    req.on('error', (error) => {
      console.error('❌ Dev portal not accessible:', error.message);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.error('❌ Dev portal timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Webhook Tests...\n');
  
  const results = {
    github: await testGitHubWebhook(),
    slack: await testSlackWebhook(),
    portal: await testDevPortalAccess()
  };
  
  console.log('\n📊 Test Results:');
  console.log(`GitHub Webhook: ${results.github ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Slack Webhook: ${results.slack ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Dev Portal Access: ${results.portal ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your setup is ready.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check your configuration.');
  }
  
  return allPassed;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testGitHubWebhook, testSlackWebhook, testDevPortalAccess };
