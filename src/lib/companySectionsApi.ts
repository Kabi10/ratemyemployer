/**
 * API functions for Financial Distress and Rising Startups sections
 * Handles data fetching, filtering, and statistics for company sections
 */

import { supabase } from './supabaseClient';
import type {
  CompanyWithDistressData,
  CompanyWithGrowthData,
  DistressCompaniesResponse,
  RisingStartupsResponse,
  DistressFilters,
  GrowthFilters,
  DistressStatistics,
  GrowthStatistics,
  FinancialDistressIndicator,
  RisingStartupIndicator,
  AddDistressIndicatorForm,
  AddGrowthIndicatorForm,
  CompanyStatusTracking,
  CompanyMetrics
} from '@/types/companySections';

/**
 * Fetch companies in financial distress
 */
export async function getFinancialDistressCompanies(
  filters: DistressFilters = {},
  limit: number = 20,
  offset: number = 0
): Promise<DistressCompaniesResponse> {
  try {
    // Use the database function for initial data
    const { data: companiesData, error } = await supabase
      .rpc('get_financial_distress_companies', { limit_param: limit + offset });

    if (error) {
      console.error('Error fetching distress companies:', error);
      throw error;
    }

    if (!companiesData || companiesData.length === 0) {
      return {
        companies: [],
        total_count: 0,
        average_distress_score: 0,
        most_common_indicator: 'layoffs'
      };
    }

    // Apply client-side filtering if needed
    let filteredData = companiesData;

    if (filters.industry) {
      filteredData = filteredData.filter(company => 
        company.industry?.toLowerCase().includes(filters.industry!.toLowerCase())
      );
    }

    if (filters.location) {
      filteredData = filteredData.filter(company => 
        company.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.min_distress_score !== undefined) {
      filteredData = filteredData.filter(company => 
        company.distress_score >= filters.min_distress_score!
      );
    }

    if (filters.max_distress_score !== undefined) {
      filteredData = filteredData.filter(company => 
        company.distress_score <= filters.max_distress_score!
      );
    }

    // Apply sorting
    if (filters.sort_by) {
      filteredData.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sort_by) {
          case 'distress_score':
            aValue = a.distress_score;
            bValue = b.distress_score;
            break;
          case 'indicator_count':
            aValue = a.indicator_count;
            bValue = b.indicator_count;
            break;
          case 'company_name':
            aValue = a.company_name;
            bValue = b.company_name;
            break;
          default:
            aValue = a.distress_score;
            bValue = b.distress_score;
        }

        if (filters.sort_order === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    // Apply pagination
    const paginatedData = filteredData.slice(offset, offset + limit);

    // Fetch additional details for each company
    const companiesWithDetails = await Promise.all(
      paginatedData.map(async (company) => {
        // Fetch distress indicators
        const { data: indicators } = await supabase
          .from('financial_distress_indicators')
          .select('*')
          .eq('company_id', company.company_id)
          .eq('verified', true)
          .order('detected_at', { ascending: false });

        return {
          id: company.company_id,
          name: company.company_name,
          industry: company.industry,
          location: company.location,
          average_rating: company.average_rating,
          distress_score: company.distress_score,
          latest_indicator: company.latest_indicator,
          indicator_count: company.indicator_count,
          distress_indicators: indicators || []
        } as CompanyWithDistressData;
      })
    );

    // Calculate statistics
    const totalCount = filteredData.length;
    const averageDistressScore = totalCount > 0 
      ? filteredData.reduce((sum, company) => sum + company.distress_score, 0) / totalCount 
      : 0;

    return {
      companies: companiesWithDetails,
      total_count: totalCount,
      average_distress_score: Math.round(averageDistressScore),
      most_common_indicator: 'layoffs' // TODO: Calculate from data
    };

  } catch (error) {
    console.error('Error in getFinancialDistressCompanies:', error);
    throw error;
  }
}

/**
 * Fetch rising startup companies
 */
export async function getRisingStartupCompanies(
  filters: GrowthFilters = {},
  limit: number = 20,
  offset: number = 0
): Promise<RisingStartupsResponse> {
  try {
    // Use the database function for initial data
    const { data: companiesData, error } = await supabase
      .rpc('get_rising_startup_companies', { limit_param: limit + offset });

    if (error) {
      console.error('Error fetching rising startups:', error);
      throw error;
    }

    if (!companiesData || companiesData.length === 0) {
      return {
        companies: [],
        total_count: 0,
        average_growth_score: 0,
        total_funding: 0,
        most_common_indicator: 'funding_round'
      };
    }

    // Apply client-side filtering if needed
    let filteredData = companiesData;

    if (filters.industry) {
      filteredData = filteredData.filter(company => 
        company.industry?.toLowerCase().includes(filters.industry!.toLowerCase())
      );
    }

    if (filters.location) {
      filteredData = filteredData.filter(company => 
        company.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.min_growth_score !== undefined) {
      filteredData = filteredData.filter(company => 
        company.growth_score >= filters.min_growth_score!
      );
    }

    if (filters.max_growth_score !== undefined) {
      filteredData = filteredData.filter(company => 
        company.growth_score <= filters.max_growth_score!
      );
    }

    if (filters.min_funding !== undefined) {
      filteredData = filteredData.filter(company => 
        (company.latest_funding || 0) >= filters.min_funding!
      );
    }

    // Apply sorting
    if (filters.sort_by) {
      filteredData.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sort_by) {
          case 'growth_score':
            aValue = a.growth_score;
            bValue = b.growth_score;
            break;
          case 'indicator_count':
            aValue = a.indicator_count;
            bValue = b.indicator_count;
            break;
          case 'latest_funding':
            aValue = a.latest_funding || 0;
            bValue = b.latest_funding || 0;
            break;
          case 'company_name':
            aValue = a.company_name;
            bValue = b.company_name;
            break;
          default:
            aValue = a.growth_score;
            bValue = b.growth_score;
        }

        if (filters.sort_order === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    // Apply pagination
    const paginatedData = filteredData.slice(offset, offset + limit);

    // Fetch additional details for each company
    const companiesWithDetails = await Promise.all(
      paginatedData.map(async (company) => {
        // Fetch growth indicators
        const { data: indicators } = await supabase
          .from('rising_startup_indicators')
          .select('*')
          .eq('company_id', company.company_id)
          .eq('verified', true)
          .order('detected_at', { ascending: false });

        return {
          id: company.company_id,
          name: company.company_name,
          industry: company.industry,
          location: company.location,
          average_rating: company.average_rating,
          growth_score: company.growth_score,
          latest_indicator: company.latest_indicator,
          indicator_count: company.indicator_count,
          latest_funding: company.latest_funding,
          growth_indicators: indicators || []
        } as CompanyWithGrowthData;
      })
    );

    // Calculate statistics
    const totalCount = filteredData.length;
    const averageGrowthScore = totalCount > 0 
      ? filteredData.reduce((sum, company) => sum + company.growth_score, 0) / totalCount 
      : 0;
    const totalFunding = filteredData.reduce((sum, company) => sum + (company.latest_funding || 0), 0);

    return {
      companies: companiesWithDetails,
      total_count: totalCount,
      average_growth_score: Math.round(averageGrowthScore),
      total_funding: totalFunding,
      most_common_indicator: 'funding_round' // TODO: Calculate from data
    };

  } catch (error) {
    console.error('Error in getRisingStartupCompanies:', error);
    throw error;
  }
}

/**
 * Add a financial distress indicator
 */
export async function addDistressIndicator(
  indicator: AddDistressIndicatorForm
): Promise<FinancialDistressIndicator> {
  try {
    const { data, error } = await supabase
      .from('financial_distress_indicators')
      .insert({
        company_id: indicator.company_id,
        indicator_type: indicator.indicator_type,
        severity: indicator.severity,
        description: indicator.description,
        source_url: indicator.source_url,
        impact_score: indicator.impact_score,
        verified: false // Requires admin verification
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding distress indicator:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addDistressIndicator:', error);
    throw error;
  }
}

/**
 * Add a growth indicator
 */
export async function addGrowthIndicator(
  indicator: AddGrowthIndicatorForm
): Promise<RisingStartupIndicator> {
  try {
    const { data, error } = await supabase
      .from('rising_startup_indicators')
      .insert({
        company_id: indicator.company_id,
        indicator_type: indicator.indicator_type,
        growth_score: indicator.growth_score,
        description: indicator.description,
        source_url: indicator.source_url,
        funding_amount: indicator.funding_amount,
        valuation: indicator.valuation,
        verified: false // Requires admin verification
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding growth indicator:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addGrowthIndicator:', error);
    throw error;
  }
}

/**
 * Get distress statistics
 */
export async function getDistressStatistics(): Promise<DistressStatistics> {
  try {
    // Get basic statistics
    const { data: companies, error } = await supabase
      .rpc('get_financial_distress_companies', { limit_param: 1000 });

    if (error) throw error;

    const totalCompanies = companies?.length || 0;
    const averageScore = totalCompanies > 0 
      ? companies.reduce((sum: number, c: any) => sum + c.distress_score, 0) / totalCompanies 
      : 0;

    // Group by industry
    const byIndustry = companies?.reduce((acc: any, company: any) => {
      const industry = company.industry || 'Unknown';
      if (!acc[industry]) {
        acc[industry] = { count: 0, totalScore: 0 };
      }
      acc[industry].count++;
      acc[industry].totalScore += company.distress_score;
      return acc;
    }, {});

    const industryStats = Object.entries(byIndustry || {}).map(([industry, data]: [string, any]) => ({
      industry,
      count: data.count,
      average_score: Math.round(data.totalScore / data.count)
    }));

    return {
      total_companies: totalCompanies,
      average_score: Math.round(averageScore),
      by_industry: industryStats,
      by_indicator_type: [], // TODO: Implement
      trend_data: [] // TODO: Implement
    };
  } catch (error) {
    console.error('Error getting distress statistics:', error);
    throw error;
  }
}

/**
 * Get growth statistics
 */
export async function getGrowthStatistics(): Promise<GrowthStatistics> {
  try {
    // Get basic statistics
    const { data: companies, error } = await supabase
      .rpc('get_rising_startup_companies', { limit_param: 1000 });

    if (error) throw error;

    const totalCompanies = companies?.length || 0;
    const averageScore = totalCompanies > 0 
      ? companies.reduce((sum: number, c: any) => sum + c.growth_score, 0) / totalCompanies 
      : 0;
    const totalFunding = companies?.reduce((sum: number, c: any) => sum + (c.latest_funding || 0), 0) || 0;

    // Group by industry
    const byIndustry = companies?.reduce((acc: any, company: any) => {
      const industry = company.industry || 'Unknown';
      if (!acc[industry]) {
        acc[industry] = { count: 0, totalScore: 0, totalFunding: 0 };
      }
      acc[industry].count++;
      acc[industry].totalScore += company.growth_score;
      acc[industry].totalFunding += company.latest_funding || 0;
      return acc;
    }, {});

    const industryStats = Object.entries(byIndustry || {}).map(([industry, data]: [string, any]) => ({
      industry,
      count: data.count,
      average_score: Math.round(data.totalScore / data.count),
      total_funding: data.totalFunding
    }));

    return {
      total_companies: totalCompanies,
      average_score: Math.round(averageScore),
      total_funding: totalFunding,
      by_industry: industryStats,
      by_indicator_type: [], // TODO: Implement
      trend_data: [] // TODO: Implement
    };
  } catch (error) {
    console.error('Error getting growth statistics:', error);
    throw error;
  }
}
