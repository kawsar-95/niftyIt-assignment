#!/usr/bin/env node

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Enhanced Configuration
const CONFIG = {
  devPortalUrl: 'https://dev.portal.denowatts.com',
  githubToken: process.env.GITHUB_TOKEN,
  githubRepo: 'kawsar-95/niftyIt-assignment',
  hashFile: path.join(__dirname, '../.website-hash'),
  checkInterval: 5 * 60 * 1000, // 5 minutes
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  maxRetries: 3,
  retryDelay: 30000, // 30 seconds
  userAgent: 'DenowattsEnhancedMonitor/2.0'
};

class EnhancedDevPortalMonitor {
  constructor() {
    this.lastHash = this.loadLastHash();
    this.isRunning = false;
    this.consecutiveFailures = 0;
    this.lastCheckTime = null;
    this.startTime = new Date();
  }

  loadLastHash() {
    try {
      if (fs.existsSync(CONFIG.hashFile)) {
        return fs.readFileSync(CONFIG.hashFile, 'utf8').trim();
      }
    } catch (error) {
      console.error('❌ Error loading last hash:', error.message);
    }
    return null;
  }

  saveHash(hash) {
    try {
      fs.writeFileSync(CONFIG.hashFile, hash);
      console.log(`💾 Hash saved: ${hash.substring(0, 8)}...`);
    } catch (error) {
      console.error('❌ Error saving hash:', error.message);
    }
  }

  async fetchWebsiteContent(retryCount = 0) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'dev.portal.denowatts.com',
        port: 443,
        path: '/',
        method: 'GET',
        headers: {
          'User-Agent': CONFIG.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 30000
      };

      const req = https.request(options, (res) => {
        let data = '';
        const startTime = Date.now();
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          console.log(`📡 Response: ${res.statusCode} (${responseTime}ms)`);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              content: data,
              statusCode: res.statusCode,
              responseTime,
              headers: res.headers
            });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error(`❌ Request error (attempt ${retryCount + 1}):`, error.message);
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async fetchWithRetry() {
    for (let attempt = 0; attempt < CONFIG.maxRetries; attempt++) {
      try {
        return await this.fetchWebsiteContent(attempt);
      } catch (error) {
        if (attempt === CONFIG.maxRetries - 1) {
          throw error;
        }
        console.log(`🔄 Retrying in ${CONFIG.retryDelay / 1000}s... (${attempt + 1}/${CONFIG.maxRetries})`);
        await this.sleep(CONFIG.retryDelay);
      }
    }
  }

  generateHash(content, headers = {}) {
    // Create a comprehensive hash including content and important headers
    const headerString = JSON.stringify({
      'last-modified': headers['last-modified'],
      'etag': headers['etag'],
      'content-length': headers['content-length'],
      'cache-control': headers['cache-control']
    });
    
    return crypto.createHash('sha256')
      .update(content + headerString)
      .digest('hex');
  }

