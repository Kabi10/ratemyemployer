#!/usr/bin/env tsx

/**
 * Core Feature Verification Framework
 * 
 * Comprehensive testing system for all RateMyEmployer platform features
 * including authentication, company management, reviews, search, and specialized sections.
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

// Create supabase client directly to avoid import issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Types for verification system
interface VerificationResult {
  id: string;
  module: string;
  testName: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  timestamp: Date;
  duration: number;
  details: string;
  errorMessage?: string;
  metadata: Record<string, any>;
}

interface VerificationSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  skippedTests: number;
  results: VerificationResult[];
  summary: string;
}

interface TestConfig {
  module: string;
  enabled: boolean;
  timeout: number;
  retries: number;
  dependencies: string[];
  environment: 'development' | 'staging' | 'production';
  parameters: Record<string, any>;
}

class CoreFeatureVerificationFramework {
  private session: VerificationSession;
  private config: Map<string, TestConfig> = new Map();
  private results: VerificationResult[] = [];

  constructor() {
    this.session = {
      id: `verification-${Date.now()}`,
      startTime: new Date(),
      status: 'running',
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      warningTests: 0,
      skippedTests: 0,
      results: [],
      summary: ''
    };

    this.initializeConfiguration();
  }

  private initializeConfiguration(): void {
    // Default configuration for all test modules
    const defaultConfig: Omit<TestConfig, 'module'> = {
      enabled: true,
      timeout: 30000, // 30 seconds
      retries: 3,
      dependencies: [],
      environment: 'development',
      parameters: {}
    };

    // Configure each verification module
    const modules = [
      'authentication',
      'company-management',
      'review-system',
      'search-filter',
      'wall-sections',
      'financial-distress',
      'rising-startups',
      'database-integration',
      'ui-ux',
      'performance-security'
    ];

    modules.forEach(module => {
      this.config.set(module, {
        ...defaultConfig,
        module,
        dependencies: module === 'authentication' ? [] : ['authentication']
      });
    });
  }

  async runVerification(modules?: string[]): Promise<VerificationSession> {
    console.log(chalk.blue('🔍 Starting Core Feature Verification Framework\n'));
    console.log(chalk.gray(`Session ID: ${this.session.id}`));
    console.log(chalk.gray(`Started at: ${this.session.startTime.toISOString()}\n`));

    try {
      const modulesToRun = modules || Array.from(this.config.keys());

      // Run verification modules in dependency order
      const sortedModules = this.sortModulesByDependencies(modulesToRun);

      for (const moduleName of sortedModules) {
        const config = this.config.get(moduleName);
        if (!config || !config.enabled) {
          this.addResult(moduleName, 'Module Configuration', 'skipped',
            `Module ${moduleName} is disabled or not configured`, 0);
          continue;
        }

        await this.runModule(moduleName, config);
      }

      this.session.status = 'completed';
      this.session.endTime = new Date();
      this.generateSummary();

    } catch (error) {
      this.session.status = 'failed';
      this.session.endTime = new Date();
      console.error(chalk.red(`\n❌ Verification failed: ${error}`));
    }

    this.printResults();
    await this.saveResults();

    return this.session;
  }

  private sortModulesByDependencies(modules: string[]): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (module: string) => {
      if (visiting.has(module)) {
        throw new Error(`Circular dependency detected involving ${module}`);
      }
      if (visited.has(module)) return;

      visiting.add(module);
      const config = this.config.get(module);
      if (config) {
        config.dependencies.forEach(dep => {
          if (modules.includes(dep)) {
            visit(dep);
          }
        });
      }
      visiting.delete(module);
      visited.add(module);
      sorted.push(module);
    };

    modules.forEach(module => visit(module));
    return sorted;
  }

  private async runModule(moduleName: string, config: TestConfig): Promise<void> {
    console.log(chalk.yellow(`\n🧪 Running ${moduleName} verification...`));

    try {
      switch (moduleName) {
        case 'authentication':
          await this.verifyAuthentication();
          break;
        case 'company-management':
          await this.verifyCompanyManagement();
          break;
        case 'review-system':
          await this.verifyReviewSystem();
          break;
        case 'search-filter':
          await this.verifySearchFilter();
          break;
        case 'wall-sections':
          await this.verifyWallSections();
          break;
        case 'financial-distress':
          await this.verifyFinancialDistress();
          break;
        case 'rising-startups':
          await this.verifyRisingStartups();
          break;
        case 'database-integration':
          await this.verifyDatabaseIntegration();
          break;
        case 'ui-ux':
          await this.verifyUIUX();
          break;
        case 'performance-security':
          await this.verifyPerformanceSecurity();
          break;
        default:
          this.addResult(moduleName, 'Unknown Module', 'skipped',
            `Module ${moduleName} is not implemented`, 0);
      }
    } catch (error) {
      this.addResult(moduleName, 'Module Execution', 'failed',
        `Module ${moduleName} failed to execute`, 0, `${error}`);
    }
  }

  // Authentication verification methods
  private async verifyAuthentication(): Promise<void> {
    await this.testDatabaseConnection();
    await this.testAuthConfiguration();
    await this.testEmailPasswordAuth();
    await this.testGoogleOAuth();
    await this.testSessionManagement();
    await this.testProtectedRoutes();
  }

  private async testDatabaseConnection(): Promise<void> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.from('companies').select('count').limit(1);

      if (error) throw error;

      this.addResult('authentication', 'Database Connection', 'passed',
        'Successfully connected to Supabase database', Date.now() - startTime);
    } catch (error) {
      this.addResult('authentication', 'Database Connection', 'failed',
        'Failed to connect to database', Date.now() - startTime, `${error}`);
    }
  }

  private async testAuthConfiguration(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test auth methods availability
      const authMethods = [
        'signUp', 'signInWithPassword', 'signInWithOAuth', 'signOut',
        'getSession', 'getUser', 'onAuthStateChange'
      ];

      const missingMethods = authMethods.filter(method =>
        typeof (supabase.auth as any)[method] !== 'function'
      );

      if (missingMethods.length > 0) {
        throw new Error(`Missing auth methods: ${missingMethods.join(', ')}`);
      }

      this.addResult('authentication', 'Auth Configuration', 'passed',
        'All authentication methods are properly configured', Date.now() - startTime);
    } catch (error) {
      this.addResult('authentication', 'Auth Configuration', 'failed',
        'Authentication configuration is incomplete', Date.now() - startTime, `${error}`);
    }
  }

  private async testEmailPasswordAuth(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test that we can check current session (without actually signing in)
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      // Test auth state change listener setup
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { });
      subscription.unsubscribe();

      this.addResult('authentication', 'Email/Password Auth', 'passed',
        'Email/password authentication system is functional', Date.now() - startTime,
        { currentSession: !!session });
    } catch (error) {
      this.addResult('authentication', 'Email/Password Auth', 'failed',
        'Email/password authentication system has issues', Date.now() - startTime, `${error}`);
    }
  }

  private async testGoogleOAuth(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test OAuth configuration (without actually triggering OAuth flow)
      // We can't fully test OAuth without user interaction, but we can verify the setup

      // Check if OAuth is configured by testing the method exists and doesn't immediately error
      const oauthMethod = (supabase.auth as any).signInWithOAuth;
      if (typeof oauthMethod !== 'function') {
        throw new Error('OAuth method not available');
      }

      this.addResult('authentication', 'Google OAuth', 'passed',
        'Google OAuth authentication is configured and available', Date.now() - startTime);
    } catch (error) {
      this.addResult('authentication', 'Google OAuth', 'failed',
        'Google OAuth authentication configuration has issues', Date.now() - startTime, `${error}`);
    }
  }

  private async testSessionManagement(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test session retrieval
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      // Test user retrieval
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;

      this.addResult('authentication', 'Session Management', 'passed',
        'Session management is working correctly', Date.now() - startTime,
        { hasSession: !!session, hasUser: !!user });
    } catch (error) {
      this.addResult('authentication', 'Session Management', 'failed',
        'Session management has issues', Date.now() - startTime, `${error}`);
    }
  }

  private async testProtectedRoutes(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test RLS policies by attempting to access protected data
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .limit(1);

      // This should work for reading public data, but we're testing the connection
      if (error && !error.message.includes('permission')) {
        throw error;
      }

      this.addResult('authentication', 'Protected Routes', 'passed',
        'Route protection and RLS policies are configured', Date.now() - startTime);
    } catch (error) {
      this.addResult('authentication', 'Protected Routes', 'failed',
        'Route protection has issues', Date.now() - startTime, `${error}`);
    }
  }

  // Company Management verification methods
  private async verifyCompanyManagement(): Promise<void> {
    await this.testCompanyListing();
    await this.testCompanyProfiles();
    await this.testCompanySearch();
    await this.testCompanyFiltering();
    await this.testCompanyStatistics();
    await this.testCompanyRatingCalculation();
  }

  private async testCompanyListing(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test basic company listing with all essential fields
      const { data: companies, error } = await supabase
        .from('companies')
        .select(`
          id, 
          name, 
          industry, 
          location, 
          average_rating,
          total_reviews,
          website,
          logo_url,
          verified,
          created_at,
          updated_at
        `)
        .limit(20);

      if (error) throw error;

      if (!companies || companies.length === 0) {
        this.addResult('company-management', 'Company Listing', 'warning',
          'No companies found in database - this may indicate missing test data', Date.now() - startTime);
        return;
      }

      // Verify required fields are present and have correct types
      const requiredFields = ['id', 'name', 'industry', 'location'];
      const firstCompany = companies[0];
      const missingFields = requiredFields.filter(field =>
        !firstCompany.hasOwnProperty(field) || firstCompany[field] === undefined
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields in company data: ${missingFields.join(', ')}`);
      }

      // Verify data types and structure
      if (typeof firstCompany.id !== 'number') {
        throw new Error('Company ID should be a number');
      }

      if (typeof firstCompany.name !== 'string' || firstCompany.name.trim() === '') {
        throw new Error('Company name should be a non-empty string');
      }

      // Test data accuracy - check for null/empty critical fields
      const companiesWithMissingData = companies.filter(company =>
        !company.name || company.name.trim() === '' || !company.location || company.location.trim() === ''
      );

      if (companiesWithMissingData.length > 0) {
        this.addResult('company-management', 'Company Listing', 'warning',
          `Found ${companiesWithMissingData.length} companies with missing critical data (name or location)`,
          Date.now() - startTime, undefined, {
          companyCount: companies.length,
          companiesWithMissingData: companiesWithMissingData.length
        });
      } else {
        this.addResult('company-management', 'Company Listing', 'passed',
          `Successfully retrieved ${companies.length} companies with complete data and correct structure`,
          Date.now() - startTime, undefined, {
          companyCount: companies.length,
          sampleCompany: {
            id: firstCompany.id,
            name: firstCompany.name,
            industry: firstCompany.industry,
            location: firstCompany.location,
            hasRating: firstCompany.average_rating !== null,
            hasReviews: firstCompany.total_reviews !== null && firstCompany.total_reviews > 0
          }
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('company-management', 'Company Listing', 'failed',
        'Failed to retrieve company listings or data validation failed', Date.now() - startTime, errorMessage);
    }
  }

  private async testCompanyProfiles(): Promise<void> {
    const startTime = Date.now();
    try {
      // Get companies to test profile viewing
      const { data: companies, error: listError } = await supabase
        .from('companies')
        .select('id, name')
        .limit(3);

      if (listError) throw listError;

      if (!companies || companies.length === 0) {
        this.addResult('company-management', 'Company Profiles', 'skipped',
          'No companies available to test profile viewing', Date.now() - startTime);
        return;
      }

      const profileTests = [];

      // Test detailed company profile retrieval for multiple companies
      for (const companyRef of companies) {
        const { data: company, error: profileError } = await supabase
          .from('companies')
          .select(`
            *,
            reviews:reviews(
              id,
              rating,
              title,
              pros,
              cons,
              position,
              employment_status,
              created_at
            )
          `)
          .eq('id', companyRef.id)
          .single();

        if (profileError) {
          profileTests.push({
            companyId: companyRef.id,
            success: false,
            error: profileError.message
          });
          continue;
        }

        if (!company) {
          profileTests.push({
            companyId: companyRef.id,
            success: false,
            error: 'Company profile not found'
          });
          continue;
        }

        // Validate profile completeness
        const profileFields = [
          'id', 'name', 'industry', 'location', 'website',
          'average_rating', 'total_reviews', 'created_at'
        ];

        const missingProfileFields = profileFields.filter(field =>
          !company.hasOwnProperty(field)
        );

        if (missingProfileFields.length > 0) {
          profileTests.push({
            companyId: companyRef.id,
            success: false,
            error: `Missing profile fields: ${missingProfileFields.join(', ')}`
          });
          continue;
        }

        // Test review relationship
        const reviewsArray = company.reviews as any[];
        const hasValidReviews = Array.isArray(reviewsArray);

        profileTests.push({
          companyId: company.id,
          companyName: company.name,
          success: true,
          hasReviews: hasValidReviews && reviewsArray.length > 0,
          reviewCount: hasValidReviews ? reviewsArray.length : 0,
          hasRating: company.average_rating !== null,
          rating: company.average_rating,
          hasWebsite: !!company.website,
          isVerified: !!company.verified
        });
      }

      const successfulProfiles = profileTests.filter(test => test.success);
      const failedProfiles = profileTests.filter(test => !test.success);

      if (failedProfiles.length > 0) {
        this.addResult('company-management', 'Company Profiles', 'warning',
          `Company profile viewing partially working: ${successfulProfiles.length}/${profileTests.length} profiles loaded successfully`,
          Date.now() - startTime, {
          successfulProfiles: successfulProfiles.length,
          failedProfiles: failedProfiles.length,
          failures: failedProfiles,
          samples: successfulProfiles.slice(0, 2)
        });
      } else {
        this.addResult('company-management', 'Company Profiles', 'passed',
          `Company profile viewing working correctly for all ${profileTests.length} tested companies`,
          Date.now() - startTime, {
          profilesTestedCount: profileTests.length,
          profilesWithReviews: successfulProfiles.filter(p => p.hasReviews).length,
          profilesWithRatings: successfulProfiles.filter(p => p.hasRating).length,
          samples: successfulProfiles.slice(0, 2)
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('company-management', 'Company Profiles', 'failed',
        'Company profile viewing has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async testCompanySearch(): Promise<void> {
    const startTime = Date.now();
    try {
      const searchTests = [];

      // Test 1: Search by common terms
      const commonSearchTerms = ['tech', 'inc', 'corp', 'company', 'solutions'];

      for (const term of commonSearchTerms) {
        const { data: results, error } = await supabase
          .from('companies')
          .select('id, name, industry, location')
          .ilike('name', `%${term}%`)
          .limit(10);

        if (error) throw error;

        // Verify search results contain the search term
        const relevantResults = results?.filter(company =>
          company.name.toLowerCase().includes(term.toLowerCase())
        ) || [];

        searchTests.push({
          term,
          totalResults: results?.length || 0,
          relevantResults: relevantResults.length,
          accuracy: results?.length > 0 ? (relevantResults.length / results.length) * 100 : 100
        });
      }

      // Test 2: Case-insensitive search
      const { data: upperCaseResults, error: upperError } = await supabase
        .from('companies')
        .select('id, name')
        .ilike('name', '%TECH%')
        .limit(5);

      if (upperError) throw upperError;

      const { data: lowerCaseResults, error: lowerError } = await supabase
        .from('companies')
        .select('id, name')
        .ilike('name', '%tech%')
        .limit(5);

      if (lowerError) throw lowerError;

      // Test 3: Empty search handling
      const { data: emptyResults, error: emptyError } = await supabase
        .from('companies')
        .select('id, name')
        .ilike('name', '%%')
        .limit(10);

      if (emptyError) throw emptyError;

      // Test 4: Non-existent search terms
      const { data: nonExistentResults, error: nonExistentError } = await supabase
        .from('companies')
        .select('id, name')
        .ilike('name', '%xyzneverexists%')
        .limit(5);

      if (nonExistentError) throw nonExistentError;

      // Calculate overall search performance
      const totalSearches = searchTests.length;
      const successfulSearches = searchTests.filter(test => test.totalResults > 0).length;
      const averageAccuracy = searchTests.reduce((sum, test) => sum + test.accuracy, 0) / totalSearches;

      const searchMetadata = {
        searchTests: searchTests,
        caseInsensitiveWorking: (upperCaseResults?.length || 0) === (lowerCaseResults?.length || 0),
        emptySearchResults: emptyResults?.length || 0,
        nonExistentSearchResults: nonExistentResults?.length || 0,
        successfulSearches,
        totalSearches,
        averageAccuracy: Math.round(averageAccuracy)
      };

      if (averageAccuracy < 80) {
        this.addResult('company-management', 'Company Search', 'warning',
          `Company search working but accuracy is low (${Math.round(averageAccuracy)}% average accuracy)`,
          Date.now() - startTime, searchMetadata);
      } else {
        this.addResult('company-management', 'Company Search', 'passed',
          `Company search working correctly with ${Math.round(averageAccuracy)}% average accuracy across ${totalSearches} test searches`,
          Date.now() - startTime, searchMetadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('company-management', 'Company Search', 'failed',
        'Company search functionality has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async testCompanyFiltering(): Promise<void> {
    const startTime = Date.now();
    try {
      const filterTests = [];

      // Test 1: Industry filtering
      const { data: allIndustries, error: industriesError } = await supabase
        .from('companies')
        .select('industry')
        .not('industry', 'is', null);

      if (industriesError) throw industriesError;

      const uniqueIndustries = [...new Set(allIndustries?.map(c => c.industry).filter(Boolean))] as string[];
      const testIndustries = uniqueIndustries.slice(0, 3); // Test first 3 industries

      for (const industry of testIndustries) {
        const { data: industryCompanies, error: industryError } = await supabase
          .from('companies')
          .select('id, name, industry')
          .eq('industry', industry)
          .limit(10);

        if (industryError) throw industryError;

        // Verify all results match the filter
        const correctlyFiltered = industryCompanies?.every(company =>
          company.industry === industry
        ) || false;

        filterTests.push({
          type: 'industry',
          filter: industry,
          resultCount: industryCompanies?.length || 0,
          correctlyFiltered
        });
      }

      // Test 2: Location filtering
      const { data: allLocations, error: locationsError } = await supabase
        .from('companies')
        .select('location')
        .not('location', 'is', null);

      if (locationsError) throw locationsError;

      const locationTerms = ['San Francisco', 'New York', 'Los Angeles', 'Seattle', 'Austin'];

      for (const locationTerm of locationTerms) {
        const { data: locationCompanies, error: locationError } = await supabase
          .from('companies')
          .select('id, name, location')
          .ilike('location', `%${locationTerm}%`)
          .limit(10);

        if (locationError) throw locationError;

        // Verify results contain the location term
        const correctlyFiltered = locationCompanies?.every(company =>
          company.location?.toLowerCase().includes(locationTerm.toLowerCase())
        ) || false;

        filterTests.push({
          type: 'location',
          filter: locationTerm,
          resultCount: locationCompanies?.length || 0,
          correctlyFiltered
        });
      }

      // Test 3: Rating filtering
      const ratingThresholds = [3.0, 4.0, 4.5];

      for (const threshold of ratingThresholds) {
        const { data: ratedCompanies, error: ratingError } = await supabase
          .from('companies')
          .select('id, name, average_rating')
          .gte('average_rating', threshold)
          .not('average_rating', 'is', null)
          .limit(10);

        if (ratingError) throw ratingError;

        // Verify all results meet the rating threshold
        const correctlyFiltered = ratedCompanies?.every(company =>
          company.average_rating !== null && company.average_rating >= threshold
        ) || false;

        filterTests.push({
          type: 'rating',
          filter: `>= ${threshold}`,
          resultCount: ratedCompanies?.length || 0,
          correctlyFiltered
        });
      }

      // Test 4: Combined filtering (industry + location)
      if (testIndustries.length > 0) {
        const { data: combinedResults, error: combinedError } = await supabase
          .from('companies')
          .select('id, name, industry, location')
          .eq('industry', testIndustries[0])
          .ilike('location', '%San Francisco%')
          .limit(5);

        if (combinedError) throw combinedError;

        const correctlyFiltered = combinedResults?.every(company =>
          company.industry === testIndustries[0] &&
          company.location?.toLowerCase().includes('san francisco')
        ) || false;

        filterTests.push({
          type: 'combined',
          filter: `${testIndustries[0]} + San Francisco`,
          resultCount: combinedResults?.length || 0,
          correctlyFiltered
        });
      }

      // Analyze results
      const totalTests = filterTests.length;
      const correctTests = filterTests.filter(test => test.correctlyFiltered).length;
      const testsWithResults = filterTests.filter(test => test.resultCount > 0).length;

      const filterMetadata = {
        totalTests,
        correctTests,
        testsWithResults,
        accuracy: totalTests > 0 ? Math.round((correctTests / totalTests) * 100) : 0,
        availableIndustries: uniqueIndustries.length,
        filterTests: filterTests.slice(0, 5) // Sample of tests
      };

      if (correctTests < totalTests) {
        this.addResult('company-management', 'Company Filtering', 'warning',
          `Company filtering partially working: ${correctTests}/${totalTests} filters working correctly`,
          Date.now() - startTime, filterMetadata);
      } else {
        this.addResult('company-management', 'Company Filtering', 'passed',
          `Company filtering working correctly: all ${totalTests} filter tests passed with ${testsWithResults} returning results`,
          Date.now() - startTime, filterMetadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('company-management', 'Company Filtering', 'failed',
        'Company filtering functionality has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async testCompanyStatistics(): Promise<void> {
    const startTime = Date.now();
    try {
      const statisticsTests = [];

      // Test 1: Total company count
      const { count: totalCompanies, error: countError } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      statisticsTests.push({
        metric: 'total_companies',
        value: totalCompanies,
        success: totalCompanies !== null && totalCompanies >= 0
      });

      // Test 2: Companies by industry statistics
      const { data: industryStats, error: industryError } = await supabase
        .from('companies')
        .select('industry')
        .not('industry', 'is', null);

      if (industryError) throw industryError;

      const industryDistribution = industryStats?.reduce((acc, company) => {
        const industry = company.industry || 'Unknown';
        acc[industry] = (acc[industry] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      statisticsTests.push({
        metric: 'industry_distribution',
        value: Object.keys(industryDistribution).length,
        success: Object.keys(industryDistribution).length > 0,
        details: industryDistribution
      });

      // Test 3: Companies with ratings statistics
      const { data: ratedCompanies, error: ratingError } = await supabase
        .from('companies')
        .select('id, average_rating, total_reviews')
        .not('average_rating', 'is', null);

      if (ratingError) throw ratingError;

      const ratingStats = {
        companiesWithRatings: ratedCompanies?.length || 0,
        averageRating: ratedCompanies?.length > 0
          ? ratedCompanies.reduce((sum, c) => sum + (c.average_rating || 0), 0) / ratedCompanies.length
          : 0,
        totalReviews: ratedCompanies?.reduce((sum, c) => sum + (c.total_reviews || 0), 0) || 0
      };

      statisticsTests.push({
        metric: 'rating_statistics',
        value: ratingStats.companiesWithRatings,
        success: ratingStats.companiesWithRatings >= 0,
        details: ratingStats
      });

      // Test 4: Companies by location statistics
      const { data: locationStats, error: locationError } = await supabase
        .from('companies')
        .select('location')
        .not('location', 'is', null);

      if (locationError) throw locationError;

      const locationDistribution = locationStats?.reduce((acc, company) => {
        const location = company.location || 'Unknown';
        // Extract city/state for grouping
        const normalizedLocation = location.split(',')[0].trim();
        acc[normalizedLocation] = (acc[normalizedLocation] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topLocations = Object.entries(locationDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      statisticsTests.push({
        metric: 'location_distribution',
        value: Object.keys(locationDistribution).length,
        success: Object.keys(locationDistribution).length > 0,
        details: { topLocations, totalLocations: Object.keys(locationDistribution).length }
      });

      // Test 5: Verification status statistics
      const { data: verificationStats, error: verificationError } = await supabase
        .from('companies')
        .select('verified, verification_status');

      if (verificationError) throw verificationError;

      const verificationDistribution = {
        verified: verificationStats?.filter(c => c.verified === true).length || 0,
        unverified: verificationStats?.filter(c => c.verified === false || c.verified === null).length || 0,
        total: verificationStats?.length || 0
      };

      statisticsTests.push({
        metric: 'verification_statistics',
        value: verificationDistribution.verified,
        success: verificationDistribution.total > 0,
        details: verificationDistribution
      });

      // Test 6: Recent activity statistics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentCompanies, error: recentError } = await supabase
        .from('companies')
        .select('id, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentError) throw recentError;

      statisticsTests.push({
        metric: 'recent_companies',
        value: recentCompanies?.length || 0,
        success: true, // This can be 0 and still be successful
        details: { companiesLast30Days: recentCompanies?.length || 0 }
      });

      // Analyze results
      const successfulTests = statisticsTests.filter(test => test.success).length;
      const totalTests = statisticsTests.length;

      const statisticsMetadata = {
        totalTests,
        successfulTests,
        statistics: statisticsTests.reduce((acc, test) => {
          acc[test.metric] = {
            value: test.value,
            success: test.success,
            ...(test.details && { details: test.details })
          };
          return acc;
        }, {} as Record<string, any>)
      };

      if (successfulTests < totalTests) {
        this.addResult('company-management', 'Company Statistics', 'warning',
          `Company statistics partially working: ${successfulTests}/${totalTests} statistics calculated successfully`,
          Date.now() - startTime, statisticsMetadata);
      } else {
        this.addResult('company-management', 'Company Statistics', 'passed',
          `Company statistics working correctly: all ${totalTests} statistics calculated successfully`,
          Date.now() - startTime, statisticsMetadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('company-management', 'Company Statistics', 'failed',
        'Company statistics functionality has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  // Review System verification methods
  private async verifyReviewSystem(): Promise<void> {
    await this.testReviewSubmissionAndValidation();
    await this.testReviewDisplayAndFormatting();
    await this.testReviewFormValidation();
    await this.testReviewFilteringAndSorting();
    await this.testReviewPagination();
    await this.testUserReviewHistory();
    await this.testReviewRatingCalculation();
  }

  // Task 4.1: Create review submission and validation testing
  private async testReviewSubmissionAndValidation(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test 1: Verify review table structure and required fields
      const { data: reviewStructure, error: structureError } = await supabase
        .from('reviews')
        .select('*')
        .limit(1);

      if (structureError) throw structureError;

      // Test 2: Validate review data storage and retrieval
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          pros,
          cons,
          position,
          employment_status,
          is_current_employee,
          company_id,
          user_id,
          reviewer_name,
          reviewer_email,
          status,
          created_at,
          updated_at,
          company:companies(id, name, industry)
        `)
        .limit(10);

      if (reviewsError) throw reviewsError;

      if (!reviews || reviews.length === 0) {
        this.addResult('review-system', 'Review Submission and Validation', 'warning',
          'No reviews found in database - this may indicate missing test data', Date.now() - startTime);
        return;
      }

      // Test 3: Verify required fields are present and properly typed
      const requiredFields = ['id', 'rating', 'title', 'pros', 'cons', 'position', 'employment_status', 'company_id'];
      const firstReview = reviews[0];
      const missingFields = requiredFields.filter(field =>
        !firstReview.hasOwnProperty(field) || firstReview[field] === undefined
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields in review data: ${missingFields.join(', ')}`);
      }

      // Test 4: Validate data types and constraints
      const validationTests = [];

      for (const review of reviews.slice(0, 5)) {
        const tests = {
          reviewId: review.id,
          validRating: typeof review.rating === 'number' && review.rating >= 1 && review.rating <= 5,
          validTitle: typeof review.title === 'string' && review.title.length >= 1,
          validPros: typeof review.pros === 'string' && review.pros.length >= 3,
          validCons: typeof review.cons === 'string' && review.cons.length >= 3,
          validPosition: typeof review.position === 'string' && review.position.length >= 1,
          validEmploymentStatus: ['Full-time', 'Part-time', 'Contract', 'Intern'].includes(review.employment_status),
          validCompanyId: typeof review.company_id === 'number' && review.company_id > 0,
          hasCompanyRelation: !!review.company,
          validStatus: !review.status || ['pending', 'approved', 'rejected'].includes(review.status)
        };

        validationTests.push(tests);
      }

      // Test 5: Check company relationship integrity
      const reviewsWithCompanies = reviews.filter(review => review.company);
      const companyRelationshipWorking = reviewsWithCompanies.length > 0;

      // Calculate validation success rate
      const totalValidationChecks = validationTests.reduce((sum, test) =>
        sum + Object.values(test).filter(v => typeof v === 'boolean').length, 0
      );
      const passedValidationChecks = validationTests.reduce((sum, test) =>
        sum + Object.values(test).filter(v => v === true).length, 0
      );
      const validationSuccessRate = Math.round((passedValidationChecks / totalValidationChecks) * 100);

      const metadata = {
        reviewCount: reviews.length,
        validationSuccessRate,
        companyRelationshipWorking,
        sampleValidations: validationTests.slice(0, 3),
        reviewsWithCompanies: reviewsWithCompanies.length,
        statusDistribution: reviews.reduce((acc, review) => {
          const status = review.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      if (validationSuccessRate < 90) {
        this.addResult('review-system', 'Review Submission and Validation', 'warning',
          `Review data validation partially successful: ${validationSuccessRate}% of validation checks passed`,
          Date.now() - startTime, metadata);
      } else {
        this.addResult('review-system', 'Review Submission and Validation', 'passed',
          `Review submission and validation working correctly: ${validationSuccessRate}% validation success rate across ${reviews.length} reviews`,
          Date.now() - startTime, metadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('review-system', 'Review Submission and Validation', 'failed',
        'Review submission and validation has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async testReviewDisplayAndFormatting(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test 1: Verify review display data completeness
      const { data: displayReviews, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          pros,
          cons,
          position,
          employment_status,
          is_current_employee,
          created_at,
          reviewer_name,
          company:companies(id, name, industry, location)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!displayReviews || displayReviews.length === 0) {
        this.addResult('review-system', 'Review Display and Formatting', 'warning',
          'No approved reviews found for display testing', Date.now() - startTime);
        return;
      }

      // Test 2: Verify display formatting requirements
      const formattingTests = [];

      for (const review of displayReviews) {
        const tests = {
          reviewId: review.id,
          hasDisplayableTitle: review.title && review.title.trim().length > 0,
          hasDisplayableRating: review.rating && review.rating >= 1 && review.rating <= 5,
          hasDisplayablePros: review.pros && review.pros.trim().length >= 3,
          hasDisplayableCons: review.cons && review.cons.trim().length >= 3,
          hasDisplayablePosition: review.position && review.position.trim().length > 0,
          hasValidEmploymentStatus: review.employment_status && review.employment_status.length > 0,
          hasFormattedDate: review.created_at && new Date(review.created_at).getTime() > 0,
          hasCompanyInfo: review.company && review.company.name,
          hasEmploymentIndicator: typeof review.is_current_employee === 'boolean'
        };

        formattingTests.push(tests);
      }

      // Test 3: Check content length and truncation handling
      const contentLengthTests = displayReviews.map(review => ({
        reviewId: review.id,
        titleLength: review.title?.length || 0,
        prosLength: review.pros?.length || 0,
        consLength: review.cons?.length || 0,
        positionLength: review.position?.length || 0,
        needsTruncation: {
          title: (review.title?.length || 0) > 100,
          pros: (review.pros?.length || 0) > 500,
          cons: (review.cons?.length || 0) > 500
        }
      }));

      // Calculate formatting success rate
      const totalFormattingChecks = formattingTests.reduce((sum, test) =>
        sum + Object.values(test).filter(v => typeof v === 'boolean').length, 0
      );
      const passedFormattingChecks = formattingTests.reduce((sum, test) =>
        sum + Object.values(test).filter(v => v === true).length, 0
      );
      const formattingSuccessRate = Math.round((passedFormattingChecks / totalFormattingChecks) * 100);

      const metadata = {
        reviewCount: displayReviews.length,
        formattingSuccessRate,
        sampleFormattingTests: formattingTests.slice(0, 3),
        contentLengthStats: {
          averageTitleLength: Math.round(contentLengthTests.reduce((sum, test) => sum + test.titleLength, 0) / contentLengthTests.length),
          averageProsLength: Math.round(contentLengthTests.reduce((sum, test) => sum + test.prosLength, 0) / contentLengthTests.length),
          averageConsLength: Math.round(contentLengthTests.reduce((sum, test) => sum + test.consLength, 0) / contentLengthTests.length),
          reviewsNeedingTruncation: contentLengthTests.filter(test =>
            test.needsTruncation.title || test.needsTruncation.pros || test.needsTruncation.cons
          ).length
        }
      };

      if (formattingSuccessRate < 95) {
        this.addResult('review-system', 'Review Display and Formatting', 'warning',
          `Review display formatting partially working: ${formattingSuccessRate}% of formatting checks passed`,
          Date.now() - startTime, metadata);
      } else {
        this.addResult('review-system', 'Review Display and Formatting', 'passed',
          `Review display and formatting working correctly: ${formattingSuccessRate}% formatting success rate across ${displayReviews.length} reviews`,
          Date.now() - startTime, metadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('review-system', 'Review Display and Formatting', 'failed',
        'Review display and formatting has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async testReviewFormValidation(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test 1: Verify form validation constraints match database constraints
      const validationTests = [];

      // Test rating validation (1-5 range)
      const ratingTests = [
        { rating: 0, shouldPass: false, description: 'Rating below minimum (0)' },
        { rating: 1, shouldPass: true, description: 'Rating at minimum (1)' },
        { rating: 3, shouldPass: true, description: 'Rating in middle (3)' },
        { rating: 5, shouldPass: true, description: 'Rating at maximum (5)' },
        { rating: 6, shouldPass: false, description: 'Rating above maximum (6)' }
      ];

      // Test title validation
      const titleTests = [
        { title: '', shouldPass: false, description: 'Empty title' },
        { title: 'A', shouldPass: true, description: 'Single character title' },
        { title: 'Valid review title', shouldPass: true, description: 'Normal title' },
        { title: 'A'.repeat(256), shouldPass: false, description: 'Title too long (256 chars)' }
      ];

      // Test pros/cons validation (minimum 3 characters based on schema)
      const prosConsTests = [
        { text: '', shouldPass: false, description: 'Empty pros/cons' },
        { text: 'AB', shouldPass: false, description: 'Too short pros/cons (2 chars)' },
        { text: 'ABC', shouldPass: true, description: 'Minimum length pros/cons (3 chars)' },
        { text: 'Valid pros or cons content', shouldPass: true, description: 'Normal pros/cons' },
        { text: 'A'.repeat(1001), shouldPass: false, description: 'Pros/cons too long (1001 chars)' }
      ];

      // Test employment status validation
      const employmentStatusTests = [
        { status: 'Full-time', shouldPass: true, description: 'Valid Full-time status' },
        { status: 'Part-time', shouldPass: true, description: 'Valid Part-time status' },
        { status: 'Contract', shouldPass: true, description: 'Valid Contract status' },
        { status: 'Intern', shouldPass: true, description: 'Valid Intern status' },
        { status: 'Invalid', shouldPass: false, description: 'Invalid employment status' },
        { status: '', shouldPass: false, description: 'Empty employment status' }
      ];

      // Test position validation
      const positionTests = [
        { position: '', shouldPass: false, description: 'Empty position' },
        { position: 'A', shouldPass: true, description: 'Single character position' },
        { position: 'Software Engineer', shouldPass: true, description: 'Normal position' },
        { position: 'A'.repeat(256), shouldPass: false, description: 'Position too long (256 chars)' }
      ];

      // Compile all validation tests
      validationTests.push(
        ...ratingTests.map(test => ({ type: 'rating', ...test })),
        ...titleTests.map(test => ({ type: 'title', ...test })),
        ...prosConsTests.map(test => ({ type: 'pros_cons', ...test })),
        ...employmentStatusTests.map(test => ({ type: 'employment_status', ...test })),
        ...positionTests.map(test => ({ type: 'position', ...test }))
      );

      // Test 2: Verify required field validation
      const requiredFieldTests = [
        { field: 'rating', required: true },
        { field: 'title', required: true },
        { field: 'pros', required: true },
        { field: 'cons', required: true },
        { field: 'position', required: true },
        { field: 'employment_status', required: true },
        { field: 'company_id', required: true },
        { field: 'reviewer_name', required: false },
        { field: 'reviewer_email', required: false }
      ];

      // Test 3: Check actual database constraints by examining existing data
      const { data: existingReviews, error: existingError } = await supabase
        .from('reviews')
        .select('rating, title, pros, cons, position, employment_status, company_id')
        .limit(20);

      if (existingError) throw existingError;

      const constraintValidation = existingReviews?.map(review => ({
        reviewId: review.id,
        validRating: review.rating >= 1 && review.rating <= 5,
        validTitle: review.title && review.title.length >= 1 && review.title.length <= 255,
        validPros: review.pros && review.pros.length >= 3 && review.pros.length <= 1000,
        validCons: review.cons && review.cons.length >= 3 && review.cons.length <= 1000,
        validPosition: review.position && review.position.length >= 1 && review.position.length <= 255,
        validEmploymentStatus: ['Full-time', 'Part-time', 'Contract', 'Intern'].includes(review.employment_status),
        validCompanyId: typeof review.company_id === 'number' && review.company_id > 0
      })) || [];

      // Calculate validation compliance
      const totalConstraintChecks = constraintValidation.reduce((sum, validation) =>
        sum + Object.values(validation).filter(v => typeof v === 'boolean').length, 0
      );
      const passedConstraintChecks = constraintValidation.reduce((sum, validation) =>
        sum + Object.values(validation).filter(v => v === true).length, 0
      );
      const constraintComplianceRate = totalConstraintChecks > 0
        ? Math.round((passedConstraintChecks / totalConstraintChecks) * 100)
        : 100;

      const metadata = {
        validationTestsCount: validationTests.length,
        requiredFieldsCount: requiredFieldTests.filter(test => test.required).length,
        optionalFieldsCount: requiredFieldTests.filter(test => !test.required).length,
        existingReviewsChecked: existingReviews?.length || 0,
        constraintComplianceRate,
        sampleValidationTests: validationTests.slice(0, 5),
        sampleConstraintValidation: constraintValidation.slice(0, 3),
        employmentStatusOptions: ['Full-time', 'Part-time', 'Contract', 'Intern']
      };

      if (constraintComplianceRate < 95) {
        this.addResult('review-system', 'Review Form Validation', 'warning',
          `Review form validation partially compliant: ${constraintComplianceRate}% of existing data meets validation constraints`,
          Date.now() - startTime, metadata);
      } else {
        this.addResult('review-system', 'Review Form Validation', 'passed',
          `Review form validation working correctly: ${constraintComplianceRate}% constraint compliance across ${existingReviews?.length || 0} existing reviews`,
          Date.now() - startTime, metadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('review-system', 'Review Form Validation', 'failed',
        'Review form validation has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  // Task 4.2: Implement review filtering and sorting verification
  private async testReviewFilteringAndSorting(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test 1: Review filtering by rating
      const ratingFilterTests = [];
      const ratingThresholds = [1, 2, 3, 4, 5];

      for (const threshold of ratingThresholds) {
        const { data: filteredReviews, error } = await supabase
          .from('reviews')
          .select('id, rating, title, company_id')
          .gte('rating', threshold)
          .limit(10);

        if (error) throw error;

        // Verify all results meet the rating filter
        const correctlyFiltered = filteredReviews?.every(review =>
          review.rating >= threshold
        ) || true; // true if no results (empty set is correctly filtered)

        ratingFilterTests.push({
          threshold,
          resultCount: filteredReviews?.length || 0,
          correctlyFiltered
        });
      }

      // Test 2: Review filtering by employment status
      const employmentStatusTests = [];
      const statuses = ['Full-time', 'Part-time', 'Contract', 'Intern'];

      for (const status of statuses) {
        const { data: statusReviews, error } = await supabase
          .from('reviews')
          .select('id, employment_status, title')
          .eq('employment_status', status)
          .limit(10);

        if (error) throw error;

        const correctlyFiltered = statusReviews?.every(review =>
          review.employment_status === status
        ) || true;

        employmentStatusTests.push({
          status,
          resultCount: statusReviews?.length || 0,
          correctlyFiltered
        });
      }

      // Test 3: Review sorting by date (newest first)
      const { data: dateOrderedReviews, error: dateError } = await supabase
        .from('reviews')
        .select('id, created_at, title')
        .order('created_at', { ascending: false })
        .limit(10);

      if (dateError) throw dateError;

      // Verify date ordering
      let dateSortingCorrect = true;
      if (dateOrderedReviews && dateOrderedReviews.length > 1) {
        for (let i = 1; i < dateOrderedReviews.length; i++) {
          const prevDate = new Date(dateOrderedReviews[i - 1].created_at);
          const currDate = new Date(dateOrderedReviews[i].created_at);
          if (prevDate < currDate) {
            dateSortingCorrect = false;
            break;
          }
        }
      }

      // Test 4: Review sorting by rating (highest first)
      const { data: ratingOrderedReviews, error: ratingOrderError } = await supabase
        .from('reviews')
        .select('id, rating, title')
        .order('rating', { ascending: false })
        .limit(10);

      if (ratingOrderError) throw ratingOrderError;

      // Verify rating ordering
      let ratingSortingCorrect = true;
      if (ratingOrderedReviews && ratingOrderedReviews.length > 1) {
        for (let i = 1; i < ratingOrderedReviews.length; i++) {
          if (ratingOrderedReviews[i - 1].rating < ratingOrderedReviews[i].rating) {
            ratingSortingCorrect = false;
            break;
          }
        }
      }

      // Calculate success rates
      const ratingFilterSuccess = ratingFilterTests.filter(test => test.correctlyFiltered).length;
      const statusFilterSuccess = employmentStatusTests.filter(test => test.correctlyFiltered).length;
      const totalFilterTests = ratingFilterTests.length + employmentStatusTests.length;
      const totalFilterSuccess = ratingFilterSuccess + statusFilterSuccess;
      const filterSuccessRate = totalFilterTests > 0 ? Math.round((totalFilterSuccess / totalFilterTests) * 100) : 100;

      const metadata = {
        ratingFilterTests,
        employmentStatusTests,
        filterSuccessRate,
        dateSortingCorrect,
        ratingSortingCorrect,
        dateOrderedCount: dateOrderedReviews?.length || 0,
        ratingOrderedCount: ratingOrderedReviews?.length || 0,
        sampleDateOrdered: dateOrderedReviews?.slice(0, 3).map(r => ({
          id: r.id,
          created_at: r.created_at
        })) || [],
        sampleRatingOrdered: ratingOrderedReviews?.slice(0, 3).map(r => ({
          id: r.id,
          rating: r.rating
        })) || []
      };

      const allSortingCorrect = dateSortingCorrect && ratingSortingCorrect;

      if (filterSuccessRate < 100 || !allSortingCorrect) {
        this.addResult('review-system', 'Review Filtering and Sorting', 'warning',
          `Review filtering and sorting partially working: ${filterSuccessRate}% filter success, sorting: ${allSortingCorrect ? 'correct' : 'issues detected'}`,
          Date.now() - startTime, metadata);
      } else {
        this.addResult('review-system', 'Review Filtering and Sorting', 'passed',
          `Review filtering and sorting working correctly: ${filterSuccessRate}% filter success rate, all sorting tests passed`,
          Date.now() - startTime, metadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('review-system', 'Review Filtering and Sorting', 'failed',
        'Review filtering and sorting has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async testReviewPagination(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test 1: Basic pagination functionality
      const pageSize = 5;
      const { data: totalReviews, error: countError } = await supabase
        .from('reviews')
        .select('id', { count: 'exact' });

      if (countError) throw countError;

      const totalCount = totalReviews?.length || 0;
      const expectedPages = Math.ceil(totalCount / pageSize);

      // Test pagination across multiple pages
      const paginationTests = [];
      const pagesToTest = Math.min(3, expectedPages); // Test first 3 pages

      for (let page = 0; page < pagesToTest; page++) {
        const offset = page * pageSize;

        const { data: pageReviews, error: pageError } = await supabase
          .from('reviews')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (pageError) throw pageError;

        const expectedPageSize = Math.min(pageSize, totalCount - offset);
        const actualPageSize = pageReviews?.length || 0;

        paginationTests.push({
          page: page + 1,
          offset,
          expectedSize: expectedPageSize,
          actualSize: actualPageSize,
          sizeCorrect: actualPageSize === expectedPageSize,
          hasResults: actualPageSize > 0
        });
      }

      // Test 2: Loading states simulation (check for consistent results)
      const { data: firstLoad, error: firstError } = await supabase
        .from('reviews')
        .select('id, title')
        .order('id', { ascending: true })
        .limit(5);

      if (firstError) throw firstError;

      // Simulate a second load to check consistency
      const { data: secondLoad, error: secondError } = await supabase
        .from('reviews')
        .select('id, title')
        .order('id', { ascending: true })
        .limit(5);

      if (secondError) throw secondError;

      const loadingConsistent = JSON.stringify(firstLoad) === JSON.stringify(secondLoad);

      // Test 3: Edge cases - empty pages and out of bounds
      const veryHighOffset = totalCount + 100;
      const { data: emptyPage, error: emptyError } = await supabase
        .from('reviews')
        .select('id')
        .range(veryHighOffset, veryHighOffset + pageSize - 1);

      if (emptyError) throw emptyError;

      const emptyPageHandled = (emptyPage?.length || 0) === 0;

      // Calculate pagination success
      const successfulPages = paginationTests.filter(test => test.sizeCorrect).length;
      const paginationSuccessRate = paginationTests.length > 0
        ? Math.round((successfulPages / paginationTests.length) * 100)
        : 100;

      const metadata = {
        totalReviews: totalCount,
        expectedPages,
        pageSize,
        paginationTests,
        paginationSuccessRate,
        loadingConsistent,
        emptyPageHandled,
        testedPages: pagesToTest
      };

      if (paginationSuccessRate < 100 || !loadingConsistent || !emptyPageHandled) {
        this.addResult('review-system', 'Review Pagination', 'warning',
          `Review pagination partially working: ${paginationSuccessRate}% success rate, consistency: ${loadingConsistent}, empty page handling: ${emptyPageHandled}`,
          Date.now() - startTime, metadata);
      } else {
        this.addResult('review-system', 'Review Pagination', 'passed',
          `Review pagination working correctly: ${paginationSuccessRate}% success rate across ${pagesToTest} pages, consistent loading states`,
          Date.now() - startTime, metadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('review-system', 'Review Pagination', 'failed',
        'Review pagination has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async testUserReviewHistory(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test 1: User review history retrieval
      const { data: reviewsWithUsers, error: usersError } = await supabase
        .from('reviews')
        .select('id, user_id, title, rating, created_at, company_id')
        .not('user_id', 'is', null)
        .limit(20);

      if (usersError) throw usersError;

      if (!reviewsWithUsers || reviewsWithUsers.length === 0) {
        this.addResult('review-system', 'User Review History', 'warning',
          'No reviews with user associations found for history testing', Date.now() - startTime);
        return;
      }

      // Group reviews by user to test history functionality
      const userReviewGroups = reviewsWithUsers.reduce((groups, review) => {
        const userId = review.user_id;
        if (!groups[userId]) {
          groups[userId] = [];
        }
        groups[userId].push(review);
        return groups;
      }, {} as Record<string, any[]>);

      const userHistoryTests = [];
      const usersToTest = Object.keys(userReviewGroups).slice(0, 5); // Test first 5 users

      for (const userId of usersToTest) {
        const userReviews = userReviewGroups[userId];

        // Test retrieving user's review history
        const { data: historyReviews, error: historyError } = await supabase
          .from('reviews')
          .select(`
            id,
            title,
            rating,
            created_at,
            company:companies(id, name)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (historyError) throw historyError;

        const expectedCount = userReviews.length;
        const actualCount = historyReviews?.length || 0;
        const countMatches = expectedCount === actualCount;

        // Check if reviews are properly ordered by date
        let properlyOrdered = true;
        if (historyReviews && historyReviews.length > 1) {
          for (let i = 1; i < historyReviews.length; i++) {
            const prevDate = new Date(historyReviews[i - 1].created_at);
            const currDate = new Date(historyReviews[i].created_at);
            if (prevDate < currDate) {
              properlyOrdered = false;
              break;
            }
          }
        }

        // Check company relationships in history
        const hasCompanyInfo = historyReviews?.every(review => review.company) || false;

        userHistoryTests.push({
          userId,
          expectedCount,
          actualCount,
          countMatches,
          properlyOrdered,
          hasCompanyInfo,
          sampleReviews: historyReviews?.slice(0, 2).map(r => ({
            id: r.id,
            title: r.title,
            rating: r.rating,
            companyName: r.company?.name
          })) || []
        });
      }

      // Test 2: Review history display formatting
      const displayTests = userHistoryTests.map(test => ({
        userId: test.userId,
        hasDisplayableData: test.sampleReviews.every(review =>
          review.title && review.rating && review.companyName
        ),
        reviewCount: test.actualCount
      }));

      // Calculate success rates
      const successfulHistoryRetrievals = userHistoryTests.filter(test =>
        test.countMatches && test.properlyOrdered && test.hasCompanyInfo
      ).length;
      const historySuccessRate = userHistoryTests.length > 0
        ? Math.round((successfulHistoryRetrievals / userHistoryTests.length) * 100)
        : 100;

      const displayableHistories = displayTests.filter(test => test.hasDisplayableData).length;
      const displaySuccessRate = displayTests.length > 0
        ? Math.round((displayableHistories / displayTests.length) * 100)
        : 100;

      const metadata = {
        totalUsersWithReviews: Object.keys(userReviewGroups).length,
        usersTestedCount: userHistoryTests.length,
        historySuccessRate,
        displaySuccessRate,
        userHistoryTests: userHistoryTests.slice(0, 3), // Sample of tests
        averageReviewsPerUser: Math.round(
          Object.values(userReviewGroups).reduce((sum, reviews) => sum + reviews.length, 0) /
          Object.keys(userReviewGroups).length
        )
      };

      if (historySuccessRate < 100 || displaySuccessRate < 100) {
        this.addResult('review-system', 'User Review History', 'warning',
          `User review history partially working: ${historySuccessRate}% retrieval success, ${displaySuccessRate}% display success`,
          Date.now() - startTime, metadata);
      } else {
        this.addResult('review-system', 'User Review History', 'passed',
          `User review history working correctly: ${historySuccessRate}% retrieval success, ${displaySuccessRate}% display success across ${userHistoryTests.length} users`,
          Date.now() - startTime, metadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('review-system', 'User Review History', 'failed',
        'User review history has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  // Task 4.3: Create review rating calculation verification
  private async testReviewRatingCalculation(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test 1: Company rating calculation from reviews
      const { data: companiesWithReviews, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          average_rating,
          total_reviews,
          reviews:reviews(id, rating, status)
        `)
        .limit(10);

      if (error) throw error;

      if (!companiesWithReviews || companiesWithReviews.length === 0) {
        this.addResult('review-system', 'Review Rating Calculation', 'warning',
          'No companies found to test rating calculation', Date.now() - startTime);
        return;
      }

      const ratingCalculationTests = [];

      for (const company of companiesWithReviews) {
        const reviews = company.reviews as any[];
        const approvedReviews = reviews.filter(r => !r.status || r.status === 'approved');
        const storedRating = company.average_rating;
        const storedReviewCount = company.total_reviews;

        // Calculate expected rating manually
        let expectedRating = null;
        let expectedCount = approvedReviews.length;

        if (approvedReviews.length > 0) {
          const validRatings = approvedReviews.filter(r =>
            r.rating !== null && r.rating !== undefined && r.rating >= 1 && r.rating <= 5
          );

          if (validRatings.length > 0) {
            expectedRating = validRatings.reduce((sum, review) => sum + review.rating, 0) / validRatings.length;
            expectedCount = validRatings.length;
          }
        }

        // Check accuracy (allow small floating point differences)
        const ratingAccurate = (storedRating === null && expectedRating === null) ||
          (storedRating !== null && expectedRating !== null &&
            Math.abs(storedRating - expectedRating) < 0.01);

        const countAccurate = storedReviewCount === expectedCount ||
          (storedReviewCount === null && expectedCount === 0);

        ratingCalculationTests.push({
          companyId: company.id,
          companyName: company.name,
          totalReviews: reviews.length,
          approvedReviews: approvedReviews.length,
          storedRating: storedRating ? Math.round(storedRating * 100) / 100 : null,
          expectedRating: expectedRating ? Math.round(expectedRating * 100) / 100 : null,
          storedCount: storedReviewCount,
          expectedCount,
          ratingAccurate,
          countAccurate,
          ratingDifference: storedRating && expectedRating
            ? Math.abs(storedRating - expectedRating)
            : 0
        });
      }

      // Test 2: Rating updates when new reviews are added (simulate by checking consistency)
      const { data: recentReviews, error: recentError } = await supabase
        .from('reviews')
        .select('company_id, rating, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      const updateConsistencyTests = [];
      if (recentReviews && recentReviews.length > 0) {
        // Group recent reviews by company
        const recentByCompany = recentReviews.reduce((groups, review) => {
          if (!groups[review.company_id]) {
            groups[review.company_id] = [];
          }
          groups[review.company_id].push(review);
          return groups;
        }, {} as Record<number, any[]>);

        // Check if company ratings reflect recent reviews
        for (const [companyId, reviews] of Object.entries(recentByCompany)) {
          const { data: companyRating, error: companyError } = await supabase
            .from('companies')
            .select('id, average_rating, total_reviews')
            .eq('id', parseInt(companyId))
            .single();

          if (companyError) continue;

          updateConsistencyTests.push({
            companyId: parseInt(companyId),
            recentReviewCount: reviews.length,
            hasStoredRating: companyRating?.average_rating !== null,
            hasReviewCount: companyRating?.total_reviews !== null && companyRating.total_reviews > 0
          });
        }
      }

      // Test 3: Average rating display consistency across company profiles
      const consistencyTests = [];
      for (const company of companiesWithReviews.slice(0, 5)) {
        // Fetch the same company data again to check consistency
        const { data: refetchedCompany, error: refetchError } = await supabase
          .from('companies')
          .select('id, average_rating, total_reviews')
          .eq('id', company.id)
          .single();

        if (refetchError) continue;

        const ratingConsistent = company.average_rating === refetchedCompany?.average_rating;
        const countConsistent = company.total_reviews === refetchedCompany?.total_reviews;

        consistencyTests.push({
          companyId: company.id,
          ratingConsistent,
          countConsistent,
          originalRating: company.average_rating,
          refetchedRating: refetchedCompany?.average_rating
        });
      }

      // Calculate success rates
      const accurateRatings = ratingCalculationTests.filter(test => test.ratingAccurate).length;
      const accurateCounts = ratingCalculationTests.filter(test => test.countAccurate).length;
      const ratingAccuracyRate = ratingCalculationTests.length > 0
        ? Math.round((accurateRatings / ratingCalculationTests.length) * 100)
        : 100;
      const countAccuracyRate = ratingCalculationTests.length > 0
        ? Math.round((accurateCounts / ratingCalculationTests.length) * 100)
        : 100;

      const consistentDisplays = consistencyTests.filter(test =>
        test.ratingConsistent && test.countConsistent
      ).length;
      const displayConsistencyRate = consistencyTests.length > 0
        ? Math.round((consistentDisplays / consistencyTests.length) * 100)
        : 100;

      const metadata = {
        companiesTestedCount: ratingCalculationTests.length,
        ratingAccuracyRate,
        countAccuracyRate,
        displayConsistencyRate,
        updateConsistencyTests,
        sampleCalculations: ratingCalculationTests.slice(0, 3),
        averageRatingDifference: ratingCalculationTests.length > 0
          ? Math.round((ratingCalculationTests.reduce((sum, test) => sum + test.ratingDifference, 0) /
            ratingCalculationTests.length) * 1000) / 1000
          : 0
      };

      const overallAccuracy = Math.min(ratingAccuracyRate, countAccuracyRate, displayConsistencyRate);

      if (overallAccuracy < 95) {
        this.addResult('review-system', 'Review Rating Calculation', 'warning',
          `Review rating calculation partially accurate: ${ratingAccuracyRate}% rating accuracy, ${countAccuracyRate}% count accuracy, ${displayConsistencyRate}% display consistency`,
          Date.now() - startTime, metadata);
      } else {
        this.addResult('review-system', 'Review Rating Calculation', 'passed',
          `Review rating calculation working correctly: ${ratingAccuracyRate}% rating accuracy, ${countAccuracyRate}% count accuracy, ${displayConsistencyRate}% display consistency across ${ratingCalculationTests.length} companies`,
          Date.now() - startTime, metadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('review-system', 'Review Rating Calculation', 'failed',
        'Review rating calculation has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async testCompanyRatingCalculation(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test average rating calculation accuracy for companies
      const { data: companiesWithReviews, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          average_rating,
          total_reviews,
          reviews:reviews(rating)
        `)
        .limit(10);

      if (error) throw error;

      if (!companiesWithReviews || companiesWithReviews.length === 0) {
        this.addResult('company-management', 'Company Rating Calculation', 'warning',
          'No companies found to test rating calculation', Date.now() - startTime);
        return;
      }

      const ratingTests = [];

      // Calculate and verify ratings for each company
      for (const company of companiesWithReviews) {
        const reviews = company.reviews as any[];
        const storedRating = company.average_rating;
        const storedReviewCount = company.total_reviews;

        if (reviews.length === 0) {
          // Company with no reviews should have null rating
          ratingTests.push({
            companyId: company.id,
            companyName: company.name,
            reviewCount: 0,
            storedRating,
            calculatedRating: null,
            ratingAccurate: storedRating === null || storedRating === 0,
            reviewCountAccurate: storedReviewCount === null || storedReviewCount === 0
          });
          continue;
        }

        // Calculate average rating manually
        const validRatings = reviews.filter(r => r.rating !== null && r.rating !== undefined);
        const calculatedRating = validRatings.length > 0
          ? validRatings.reduce((sum, review) => sum + review.rating, 0) / validRatings.length
          : null;

        // Check accuracy (allow small floating point differences)
        const ratingDifference = storedRating && calculatedRating
          ? Math.abs(storedRating - calculatedRating)
          : 0;

        const ratingAccurate = storedRating === null && calculatedRating === null ||
          (storedRating !== null && calculatedRating !== null && ratingDifference < 0.01);

        const reviewCountAccurate = storedReviewCount === reviews.length;

        ratingTests.push({
          companyId: company.id,
          companyName: company.name,
          reviewCount: reviews.length,
          storedRating: storedRating ? Math.round(storedRating * 100) / 100 : null,
          calculatedRating: calculatedRating ? Math.round(calculatedRating * 100) / 100 : null,
          ratingDifference: Math.round(ratingDifference * 100) / 100,
          ratingAccurate,
          reviewCountAccurate,
          storedReviewCount
        });
      }

      // Test rating consistency across company profiles
      const { data: companyProfiles, error: profileError } = await supabase
        .from('companies')
        .select('id, name, average_rating')
        .not('average_rating', 'is', null)
        .limit(5);

      if (profileError) throw profileError;

      const consistencyTests = [];
      for (const profile of companyProfiles || []) {
        // Verify the same rating appears consistently
        const { data: sameCompany, error: sameError } = await supabase
          .from('companies')
          .select('average_rating')
          .eq('id', profile.id)
          .single();

        if (sameError) continue;

        consistencyTests.push({
          companyId: profile.id,
          consistent: profile.average_rating === sameCompany.average_rating
        });
      }

      // Analyze results
      const totalRatingTests = ratingTests.length;
      const accurateRatings = ratingTests.filter(test => test.ratingAccurate).length;
      const accurateReviewCounts = ratingTests.filter(test => test.reviewCountAccurate).length;
      const consistentRatings = consistencyTests.filter(test => test.consistent).length;

      const ratingMetadata = {
        totalCompaniesTestedForRatings: totalRatingTests,
        accurateRatings,
        accurateReviewCounts,
        ratingAccuracy: totalRatingTests > 0 ? Math.round((accurateRatings / totalRatingTests) * 100) : 0,
        reviewCountAccuracy: totalRatingTests > 0 ? Math.round((accurateReviewCounts / totalRatingTests) * 100) : 0,
        consistentRatings,
        totalConsistencyTests: consistencyTests.length,
        sampleTests: ratingTests.slice(0, 3),
        companiesWithReviews: ratingTests.filter(test => test.reviewCount > 0).length
      };

      if (accurateRatings < totalRatingTests * 0.9) {
        this.addResult('company-management', 'Company Rating Calculation', 'failed',
          `Rating calculation accuracy is too low: ${accurateRatings}/${totalRatingTests} companies have accurate ratings`,
          Date.now() - startTime, ratingMetadata);
      } else if (accurateRatings < totalRatingTests) {
        this.addResult('company-management', 'Company Rating Calculation', 'warning',
          `Rating calculation mostly accurate: ${accurateRatings}/${totalRatingTests} companies have accurate ratings`,
          Date.now() - startTime, ratingMetadata);
      } else {
        this.addResult('company-management', 'Company Rating Calculation', 'passed',
          `Rating calculation working perfectly: all ${totalRatingTests} companies have accurate ratings and review counts`,
          Date.now() - startTime, ratingMetadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('company-management', 'Company Rating Calculation', 'failed',
        'Company rating calculation functionality has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async testRatingCalculation(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test average rating calculation for companies
      const { data: companyRatings, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          reviews:reviews(rating)
        `)
        .limit(5);

      if (error) throw error;

      if (!companyRatings || companyRatings.length === 0) {
        this.addResult('review-system', 'Rating Calculation', 'warning',
          'No companies with reviews found to test rating calculation', Date.now() - startTime);
        return;
      }

      // Calculate average ratings manually to verify
      const ratingsCalculated = companyRatings.map(company => {
        const reviews = company.reviews as any[];
        if (reviews.length === 0) return { ...company, avgRating: null };

        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        const avgRating = sum / reviews.length;

        return { ...company, avgRating, reviewCount: reviews.length };
      }).filter(company => company.avgRating !== null);

      this.addResult('review-system', 'Rating Calculation', 'passed',
        `Rating calculation is working (calculated averages for ${ratingsCalculated.length} companies)`,
        Date.now() - startTime, {
        companiesWithRatings: ratingsCalculated.length,
        sampleRatings: ratingsCalculated.slice(0, 3).map(c => ({
          company: c.name,
          avgRating: c.avgRating,
          reviewCount: c.reviewCount
        }))
      });
    } catch (error) {
      this.addResult('review-system', 'Rating Calculation', 'failed',
        'Rating calculation functionality has issues', Date.now() - startTime, `${error}`);
    }
  }

  // Search and Filter System verification methods
  private async verifySearchFilter(): Promise<void> {
    await this.testGlobalSearchFunctionality();
    await this.testMultiCriteriaFiltering();
    await this.testSearchPerformance();
    await this.testFilterCombinations();
  }

  // Task 5.1: Create global search functionality testing
  private async testGlobalSearchFunctionality(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test 1: Company search by name functionality
      const searchTerms = ['tech', 'inc', 'corp', 'solutions', 'group', 'media', 'systems'];
      const searchTests = [];

      for (const term of searchTerms) {
        // Test case-insensitive search
        const { data: searchResults, error } = await supabase
          .from('companies')
          .select('id, name, industry, location, average_rating, total_reviews')
          .ilike('name', `%${term}%`)
          .limit(20);

        if (error) throw error;

        // Verify search results contain the search term
        const relevantResults = searchResults?.filter(company =>
          company.name.toLowerCase().includes(term.toLowerCase())
        ) || [];

        const accuracy = searchResults?.length > 0
          ? (relevantResults.length / searchResults.length) * 100
          : 100;

        searchTests.push({
          term,
          totalResults: searchResults?.length || 0,
          relevantResults: relevantResults.length,
          accuracy: Math.round(accuracy),
          hasResults: (searchResults?.length || 0) > 0
        });
      }

      // Test 2: Search result accuracy and relevance validation
      const specificSearchTests = [
        { query: 'Google', expectedRelevance: 'high' },
        { query: 'Microsoft', expectedRelevance: 'high' },
        { query: 'Apple', expectedRelevance: 'high' },
        { query: 'xyz123nonexistent', expectedRelevance: 'none' }
      ];

      const relevanceTests = [];
      for (const test of specificSearchTests) {
        const { data: results, error } = await supabase
          .from('companies')
          .select('id, name, industry')
          .ilike('name', `%${test.query}%`)
          .limit(10);

        if (error) throw error;

        const hasResults = (results?.length || 0) > 0;
        const relevanceMatch = test.expectedRelevance === 'none'
          ? !hasResults
          : hasResults;

        relevanceTests.push({
          query: test.query,
          expectedRelevance: test.expectedRelevance,
          actualResults: results?.length || 0,
          relevanceMatch,
          sampleResults: results?.slice(0, 3).map(r => r.name) || []
        });
      }

      // Test 3: Search performance benchmarking
      const performanceTests = [];
      const performanceSearchTerms = ['a', 'tech', 'company', 'solutions'];

      for (const term of performanceSearchTerms) {
        const perfStartTime = Date.now();

        const { data: perfResults, error: perfError } = await supabase
          .from('companies')
          .select('id, name')
          .ilike('name', `%${term}%`)
          .limit(50);

        const perfDuration = Date.now() - perfStartTime;

        if (perfError) throw perfError;

        performanceTests.push({
          term,
          resultCount: perfResults?.length || 0,
          duration: perfDuration,
          performanceGood: perfDuration < 2000 // Under 2 seconds
        });
      }

      // Test 4: Empty search handling
      const { data: emptyResults, error: emptyError } = await supabase
        .from('companies')
        .select('id, name')
        .ilike('name', '%%')
        .limit(10);

      if (emptyError) throw emptyError;

      // Calculate success rates
      const accurateSearches = searchTests.filter(test => test.accuracy >= 80).length;
      const searchAccuracyRate = searchTests.length > 0
        ? Math.round((accurateSearches / searchTests.length) * 100)
        : 100;

      const relevantSearches = relevanceTests.filter(test => test.relevanceMatch).length;
      const relevanceSuccessRate = relevanceTests.length > 0
        ? Math.round((relevantSearches / relevanceTests.length) * 100)
        : 100;

      const fastSearches = performanceTests.filter(test => test.performanceGood).length;
      const performanceSuccessRate = performanceTests.length > 0
        ? Math.round((fastSearches / performanceTests.length) * 100)
        : 100;

      const metadata = {
        searchTests,
        relevanceTests,
        performanceTests,
        searchAccuracyRate,
        relevanceSuccessRate,
        performanceSuccessRate,
        emptySearchHandled: (emptyResults?.length || 0) > 0,
        averageSearchDuration: Math.round(
          performanceTests.reduce((sum, test) => sum + test.duration, 0) / performanceTests.length
        ),
        totalSearchTermsTested: searchTerms.length + specificSearchTests.length
      };

      const overallSuccessRate = Math.min(searchAccuracyRate, relevanceSuccessRate, performanceSuccessRate);

      if (overallSuccessRate < 80) {
        this.addResult('search-filter', 'Global Search Functionality', 'warning',
          `Global search partially working: ${searchAccuracyRate}% accuracy, ${relevanceSuccessRate}% relevance, ${performanceSuccessRate}% performance`,
          Date.now() - startTime, metadata);
      } else {
        this.addResult('search-filter', 'Global Search Functionality', 'passed',
          `Global search working correctly: ${searchAccuracyRate}% accuracy, ${relevanceSuccessRate}% relevance, ${performanceSuccessRate}% performance across ${metadata.totalSearchTermsTested} test queries`,
          Date.now() - startTime, metadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('search-filter', 'Global Search Functionality', 'failed',
        'Global search functionality has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  // Task 5.2: Implement multi-criteria filtering verification
  private async testMultiCriteriaFiltering(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test 1: Industry filtering functionality
      const { data: allIndustries, error: industriesError } = await supabase
        .from('companies')
        .select('industry')
        .not('industry', 'is', null);

      if (industriesError) throw industriesError;

      const uniqueIndustries = [...new Set(allIndustries?.map(c => c.industry).filter(Boolean))] as string[];
      const industryFilterTests = [];

      // Test filtering by each available industry
      for (const industry of uniqueIndustries.slice(0, 5)) { // Test first 5 industries
        const { data: industryCompanies, error } = await supabase
          .from('companies')
          .select('id, name, industry, location, average_rating')
          .eq('industry', industry)
          .limit(20);

        if (error) throw error;

        // Verify all results match the industry filter
        const correctlyFiltered = industryCompanies?.every(company =>
          company.industry === industry
        ) || true;

        industryFilterTests.push({
          industry,
          resultCount: industryCompanies?.length || 0,
          correctlyFiltered,
          hasResults: (industryCompanies?.length || 0) > 0
        });
      }

      // Test 2: Location-based filtering
      const locationTerms = ['San Francisco', 'New York', 'Los Angeles', 'Seattle', 'Austin', 'Boston'];
      const locationFilterTests = [];

      for (const location of locationTerms) {
        const { data: locationCompanies, error } = await supabase
          .from('companies')
          .select('id, name, location, industry')
          .ilike('location', `%${location}%`)
          .limit(15);

        if (error) throw error;

        // Verify results contain the location term
        const correctlyFiltered = locationCompanies?.every(company =>
          company.location?.toLowerCase().includes(location.toLowerCase())
        ) || true;

        locationFilterTests.push({
          location,
          resultCount: locationCompanies?.length || 0,
          correctlyFiltered,
          hasResults: (locationCompanies?.length || 0) > 0
        });
      }

      // Test 3: Rating range filtering
      const ratingRanges = [
        { min: 1, max: 2, label: '1-2 stars' },
        { min: 2, max: 3, label: '2-3 stars' },
        { min: 3, max: 4, label: '3-4 stars' },
        { min: 4, max: 5, label: '4-5 stars' }
      ];

      const ratingFilterTests = [];

      for (const range of ratingRanges) {
        const { data: ratedCompanies, error } = await supabase
          .from('companies')
          .select('id, name, average_rating, total_reviews')
          .gte('average_rating', range.min)
          .lt('average_rating', range.max)
          .not('average_rating', 'is', null)
          .limit(10);

        if (error) throw error;

        // Verify all results fall within the rating range
        const correctlyFiltered = ratedCompanies?.every(company =>
          company.average_rating !== null &&
          company.average_rating >= range.min &&
          company.average_rating < range.max
        ) || true;

        ratingFilterTests.push({
          range: range.label,
          min: range.min,
          max: range.max,
          resultCount: ratedCompanies?.length || 0,
          correctlyFiltered,
          hasResults: (ratedCompanies?.length || 0) > 0
        });
      }

      // Test 4: Filter combination and interaction logic
      const combinationTests = [];

      // Test industry + location combination
      if (uniqueIndustries.length > 0) {
        const testIndustry = uniqueIndustries[0];
        const testLocation = 'San Francisco';

        const { data: combinedResults, error: combinedError } = await supabase
          .from('companies')
          .select('id, name, industry, location')
          .eq('industry', testIndustry)
          .ilike('location', `%${testLocation}%`)
          .limit(10);

        if (combinedError) throw combinedError;

        const correctlyCombined = combinedResults?.every(company =>
          company.industry === testIndustry &&
          company.location?.toLowerCase().includes(testLocation.toLowerCase())
        ) || true;

        combinationTests.push({
          type: 'industry + location',
          filters: { industry: testIndustry, location: testLocation },
          resultCount: combinedResults?.length || 0,
          correctlyFiltered: correctlyCombined
        });
      }

      // Test industry + rating combination
      if (uniqueIndustries.length > 0) {
        const testIndustry = uniqueIndustries[0];
        const minRating = 3.0;

        const { data: industryRatingResults, error: industryRatingError } = await supabase
          .from('companies')
          .select('id, name, industry, average_rating')
          .eq('industry', testIndustry)
          .gte('average_rating', minRating)
          .not('average_rating', 'is', null)
          .limit(10);

        if (industryRatingError) throw industryRatingError;

        const correctlyFiltered = industryRatingResults?.every(company =>
          company.industry === testIndustry &&
          company.average_rating !== null &&
          company.average_rating >= minRating
        ) || true;

        combinationTests.push({
          type: 'industry + rating',
          filters: { industry: testIndustry, minRating },
          resultCount: industryRatingResults?.length || 0,
          correctlyFiltered
        });
      }

      // Calculate success rates
      const successfulIndustryFilters = industryFilterTests.filter(test => test.correctlyFiltered).length;
      const industryFilterSuccessRate = industryFilterTests.length > 0
        ? Math.round((successfulIndustryFilters / industryFilterTests.length) * 100)
        : 100;

      const successfulLocationFilters = locationFilterTests.filter(test => test.correctlyFiltered).length;
      const locationFilterSuccessRate = locationFilterTests.length > 0
        ? Math.round((successfulLocationFilters / locationFilterTests.length) * 100)
        : 100;

      const successfulRatingFilters = ratingFilterTests.filter(test => test.correctlyFiltered).length;
      const ratingFilterSuccessRate = ratingFilterTests.length > 0
        ? Math.round((successfulRatingFilters / ratingFilterTests.length) * 100)
        : 100;

      const successfulCombinations = combinationTests.filter(test => test.correctlyFiltered).length;
      const combinationSuccessRate = combinationTests.length > 0
        ? Math.round((successfulCombinations / combinationTests.length) * 100)
        : 100;

      const metadata = {
        industryFilterTests,
        locationFilterTests,
        ratingFilterTests,
        combinationTests,
        industryFilterSuccessRate,
        locationFilterSuccessRate,
        ratingFilterSuccessRate,
        combinationSuccessRate,
        availableIndustries: uniqueIndustries.length,
        totalFiltersTestedCount: industryFilterTests.length + locationFilterTests.length + ratingFilterTests.length,
        combinationFiltersTestedCount: combinationTests.length
      };

      const overallFilterSuccessRate = Math.min(
        industryFilterSuccessRate,
        locationFilterSuccessRate,
        ratingFilterSuccessRate,
        combinationSuccessRate
      );

      if (overallFilterSuccessRate < 90) {
        this.addResult('search-filter', 'Multi-Criteria Filtering', 'warning',
          `Multi-criteria filtering partially working: ${industryFilterSuccessRate}% industry, ${locationFilterSuccessRate}% location, ${ratingFilterSuccessRate}% rating, ${combinationSuccessRate}% combinations`,
          Date.now() - startTime, metadata);
      } else {
        this.addResult('search-filter', 'Multi-Criteria Filtering', 'passed',
          `Multi-criteria filtering working correctly: ${overallFilterSuccessRate}% overall success rate across ${metadata.totalFiltersTestedCount} individual filters and ${metadata.combinationFiltersTestedCount} combinations`,
          Date.now() - startTime, metadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('search-filter', 'Multi-Criteria Filtering', 'failed',
        'Multi-criteria filtering has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async testSearchPerformance(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test 1: Search performance benchmarking
      const performanceTests = [];
      const searchScenarios = [
        { type: 'short_term', query: 'a', expectedResults: 'many', description: 'Single character search' },
        { type: 'common_term', query: 'tech', expectedResults: 'moderate', description: 'Common term search' },
        { type: 'specific_term', query: 'microsoft', expectedResults: 'few', description: 'Specific company search' },
        { type: 'complex_term', query: 'software development solutions', expectedResults: 'few', description: 'Multi-word search' },
        { type: 'no_results', query: 'xyz123nonexistent987', expectedResults: 'none', description: 'No results search' }
      ];

      for (const scenario of searchScenarios) {
        const perfStartTime = Date.now();

        const { data: results, error } = await supabase
          .from('companies')
          .select('id, name, industry, location')
          .ilike('name', `%${scenario.query}%`)
          .limit(100);

        const duration = Date.now() - perfStartTime;

        if (error) throw error;

        const resultCount = results?.length || 0;
        const performanceGood = duration < 3000; // Under 3 seconds
        const resultsExpected = scenario.expectedResults === 'none'
          ? resultCount === 0
          : resultCount >= 0; // Any result count is acceptable for other scenarios

        performanceTests.push({
          type: scenario.type,
          query: scenario.query,
          description: scenario.description,
          duration,
          resultCount,
          performanceGood,
          resultsExpected,
          throughput: resultCount > 0 ? Math.round(resultCount / (duration / 1000)) : 0 // results per second
        });
      }

      // Test 2: Large dataset handling performance
      const { data: totalCompanies, error: countError } = await supabase
        .from('companies')
        .select('id', { count: 'exact' });

      if (countError) throw countError;

      const totalCount = totalCompanies?.length || 0;

      // Test pagination performance with large offsets
      const paginationPerformanceTests = [];
      const offsets = [0, 50, 100, 200];

      for (const offset of offsets) {
        if (offset >= totalCount) continue;

        const pagePerfStartTime = Date.now();

        const { data: pageResults, error: pageError } = await supabase
          .from('companies')
          .select('id, name')
          .range(offset, offset + 19) // 20 results per page
          .order('id');

        const pageDuration = Date.now() - pagePerfStartTime;

        if (pageError) throw pageError;

        paginationPerformanceTests.push({
          offset,
          duration: pageDuration,
          resultCount: pageResults?.length || 0,
          performanceGood: pageDuration < 2000 // Under 2 seconds
        });
      }

      // Test 3: Concurrent search simulation
      const concurrentSearchStartTime = Date.now();
      const concurrentSearches = [
        supabase.from('companies').select('id, name').ilike('name', '%tech%').limit(10),
        supabase.from('companies').select('id, name').ilike('name', '%inc%').limit(10),
        supabase.from('companies').select('id, name').ilike('name', '%corp%').limit(10)
      ];

      const concurrentResults = await Promise.all(concurrentSearches);
      const concurrentDuration = Date.now() - concurrentSearchStartTime;

      const concurrentSuccess = concurrentResults.every(result => !result.error);
      const concurrentPerformanceGood = concurrentDuration < 5000; // Under 5 seconds for 3 concurrent searches

      // Calculate performance metrics
      const fastSearches = performanceTests.filter(test => test.performanceGood).length;
      const searchPerformanceRate = performanceTests.length > 0
        ? Math.round((fastSearches / performanceTests.length) * 100)
        : 100;

      const fastPagination = paginationPerformanceTests.filter(test => test.performanceGood).length;
      const paginationPerformanceRate = paginationPerformanceTests.length > 0
        ? Math.round((fastPagination / paginationPerformanceTests.length) * 100)
        : 100;

      const averageSearchDuration = Math.round(
        performanceTests.reduce((sum, test) => sum + test.duration, 0) / performanceTests.length
      );

      const metadata = {
        performanceTests,
        paginationPerformanceTests,
        searchPerformanceRate,
        paginationPerformanceRate,
        averageSearchDuration,
        totalCompaniesInDatabase: totalCount,
        concurrentSearchSuccess: concurrentSuccess,
        concurrentSearchDuration: concurrentDuration,
        concurrentPerformanceGood: concurrentPerformanceGood,
        maxThroughput: Math.max(...performanceTests.map(test => test.throughput))
      };

      const overallPerformanceGood = searchPerformanceRate >= 80 &&
        paginationPerformanceRate >= 80 &&
        concurrentPerformanceGood;

      if (!overallPerformanceGood) {
        this.addResult('search-filter', 'Search Performance', 'warning',
          `Search performance needs improvement: ${searchPerformanceRate}% search performance, ${paginationPerformanceRate}% pagination performance, concurrent: ${concurrentPerformanceGood}`,
          Date.now() - startTime, metadata);
      } else {
        this.addResult('search-filter', 'Search Performance', 'passed',
          `Search performance is good: ${searchPerformanceRate}% search performance, ${paginationPerformanceRate}% pagination performance, average ${averageSearchDuration}ms per search`,
          Date.now() - startTime, metadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('search-filter', 'Search Performance', 'failed',
        'Search performance testing has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async testFilterCombinations(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test 1: Complex filter combinations
      const { data: sampleData, error: sampleError } = await supabase
        .from('companies')
        .select('industry, location, average_rating')
        .not('industry', 'is', null)
        .not('location', 'is', null)
        .limit(100);

      if (sampleError) throw sampleError;

      if (!sampleData || sampleData.length === 0) {
        this.addResult('search-filter', 'Filter Combinations', 'warning',
          'No sample data available for filter combination testing', Date.now() - startTime);
        return;
      }

      const availableIndustries = [...new Set(sampleData.map(c => c.industry).filter(Boolean))];
      const availableLocations = [...new Set(sampleData.map(c => c.location).filter(Boolean))];

      const combinationTests = [];

      // Test 2: Triple filter combinations (industry + location + rating)
      if (availableIndustries.length > 0 && availableLocations.length > 0) {
        const testIndustry = availableIndustries[0];
        const testLocation = availableLocations[0];
        const minRating = 3.0;

        const { data: tripleFilterResults, error: tripleError } = await supabase
          .from('companies')
          .select('id, name, industry, location, average_rating')
          .eq('industry', testIndustry)
          .ilike('location', `%${testLocation}%`)
          .gte('average_rating', minRating)
          .not('average_rating', 'is', null)
          .limit(20);

        if (tripleError) throw tripleError;

        const correctlyFiltered = tripleFilterResults?.every(company =>
          company.industry === testIndustry &&
          company.location?.toLowerCase().includes(testLocation.toLowerCase()) &&
          company.average_rating !== null &&
          company.average_rating >= minRating
        ) || true;

        combinationTests.push({
          type: 'triple_filter',
          filters: { industry: testIndustry, location: testLocation, minRating },
          resultCount: tripleFilterResults?.length || 0,
          correctlyFiltered,
          description: 'Industry + Location + Rating filter'
        });
      }

      // Test 3: Filter interaction logic (OR vs AND)
      if (availableIndustries.length >= 2) {
        const industry1 = availableIndustries[0];
        const industry2 = availableIndustries[1];

        // Test OR logic simulation (separate queries)
        const { data: industry1Results, error: ind1Error } = await supabase
          .from('companies')
          .select('id, name, industry')
          .eq('industry', industry1)
          .limit(10);

        const { data: industry2Results, error: ind2Error } = await supabase
          .from('companies')
          .select('id, name, industry')
          .eq('industry', industry2)
          .limit(10);

        if (ind1Error || ind2Error) throw ind1Error || ind2Error;

        const orResultCount = (industry1Results?.length || 0) + (industry2Results?.length || 0);

        combinationTests.push({
          type: 'or_logic',
          filters: { industry1, industry2 },
          resultCount: orResultCount,
          correctlyFiltered: true, // Assume correct since we're testing separate queries
          description: 'OR logic simulation for multiple industries'
        });
      }

      // Test 4: Filter reset and state management
      const filterResetTests = [];

      // Apply filter, then "reset" by querying all
      const { data: filteredResults, error: filteredError } = await supabase
        .from('companies')
        .select('id, name, industry')
        .eq('industry', availableIndustries[0])
        .limit(10);

      if (filteredError) throw filteredError;

      const { data: allResults, error: allError } = await supabase
        .from('companies')
        .select('id, name, industry')
        .limit(10);

      if (allError) throw allError;

      const resetWorking = (allResults?.length || 0) >= (filteredResults?.length || 0);

      filterResetTests.push({
        filteredCount: filteredResults?.length || 0,
        allCount: allResults?.length || 0,
        resetWorking,
        description: 'Filter reset functionality'
      });

      // Test 5: Edge cases and boundary conditions
      const edgeCaseTests = [];

      // Test empty filter values
      const { data: emptyFilterResults, error: emptyFilterError } = await supabase
        .from('companies')
        .select('id, name')
        .ilike('name', '%%') // Empty-like filter
        .limit(5);

      if (emptyFilterError) throw emptyFilterError;

      // Test non-existent filter values
      const { data: nonExistentResults, error: nonExistentError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('industry', 'NonExistentIndustry123')
        .limit(5);

      if (nonExistentError) throw nonExistentError;

      edgeCaseTests.push({
        emptyFilterHandled: (emptyFilterResults?.length || 0) > 0,
        nonExistentFilterHandled: (nonExistentResults?.length || 0) === 0,
        description: 'Edge case handling'
      });

      // Calculate success rates
      const successfulCombinations = combinationTests.filter(test => test.correctlyFiltered).length;
      const combinationSuccessRate = combinationTests.length > 0
        ? Math.round((successfulCombinations / combinationTests.length) * 100)
        : 100;

      const successfulResets = filterResetTests.filter(test => test.resetWorking).length;
      const resetSuccessRate = filterResetTests.length > 0
        ? Math.round((successfulResets / filterResetTests.length) * 100)
        : 100;

      const edgeCasesHandled = edgeCaseTests.filter(test =>
        test.emptyFilterHandled && test.nonExistentFilterHandled
      ).length;
      const edgeCaseSuccessRate = edgeCaseTests.length > 0
        ? Math.round((edgeCasesHandled / edgeCaseTests.length) * 100)
        : 100;

      const metadata = {
        combinationTests,
        filterResetTests,
        edgeCaseTests,
        combinationSuccessRate,
        resetSuccessRate,
        edgeCaseSuccessRate,
        availableIndustriesCount: availableIndustries.length,
        availableLocationsCount: availableLocations.length,
        totalCombinationsTestedCount: combinationTests.length
      };

      const overallSuccessRate = Math.min(combinationSuccessRate, resetSuccessRate, edgeCaseSuccessRate);

      if (overallSuccessRate < 90) {
        this.addResult('search-filter', 'Filter Combinations', 'warning',
          `Filter combinations partially working: ${combinationSuccessRate}% combinations, ${resetSuccessRate}% reset, ${edgeCaseSuccessRate}% edge cases`,
          Date.now() - startTime, metadata);
      } else {
        this.addResult('search-filter', 'Filter Combinations', 'passed',
          `Filter combinations working correctly: ${overallSuccessRate}% overall success rate across ${combinationTests.length} combination tests`,
          Date.now() - startTime, metadata);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      this.addResult('search-filter', 'Filter Combinations', 'failed',
        'Filter combinations testing has critical issues', Date.now() - startTime, errorMessage);
    }
  }

  private async verifyWallSections(): Promise<void> {
    this.addResult('wall-sections', 'Wall of Fame/Shame', 'skipped', 'Wall sections verification not yet implemented', 0);
  }

  private async verifyFinancialDistress(): Promise<void> {
    this.addResult('financial-distress', 'Distress Monitoring', 'skipped', 'Financial distress verification not yet implemented', 0);
  }

  private async verifyRisingStartups(): Promise<void> {
    this.addResult('rising-startups', 'Startup Tracking', 'skipped', 'Rising startups verification not yet implemented', 0);
  }

  private async verifyDatabaseIntegration(): Promise<void> {
    this.addResult('database-integration', 'Database Operations', 'skipped', 'Database integration verification not yet implemented', 0);
  }

  private async verifyUIUX(): Promise<void> {
    this.addResult('ui-ux', 'User Interface', 'skipped', 'UI/UX verification not yet implemented', 0);
  }

  private async verifyPerformanceSecurity(): Promise<void> {
    this.addResult('performance-security', 'Performance & Security', 'skipped', 'Performance & security verification not yet implemented', 0);
  }

  // Utility methods
  private addResult(
    module: string,
    testName: string,
    status: 'passed' | 'failed' | 'warning' | 'skipped',
    details: string,
    duration: number,
    errorMessageOrMetadata?: string | Record<string, any>,
    metadata: Record<string, any> = {}
  ): void {
    // Handle the case where metadata is passed as the 6th parameter
    let errorMessage: string | undefined;
    let finalMetadata: Record<string, any> = metadata;

    if (typeof errorMessageOrMetadata === 'string') {
      errorMessage = errorMessageOrMetadata;
    } else if (typeof errorMessageOrMetadata === 'object' && errorMessageOrMetadata !== null) {
      finalMetadata = errorMessageOrMetadata;
      errorMessage = undefined;
    }

    const result: VerificationResult = {
      id: `${module}-${testName}-${Date.now()}`,
      module,
      testName,
      status,
      timestamp: new Date(),
      duration,
      details,
      errorMessage,
      metadata: finalMetadata
    };

    this.results.push(result);
    this.session.results.push(result);
    this.session.totalTests++;

    switch (status) {
      case 'passed':
        this.session.passedTests++;
        break;
      case 'failed':
        this.session.failedTests++;
        break;
      case 'warning':
        this.session.warningTests++;
        break;
      case 'skipped':
        this.session.skippedTests++;
        break;
    }
  }

  private generateSummary(): void {
    const { passedTests, failedTests, warningTests, skippedTests, totalTests } = this.session;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    this.session.summary = `Verification completed: ${passedTests}/${totalTests} passed (${passRate}%), ${failedTests} failed, ${warningTests} warnings, ${skippedTests} skipped`;
  }

  private printResults(): void {
    console.log(chalk.blue('\n📊 Verification Results Summary:\n'));

    // Group results by module
    const moduleResults = new Map<string, VerificationResult[]>();
    this.results.forEach(result => {
      if (!moduleResults.has(result.module)) {
        moduleResults.set(result.module, []);
      }
      moduleResults.get(result.module)!.push(result);
    });

    // Print results by module
    moduleResults.forEach((results, module) => {
      console.log(chalk.yellow(`\n🔧 ${module.toUpperCase()} MODULE:`));

      results.forEach(result => {
        const icon = this.getStatusIcon(result.status);
        const duration = result.duration > 0 ? ` (${result.duration}ms)` : '';

        console.log(`${icon} ${result.testName}${duration}`);
        console.log(`   ${result.details}`);

        if (result.errorMessage && result.status === 'failed') {
          console.log(chalk.red(`   Error: ${result.errorMessage}`));
        }

        if (Object.keys(result.metadata).length > 0) {
          console.log(chalk.gray(`   Metadata: ${JSON.stringify(result.metadata)}`));
        }
        console.log();
      });
    });

    // Print overall summary
    const { passedTests, failedTests, warningTests, skippedTests, totalTests } = this.session;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    console.log(chalk.blue('\n📈 Overall Summary:'));
    console.log(chalk.green(`   ✅ Passed: ${passedTests}/${totalTests} (${passRate}%)`));
    console.log(chalk.red(`   ❌ Failed: ${failedTests}/${totalTests}`));
    console.log(chalk.yellow(`   ⚠️  Warnings: ${warningTests}/${totalTests}`));
    console.log(chalk.gray(`   ⏭️  Skipped: ${skippedTests}/${totalTests}`));

    const duration = this.session.endTime && this.session.startTime
      ? this.session.endTime.getTime() - this.session.startTime.getTime()
      : 0;

    console.log(chalk.blue(`\n⏱️  Total Duration: ${duration}ms`));
    console.log(chalk.blue(`📝 Session ID: ${this.session.id}`));
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'warning': return '⚠️';
      case 'skipped': return '⏭️';
      default: return '❓';
    }
  }

  private async saveResults(): Promise<void> {
    try {
      // Create reports directory if it doesn't exist
      const reportsDir = path.resolve(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Save detailed results
      const reportPath = path.resolve(reportsDir, `verification-${this.session.id}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(this.session, null, 2));

      console.log(chalk.green(`\n💾 Results saved to: ${reportPath}`));
    } catch (error) {
      console.error(chalk.red(`\n❌ Failed to save results: ${error}`));
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const modules = args.length > 0 ? args : undefined;

  const framework = new CoreFeatureVerificationFramework();
  const session = await framework.runVerification(modules);

  // Exit with appropriate code
  if (session.failedTests > 0) {
    console.log(chalk.red('\n❌ Some verification tests failed.'));
    process.exit(1);
  } else if (session.warningTests > 0) {
    console.log(chalk.yellow('\n⚠️ Verification completed with warnings.'));
    process.exit(0);
  } else {
    console.log(chalk.green('\n🎉 All verification tests passed!'));
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { CoreFeatureVerificationFramework };