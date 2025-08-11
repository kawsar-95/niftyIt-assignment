import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
  acNameplate: number;
  mountingType: string;
  moduleTechnology: string;
  expectedSensors: number;
  expectedGateways: number;
  actualSensors: number;
  actualGateways: number;
  sensorsValid: boolean;
  gatewaysValid: boolean;
  totalInitialInvoice: number;
  recurringAnnualService: number;
  quoteTotalValid: boolean;
  timestamp: string;
  status: 'PASS' | 'FAIL';
  errorMessage?: string;
}

export interface TestReportData {
  testSuite: string;
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: string;
  results: TestResult[];
  summary: {
    hardwareValidationResults: {
      totalSensorTests: number;
      passedSensorTests: number;
      totalGatewayTests: number;
      passedGatewayTests: number;
    };
    quoteCalculationResults: {
      totalQuoteTests: number;
      passedQuoteTests: number;
    };
    mountingTypeResults: {
      groundFixedTests: number;
      groundTrackerTests: number;
      antennaTrackerValidations: number;
    };
    moduleTechnologyResults: {
      monofacialTests: number;
      bifacialTests: number;
    };
  };
}

export class TestReportGenerator {
  private static instance: TestReportGenerator;
  private testResults: TestResult[] = [];

  private constructor() {}

  public static getInstance(): TestReportGenerator {
    if (!TestReportGenerator.instance) {
      TestReportGenerator.instance = new TestReportGenerator();
    }
    return TestReportGenerator.instance;
  }

  public addTestResult(result: TestResult): void {
    // Determine pass/fail status
    result.status = (result.sensorsValid && result.gatewaysValid && result.quoteTotalValid) ? 'PASS' : 'FAIL';
    this.testResults.push(result);
  }

  public generateReport(): TestReportData {
    const timestamp = new Date().toISOString();
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) + '%' : '0%';

    // Generate summary statistics
    const summary = this.generateSummary();

