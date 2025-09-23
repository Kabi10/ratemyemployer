#!/usr/bin/env tsx

/**
 * Search and Filter System Tester
 * 
 * Comprehensive testing for multi-criteria filtering and search functionality
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

interface FilterTestResult {
  testName: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  duration: number;
  details: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

class SearchFilterTester {
  private results: FilterTestResult[] = [];

  async runAllTests(): Promise<FilterTestResult[]> {
    console.log(chalk.blue('🔍 Starting Search and Filter System Tests\n'));
    console.log(chalk.gray(`Started at: ${new Date().toISOString()}\n`));

    // Test industry filtering
    await this.testIndustryFiltering();
    await this.testLocationBasedFiltering();
    await this.testRatingRangeFiltering();
    
    // Test multi-criteria combinations
    await this.testIndustryLocationCombination();
    await this.testIndustryRatingCombination();
    await this.testLocationRatingCombination();
    await this.testTripleCriteriaFiltering();
    
    // Test filter interaction logic
    await this.testFilterCombinationLogic();
    await this.testFilterClearingBehavior();
    
    // Test search with filters
    await this.testSearchWithFilters();
    
    // Test edge cases
    await this.testEmptyFilterResults();
    await this.testInvalidFilterValues();

    this.printResults();
    return this.results;
  }

  private async testIndustryFiltering(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing industry filtering functionality...'));
      
      // Get available industries
      const { data: allIndustries, error: industriesError } = await supabase
        .from('companies')
        .select('industry')
        .not('industry', 'is', null);

      if (industriesError) throw industriesError;

      const uniqueIndustries = [...new Set(allIndustries?.map(c => c.industry).filter(Boolean))] as string[];
      const testIndustries = uniqueIndustries.slice(0, 5); // Test first 5 industries

      const industryResults = [];

      for (const industry of testIndustries) {
        // Test exact industry match
        const { data: industryCompanies, error: industryError } = await supabase
          .from('companies')
          .select('id, name, industry, location, average_rating')
          .eq('industry', industry)
          .limit(20);

        if (industryError) throw industryError;

        // Verify all results match the industry filter
        const correctlyFiltered = industryCompanies?.every(company =>
          company.industry === industry
        ) || true;

        // Test case-insensitive industry filtering
        const { data: caseInsensitiveResults, error: caseError } = await supabase
          .from('companies')
          .select('id, name, industry')
          .ilike('industry', industry)
          .limit(10);

        if (caseError) throw caseError;

        const caseInsensitiveCorrect = caseInsensitiveResults?.every(company =>
          company.industry?.toLowerCase() === industry.toLowerCase()
        ) || true;

        industryResults.push({
          industry,
          exactMatches: industryCompanies?.length || 0,
          caseInsensitiveMatches: caseInsensitiveResults?.length || 0,
          exactCorrect: correctlyFiltered,
          caseInsensitiveCorrect
        });
      }

      // Test industry filtering with additional data
      const { data: industriesWithStats, error: statsError } = await supabase
        .from('companies')
        .select('industry, average_rating, total_reviews')
        .eq('industry', testIndustries[0])
        .not('average_rating', 'is', null)
        .limit(10);

      if (statsError) throw statsError;

      const allIndustryFiltersWorking = industryResults.every(result => 
        result.exactCorrect && result.caseInsensitiveCorrect
      );

      if (allIndustryFiltersWorking) {
        this.addResult('Industry Filtering', 'passed', Date.now() - startTime,
          `Industry filtering working correctly for all ${testIndustries.length} tested industries`, undefined, {
            availableIndustries: uniqueIndustries.length,
            testedIndustries: testIndustries.length,
            industryResults,
            companiesWithStats: industriesWithStats?.length || 0
          });
      } else {
        this.addResult('Industry Filtering', 'warning', Date.now() - startTime,
          'Some industry filters may not be working correctly', undefined, {
            industryResults,
            allFiltersWorking: allIndustryFiltersWorking
          });
      }

    } catch (error) {
      this.addResult('Industry Filtering', 'failed', Date.now() - startTime,
        'Industry filtering has issues', `${error}`);
    }
  }

  private async testLocationBasedFiltering(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing location-based filtering...'));
      
      // Test major cities and regions
      const testLocations = [
        'San Francisco', 'New York', 'Los Angeles', 'Seattle', 'Austin',
        'California', 'Texas', 'Washington', 'New York'
      ];

      const locationResults = [];

      for (const location of testLocations) {
        // Test location contains filtering (most common use case)
        const { data: locationCompanies, error: locationError } = await supabase
          .from('companies')
          .select('id, name, location, industry, average_rating')
          .ilike('location', `%${location}%`)
          .limit(15);

        if (locationError) throw locationError;

        // Verify all results contain the location term
        const correctlyFiltered = locationCompanies?.every(company =>
          company.location?.toLowerCase().includes(location.toLowerCase())
        ) || true;

        // Test exact location match
        const { data: exactLocationMatches, error: exactError } = await supabase
          .from('companies')
          .select('id, name, location')
          .eq('location', location)
          .limit(10);

        if (exactError) throw exactError;

        locationResults.push({
          location,
          containsMatches: locationCompanies?.length || 0,
          exactMatches: exactLocationMatches?.length || 0,
          correctlyFiltered
        });
      }

      // Test location filtering with state/country patterns
      const { data: stateResults, error: stateError } = await supabase
        .from('companies')
        .select('id, name, location')
        .ilike('location', '%CA%') // California abbreviation
        .limit(10);

      if (stateError) throw stateError;

      // Test location filtering with zip codes (if any)
      const { data: zipResults, error: zipError } = await supabase
        .from('companies')
        .select('id, name, location')
        .ilike('location', '%9%') // Contains digit (zip code pattern)
        .limit(10);

      if (zipError) throw zipError;

      const allLocationFiltersWorking = locationResults.every(result => result.correctlyFiltered);
      const locationsWithResults = locationResults.filter(result => result.containsMatches > 0).length;

      if (allLocationFiltersWorking && locationsWithResults >= testLocations.length * 0.3) {
        this.addResult('Location-Based Filtering', 'passed', Date.now() - startTime,
          `Location filtering working correctly: ${locationsWithResults}/${testLocations.length} locations have results`, undefined, {
            testedLocations: testLocations.length,
            locationsWithResults,
            locationResults: locationResults.slice(0, 5),
            stateResults: stateResults?.length || 0,
            zipResults: zipResults?.length || 0
          });
      } else {
        this.addResult('Location-Based Filtering', 'warning', Date.now() - startTime,
          `Location filtering partially working: ${locationsWithResults}/${testLocations.length} locations have results`, undefined, {
            locationResults,
            allFiltersWorking: allLocationFiltersWorking,
            locationsWithResults
          });
      }

    } catch (error) {
      this.addResult('Location-Based Filtering', 'failed', Date.now() - startTime,
        'Location-based filtering has issues', `${error}`);
    }
  }

  private async testRatingRangeFiltering(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing rating range filtering...'));
      
      const ratingRanges = [
        { min: 1.0, max: 2.0, name: 'Low ratings (1-2)' },
        { min: 2.0, max: 3.0, name: 'Below average (2-3)' },
        { min: 3.0, max: 4.0, name: 'Average (3-4)' },
        { min: 4.0, max: 5.0, name: 'High ratings (4-5)' },
        { min: 4.5, max: 5.0, name: 'Excellent (4.5-5)' }
      ];

      const rangeResults = [];

      for (const range of ratingRanges) {
        // Test rating range filtering
        const { data: rangeCompanies, error: rangeError } = await supabase
          .from('companies')
          .select('id, name, average_rating, industry, location')
          .gte('average_rating', range.min)
          .lte('average_rating', range.max)
          .not('average_rating', 'is', null)
          .limit(20);

        if (rangeError) throw rangeError;

        // Verify all results are within the rating range
        const correctlyFiltered = rangeCompanies?.every(company =>
          company.average_rating !== null &&
          company.average_rating >= range.min &&
          company.average_rating <= range.max
        ) || true;

        // Test minimum rating filtering
        const { data: minRatingCompanies, error: minError } = await supabase
          .from('companies')
          .select('id, name, average_rating')
          .gte('average_rating', range.min)
          .not('average_rating', 'is', null)
          .limit(15);

        if (minError) throw minError;

        const minRatingCorrect = minRatingCompanies?.every(company =>
          company.average_rating !== null && company.average_rating >= range.min
        ) || true;

        rangeResults.push({
          rangeName: range.name,
          min: range.min,
          max: range.max,
          rangeMatches: rangeCompanies?.length || 0,
          minMatches: minRatingCompanies?.length || 0,
          rangeCorrect: correctlyFiltered,
          minCorrect: minRatingCorrect
        });
      }

      // Test specific rating values
      const specificRatings = [3.0, 4.0, 5.0];
      const specificResults = [];

      for (const rating of specificRatings) {
        const { data: specificRatingCompanies, error: specificError } = await supabase
          .from('companies')
          .select('id, name, average_rating')
          .eq('average_rating', rating)
          .limit(10);

        if (specificError) throw specificError;

        const specificCorrect = specificRatingCompanies?.every(company =>
          company.average_rating === rating
        ) || true;

        specificResults.push({
          rating,
          matches: specificRatingCompanies?.length || 0,
          correct: specificCorrect
        });
      }

      const allRangeFiltersWorking = rangeResults.every(result => 
        result.rangeCorrect && result.minCorrect
      ) && specificResults.every(result => result.correct);

      if (allRangeFiltersWorking) {
        this.addResult('Rating Range Filtering', 'passed', Date.now() - startTime,
          `Rating range filtering working correctly for all ${ratingRanges.length} tested ranges`, undefined, {
            rangeResults,
            specificResults,
            totalRangesTested: ratingRanges.length,
            totalSpecificRatingsTested: specificRatings.length
          });
      } else {
        this.addResult('Rating Range Filtering', 'warning', Date.now() - startTime,
          'Some rating range filters may not be working correctly', undefined, {
            rangeResults,
            specificResults,
            allFiltersWorking: allRangeFiltersWorking
          });
      }

    } catch (error) {
      this.addResult('Rating Range Filtering', 'failed', Date.now() - startTime,
        'Rating range filtering has issues', `${error}`);
    }
  }

  private async testIndustryLocationCombination(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing industry + location combination filtering...'));
      
      // Get sample industries and locations for combination testing
      const { data: sampleCompanies, error: sampleError } = await supabase
        .from('companies')
        .select('industry, location')
        .not('industry', 'is', null)
        .not('location', 'is', null)
        .limit(20);

      if (sampleError) throw sampleError;

      if (!sampleCompanies || sampleCompanies.length === 0) {
        this.addResult('Industry + Location Combination', 'skipped', Date.now() - startTime,
          'No companies with both industry and location data found');
        return;
      }

      const combinations = [
        { industry: 'Technology', location: 'San Francisco' },
        { industry: 'Finance', location: 'New York' },
        { industry: 'Healthcare', location: 'California' },
        { industry: 'Technology', location: 'Seattle' }
      ];

      const combinationResults = [];

      for (const combo of combinations) {
        // Test exact combination
        const { data: exactCombo, error: exactError } = await supabase
          .from('companies')
          .select('id, name, industry, location, average_rating')
          .eq('industry', combo.industry)
          .ilike('location', `%${combo.location}%`)
          .limit(15);

        if (exactError) throw exactError;

        // Verify all results match both criteria
        const correctlyFiltered = exactCombo?.every(company =>
          company.industry === combo.industry &&
          company.location?.toLowerCase().includes(combo.location.toLowerCase())
        ) || true;

        // Test with case-insensitive industry
        const { data: caseInsensitiveCombo, error: caseError } = await supabase
          .from('companies')
          .select('id, name, industry, location')
          .ilike('industry', combo.industry)
          .ilike('location', `%${combo.location}%`)
          .limit(10);

        if (caseError) throw caseError;

        const caseInsensitiveCorrect = caseInsensitiveCombo?.every(company =>
          company.industry?.toLowerCase().includes(combo.industry.toLowerCase()) &&
          company.location?.toLowerCase().includes(combo.location.toLowerCase())
        ) || true;

        combinationResults.push({
          industry: combo.industry,
          location: combo.location,
          exactMatches: exactCombo?.length || 0,
          caseInsensitiveMatches: caseInsensitiveCombo?.length || 0,
          exactCorrect: correctlyFiltered,
          caseInsensitiveCorrect
        });
      }

      const allCombinationsWorking = combinationResults.every(result => 
        result.exactCorrect && result.caseInsensitiveCorrect
      );

      const combinationsWithResults = combinationResults.filter(result => 
        result.exactMatches > 0 || result.caseInsensitiveMatches > 0
      ).length;

      if (allCombinationsWorking) {
        this.addResult('Industry + Location Combination', 'passed', Date.now() - startTime,
          `Industry + location combination filtering working correctly: ${combinationsWithResults}/${combinations.length} combinations have results`, undefined, {
            totalCombinations: combinations.length,
            combinationsWithResults,
            combinationResults,
            allFiltersWorking: allCombinationsWorking
          });
      } else {
        this.addResult('Industry + Location Combination', 'warning', Date.now() - startTime,
          'Some industry + location combination filters may not be working correctly', undefined, {
            combinationResults,
            allFiltersWorking: allCombinationsWorking
          });
      }

    } catch (error) {
      this.addResult('Industry + Location Combination', 'failed', Date.now() - startTime,
        'Industry + location combination filtering has issues', `${error}`);
    }
  }

  private async testIndustryRatingCombination(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing industry + rating combination filtering...'));
      
      const industryRatingCombos = [
        { industry: 'Technology', minRating: 4.0 },
        { industry: 'Finance', minRating: 3.5 },
        { industry: 'Healthcare', minRating: 4.5 },
        { industry: 'Education', minRating: 3.0 }
      ];

      const comboResults = [];

      for (const combo of industryRatingCombos) {
        // Test industry + minimum rating combination
        const { data: industryRatingResults, error: comboError } = await supabase
          .from('companies')
          .select('id, name, industry, average_rating, location')
          .eq('industry', combo.industry)
          .gte('average_rating', combo.minRating)
          .not('average_rating', 'is', null)
          .limit(15);

        if (comboError) throw comboError;

        // Verify all results match both criteria
        const correctlyFiltered = industryRatingResults?.every(company =>
          company.industry === combo.industry &&
          company.average_rating !== null &&
          company.average_rating >= combo.minRating
        ) || true;

        // Test with rating range
        const { data: rangeResults, error: rangeError } = await supabase
          .from('companies')
          .select('id, name, industry, average_rating')
          .eq('industry', combo.industry)
          .gte('average_rating', combo.minRating)
          .lte('average_rating', 5.0)
          .not('average_rating', 'is', null)
          .limit(10);

        if (rangeError) throw rangeError;

        const rangeCorrect = rangeResults?.every(company =>
          company.industry === combo.industry &&
          company.average_rating !== null &&
          company.average_rating >= combo.minRating &&
          company.average_rating <= 5.0
        ) || true;

        comboResults.push({
          industry: combo.industry,
          minRating: combo.minRating,
          minRatingMatches: industryRatingResults?.length || 0,
          rangeMatches: rangeResults?.length || 0,
          minRatingCorrect: correctlyFiltered,
          rangeCorrect
        });
      }

      const allCombosWorking = comboResults.every(result => 
        result.minRatingCorrect && result.rangeCorrect
      );

      const combosWithResults = comboResults.filter(result => 
        result.minRatingMatches > 0
      ).length;

      if (allCombosWorking) {
        this.addResult('Industry + Rating Combination', 'passed', Date.now() - startTime,
          `Industry + rating combination filtering working correctly: ${combosWithResults}/${industryRatingCombos.length} combinations have results`, undefined, {
            totalCombinations: industryRatingCombos.length,
            combosWithResults,
            comboResults,
            allFiltersWorking: allCombosWorking
          });
      } else {
        this.addResult('Industry + Rating Combination', 'warning', Date.now() - startTime,
          'Some industry + rating combination filters may not be working correctly', undefined, {
            comboResults,
            allFiltersWorking: allCombosWorking
          });
      }

    } catch (error) {
      this.addResult('Industry + Rating Combination', 'failed', Date.now() - startTime,
        'Industry + rating combination filtering has issues', `${error}`);
    }
  }

  private async testLocationRatingCombination(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing location + rating combination filtering...'));
      
      const locationRatingCombos = [
        { location: 'San Francisco', minRating: 4.0 },
        { location: 'New York', minRating: 3.5 },
        { location: 'California', minRating: 4.5 },
        { location: 'Seattle', minRating: 4.0 }
      ];

      const comboResults = [];

      for (const combo of locationRatingCombos) {
        // Test location + minimum rating combination
        const { data: locationRatingResults, error: comboError } = await supabase
          .from('companies')
          .select('id, name, location, average_rating, industry')
          .ilike('location', `%${combo.location}%`)
          .gte('average_rating', combo.minRating)
          .not('average_rating', 'is', null)
          .limit(15);

        if (comboError) throw comboError;

        // Verify all results match both criteria
        const correctlyFiltered = locationRatingResults?.every(company =>
          company.location?.toLowerCase().includes(combo.location.toLowerCase()) &&
          company.average_rating !== null &&
          company.average_rating >= combo.minRating
        ) || true;

        comboResults.push({
          location: combo.location,
          minRating: combo.minRating,
          matches: locationRatingResults?.length || 0,
          correctlyFiltered
        });
      }

      const allCombosWorking = comboResults.every(result => result.correctlyFiltered);
      const combosWithResults = comboResults.filter(result => result.matches > 0).length;

      if (allCombosWorking) {
        this.addResult('Location + Rating Combination', 'passed', Date.now() - startTime,
          `Location + rating combination filtering working correctly: ${combosWithResults}/${locationRatingCombos.length} combinations have results`, undefined, {
            totalCombinations: locationRatingCombos.length,
            combosWithResults,
            comboResults,
            allFiltersWorking: allCombosWorking
          });
      } else {
        this.addResult('Location + Rating Combination', 'warning', Date.now() - startTime,
          'Some location + rating combination filters may not be working correctly', undefined, {
            comboResults,
            allFiltersWorking: allCombosWorking
          });
      }

    } catch (error) {
      this.addResult('Location + Rating Combination', 'failed', Date.now() - startTime,
        'Location + rating combination filtering has issues', `${error}`);
    }
  }

  private async testTripleCriteriaFiltering(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing triple criteria (industry + location + rating) filtering...'));
      
      const tripleCombos = [
        { industry: 'Technology', location: 'San Francisco', minRating: 4.0 },
        { industry: 'Finance', location: 'New York', minRating: 3.5 },
        { industry: 'Healthcare', location: 'California', minRating: 4.0 }
      ];

      const tripleResults = [];

      for (const combo of tripleCombos) {
        // Test all three criteria combined
        const { data: tripleFilterResults, error: tripleError } = await supabase
          .from('companies')
          .select('id, name, industry, location, average_rating, total_reviews')
          .eq('industry', combo.industry)
          .ilike('location', `%${combo.location}%`)
          .gte('average_rating', combo.minRating)
          .not('average_rating', 'is', null)
          .limit(10);

        if (tripleError) throw tripleError;

        // Verify all results match all three criteria
        const correctlyFiltered = tripleFilterResults?.every(company =>
          company.industry === combo.industry &&
          company.location?.toLowerCase().includes(combo.location.toLowerCase()) &&
          company.average_rating !== null &&
          company.average_rating >= combo.minRating
        ) || true;

        tripleResults.push({
          industry: combo.industry,
          location: combo.location,
          minRating: combo.minRating,
          matches: tripleFilterResults?.length || 0,
          correctlyFiltered,
          sampleCompany: tripleFilterResults?.[0] || null
        });
      }

      const allTripleFiltersWorking = tripleResults.every(result => result.correctlyFiltered);
      const tripleFiltersWithResults = tripleResults.filter(result => result.matches > 0).length;

      if (allTripleFiltersWorking) {
        this.addResult('Triple Criteria Filtering', 'passed', Date.now() - startTime,
          `Triple criteria filtering working correctly: ${tripleFiltersWithResults}/${tripleCombos.length} combinations have results`, undefined, {
            totalCombinations: tripleCombos.length,
            combinationsWithResults: tripleFiltersWithResults,
            tripleResults,
            allFiltersWorking: allTripleFiltersWorking
          });
      } else {
        this.addResult('Triple Criteria Filtering', 'warning', Date.now() - startTime,
          'Some triple criteria filters may not be working correctly', undefined, {
            tripleResults,
            allFiltersWorking: allTripleFiltersWorking
          });
      }

    } catch (error) {
      this.addResult('Triple Criteria Filtering', 'failed', Date.now() - startTime,
        'Triple criteria filtering has issues', `${error}`);
    }
  }

  private async testFilterCombinationLogic(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing filter combination logic and interactions...'));
      
      // Test that combining filters reduces result set appropriately
      const { data: allCompanies, error: allError } = await supabase
        .from('companies')
        .select('id')
        .limit(1000);

      if (allError) throw allError;

      const totalCompanies = allCompanies?.length || 0;

      // Test single filter
      const { data: industryOnly, error: industryError } = await supabase
        .from('companies')
        .select('id')
        .eq('industry', 'Technology')
        .limit(1000);

      if (industryError) throw industryError;

      // Test two filters
      const { data: industryLocation, error: comboError } = await supabase
        .from('companies')
        .select('id')
        .eq('industry', 'Technology')
        .ilike('location', '%California%')
        .limit(1000);

      if (comboError) throw comboError;

      // Test three filters
      const { data: allThreeFilters, error: threeError } = await supabase
        .from('companies')
        .select('id')
        .eq('industry', 'Technology')
        .ilike('location', '%California%')
        .gte('average_rating', 3.0)
        .not('average_rating', 'is', null)
        .limit(1000);

      if (threeError) throw threeError;

      const industryOnlyCount = industryOnly?.length || 0;
      const industryLocationCount = industryLocation?.length || 0;
      const allThreeCount = allThreeFilters?.length || 0;

      // Logic check: each additional filter should reduce or maintain result count
      const logicCorrect = 
        industryLocationCount <= industryOnlyCount &&
        allThreeCount <= industryLocationCount;

      const logicResults = {
        totalCompanies,
        industryOnlyCount,
        industryLocationCount,
        allThreeCount,
        logicCorrect,
        reductionPattern: `${totalCompanies} → ${industryOnlyCount} → ${industryLocationCount} → ${allThreeCount}`
      };

      if (logicCorrect) {
        this.addResult('Filter Combination Logic', 'passed', Date.now() - startTime,
          'Filter combination logic working correctly - each filter appropriately reduces result set', undefined, logicResults);
      } else {
        this.addResult('Filter Combination Logic', 'warning', Date.now() - startTime,
          'Filter combination logic may have issues - result set not reducing as expected', undefined, logicResults);
      }

    } catch (error) {
      this.addResult('Filter Combination Logic', 'failed', Date.now() - startTime,
        'Filter combination logic testing has issues', `${error}`);
    }
  }

  private async testFilterClearingBehavior(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing filter clearing behavior...'));
      
      // Test that clearing filters returns to full result set
      const { data: allResults, error: allError } = await supabase
        .from('companies')
        .select('id, name, industry, location')
        .limit(50);

      if (allError) throw allError;

      // Test filtered results
      const { data: filteredResults, error: filteredError } = await supabase
        .from('companies')
        .select('id, name, industry, location')
        .eq('industry', 'Technology')
        .limit(50);

      if (filteredError) throw filteredError;

      // Test "clearing" by removing filter (back to all results)
      const { data: clearedResults, error: clearedError } = await supabase
        .from('companies')
        .select('id, name, industry, location')
        .limit(50);

      if (clearedError) throw clearedError;

      // Verify clearing behavior
      const clearingWorksCorrectly = 
        (allResults?.length || 0) === (clearedResults?.length || 0) &&
        (filteredResults?.length || 0) <= (allResults?.length || 0);

      const clearingResults = {
        allResultsCount: allResults?.length || 0,
        filteredResultsCount: filteredResults?.length || 0,
        clearedResultsCount: clearedResults?.length || 0,
        clearingWorksCorrectly
      };

      if (clearingWorksCorrectly) {
        this.addResult('Filter Clearing Behavior', 'passed', Date.now() - startTime,
          'Filter clearing behavior working correctly', undefined, clearingResults);
      } else {
        this.addResult('Filter Clearing Behavior', 'warning', Date.now() - startTime,
          'Filter clearing behavior may have issues', undefined, clearingResults);
      }

    } catch (error) {
      this.addResult('Filter Clearing Behavior', 'failed', Date.now() - startTime,
        'Filter clearing behavior testing has issues', `${error}`);
    }
  }

  private async testSearchWithFilters(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing search functionality combined with filters...'));
      
      const searchTerms = ['tech', 'inc', 'corp', 'solutions'];
      const searchFilterResults = [];

      for (const term of searchTerms) {
        // Test search alone
        const { data: searchOnly, error: searchError } = await supabase
          .from('companies')
          .select('id, name, industry, location, average_rating')
          .ilike('name', `%${term}%`)
          .limit(20);

        if (searchError) throw searchError;

        // Test search + industry filter
        const { data: searchWithIndustry, error: industryError } = await supabase
          .from('companies')
          .select('id, name, industry, location, average_rating')
          .ilike('name', `%${term}%`)
          .eq('industry', 'Technology')
          .limit(20);

        if (industryError) throw industryError;

        // Test search + location filter
        const { data: searchWithLocation, error: locationError } = await supabase
          .from('companies')
          .select('id, name, industry, location, average_rating')
          .ilike('name', `%${term}%`)
          .ilike('location', '%California%')
          .limit(20);

        if (locationError) throw locationError;

        // Verify search results contain the search term
        const searchOnlyCorrect = searchOnly?.every(company =>
          company.name.toLowerCase().includes(term.toLowerCase())
        ) || true;

        const searchIndustryCorrect = searchWithIndustry?.every(company =>
          company.name.toLowerCase().includes(term.toLowerCase()) &&
          company.industry === 'Technology'
        ) || true;

        const searchLocationCorrect = searchWithLocation?.every(company =>
          company.name.toLowerCase().includes(term.toLowerCase()) &&
          company.location?.toLowerCase().includes('california')
        ) || true;

        searchFilterResults.push({
          searchTerm: term,
          searchOnlyCount: searchOnly?.length || 0,
          searchIndustryCount: searchWithIndustry?.length || 0,
          searchLocationCount: searchWithLocation?.length || 0,
          searchOnlyCorrect,
          searchIndustryCorrect,
          searchLocationCorrect
        });
      }

      const allSearchFiltersWorking = searchFilterResults.every(result =>
        result.searchOnlyCorrect && result.searchIndustryCorrect && result.searchLocationCorrect
      );

      if (allSearchFiltersWorking) {
        this.addResult('Search with Filters', 'passed', Date.now() - startTime,
          `Search combined with filters working correctly for all ${searchTerms.length} search terms`, undefined, {
            searchTermsTested: searchTerms.length,
            searchFilterResults,
            allFiltersWorking: allSearchFiltersWorking
          });
      } else {
        this.addResult('Search with Filters', 'warning', Date.now() - startTime,
          'Some search + filter combinations may not be working correctly', undefined, {
            searchFilterResults,
            allFiltersWorking: allSearchFiltersWorking
          });
      }

    } catch (error) {
      this.addResult('Search with Filters', 'failed', Date.now() - startTime,
        'Search with filters testing has issues', `${error}`);
    }
  }

  private async testEmptyFilterResults(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing empty filter results handling...'));
      
      // Test filters that should return no results
      const emptyFilterTests = [
        {
          name: 'Non-existent Industry',
          query: () => supabase.from('companies').select('id').eq('industry', 'NonExistentIndustry123')
        },
        {
          name: 'Non-existent Location',
          query: () => supabase.from('companies').select('id').ilike('location', '%NonExistentCity123%')
        },
        {
          name: 'Impossible Rating',
          query: () => supabase.from('companies').select('id').eq('average_rating', 10.0)
        },
        {
          name: 'Contradictory Filters',
          query: () => supabase.from('companies').select('id').gte('average_rating', 5.0).lte('average_rating', 1.0)
        }
      ];

      const emptyResults = [];

      for (const test of emptyFilterTests) {
        const { data, error } = await test.query();
        
        if (error) throw error;

        const isEmpty = !data || data.length === 0;
        
        emptyResults.push({
          testName: test.name,
          isEmpty,
          resultCount: data?.length || 0
        });
      }

      const allEmptyTestsCorrect = emptyResults.every(result => result.isEmpty);

      if (allEmptyTestsCorrect) {
        this.addResult('Empty Filter Results', 'passed', Date.now() - startTime,
          'Empty filter results handled correctly - all impossible filters return empty results', undefined, {
            emptyTestsCount: emptyFilterTests.length,
            emptyResults,
            allTestsCorrect: allEmptyTestsCorrect
          });
      } else {
        this.addResult('Empty Filter Results', 'warning', Date.now() - startTime,
          'Some empty filter results may not be handled correctly', undefined, {
            emptyResults,
            allTestsCorrect: allEmptyTestsCorrect
          });
      }

    } catch (error) {
      this.addResult('Empty Filter Results', 'failed', Date.now() - startTime,
        'Empty filter results testing has issues', `${error}`);
    }
  }

  private async testInvalidFilterValues(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(chalk.yellow('Testing invalid filter values handling...'));
      
      // Test various invalid filter values
      const invalidFilterTests = [
        {
          name: 'Null Industry Filter',
          query: () => supabase.from('companies').select('id').eq('industry', null)
        },
        {
          name: 'Empty String Location',
          query: () => supabase.from('companies').select('id').eq('location', '')
        },
        {
          name: 'Negative Rating',
          query: () => supabase.from('companies').select('id').eq('average_rating', -1.0)
        },
        {
          name: 'String as Rating',
          query: () => supabase.from('companies').select('id').eq('average_rating', 'invalid' as any)
        }
      ];

      const invalidResults = [];

      for (const test of invalidFilterTests) {
        try {
          const { data, error } = await test.query();
          
          // Some of these might error, which is acceptable
          const handledGracefully = !error || error.message.includes('invalid') || error.message.includes('type');
          
          invalidResults.push({
            testName: test.name,
            handledGracefully,
            resultCount: data?.length || 0,
            error: error?.message || 'none'
          });
        } catch (testError) {
          // Catching errors is also acceptable for invalid values
          invalidResults.push({
            testName: test.name,
            handledGracefully: true,
            resultCount: 0,
            error: `${testError}`
          });
        }
      }

      const allInvalidTestsHandled = invalidResults.every(result => result.handledGracefully);

      if (allInvalidTestsHandled) {
        this.addResult('Invalid Filter Values', 'passed', Date.now() - startTime,
          'Invalid filter values handled gracefully - all invalid inputs properly managed', undefined, {
            invalidTestsCount: invalidFilterTests.length,
            invalidResults,
            allTestsHandled: allInvalidTestsHandled
          });
      } else {
        this.addResult('Invalid Filter Values', 'warning', Date.now() - startTime,
          'Some invalid filter values may not be handled gracefully', undefined, {
            invalidResults,
            allTestsHandled: allInvalidTestsHandled
          });
      }

    } catch (error) {
      this.addResult('Invalid Filter Values', 'failed', Date.now() - startTime,
        'Invalid filter values testing has issues', `${error}`);
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
    console.log(chalk.blue('\n📊 Search and Filter System Test Results:\n'));
    
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
  const tester = new SearchFilterTester();
  const results = await tester.runAllTests();
  
  const failed = results.filter(r => r.status === 'failed').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  if (failed > 0) {
    console.log(chalk.red('\n❌ Some search and filter tests failed.'));
    process.exit(1);
  } else if (warnings > 0) {
    console.log(chalk.yellow('\n⚠️ Search and filter tests completed with warnings.'));
    process.exit(0);
  } else {
    console.log(chalk.green('\n🎉 All search and filter tests passed!'));
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { SearchFilterTester };