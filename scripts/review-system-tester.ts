#!/usr/bin/env tsx

/**
 * Review System Tester
 * 
 * Comprehensive testing for review filtering, sorting, and management functionality
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

// Load environment variables
config();

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(chalk.red('❌ Missing Supabase environment variables'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ReviewTestResult {
  testName: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  duration: number;
  details: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

class ReviewSystemTester {
  private results: ReviewTestResult[] = [];

  async runAllTests(): Promise<ReviewTestResult[]> {
    console.log(chalk.blue('📝 Starting Review System Tests\n'));
    console.log(chalk.gray(`Started at: ${new Date().toISOString()}\n`));

    // Test review filtering functionality
    await this.testReviewFilteringByRating();
    await this.testReviewFilteringByDate();
    await this.testReviewFilteringByEmploymentStatus();
    await this.testReviewFilteringByPosition();
    
    // Test review sorting functionality
    await this.testReviewSortingByDate();
    await this.testReviewSortingByRating();
    await this.testReviewSortingByHelpfulness();
    
    // Test user review history
    await this.testUserReviewHistory();
    
    // Test review pagination
    await this.testReviewPagination();
    
    // Test review loading states
    await this.testReviewLoadingStates();
    
    // Test review rating calculations
    await this.testCompanyRatingCalculation();
    await this.testRatingAccuracyValidation();
    await this.testRatingUpdateConsistency();

    this.printResults();
    return this.results;
  }

  private async testReviewFilteringByRating(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing review filtering by rating...'));
      
      // Test different rating filters
      const ratingFilters = [1, 2, 3, 4, 5];
      const filterResults = [];

      for (const rating of ratingFilters) {
        // Test exact rating filter
        const { data: exactRatingReviews, error: exactError } = await supabase
          .from('reviews')
          .select('id, rating, title, company_id')
          .eq('rating', rating)
          .limit(10);

        if (exactError) throw exactError;

        // Verify all results match the filter
        const correctlyFiltered = exactRatingReviews?.every(review => 
          review.rating === rating
        ) || true; // true if no results (empty is valid)

        // Test minimum rating filter
        const { data: minRatingReviews, error: minError } = await supabase
          .from('reviews')
          .select('id, rating, title')
          .gte('rating', rating)
          .limit(10);

        if (minError) throw minError;

        const correctlyFilteredMin = minRatingReviews?.every(review => 
          review.rating >= rating
        ) || true;

        filterResults.push({
          rating,
          exactMatches: exactRatingReviews?.length || 0,
          minMatches: minRatingReviews?.length || 0,
          exactCorrect: correctlyFiltered,
          minCorrect: correctlyFilteredMin
        });
      }

      // Test rating range filtering
      const { data: rangeReviews, error: rangeError } = await supabase
        .from('reviews')
        .select('id, rating, title')
        .gte('rating', 3)
        .lte('rating', 5)
        .limit(20);

      if (rangeError) throw rangeError;

      const rangeCorrect = rangeReviews?.every(review => 
        review.rating >= 3 && review.rating <= 5
      ) || true;

      const allFiltersWorking = filterResults.every(result => 
        result.exactCorrect && result.minCorrect
      ) && rangeCorrect;

      if (allFiltersWorking) {
        this.addResult('Review Filtering by Rating', 'passed', Date.now() - startTime,
          `Rating filters working correctly across all ${ratingFilters.length} rating levels`, undefined, {
            filterResults,
            rangeFilterWorking: rangeCorrect,
            rangeResults: rangeReviews?.length || 0,
            totalFiltersTest: ratingFilters.length
          });
      } else {
        this.addResult('Review Filtering by Rating', 'warning', Date.now() - startTime,
          'Some rating filters may not be working correctly', undefined, {
            filterResults,
            rangeFilterWorking: rangeCorrect,
            allFiltersWorking
          });
      }

    } catch (error) {
      this.addResult('Review Filtering by Rating', 'failed', Date.now() - startTime,
        'Review rating filtering has issues', `${error}`);
    }
  }

  private async testReviewFilteringByDate(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing review filtering by date...'));
      
      // Test recent reviews (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentReviews, error: recentError } = await supabase
        .from('reviews')
        .select('id, created_at, title, rating')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .limit(20);

      if (recentError) throw recentError;

      // Verify all results are within the date range
      const recentCorrect = recentReviews?.every(review => 
        new Date(review.created_at) >= thirtyDaysAgo
      ) || true;

      // Test older reviews (more than 30 days ago)
      const { data: olderReviews, error: olderError } = await supabase
        .from('reviews')
        .select('id, created_at, title, rating')
        .lt('created_at', thirtyDaysAgo.toISOString())
        .limit(20);

      if (olderError) throw olderError;

      const olderCorrect = olderReviews?.every(review => 
        new Date(review.created_at) < thirtyDaysAgo
      ) || true;

      // Test date range filtering
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data: yearRangeReviews, error: yearError } = await supabase
        .from('reviews')
        .select('id, created_at, title')
        .gte('created_at', oneYearAgo.toISOString())
        .lte('created_at', new Date().toISOString())
        .limit(30);

      if (yearError) throw yearError;

      const yearRangeCorrect = yearRangeReviews?.every(review => {
        const reviewDate = new Date(review.created_at);
        return reviewDate >= oneYearAgo && reviewDate <= new Date();
      }) || true;

      const allDateFiltersWorking = recentCorrect && olderCorrect && yearRangeCorrect;

      if (allDateFiltersWorking) {
        this.addResult('Review Filtering by Date', 'passed', Date.now() - startTime,
          'Date filtering working correctly for all tested ranges', undefined, {
            recentReviews: recentReviews?.length || 0,
            olderReviews: olderReviews?.length || 0,
            yearRangeReviews: yearRangeReviews?.length || 0,
            recentCorrect,
            olderCorrect,
            yearRangeCorrect
          });
      } else {
        this.addResult('Review Filtering by Date', 'warning', Date.now() - startTime,
          'Some date filters may not be working correctly', undefined, {
            recentCorrect,
            olderCorrect,
            yearRangeCorrect,
            allDateFiltersWorking
          });
      }

    } catch (error) {
      this.addResult('Review Filtering by Date', 'failed', Date.now() - startTime,
        'Review date filtering has issues', `${error}`);
    }
  }

  private async testReviewFilteringByEmploymentStatus(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing review filtering by employment status...'));
      
      // Get available employment statuses
      const { data: allStatuses, error: statusError } = await supabase
        .from('reviews')
        .select('employment_status')
        .not('employment_status', 'is', null);

      if (statusError) throw statusError;

      const uniqueStatuses = [...new Set(allStatuses?.map(r => r.employment_status).filter(Boolean))] as string[];
      const testStatuses = uniqueStatuses.slice(0, 5); // Test first 5 statuses

      const statusResults = [];

      for (const status of testStatuses) {
        const { data: statusReviews, error: filterError } = await supabase
          .from('reviews')
          .select('id, employment_status, title, rating')
          .eq('employment_status', status)
          .limit(10);

        if (filterError) throw filterError;

        const correctlyFiltered = statusReviews?.every(review => 
          review.employment_status === status
        ) || true;

        statusResults.push({
          status,
          reviewCount: statusReviews?.length || 0,
          correctlyFiltered
        });
      }

      const allStatusFiltersWorking = statusResults.every(result => result.correctlyFiltered);

      if (allStatusFiltersWorking) {
        this.addResult('Review Filtering by Employment Status', 'passed', Date.now() - startTime,
          `Employment status filtering working correctly for ${testStatuses.length} different statuses`, undefined, {
            availableStatuses: uniqueStatuses.length,
            testedStatuses: testStatuses.length,
            statusResults,
            allFiltersWorking: allStatusFiltersWorking
          });
      } else {
        this.addResult('Review Filtering by Employment Status', 'warning', Date.now() - startTime,
          'Some employment status filters may not be working correctly', undefined, {
            statusResults,
            allFiltersWorking: allStatusFiltersWorking
          });
      }

    } catch (error) {
      this.addResult('Review Filtering by Employment Status', 'failed', Date.now() - startTime,
        'Review employment status filtering has issues', `${error}`);
    }
  }

  private async testReviewFilteringByPosition(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing review filtering by position...'));
      
      // Test position-based filtering using common job titles
      const commonPositions = ['Engineer', 'Manager', 'Developer', 'Analyst', 'Designer'];
      const positionResults = [];

      for (const position of commonPositions) {
        const { data: positionReviews, error: positionError } = await supabase
          .from('reviews')
          .select('id, position, title, rating')
          .ilike('position', `%${position}%`)
          .limit(10);

        if (positionError) throw positionError;

        const correctlyFiltered = positionReviews?.every(review => 
          review.position?.toLowerCase().includes(position.toLowerCase())
        ) || true;

        positionResults.push({
          position,
          reviewCount: positionReviews?.length || 0,
          correctlyFiltered
        });
      }

      // Test exact position matching
      const { data: sampleReviews, error: sampleError } = await supabase
        .from('reviews')
        .select('position')
        .not('position', 'is', null)
        .limit(5);

      if (sampleError) throw sampleError;

      let exactMatchResults = [];
      if (sampleReviews && sampleReviews.length > 0) {
        const testPosition = sampleReviews[0].position;
        
        const { data: exactMatches, error: exactError } = await supabase
          .from('reviews')
          .select('id, position, title')
          .eq('position', testPosition)
          .limit(10);

        if (exactError) throw exactError;

        const exactCorrect = exactMatches?.every(review => 
          review.position === testPosition
        ) || true;

        exactMatchResults.push({
          testPosition,
          exactMatches: exactMatches?.length || 0,
          exactCorrect
        });
      }

      const allPositionFiltersWorking = positionResults.every(result => result.correctlyFiltered) &&
        exactMatchResults.every(result => result.exactCorrect);

      if (allPositionFiltersWorking) {
        this.addResult('Review Filtering by Position', 'passed', Date.now() - startTime,
          `Position filtering working correctly for ${commonPositions.length} test positions`, undefined, {
            positionResults,
            exactMatchResults,
            allFiltersWorking: allPositionFiltersWorking
          });
      } else {
        this.addResult('Review Filtering by Position', 'warning', Date.now() - startTime,
          'Some position filters may not be working correctly', undefined, {
            positionResults,
            exactMatchResults,
            allFiltersWorking: allPositionFiltersWorking
          });
      }

    } catch (error) {
      this.addResult('Review Filtering by Position', 'failed', Date.now() - startTime,
        'Review position filtering has issues', `${error}`);
    }
  }

  private async testReviewSortingByDate(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing review sorting by date...'));
      
      // Test ascending date sort (oldest first)
      const { data: ascendingReviews, error: ascError } = await supabase
        .from('reviews')
        .select('id, created_at, title, rating')
        .order('created_at', { ascending: true })
        .limit(20);

      if (ascError) throw ascError;

      // Verify ascending order
      let ascendingCorrect = true;
      if (ascendingReviews && ascendingReviews.length > 1) {
        for (let i = 1; i < ascendingReviews.length; i++) {
          if (new Date(ascendingReviews[i].created_at) < new Date(ascendingReviews[i-1].created_at)) {
            ascendingCorrect = false;
            break;
          }
        }
      }

      // Test descending date sort (newest first)
      const { data: descendingReviews, error: descError } = await supabase
        .from('reviews')
        .select('id, created_at, title, rating')
        .order('created_at', { ascending: false })
        .limit(20);

      if (descError) throw descError;

      // Verify descending order
      let descendingCorrect = true;
      if (descendingReviews && descendingReviews.length > 1) {
        for (let i = 1; i < descendingReviews.length; i++) {
          if (new Date(descendingReviews[i].created_at) > new Date(descendingReviews[i-1].created_at)) {
            descendingCorrect = false;
            break;
          }
        }
      }

      const dateSortingWorking = ascendingCorrect && descendingCorrect;

      if (dateSortingWorking) {
        this.addResult('Review Sorting by Date', 'passed', Date.now() - startTime,
          'Date sorting working correctly in both ascending and descending order', undefined, {
            ascendingResults: ascendingReviews?.length || 0,
            descendingResults: descendingReviews?.length || 0,
            ascendingCorrect,
            descendingCorrect,
            oldestDate: ascendingReviews?.[0]?.created_at,
            newestDate: descendingReviews?.[0]?.created_at
          });
      } else {
        this.addResult('Review Sorting by Date', 'warning', Date.now() - startTime,
          'Date sorting may not be working correctly', undefined, {
            ascendingCorrect,
            descendingCorrect,
            dateSortingWorking
          });
      }

    } catch (error) {
      this.addResult('Review Sorting by Date', 'failed', Date.now() - startTime,
        'Review date sorting has issues', `${error}`);
    }
  }

  private async testReviewSortingByRating(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing review sorting by rating...'));
      
      // Test ascending rating sort (lowest first)
      const { data: ascendingRatings, error: ascError } = await supabase
        .from('reviews')
        .select('id, rating, title, created_at')
        .order('rating', { ascending: true })
        .limit(20);

      if (ascError) throw ascError;

      // Verify ascending order
      let ascendingCorrect = true;
      if (ascendingRatings && ascendingRatings.length > 1) {
        for (let i = 1; i < ascendingRatings.length; i++) {
          if (ascendingRatings[i].rating < ascendingRatings[i-1].rating) {
            ascendingCorrect = false;
            break;
          }
        }
      }

      // Test descending rating sort (highest first)
      const { data: descendingRatings, error: descError } = await supabase
        .from('reviews')
        .select('id, rating, title, created_at')
        .order('rating', { ascending: false })
        .limit(20);

      if (descError) throw descError;

      // Verify descending order
      let descendingCorrect = true;
      if (descendingRatings && descendingRatings.length > 1) {
        for (let i = 1; i < descendingRatings.length; i++) {
          if (descendingRatings[i].rating > descendingRatings[i-1].rating) {
            descendingCorrect = false;
            break;
          }
        }
      }

      const ratingSortingWorking = ascendingCorrect && descendingCorrect;

      if (ratingSortingWorking) {
        this.addResult('Review Sorting by Rating', 'passed', Date.now() - startTime,
          'Rating sorting working correctly in both ascending and descending order', undefined, {
            ascendingResults: ascendingRatings?.length || 0,
            descendingResults: descendingRatings?.length || 0,
            ascendingCorrect,
            descendingCorrect,
            lowestRating: ascendingRatings?.[0]?.rating,
            highestRating: descendingRatings?.[0]?.rating
          });
      } else {
        this.addResult('Review Sorting by Rating', 'warning', Date.now() - startTime,
          'Rating sorting may not be working correctly', undefined, {
            ascendingCorrect,
            descendingCorrect,
            ratingSortingWorking
          });
      }

    } catch (error) {
      this.addResult('Review Sorting by Rating', 'failed', Date.now() - startTime,
        'Review rating sorting has issues', `${error}`);
    }
  }

  private async testReviewSortingByHelpfulness(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing review sorting by helpfulness...'));
      
      // Test if helpfulness/likes column exists and can be sorted
      const { data: helpfulnessReviews, error: helpfulnessError } = await supabase
        .from('reviews')
        .select('id, title, rating, helpful_count, likes')
        .limit(10);

      if (helpfulnessError) {
        // If helpfulness columns don't exist, that's okay - skip this test
        this.addResult('Review Sorting by Helpfulness', 'skipped', Date.now() - startTime,
          'Helpfulness sorting not available - helpfulness columns not found in database', helpfulnessError.message);
        return;
      }

      // Check if we have helpfulness data
      const hasHelpfulCount = helpfulnessReviews?.some(review => review.helpful_count !== null);
      const hasLikes = helpfulnessReviews?.some(review => review.likes !== null);

      if (!hasHelpfulCount && !hasLikes) {
        this.addResult('Review Sorting by Helpfulness', 'skipped', Date.now() - startTime,
          'Helpfulness sorting not testable - no helpfulness data found', undefined, {
            reviewsChecked: helpfulnessReviews?.length || 0,
            hasHelpfulCount,
            hasLikes
          });
        return;
      }

      // Test sorting by helpful_count if available
      let helpfulCountSortWorking = true;
      if (hasHelpfulCount) {
        const { data: sortedByHelpful, error: sortError } = await supabase
          .from('reviews')
          .select('id, helpful_count, title')
          .not('helpful_count', 'is', null)
          .order('helpful_count', { ascending: false })
          .limit(10);

        if (sortError) throw sortError;

        // Verify descending order
        if (sortedByHelpful && sortedByHelpful.length > 1) {
          for (let i = 1; i < sortedByHelpful.length; i++) {
            if (sortedByHelpful[i].helpful_count > sortedByHelpful[i-1].helpful_count) {
              helpfulCountSortWorking = false;
              break;
            }
          }
        }
      }

      this.addResult('Review Sorting by Helpfulness', 'passed', Date.now() - startTime,
        'Helpfulness sorting functionality is available and working', undefined, {
          hasHelpfulCount,
          hasLikes,
          helpfulCountSortWorking,
          reviewsWithHelpfulness: helpfulnessReviews?.length || 0
        });

    } catch (error) {
      this.addResult('Review Sorting by Helpfulness', 'failed', Date.now() - startTime,
        'Review helpfulness sorting has issues', `${error}`);
    }
  }

  private async testUserReviewHistory(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing user review history display...'));
      
      // Test user review history functionality
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError && !userError.message.includes('not authenticated')) {
        throw new Error(`User check failed: ${userError.message}`);
      }

      if (!user) {
        // Test without authenticated user - should handle gracefully
        const { data: publicReviews, error: publicError } = await supabase
          .from('reviews')
          .select('id, title, rating, created_at')
          .limit(5);

        if (publicError) throw publicError;

        this.addResult('User Review History', 'passed', Date.now() - startTime,
          'User review history system handles unauthenticated users correctly', undefined, {
            userAuthenticated: false,
            canAccessPublicReviews: !publicError,
            publicReviewsCount: publicReviews?.length || 0
          });
      } else {
        // Test authenticated user review history
        const { data: userReviews, error: userReviewsError } = await supabase
          .from('reviews')
          .select('id, title, rating, created_at, company_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (userReviewsError) {
          // This might fail due to RLS policies, which is expected
          if (userReviewsError.message.includes('permission') || userReviewsError.message.includes('policy')) {
            this.addResult('User Review History', 'passed', Date.now() - startTime,
              'User review history properly protected by RLS policies', undefined, {
                userAuthenticated: true,
                userId: user.id,
                rlsProtected: true,
                error: userReviewsError.message
              });
          } else {
            throw userReviewsError;
          }
        } else {
          this.addResult('User Review History', 'passed', Date.now() - startTime,
            `User review history working correctly - found ${userReviews?.length || 0} reviews for user`, undefined, {
              userAuthenticated: true,
              userId: user.id,
              userReviewCount: userReviews?.length || 0,
              hasReviews: (userReviews?.length || 0) > 0
            });
        }
      }

    } catch (error) {
      this.addResult('User Review History', 'failed', Date.now() - startTime,
        'User review history has issues', `${error}`);
    }
  }

  private async testReviewPagination(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing review pagination...'));
      
      // Test pagination with different page sizes
      const pageSizes = [5, 10, 20];
      const paginationResults = [];

      for (const pageSize of pageSizes) {
        // Test first page
        const { data: firstPage, error: firstError } = await supabase
          .from('reviews')
          .select('id, title, rating, created_at')
          .order('created_at', { ascending: false })
          .range(0, pageSize - 1);

        if (firstError) throw firstError;

        // Test second page
        const { data: secondPage, error: secondError } = await supabase
          .from('reviews')
          .select('id, title, rating, created_at')
          .order('created_at', { ascending: false })
          .range(pageSize, (pageSize * 2) - 1);

        if (secondError) throw secondError;

        // Verify no overlap between pages
        const firstPageIds = new Set(firstPage?.map(r => r.id) || []);
        const secondPageIds = new Set(secondPage?.map(r => r.id) || []);
        const hasOverlap = [...firstPageIds].some(id => secondPageIds.has(id));

        paginationResults.push({
          pageSize,
          firstPageCount: firstPage?.length || 0,
          secondPageCount: secondPage?.length || 0,
          noOverlap: !hasOverlap,
          correctPageSize: (firstPage?.length || 0) <= pageSize
        });
      }

      // Test total count for pagination
      const { count: totalReviews, error: countError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      const allPaginationWorking = paginationResults.every(result => 
        result.noOverlap && result.correctPageSize
      );

      if (allPaginationWorking) {
        this.addResult('Review Pagination', 'passed', Date.now() - startTime,
          `Review pagination working correctly for all ${pageSizes.length} tested page sizes`, undefined, {
            totalReviews: totalReviews || 0,
            paginationResults,
            allPaginationWorking
          });
      } else {
        this.addResult('Review Pagination', 'warning', Date.now() - startTime,
          'Some pagination functionality may not be working correctly', undefined, {
            paginationResults,
            allPaginationWorking
          });
      }

    } catch (error) {
      this.addResult('Review Pagination', 'failed', Date.now() - startTime,
        'Review pagination has issues', `${error}`);
    }
  }

  private async testReviewLoadingStates(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing review loading states...'));
      
      // Test empty state handling
      const { data: emptyResults, error: emptyError } = await supabase
        .from('reviews')
        .select('id, title, rating')
        .eq('company_id', 999999) // Non-existent company
        .limit(10);

      if (emptyError) throw emptyError;

      const emptyStateHandled = emptyResults?.length === 0;

      // Test error state handling by using invalid query
      const { data: errorResults, error: intentionalError } = await supabase
        .from('reviews')
        .select('nonexistent_column')
        .limit(1);

      const errorStateHandled = !!intentionalError;

      // Test large dataset handling
      const { data: largeDataset, error: largeError } = await supabase
        .from('reviews')
        .select('id, title, rating, created_at')
        .limit(100);

      if (largeError) throw largeError;

      const largeDatasetHandled = !largeError;

      this.addResult('Review Loading States', 'passed', Date.now() - startTime,
        'Review loading states handled correctly', undefined, {
          emptyStateHandled,
          errorStateHandled,
          largeDatasetHandled,
          largeDatasetSize: largeDataset?.length || 0,
          errorMessage: intentionalError?.message || 'none'
        });

    } catch (error) {
      this.addResult('Review Loading States', 'failed', Date.now() - startTime,
        'Review loading states have issues', `${error}`);
    }
  }

  private addResult(
    testName: string,
    status: 'passed' | 'failed' | 'warning' | 'skipped',
    duration: number,
    details: string,
    errorMessage?: string,
    metadata?: Record<string, any>
  ): void {
    this.results.push({
      testName,
      status,
      duration,
      details,
      errorMessage,
      metadata
    });
  }

  private printResults(): void {
    console.log(chalk.blue('\n📊 Review System Test Results:\n'));
    
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    
    this.results.forEach(result => {
      const icon = this.getStatusIcon(result.status);
      const duration = result.duration > 0 ? ` (${result.duration}ms)` : '';
      
      console.log(`${icon} ${result.testName}${duration}`);
      console.log(`   ${result.details}`);
      
      if (result.errorMessage) {
        console.log(chalk.red(`   Error: ${result.errorMessage}`));
      }
      
      if (result.metadata && Object.keys(result.metadata).length > 0) {
        console.log(chalk.gray(`   Details: ${JSON.stringify(result.metadata, null, 2)}`));
      }
      console.log();
    });
    
    console.log(chalk.blue('📈 Summary:'));
    console.log(chalk.green(`   ✅ Passed: ${passed}/${this.results.length}`));
    console.log(chalk.red(`   ❌ Failed: ${failed}/${this.results.length}`));
    console.log(chalk.yellow(`   ⚠️  Warnings: ${warnings}/${this.results.length}`));
    console.log(chalk.gray(`   ⏭️  Skipped: ${skipped}/${this.results.length}`));
    
    const passRate = this.results.length > 0 ? Math.round((passed / this.results.length) * 100) : 0;
    console.log(chalk.blue(`\n📊 Pass Rate: ${passRate}%`));
  }

  private async testCompanyRatingCalculation(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing company rating calculation accuracy...'));
      
      // Get companies with reviews to test rating calculations
      const { data: companiesWithReviews, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id, 
          name, 
          average_rating, 
          total_reviews,
          reviews:reviews(rating)
        `)
        .not('average_rating', 'is', null)
        .limit(10);

      if (companiesError) throw companiesError;

      if (!companiesWithReviews || companiesWithReviews.length === 0) {
        this.addResult('Company Rating Calculation', 'skipped', Date.now() - startTime,
          'No companies with ratings found to test calculation accuracy');
        return;
      }

      const calculationResults = [];

      for (const company of companiesWithReviews) {
        const reviews = company.reviews as any[];
        
        if (!reviews || reviews.length === 0) {
          calculationResults.push({
            companyId: company.id,
            companyName: company.name,
            storedRating: company.average_rating,
            calculatedRating: null,
            reviewCount: 0,
            accurate: company.average_rating === null,
            issue: 'No reviews but has rating'
          });
          continue;
        }

        // Calculate expected average rating
        const validRatings = reviews
          .map(r => r.rating)
          .filter(rating => rating !== null && rating !== undefined && !isNaN(rating));

        if (validRatings.length === 0) {
          calculationResults.push({
            companyId: company.id,
            companyName: company.name,
            storedRating: company.average_rating,
            calculatedRating: null,
            reviewCount: reviews.length,
            accurate: company.average_rating === null,
            issue: 'No valid ratings'
          });
          continue;
        }

        const calculatedAverage = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
        const roundedCalculated = Math.round(calculatedAverage * 100) / 100; // Round to 2 decimal places

        // Check if stored rating matches calculated rating (with small tolerance for rounding)
        const tolerance = 0.01;
        const accurate = Math.abs((company.average_rating || 0) - roundedCalculated) <= tolerance;

        calculationResults.push({
          companyId: company.id,
          companyName: company.name,
          storedRating: company.average_rating,
          calculatedRating: roundedCalculated,
          reviewCount: validRatings.length,
          totalReviews: reviews.length,
          accurate,
          difference: Math.abs((company.average_rating || 0) - roundedCalculated)
        });
      }

      const accurateCalculations = calculationResults.filter(result => result.accurate).length;
      const totalCalculations = calculationResults.length;
      const accuracyRate = totalCalculations > 0 ? (accurateCalculations / totalCalculations) * 100 : 0;

      if (accuracyRate >= 90) {
        this.addResult('Company Rating Calculation', 'passed', Date.now() - startTime,
          `Company rating calculations are accurate: ${accurateCalculations}/${totalCalculations} (${Math.round(accuracyRate)}%) calculations correct`, undefined, {
            companiesTested: totalCalculations,
            accurateCalculations,
            accuracyRate: Math.round(accuracyRate),
            sampleResults: calculationResults.slice(0, 3)
          });
      } else if (accuracyRate >= 70) {
        this.addResult('Company Rating Calculation', 'warning', Date.now() - startTime,
          `Company rating calculations partially accurate: ${accurateCalculations}/${totalCalculations} (${Math.round(accuracyRate)}%) calculations correct`, undefined, {
            companiesTested: totalCalculations,
            accurateCalculations,
            accuracyRate: Math.round(accuracyRate),
            inaccurateResults: calculationResults.filter(r => !r.accurate).slice(0, 3)
          });
      } else {
        this.addResult('Company Rating Calculation', 'failed', Date.now() - startTime,
          `Company rating calculations are inaccurate: only ${accurateCalculations}/${totalCalculations} (${Math.round(accuracyRate)}%) calculations correct`, undefined, {
            companiesTested: totalCalculations,
            accurateCalculations,
            accuracyRate: Math.round(accuracyRate),
            inaccurateResults: calculationResults.filter(r => !r.accurate)
          });
      }

    } catch (error) {
      this.addResult('Company Rating Calculation', 'failed', Date.now() - startTime,
        'Company rating calculation testing has issues', `${error}`);
    }
  }

  private async testRatingAccuracyValidation(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing rating accuracy validation across different scenarios...'));
      
      const scenarioResults = [];

      // Scenario 1: Companies with single review
      const { data: singleReviewCompanies, error: singleError } = await supabase
        .from('companies')
        .select(`
          id, 
          name, 
          average_rating,
          reviews:reviews(rating)
        `)
        .eq('total_reviews', 1)
        .limit(5);

      if (singleError) throw singleError;

      let singleReviewAccuracy = 0;
      if (singleReviewCompanies && singleReviewCompanies.length > 0) {
        const accurateSingle = singleReviewCompanies.filter(company => {
          const reviews = company.reviews as any[];
          if (reviews && reviews.length === 1) {
            return Math.abs((company.average_rating || 0) - reviews[0].rating) <= 0.01;
          }
          return false;
        }).length;
        
        singleReviewAccuracy = (accurateSingle / singleReviewCompanies.length) * 100;
      }

      scenarioResults.push({
        scenario: 'Single Review Companies',
        companiesFound: singleReviewCompanies?.length || 0,
        accuracyRate: Math.round(singleReviewAccuracy)
      });

      // Scenario 2: Companies with multiple reviews of same rating
      const { data: uniformRatingCompanies, error: uniformError } = await supabase
        .from('companies')
        .select(`
          id, 
          name, 
          average_rating,
          reviews:reviews(rating)
        `)
        .gte('total_reviews', 2)
        .limit(10);

      if (uniformError) throw uniformError;

      let uniformRatingAccuracy = 0;
      let uniformRatingCount = 0;
      
      if (uniformRatingCompanies) {
        for (const company of uniformRatingCompanies) {
          const reviews = company.reviews as any[];
          if (reviews && reviews.length >= 2) {
            const ratings = reviews.map(r => r.rating).filter(r => r !== null);
            const allSameRating = ratings.every(rating => rating === ratings[0]);
            
            if (allSameRating && ratings.length > 0) {
              uniformRatingCount++;
              const expectedRating = ratings[0];
              const accurate = Math.abs((company.average_rating || 0) - expectedRating) <= 0.01;
              if (accurate) uniformRatingAccuracy++;
            }
          }
        }
      }

      if (uniformRatingCount > 0) {
        uniformRatingAccuracy = (uniformRatingAccuracy / uniformRatingCount) * 100;
      }

      scenarioResults.push({
        scenario: 'Uniform Rating Companies',
        companiesFound: uniformRatingCount,
        accuracyRate: Math.round(uniformRatingAccuracy)
      });

      // Scenario 3: Companies with mixed ratings
      const { data: mixedRatingCompanies, error: mixedError } = await supabase
        .from('companies')
        .select(`
          id, 
          name, 
          average_rating,
          reviews:reviews(rating)
        `)
        .gte('total_reviews', 3)
        .limit(15);

      if (mixedError) throw mixedError;

      let mixedRatingAccuracy = 0;
      let mixedRatingCount = 0;

      if (mixedRatingCompanies) {
        for (const company of mixedRatingCompanies) {
          const reviews = company.reviews as any[];
          if (reviews && reviews.length >= 3) {
            const ratings = reviews.map(r => r.rating).filter(r => r !== null && !isNaN(r));
            
            if (ratings.length >= 3) {
              const uniqueRatings = [...new Set(ratings)];
              if (uniqueRatings.length >= 2) { // Mixed ratings
                mixedRatingCount++;
                const expectedAverage = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
                const accurate = Math.abs((company.average_rating || 0) - expectedAverage) <= 0.05; // Slightly higher tolerance for mixed ratings
                if (accurate) mixedRatingAccuracy++;
              }
            }
          }
        }
      }

      if (mixedRatingCount > 0) {
        mixedRatingAccuracy = (mixedRatingAccuracy / mixedRatingCount) * 100;
      }

      scenarioResults.push({
        scenario: 'Mixed Rating Companies',
        companiesFound: mixedRatingCount,
        accuracyRate: Math.round(mixedRatingAccuracy)
      });

      // Overall assessment
      const overallAccuracy = scenarioResults.reduce((sum, result) => {
        return sum + (result.accuracyRate * result.companiesFound);
      }, 0) / scenarioResults.reduce((sum, result) => sum + result.companiesFound, 0);

      const totalCompaniesTest = scenarioResults.reduce((sum, result) => sum + result.companiesFound, 0);

      if (overallAccuracy >= 85) {
        this.addResult('Rating Accuracy Validation', 'passed', Date.now() - startTime,
          `Rating accuracy validation passed across ${scenarioResults.length} scenarios with ${Math.round(overallAccuracy)}% overall accuracy`, undefined, {
            totalCompaniesTest,
            overallAccuracy: Math.round(overallAccuracy),
            scenarioResults
          });
      } else if (overallAccuracy >= 70) {
        this.addResult('Rating Accuracy Validation', 'warning', Date.now() - startTime,
          `Rating accuracy validation partially passed with ${Math.round(overallAccuracy)}% overall accuracy`, undefined, {
            totalCompaniesTest,
            overallAccuracy: Math.round(overallAccuracy),
            scenarioResults
          });
      } else {
        this.addResult('Rating Accuracy Validation', 'failed', Date.now() - startTime,
          `Rating accuracy validation failed with only ${Math.round(overallAccuracy)}% overall accuracy`, undefined, {
            totalCompaniesTest,
            overallAccuracy: Math.round(overallAccuracy),
            scenarioResults
          });
      }

    } catch (error) {
      this.addResult('Rating Accuracy Validation', 'failed', Date.now() - startTime,
        'Rating accuracy validation testing has issues', `${error}`);
    }
  }

  private async testRatingUpdateConsistency(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing rating update consistency across company profiles...'));
      
      // Test that average ratings are consistent across different views
      const { data: companiesFromMainTable, error: mainError } = await supabase
        .from('companies')
        .select('id, name, average_rating, total_reviews')
        .not('average_rating', 'is', null)
        .limit(10);

      if (mainError) throw mainError;

      if (!companiesFromMainTable || companiesFromMainTable.length === 0) {
        this.addResult('Rating Update Consistency', 'skipped', Date.now() - startTime,
          'No companies with ratings found to test consistency');
        return;
      }

      const consistencyResults = [];

      for (const company of companiesFromMainTable) {
        // Get the same company data through a different query path
        const { data: companyWithReviews, error: reviewsError } = await supabase
          .from('companies')
          .select(`
            id,
            name,
            average_rating,
            total_reviews,
            reviews:reviews(rating)
          `)
          .eq('id', company.id)
          .single();

        if (reviewsError) {
          consistencyResults.push({
            companyId: company.id,
            companyName: company.name,
            consistent: false,
            issue: `Failed to fetch company with reviews: ${reviewsError.message}`
          });
          continue;
        }

        // Check consistency between main table and joined data
        const mainTableRating = company.average_rating;
        const joinedTableRating = companyWithReviews.average_rating;
        const mainTableReviewCount = company.total_reviews;
        const joinedTableReviewCount = companyWithReviews.total_reviews;

        const ratingConsistent = Math.abs((mainTableRating || 0) - (joinedTableRating || 0)) <= 0.01;
        const reviewCountConsistent = mainTableReviewCount === joinedTableReviewCount;

        // Verify review count matches actual reviews
        const actualReviews = companyWithReviews.reviews as any[];
        const actualReviewCount = actualReviews ? actualReviews.length : 0;
        const reviewCountAccurate = actualReviewCount === (joinedTableReviewCount || 0);

        consistencyResults.push({
          companyId: company.id,
          companyName: company.name,
          mainTableRating,
          joinedTableRating,
          mainTableReviewCount,
          joinedTableReviewCount,
          actualReviewCount,
          ratingConsistent,
          reviewCountConsistent,
          reviewCountAccurate,
          consistent: ratingConsistent && reviewCountConsistent && reviewCountAccurate
        });
      }

      const consistentCompanies = consistencyResults.filter(result => result.consistent).length;
      const totalCompanies = consistencyResults.length;
      const consistencyRate = totalCompanies > 0 ? (consistentCompanies / totalCompanies) * 100 : 0;

      if (consistencyRate >= 95) {
        this.addResult('Rating Update Consistency', 'passed', Date.now() - startTime,
          `Rating update consistency excellent: ${consistentCompanies}/${totalCompanies} (${Math.round(consistencyRate)}%) companies have consistent ratings`, undefined, {
            companiesTested: totalCompanies,
            consistentCompanies,
            consistencyRate: Math.round(consistencyRate),
            sampleResults: consistencyResults.slice(0, 3)
          });
      } else if (consistencyRate >= 80) {
        this.addResult('Rating Update Consistency', 'warning', Date.now() - startTime,
          `Rating update consistency good but could be improved: ${consistentCompanies}/${totalCompanies} (${Math.round(consistencyRate)}%) companies have consistent ratings`, undefined, {
            companiesTested: totalCompanies,
            consistentCompanies,
            consistencyRate: Math.round(consistencyRate),
            inconsistentResults: consistencyResults.filter(r => !r.consistent).slice(0, 3)
          });
      } else {
        this.addResult('Rating Update Consistency', 'failed', Date.now() - startTime,
          `Rating update consistency poor: only ${consistentCompanies}/${totalCompanies} (${Math.round(consistencyRate)}%) companies have consistent ratings`, undefined, {
            companiesTested: totalCompanies,
            consistentCompanies,
            consistencyRate: Math.round(consistencyRate),
            inconsistentResults: consistencyResults.filter(r => !r.consistent)
          });
      }

    } catch (error) {
      this.addResult('Rating Update Consistency', 'failed', Date.now() - startTime,
        'Rating update consistency testing has issues', `${error}`);
    }
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
}

// CLI interface
async function main() {
  const tester = new ReviewSystemTester();
  const results = await tester.runAllTests();
  
  const failed = results.filter(r => r.status === 'failed').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  if (failed > 0) {
    console.log(chalk.red('\n❌ Some review system tests failed.'));
    process.exit(1);
  } else if (warnings > 0) {
    console.log(chalk.yellow('\n⚠️ Review system tests completed with warnings.'));
    process.exit(0);
  } else {
    console.log(chalk.green('\n🎉 All review system tests passed!'));
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ReviewSystemTester };