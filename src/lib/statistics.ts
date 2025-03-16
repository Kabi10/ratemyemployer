import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type IndustryStatistic = {
  industry: string;
  avg_rating: number;
  company_count: number;
  review_count: number;
};

export type LocationStatistic = {
  location: string;
  avg_rating: number;
  company_count: number;
  review_count: number;
};

/**
 * Get statistics grouped by industry
 */
export async function getIndustryStatistics(): Promise<IndustryStatistic[]> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        industry,
        id,
        reviews!inner (
          rating
        )
      `)
      .not('industry', 'is', null);

    if (error) throw error;

    // Process the data to get statistics
    const industryMap = new Map<string, { 
      ratings: number[], 
      companies: Set<number>,
      reviews: number
    }>();

    // Group by industry
    data?.forEach(company => {
      const industry = company.industry as string;
      if (!industryMap.has(industry)) {
        industryMap.set(industry, { 
          ratings: [], 
          companies: new Set<number>(),
          reviews: 0
        });
      }
      
      const stats = industryMap.get(industry)!;
      stats.companies.add(company.id);
      
      // Add ratings
      const reviews = company.reviews as any[];
      reviews.forEach(review => {
        stats.ratings.push(review.rating);
        stats.reviews++;
      });
    });

    // Convert map to array of statistics
    const statistics: IndustryStatistic[] = Array.from(industryMap.entries()).map(([industry, stats]) => ({
      industry,
      avg_rating: stats.ratings.length > 0 
        ? stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length 
        : 0,
      company_count: stats.companies.size,
      review_count: stats.reviews
    }));

    // Sort by average rating descending
    return statistics.sort((a, b) => b.avg_rating - a.avg_rating);
  } catch (error) {
    console.error('Error getting industry statistics:', error);
    return [];
  }
}

/**
 * Get statistics grouped by location
 */
export async function getLocationStatistics(): Promise<LocationStatistic[]> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        location,
        id,
        reviews!inner (
          rating
        )
      `)
      .not('location', 'is', null);

    if (error) throw error;

    // Process the data to get statistics
    const locationMap = new Map<string, { 
      ratings: number[], 
      companies: Set<number>,
      reviews: number
    }>();

    // Group by location
    data?.forEach(company => {
      const location = company.location as string;
      if (!locationMap.has(location)) {
        locationMap.set(location, { 
          ratings: [], 
          companies: new Set<number>(),
          reviews: 0
        });
      }
      
      const stats = locationMap.get(location)!;
      stats.companies.add(company.id);
      
      // Add ratings
      const reviews = company.reviews as any[];
      reviews.forEach(review => {
        stats.ratings.push(review.rating);
        stats.reviews++;
      });
    });

    // Convert map to array of statistics
    const statistics: LocationStatistic[] = Array.from(locationMap.entries()).map(([location, stats]) => ({
      location,
      avg_rating: stats.ratings.length > 0 
        ? stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length 
        : 0,
      company_count: stats.companies.size,
      review_count: stats.reviews
    }));

    // Sort by average rating descending
    return statistics.sort((a, b) => b.avg_rating - a.avg_rating);
  } catch (error) {
    console.error('Error getting location statistics:', error);
    return [];
  }
}

/**
 * Get all industry statistics (including those without reviews)
 */
export async function getAllIndustryStatistics(): Promise<IndustryStatistic[]> {
  try {
    // First get all companies grouped by industry
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('industry, id')
      .not('industry', 'is', null);

    if (companiesError) throw companiesError;

    // Then get all reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('company_id, rating');

    if (reviewsError) throw reviewsError;

    // Process the data to get statistics
    const industryMap = new Map<string, { 
      ratings: number[], 
      companies: Set<number>,
      reviews: number
    }>();

    // Group companies by industry
    companies?.forEach(company => {
      const industry = company.industry as string;
      if (!industryMap.has(industry)) {
        industryMap.set(industry, { 
          ratings: [], 
          companies: new Set<number>(),
          reviews: 0
        });
      }
      
      const stats = industryMap.get(industry)!;
      stats.companies.add(company.id);
    });

    // Add reviews to the appropriate industry
    reviews?.forEach(review => {
      // Find which industry this company belongs to
      const company = companies?.find(c => c.id === review.company_id);
      if (company && company.industry) {
        const stats = industryMap.get(company.industry as string);
        if (stats) {
          stats.ratings.push(review.rating);
          stats.reviews++;
        }
      }
    });

    // Convert map to array of statistics
    const statistics: IndustryStatistic[] = Array.from(industryMap.entries()).map(([industry, stats]) => ({
      industry,
      avg_rating: stats.ratings.length > 0 
        ? stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length 
        : 0,
      company_count: stats.companies.size,
      review_count: stats.reviews
    }));

    // Sort by average rating descending
    return statistics.sort((a, b) => b.avg_rating - a.avg_rating);
  } catch (error) {
    console.error('Error getting all industry statistics:', error);
    return [];
  }
}

/**
 * Get all location statistics (including those without reviews)
 */
export async function getAllLocationStatistics(): Promise<LocationStatistic[]> {
  try {
    // First get all companies grouped by location
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('location, id')
      .not('location', 'is', null);

    if (companiesError) throw companiesError;

    // Then get all reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('company_id, rating');

    if (reviewsError) throw reviewsError;

    // Process the data to get statistics
    const locationMap = new Map<string, { 
      ratings: number[], 
      companies: Set<number>,
      reviews: number
    }>();

    // Group companies by location
    companies?.forEach(company => {
      const location = company.location as string;
      if (!locationMap.has(location)) {
        locationMap.set(location, { 
          ratings: [], 
          companies: new Set<number>(),
          reviews: 0
        });
      }
      
      const stats = locationMap.get(location)!;
      stats.companies.add(company.id);
    });

    // Add reviews to the appropriate location
    reviews?.forEach(review => {
      // Find which location this company belongs to
      const company = companies?.find(c => c.id === review.company_id);
      if (company && company.location) {
        const stats = locationMap.get(company.location as string);
        if (stats) {
          stats.ratings.push(review.rating);
          stats.reviews++;
        }
      }
    });

    // Convert map to array of statistics
    const statistics: LocationStatistic[] = Array.from(locationMap.entries()).map(([location, stats]) => ({
      location,
      avg_rating: stats.ratings.length > 0 
        ? stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length 
        : 0,
      company_count: stats.companies.size,
      review_count: stats.reviews
    }));

    // Sort by average rating descending
    return statistics.sort((a, b) => b.avg_rating - a.avg_rating);
  } catch (error) {
    console.error('Error getting all location statistics:', error);
    return [];
  }
} 