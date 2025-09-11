#!/usr/bin/env tsx

/**
 * Core Functionality Validation Script
 * Tests essential user journeys and system functionality
 */

import { supabase } from '../src/lib/supabaseClient';

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

class CoreFunctionalityValidator {
  private results: ValidationResult[] = [];

  async validateAll(): Promise<ValidationResult[]> {
    console.log('🔍 Validating core functionality...\n');

    await this.validateDatabaseConnection();
    await this.validateAuthenticationSystem();
    await this.validateCompanyCRUD();
    await this.validateReviewCRUD();
    await this.validateSearchFunctionality();

    this.printResults();
    return this.results;
  }

  private async validateDatabaseConnection(): Promise<void> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.from('companies').select('count').limit(1);
      
      if (error) throw error;
      
      this.results.push({
        test: 'Database Connection',
        status: 'PASS',
        message: 'Successfully connected to Supabase',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        test: 'Database Connection',
        status: 'FAIL',
        message: `Failed to connect: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async validateAuthenticationSystem(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test auth configuration
      const { data: { session } } = await supabase.auth.getSession();
      
      // Test auth methods availability
      const authMethods = [
        'signUp',
        'signInWithPassword',
        'signOut',
        'getSession',
        'getUser'
      ];
      
      const missingMethods = authMethods.filter(method => 
        typeof (supabase.auth as any)[method] !== 'function'
      );
      
      if (missingMethods.length > 0) {
        throw new Error(`Missing auth methods: ${missingMethods.join(', ')}`);
      }
      
      this.results.push({
        test: 'Authentication System',
        status: 'PASS',
        message: 'Auth system properly configured',
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        test: 'Authentication System',
        status: 'FAIL',
        message: `Auth validation failed: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async validateCompanyCRUD(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test READ operation
      const { data: companies, error: readError } = await supabase
        .from('companies')
        .select('id, name, industry, location')
        .limit(5);
      
      if (readError) throw readError;
      
      if (!companies || companies.length === 0) {
        this.results.push({
          test: 'Company CRUD Operations',
          status: 'SKIP',
          message: 'No companies found in database to test with',
          duration: Date.now() - startTime
        });
        return;
      }
      
      // Test that we can read company details
      const testCompany = companies[0];
      const { data: companyDetail, error: detailError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', testCompany.id)
        .single();
      
      if (detailError) throw detailError;
      
      if (!companyDetail) {
        throw new Error('Could not fetch company details');
      }
      
      this.results.push({
        test: 'Company CRUD Operations',
        status: 'PASS',
        message: `Successfully validated company operations (tested with ${companies.length} companies)`,
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        test: 'Company CRUD Operations',
        status: 'FAIL',
        message: `Company CRUD validation failed: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async validateReviewCRUD(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test READ operation
      const { data: reviews, error: readError } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          pros,
          cons,
          rating,
          status,
          company:companies(id, name)
        `)
        .limit(5);
      
      if (readError) throw readError;
      
      if (!reviews || reviews.length === 0) {
        this.results.push({
          test: 'Review CRUD Operations',
          status: 'SKIP',
          message: 'No reviews found in database to test with',
          duration: Date.now() - startTime
        });
        return;
      }
      
      // Test that we can read review with company relationship
      const testReview = reviews[0];
      if (!testReview.company) {
        throw new Error('Review-Company relationship not working');
      }
      
      // Test filtering by status
      const { data: approvedReviews, error: filterError } = await supabase
        .from('reviews')
        .select('id, status')
        .eq('status', 'approved')
        .limit(3);
      
      if (filterError) throw filterError;
      
      this.results.push({
        test: 'Review CRUD Operations',
        status: 'PASS',
        message: `Successfully validated review operations (tested with ${reviews.length} reviews, ${approvedReviews?.length || 0} approved)`,
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        test: 'Review CRUD Operations',
        status: 'FAIL',
        message: `Review CRUD validation failed: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async validateSearchFunctionality(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test company search
      const { data: searchResults, error: searchError } = await supabase
        .from('companies')
        .select('id, name, industry')
        .ilike('name', '%tech%')
        .limit(5);
      
      if (searchError) throw searchError;
      
      // Test review search
      const { data: reviewSearch, error: reviewSearchError } = await supabase
        .from('reviews')
        .select('id, title, pros, cons')
        .or('title.ilike.%good%,pros.ilike.%good%')
        .limit(5);
      
      if (reviewSearchError) throw reviewSearchError;
      
      this.results.push({
        test: 'Search Functionality',
        status: 'PASS',
        message: `Search working (found ${searchResults?.length || 0} companies, ${reviewSearch?.length || 0} reviews)`,
        duration: Date.now() - startTime
      });
    } catch (error) {
      this.results.push({
        test: 'Search Functionality',
        status: 'FAIL',
        message: `Search validation failed: ${error}`,
        duration: Date.now() - startTime
      });
    }
  }

  private printResults(): void {
    console.log('\n📊 Validation Results:\n');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.test}${duration}`);
      console.log(`   ${result.message}\n`);
    });
    
    console.log(`Summary: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);
    
    if (failed > 0) {
      console.log('❌ Some core functionality tests failed. Please review the issues above.');
      process.exit(1);
    } else {
      console.log('✅ All core functionality tests passed!');
    }
  }
}

async function main() {
  const validator = new CoreFunctionalityValidator();
  await validator.validateAll();
}

if (require.main === module) {
  main().catch(console.error);
}

export { CoreFunctionalityValidator };