  async triggerGitHubWebhook(reason = 'Dev portal changes detected', metadata = {}) {
    if (!CONFIG.githubToken) {
      console.error('❌ GITHUB_TOKEN not set. Cannot trigger webhook.');
      return false;
    }

    const webhookData = {
      event_type: 'dev-portal-changed',
      client_payload: {
        reason: reason,
        sender: 'EnhancedDevPortalMonitor',
        timestamp: new Date().toISOString(),
        portal_url: CONFIG.devPortalUrl,
        metadata: {
          ...metadata,
          monitor_uptime: Date.now() - this.startTime.getTime(),
          consecutive_failures: this.consecutiveFailures
        }
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
          'User-Agent': CONFIG.userAgent,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        },
        timeout: 30000
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

      req.on('timeout', () => {
        req.destroy();
        console.error('❌ GitHub webhook timeout');
        resolve(false);
      });

      req.write(data);
      req.end();
    });
  }

  async sendSlackNotification(message, isSuccess = true, metadata = {}) {
    if (!CONFIG.slackWebhookUrl) {
      console.log('ℹ️ SLACK_WEBHOOK_URL not set. Skipping Slack notification.');
      return;
    }

    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000 / 60); // minutes
    
    const slackData = {
      attachments: [{
        color: isSuccess ? 'good' : 'danger',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${isSuccess ? '✅' : '⚠️'} Dev Portal Monitor Alert`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `🕐 Uptime: ${uptime}m | 🔄 Failures: ${this.consecutiveFailures} | 📡 URL: ${CONFIG.devPortalUrl}`
              }
            ]
          }
        ]
      }]
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
        },
        timeout: 10000
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

      req.on('timeout', () => {
        req.destroy();
        console.error('❌ Slack notification timeout');
        resolve();
      });

      req.write(data);
      req.end();
    });
  }

  async checkForChanges() {
    const checkStartTime = Date.now();
    this.lastCheckTime = new Date();
    
    try {
      console.log(`\n🔍 [${new Date().toISOString()}] Checking ${CONFIG.devPortalUrl} for changes...`);
      
      const response = await this.fetchWithRetry();
      const currentHash = this.generateHash(response.content, response.headers);
      
      console.log(`📊 Status: ${response.statusCode} | Time: ${response.responseTime}ms | Hash: ${currentHash.substring(0, 8)}...`);
      
      if (this.lastHash && currentHash !== this.lastHash) {
        console.log('🔄 Changes detected! Triggering webhook...');
        
        const metadata = {
          statusCode: response.statusCode,
          responseTime: response.responseTime,
          previousHash: this.lastHash.substring(0, 8),
          currentHash: currentHash.substring(0, 8)
        };
        
        const webhookSuccess = await this.triggerGitHubWebhook('Enhanced monitoring detected changes', metadata);
        
        if (webhookSuccess) {
          await this.sendSlackNotification(
            `🔄 *Dev Portal Changes Detected*\n\n` +
            `Changes have been detected on ${CONFIG.devPortalUrl}\n` +
            `• Status: ${response.statusCode}\n` +
            `• Response Time: ${response.responseTime}ms\n` +
            `• Hash Change: ${this.lastHash.substring(0, 8)}... → ${currentHash.substring(0, 8)}...\n\n` +
            `Automated tests have been triggered.\n\n` +
            `🔗 [View Workflow Runs](https://github.com/${CONFIG.githubRepo}/actions)`,
            true,
            metadata
          );
        }
        
        this.lastHash = currentHash;
        this.saveHash(currentHash);
        this.consecutiveFailures = 0; // Reset failure counter on success
      } else {
        console.log('✅ No changes detected');
        this.consecutiveFailures = 0; // Reset failure counter on success
      }
      
      const checkDuration = Date.now() - checkStartTime;
      console.log(`⏱️ Check completed in ${checkDuration}ms`);
      
    } catch (error) {
      this.consecutiveFailures++;
      console.error(`❌ Error checking for changes (failure #${this.consecutiveFailures}):`, error.message);
      
      if (this.consecutiveFailures >= 3) {
        await this.sendSlackNotification(
          `🚨 *Dev Portal Monitor Error*\n\n` +
          `Failed to check ${CONFIG.devPortalUrl} ${this.consecutiveFailures} times in a row.\n\n` +
          `**Error**: \`${error.message}\`\n\n` +
          `Please check the monitor script and portal availability.`,
          false,
          { error: error.message, consecutiveFailures: this.consecutiveFailures }
        );
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Enhanced Dev Portal Monitor...');
    console.log(`📡 Monitoring: ${CONFIG.devPortalUrl}`);
    console.log(`⏰ Check interval: ${CONFIG.checkInterval / 1000} seconds`);
    console.log(`📁 Hash file: ${CONFIG.hashFile}`);
    console.log(`🔄 Max retries: ${CONFIG.maxRetries}`);
    
    if (!CONFIG.githubToken) {
      console.log('⚠️ GITHUB_TOKEN not set. Webhook triggering will be disabled.');
    }
    
    if (!CONFIG.slackWebhookUrl) {
      console.log('⚠️ SLACK_WEBHOOK_URL not set. Slack notifications will be disabled.');
    }

    // Send startup notification
    await this.sendSlackNotification(
      `🚀 *Enhanced Dev Portal Monitor Started*\n\n` +
      `Monitoring ${CONFIG.devPortalUrl}\n` +
      `Check interval: ${CONFIG.checkInterval / 1000}s\n` +
      `Started at: ${this.startTime.toISOString()}`,
      true
    );

    // Initial check
    await this.checkForChanges();

    // Set up periodic checks
    const intervalId = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(intervalId);
        return;
      }
      await this.checkForChanges();
    }, CONFIG.checkInterval);

    console.log('✅ Enhanced monitor started successfully');
    
    // Store interval ID for cleanup
    this.intervalId = intervalId;
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log('🛑 Enhanced monitor stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      startTime: this.startTime,
      lastCheckTime: this.lastCheckTime,
      consecutiveFailures: this.consecutiveFailures,
      uptime: Date.now() - this.startTime.getTime(),
      lastHash: this.lastHash ? this.lastHash.substring(0, 8) + '...' : null
    };
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Stopping enhanced monitor...');
  if (monitor) {
    await monitor.sendSlackNotification(
      `🛑 *Enhanced Dev Portal Monitor Stopped*\n\n` +
      `Monitor stopped by user request.\n` +
      `Uptime: ${Math.floor((Date.now() - monitor.startTime.getTime()) / 1000 / 60)}m`,
      true
    );
    monitor.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Stopping enhanced monitor...');
  if (monitor) {
    await monitor.sendSlackNotification(
      `🛑 *Enhanced Dev Portal Monitor Stopped*\n\n` +
      `Monitor stopped by system.\n` +
      `Uptime: ${Math.floor((Date.now() - monitor.startTime.getTime()) / 1000 / 60)}m`,
      true
    );
    monitor.stop();
  }
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('❌ Uncaught Exception:', error);
  if (monitor) {
    await monitor.sendSlackNotification(
      `💥 *Enhanced Monitor Critical Error*\n\n` +
      `Uncaught exception occurred:\n` +
      `\`\`\`${error.message}\`\`\`\n\n` +
      `Monitor will attempt to restart...`,
      false
    );
  }
  process.exit(1);
});

// Start the enhanced monitor
const monitor = new EnhancedDevPortalMonitor();
monitor.start().catch(error => {
  console.error('❌ Failed to start enhanced monitor:', error);
  process.exit(1);
});

// Export for potential external use
module.exports = { EnhancedDevPortalMonitor, monitor };
