import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

/**
 * Form Validation Testing Script
 * 
 * This script tests the validation logic for company and review forms
 * using the same Zod schemas that are used in the application.
 */

// Import schemas (these should match the schemas used in the application)
// Note: In a real implementation, these would be imported from the application
const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(100, "Company name must be less than 100 characters"),
  industry: z.string().min(1, "Industry is required"),
  location: z.string().min(1, "Location is required"),
  website: z.string().url("Website must be a valid URL").optional().or(z.literal('')),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]).optional(),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
});

const reviewSchema = z.object({
  company_id: z.number().int().positive("Company ID is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  pros: z.string().min(10, "Pros must be at least 10 characters").max(1000, "Pros must be less than 1000 characters"),
  cons: z.string().min(10, "Cons must be at least 10 characters").max(1000, "Cons must be less than 1000 characters"),
  employment_status: z.enum(["current", "former", "never"]),
  position: z.string().min(2, "Position must be at least 2 characters").max(100, "Position must be less than 100 characters"),
  location: z.string().min(1, "Location is required").max(100, "Location must be less than 100 characters"),
  salary: z.string().optional().or(z.literal('')),
  recommend: z.boolean(),
  ceo_rating: z.number().min(1, "CEO rating must be at least 1").max(5, "CEO rating must be at most 5").optional(),
});

// Test cases for company form
const companyTestCases = [
  {
    name: "Valid company data",
    data: {
      name: "Acme Corporation",
      industry: "Technology",
      location: "San Francisco, CA",
      website: "https://acme.example.com",
      size: "51-200",
      founded_year: 2010,
      description: "A leading technology company",
    },
    shouldPass: true,
  },
  {
    name: "Company with minimal required fields",
    data: {
      name: "Acme Corp",
      industry: "Technology",
      location: "San Francisco, CA",
    },
    shouldPass: true,
  },
  {
    name: "Company with empty name",
    data: {
      name: "",
      industry: "Technology",
      location: "San Francisco, CA",
    },
    shouldPass: false,
  },
  {
    name: "Company with invalid website",
    data: {
      name: "Acme Corp",
      industry: "Technology",
      location: "San Francisco, CA",
      website: "not-a-url",
    },
    shouldPass: false,
  },
  {
    name: "Company with empty website (should pass)",
    data: {
      name: "Acme Corp",
      industry: "Technology",
      location: "San Francisco, CA",
      website: "",
    },
    shouldPass: true,
  },
  {
    name: "Company with invalid size",
    data: {
      name: "Acme Corp",
      industry: "Technology",
      location: "San Francisco, CA",
      size: "invalid-size",
    },
    shouldPass: false,
  },
  {
    name: "Company with future founded year",
    data: {
      name: "Acme Corp",
      industry: "Technology",
      location: "San Francisco, CA",
      founded_year: new Date().getFullYear() + 1,
    },
    shouldPass: false,
  },
  {
    name: "Company with very long description",
    data: {
      name: "Acme Corp",
      industry: "Technology",
      location: "San Francisco, CA",
      description: "A".repeat(1001),
    },
    shouldPass: false,
  },
];

// Test cases for review form
const reviewTestCases = [
  {
    name: "Valid review data",
    data: {
      company_id: 1,
      rating: 4,
      title: "Great place to work",
      pros: "Good work-life balance, great benefits, friendly colleagues",
      cons: "Limited career growth opportunities, slow decision making process",
      employment_status: "current",
      position: "Software Engineer",
      location: "San Francisco, CA",
      salary: "$100,000 - $120,000",
      recommend: true,
      ceo_rating: 4,
    },
    shouldPass: true,
  },
  {
    name: "Review with minimal required fields",
    data: {
      company_id: 1,
      rating: 3,
      title: "Average experience",
      pros: "Good enough for now",
      cons: "Could be better in many ways",
      employment_status: "former",
      position: "Developer",
      location: "Remote",
      recommend: false,
    },
    shouldPass: true,
  },
  {
    name: "Review with invalid rating (too low)",
    data: {
      company_id: 1,
      rating: 0,
      title: "Bad experience",
      pros: "Nothing good to say",
      cons: "Everything was terrible",
      employment_status: "former",
      position: "Developer",
      location: "Remote",
      recommend: false,
    },
    shouldPass: false,
  },
  {
    name: "Review with invalid rating (too high)",
    data: {
      company_id: 1,
      rating: 6,
      title: "Amazing experience",
      pros: "Everything was perfect",
      cons: "Nothing bad to say",
      employment_status: "current",
      position: "Developer",
      location: "Remote",
      recommend: true,
    },
    shouldPass: false,
  },
  {
    name: "Review with short title",
    data: {
      company_id: 1,
      rating: 4,
      title: "Hi",
      pros: "Good work-life balance",
      cons: "Limited career growth",
      employment_status: "current",
      position: "Developer",
      location: "Remote",
      recommend: true,
    },
    shouldPass: false,
  },
  {
    name: "Review with short pros",
    data: {
      company_id: 1,
      rating: 4,
      title: "Good company",
      pros: "Good",
      cons: "Limited career growth opportunities",
      employment_status: "current",
      position: "Developer",
      location: "Remote",
      recommend: true,
    },
    shouldPass: false,
  },
  {
    name: "Review with short cons",
    data: {
      company_id: 1,
      rating: 4,
      title: "Good company",
      pros: "Good work-life balance and benefits",
      cons: "Bad",
      employment_status: "current",
      position: "Developer",
      location: "Remote",
      recommend: true,
    },
    shouldPass: false,
  },
  {
    name: "Review with invalid employment status",
    data: {
      company_id: 1,
      rating: 4,
      title: "Good company",
      pros: "Good work-life balance and benefits",
      cons: "Limited career growth opportunities",
      employment_status: "invalid",
      position: "Developer",
      location: "Remote",
      recommend: true,
    },
    shouldPass: false,
  },
];

// Function to run tests
function runTests(schema: z.ZodType<any>, testCases: any[], schemaName: string) {
  console.log(chalk.blue(`\n🧪 Running tests for ${schemaName} schema...\n`));
  
  let passCount = 0;
  let failCount = 0;
  const results: any[] = [];
  
  testCases.forEach((testCase, index) => {
    const { name, data, shouldPass } = testCase;
    
    try {
      const result = schema.parse(data);
      const passed = shouldPass === true;
      
      if (passed) {
        console.log(chalk.green(`✅ Test #${index + 1}: ${name} - PASSED`));
        passCount++;
      } else {
        console.log(chalk.red(`❌ Test #${index + 1}: ${name} - FAILED (Expected to fail but passed)`));
        failCount++;
      }
      
      results.push({
        name,
        passed,
        expected: shouldPass ? "pass" : "fail",
        actual: "pass",
        data,
        result,
      });
    } catch (error) {
      const passed = shouldPass === false;
      
      if (passed) {
        console.log(chalk.green(`✅ Test #${index + 1}: ${name} - PASSED (Failed as expected)`));
        if (error instanceof z.ZodError) {
          console.log(chalk.gray(`   Validation errors: ${JSON.stringify(error.errors)}`));
        }
        passCount++;
      } else {
        console.log(chalk.red(`❌ Test #${index + 1}: ${name} - FAILED`));
        if (error instanceof z.ZodError) {
          console.log(chalk.red(`   Validation errors: ${JSON.stringify(error.errors)}`));
        }
        failCount++;
      }
      
      results.push({
        name,
        passed,
        expected: shouldPass ? "pass" : "fail",
        actual: "fail",
        data,
        error: error instanceof z.ZodError ? error.errors : error,
      });
    }
  });
  
  console.log(chalk.blue(`\n📊 ${schemaName} Test Summary:`));
  console.log(chalk.green(`   ✅ Passed: ${passCount}/${testCases.length} (${Math.round((passCount / testCases.length) * 100)}%)`));
  console.log(chalk.red(`   ❌ Failed: ${failCount}/${testCases.length} (${Math.round((failCount / testCases.length) * 100)}%)`));
  
  return {
    schemaName,
    passCount,
    failCount,
    totalTests: testCases.length,
    passRate: Math.round((passCount / testCases.length) * 100),
    results,
  };
}

// Function to generate a report
function generateReport(results: any[]) {
  console.log(chalk.blue('\n📝 Generating test report...'));
  
  // Create reports directory if it doesn't exist
  const reportsDir = path.resolve(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }
  
  // Generate report data
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSchemas: results.length,
      totalTests: results.reduce((sum, r) => sum + r.totalTests, 0),
      totalPassed: results.reduce((sum, r) => sum + r.passCount, 0),
      totalFailed: results.reduce((sum, r) => sum + r.failCount, 0),
      overallPassRate: Math.round(
        (results.reduce((sum, r) => sum + r.passCount, 0) / 
         results.reduce((sum, r) => sum + r.totalTests, 0)) * 100
      ),
    },
    schemaResults: results,
  };
  
  // Write report to file
  const reportPath = path.resolve(reportsDir, `form-validation-report-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  console.log(chalk.green(`✅ Report generated at ${reportPath}`));
  
  // Print overall summary
  console.log(chalk.blue('\n📊 Overall Test Summary:'));
  console.log(chalk.blue(`   Total Schemas: ${reportData.summary.totalSchemas}`));
  console.log(chalk.blue(`   Total Tests: ${reportData.summary.totalTests}`));
  console.log(chalk.green(`   ✅ Passed: ${reportData.summary.totalPassed}/${reportData.summary.totalTests} (${reportData.summary.overallPassRate}%)`));
  console.log(chalk.red(`   ❌ Failed: ${reportData.summary.totalFailed}/${reportData.summary.totalTests} (${100 - reportData.summary.overallPassRate}%)`));
  
  return reportData;
}

// Main function
function main() {
  console.log(chalk.blue('🚀 Starting form validation tests...\n'));
  
  // Run tests for company schema
  const companyResults = runTests(companySchema, companyTestCases, 'Company');
  
  // Run tests for review schema
  const reviewResults = runTests(reviewSchema, reviewTestCases, 'Review');
  
  // Generate report
  const reportData = generateReport([companyResults, reviewResults]);
  
  // Exit with appropriate code
  if (reportData.summary.totalFailed > 0) {
    console.log(chalk.yellow('\n⚠️ Some tests failed. Please check the report for details.'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n🎉 All tests passed!'));
    process.exit(0);
  }
}

// Run the main function
main();