    return {
      testSuite: 'Denowatts Quote Creation Comprehensive Test Suite',
      timestamp,
      totalTests,
      passedTests,
      failedTests,
      successRate,
      results: this.testResults,
      summary
    };
  }

  private generateSummary() {
    const hardwareValidationResults = {
      totalSensorTests: this.testResults.length,
      passedSensorTests: this.testResults.filter(r => r.sensorsValid).length,
      totalGatewayTests: this.testResults.length,
      passedGatewayTests: this.testResults.filter(r => r.gatewaysValid).length
    };

    const quoteCalculationResults = {
      totalQuoteTests: this.testResults.length,
      passedQuoteTests: this.testResults.filter(r => r.quoteTotalValid).length
    };

    const mountingTypeResults = {
      groundFixedTests: this.testResults.filter(r => r.mountingType === 'GroundFixed').length,
      groundTrackerTests: this.testResults.filter(r => r.mountingType === 'GroundTracker').length,
      antennaTrackerValidations: this.testResults.filter(r => r.mountingType === 'GroundTracker').length
    };

    const moduleTechnologyResults = {
      monofacialTests: this.testResults.filter(r => r.moduleTechnology === 'Monofacial').length,
      bifacialTests: this.testResults.filter(r => r.moduleTechnology === 'Bifacial').length
    };

    return {
      hardwareValidationResults,
      quoteCalculationResults,
      mountingTypeResults,
      moduleTechnologyResults
    };
  }

  public async saveReportToFile(filePath: string = 'test-report.json'): Promise<void> {
    const report = this.generateReport();
    
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Save JSON report
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
      
      // Also save a human-readable markdown report
      const mdFilePath = filePath.replace('.json', '.md');
      const markdownReport = this.generateMarkdownReport(report);
      fs.writeFileSync(mdFilePath, markdownReport);

      console.log(`📄 Test report saved to: ${filePath}`);
      console.log(`📄 Markdown report saved to: ${mdFilePath}`);
    } catch (error) {
      console.error(`❌ Failed to save test report: ${error}`);
    }
  }

  private generateMarkdownReport(report: TestReportData): string {
    let markdown = `# ${report.testSuite}\n\n`;
    markdown += `**Generated:** ${report.timestamp}\n\n`;
    markdown += `## 📊 Test Summary\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total Tests | ${report.totalTests} |\n`;
    markdown += `| Passed Tests | ${report.passedTests} |\n`;
    markdown += `| Failed Tests | ${report.failedTests} |\n`;
    markdown += `| Success Rate | ${report.successRate} |\n\n`;

    markdown += `## 🔧 Hardware Validation Results\n\n`;
    markdown += `| Component | Total Tests | Passed | Success Rate |\n`;
    markdown += `|-----------|-------------|--------|-------------|\n`;
    markdown += `| Sensors | ${report.summary.hardwareValidationResults.totalSensorTests} | ${report.summary.hardwareValidationResults.passedSensorTests} | ${((report.summary.hardwareValidationResults.passedSensorTests / report.summary.hardwareValidationResults.totalSensorTests) * 100).toFixed(1)}% |\n`;
    markdown += `| Gateways | ${report.summary.hardwareValidationResults.totalGatewayTests} | ${report.summary.hardwareValidationResults.passedGatewayTests} | ${((report.summary.hardwareValidationResults.passedGatewayTests / report.summary.hardwareValidationResults.totalGatewayTests) * 100).toFixed(1)}% |\n\n`;

    markdown += `## ⚙️ Configuration Test Results\n\n`;
    markdown += `| Configuration | Test Count |\n`;
    markdown += `|---------------|------------|\n`;
    markdown += `| Ground Fixed | ${report.summary.mountingTypeResults.groundFixedTests} |\n`;
    markdown += `| Ground Tracker | ${report.summary.mountingTypeResults.groundTrackerTests} |\n`;
    markdown += `| Monofacial | ${report.summary.moduleTechnologyResults.monofacialTests} |\n`;
    markdown += `| Bifacial | ${report.summary.moduleTechnologyResults.bifacialTests} |\n\n`;

    markdown += `## 📋 Detailed Test Results\n\n`;
    markdown += `| AC (MW) | Mounting | Module | Expected S/G | Actual S/G | Status | Total Invoice | Recurring Service |\n`;
    markdown += `|---------|----------|--------|--------------|------------|--------|---------------|-----------------|\n`;

    for (const result of report.results) {
      const statusIcon = result.status === 'PASS' ? '✅' : '❌';
      markdown += `| ${result.acNameplate} | ${result.mountingType} | ${result.moduleTechnology} | ${result.expectedSensors}/${result.expectedGateways} | ${result.actualSensors}/${result.actualGateways} | ${statusIcon} ${result.status} | $${result.totalInitialInvoice} | $${result.recurringAnnualService} |\n`;
    }

    markdown += `\n## ⚠️ Failed Tests\n\n`;
    const failedTests = report.results.filter(r => r.status === 'FAIL');
    if (failedTests.length === 0) {
      markdown += `No failed tests! 🎉\n\n`;
    } else {
      for (const failedTest of failedTests) {
        markdown += `### ${failedTest.acNameplate}MW, ${failedTest.mountingType}, ${failedTest.moduleTechnology}\n`;
        markdown += `- **Expected:** ${failedTest.expectedSensors} sensors, ${failedTest.expectedGateways} gateways\n`;
        markdown += `- **Actual:** ${failedTest.actualSensors} sensors, ${failedTest.actualGateways} gateways\n`;
        markdown += `- **Quote Valid:** ${failedTest.quoteTotalValid ? 'Yes' : 'No'}\n`;
        if (failedTest.errorMessage) {
          markdown += `- **Error:** ${failedTest.errorMessage}\n`;
        }
        markdown += `\n`;
      }
    }

    return markdown;
  }

  public printSummary(): void {
    const report = this.generateReport();
    
    console.log('\n🎯 ===== TEST EXECUTION SUMMARY =====');
    console.log(`📊 Total Tests: ${report.totalTests}`);
    console.log(`✅ Passed: ${report.passedTests}`);
    console.log(`❌ Failed: ${report.failedTests}`);
    console.log(`🎯 Success Rate: ${report.successRate}`);
    console.log('\n💡 Hardware Validation:');
    console.log(`   Sensors: ${report.summary.hardwareValidationResults.passedSensorTests}/${report.summary.hardwareValidationResults.totalSensorTests} passed`);
    console.log(`   Gateways: ${report.summary.hardwareValidationResults.passedGatewayTests}/${report.summary.hardwareValidationResults.totalGatewayTests} passed`);
    console.log('\n🔧 Configuration Coverage:');
    console.log(`   Ground Fixed: ${report.summary.mountingTypeResults.groundFixedTests} tests`);
    console.log(`   Ground Tracker: ${report.summary.mountingTypeResults.groundTrackerTests} tests`);
    console.log(`   Monofacial: ${report.summary.moduleTechnologyResults.monofacialTests} tests`);
    console.log(`   Bifacial: ${report.summary.moduleTechnologyResults.bifacialTests} tests`);
    console.log('=====================================\n');
  }

  public clearResults(): void {
    this.testResults = [];
  }
}
