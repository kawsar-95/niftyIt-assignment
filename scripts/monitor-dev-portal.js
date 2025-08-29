#!/usr/bin/env node

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  devPortalUrl: 'https://dev.portal.denowatts.com',
  githubToken: process.env.GITHUB_TOKEN,
  githubRepo: 'kawsar-95/niftyIt-assignment',
  hashFile: path.join(__dirname, '../.website-hash'),
  checkInterval: 5 * 60 * 1000, // 5 minutes
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL
};

class DevPortalMonitor {
  constructor() {
    this.lastHash = this.loadLastHash();
    this.isRunning = false;
  }

  loadLastHash() {
    try {
      if (fs.existsSync(CONFIG.hashFile)) {
        return fs.readFileSync(CONFIG.hashFile, 'utf8').trim();
      }
    } catch (error) {
      console.error('Error loading last hash:', error.message);
    }
    return null;
  }

  saveHash(hash) {
    try {
      fs.writeFileSync(CONFIG.hashFile, hash);
    } catch (error) {
      console.error('Error saving hash:', error.message);
    }
  }

  async fetchWebsiteContent() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'dev.portal.denowatts.com',
        port: 443,
        path: '/',
        method: 'GET',
        headers: {
          'User-Agent': 'DevPortalMonitor/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve(data);
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async triggerGitHubWebhook(reason = 'Dev portal changes detected') {
    if (!CONFIG.githubToken) {
      console.error('❌ GITHUB_TOKEN not set. Cannot trigger webhook.');
      return false;
    }

    const webhookData = {
      event_type: 'dev-portal-changed',
      client_payload: {
        reason: reason,
        sender: 'DevPortalMonitor',
        timestamp: new Date().toISOString(),
        portal_url: CONFIG.devPortalUrl
      }
    };

    return new Promise((resolve, reject) => {
      const data = JSON.stringify(webhookData);
      
      const options = {
        hostname: 'api.github.com',
        port: 443,
        path: `/repos/${CONFIG.githubRepo}/dispatches`,
        method: 'POST',
        headers: {
          'Authorization': `token ${CONFIG.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DevPortalMonitor/1.0',
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
            console.log('✅ GitHub webhook triggered successfully');
            resolve(true);
          } else {
            console.error(`❌ GitHub webhook failed: ${res.statusCode} - ${responseData}`);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Error triggering GitHub webhook:', error.message);
        resolve(false);
      });

      req.write(data);
      req.end();
    });
  }

  async sendSlackNotification(message, isSuccess = true) {
    if (!CONFIG.slackWebhookUrl) {
      console.log('ℹ️ SLACK_WEBHOOK_URL not set. Skipping Slack notification.');
      return;
    }

    const slackData = {
      text: message,
      icon_emoji: isSuccess ? ':white_check_mark:' : ':warning:'
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
            console.log('✅ Slack notification sent');
          } else {
            console.log(`⚠️ Slack notification failed: ${res.statusCode}`);
          }
          resolve();
        });
      });

      req.on('error', (error) => {
        console.error('❌ Error sending Slack notification:', error.message);
        resolve();
      });

      req.write(data);
      req.end();
    });
  }

  async checkForChanges() {
    try {
      console.log(`🔍 Checking ${CONFIG.devPortalUrl} for changes...`);
      
      const content = await this.fetchWebsiteContent();
      const currentHash = this.generateHash(content);
      
      if (this.lastHash && currentHash !== this.lastHash) {
        console.log('🔄 Changes detected! Triggering webhook...');
        
        const webhookSuccess = await this.triggerGitHubWebhook();
        
        if (webhookSuccess) {
          await this.sendSlackNotification(
            `🔄 *Dev Portal Changes Detected*\n\n` +
            `Changes have been detected on ${CONFIG.devPortalUrl}\n` +
            `Automated tests have been triggered.\n\n` +
            `🔗 [View Workflow Runs](https://github.com/${CONFIG.githubRepo}/actions)`,
            true
          );
        }
        
        this.lastHash = currentHash;
        this.saveHash(currentHash);
      } else {
        console.log('✅ No changes detected');
      }
    } catch (error) {
      console.error('❌ Error checking for changes:', error.message);
      await this.sendSlackNotification(
        `⚠️ *Dev Portal Monitor Error*\n\n` +
        `Error checking ${CONFIG.devPortalUrl}:\n` +
        `\`\`\`${error.message}\`\`\`\n\n` +
        `Please check the monitor script.`,
        false
      );
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Dev Portal Monitor...');
    console.log(`📡 Monitoring: ${CONFIG.devPortalUrl}`);
    console.log(`⏰ Check interval: ${CONFIG.checkInterval / 1000} seconds`);
    console.log(`📁 Hash file: ${CONFIG.hashFile}`);
    
    if (!CONFIG.githubToken) {
      console.log('⚠️ GITHUB_TOKEN not set. Webhook triggering will be disabled.');
    }
    
    if (!CONFIG.slackWebhookUrl) {
      console.log('⚠️ SLACK_WEBHOOK_URL not set. Slack notifications will be disabled.');
    }

    // Initial check
    await this.checkForChanges();

    // Set up periodic checks
    setInterval(async () => {
      await this.checkForChanges();
    }, CONFIG.checkInterval);

    console.log('✅ Monitor started successfully');
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Monitor stopped');
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Stopping monitor...');
  if (monitor) {
    monitor.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Stopping monitor...');
  if (monitor) {
    monitor.stop();
  }
  process.exit(0);
});

// Start the monitor
const monitor = new DevPortalMonitor();
monitor.start().catch(error => {
  console.error('❌ Failed to start monitor:', error);
  process.exit(1);
});
