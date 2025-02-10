'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui-library/card';
import { Skeleton } from '@/components/ui-library/skeleton';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui-library/alert';
import {
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
} from '@radix-ui/react-icons';
// import { fetchAndStoreCompanyNews, fetchNewsForCompanies, fetchNewsFromRSS } from '@/lib/newsApi';
import type { Company, Review } from '@/types/database';
import { CompanyWithStats } from '@/types/types';
import { ShameList } from '@/components/ShameList';
import { Database } from '@/types/supabase';

// Interfaces

/**
 * Represents a company with additional shame-related data
 */
type CompanyWithShameData = Database['public']['Tables']['companies']['Row'] & {
  /** Array of all reviews associated with the company */
  reviews: Database['public']['Tables']['reviews']['Row'][];
  
  /** Calculated shame score for the company */
  shame_score: number;
  
  /** Array of recent reviews for calculating shame metrics */
  recent_reviews: Database['public']['Tables']['reviews']['Row'][];
  
  /** Average rating across all reviews */
  average_rating: number;
  
  /** Total number of reviews submitted */
  total_reviews: number;
  
  /** Detailed breakdown of the shame score calculation */
  score_breakdown?: {
    /** Base shame score before adjustments */
    base_score: number;
    
    /** Weight factor applied to the score */
    weight: number;
    
    /** Count of recent negative reviews */
    recent_negative_count: number;
    
    /** Bonus points from recent activity */
    recent_bonus: number;
  };
};

/**
 * Represents a news article related to a company
 */
type NewsArticle = {
  /** Title of the news article */
  title: string;
  
  /** Brief description or excerpt of the article */
  description: string;
  
  /** URL link to the full article */
  url: string;
  
  /** Source information for the article */
  source: {
    /** Name of the news source */
    name: string;
  };
  
  /** Publication date of the article */
  publishedAt: string;
};

export default function ShamePage() {
  const [companies, setCompanies] = useState<CompanyWithShameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyNews, setCompanyNews] = useState<{
    [key: string]: NewsArticle[];
  }>({});
  const [loadingNews, setLoadingNews] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const formatEmploymentStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      FULL_TIME: 'Full-time',
      PART_TIME: 'Part-time',
      CONTRACT: 'Contract',
      INTERN: 'Intern',
    };
    return statusMap[status] || status;
  };

  // Consolidated fetch logic
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*, reviews(*)')
        .order('shame_score', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Calculate shame scores for each company
      const companiesWithScores = (data || []).map((company) => ({
        ...company,
        shame_score: calculateShameScore(company),
      }));

      setCompanies(companiesWithScores);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch companies'
      );
    } finally {
      setLoading(false);
    }
  };

  // Optimized useEffect
  useEffect(() => {
    fetchData();
  }, []);

  // Improved shame score calculation
  const calculateShameScore = (company: CompanyWithShameData): number => {
    const reviews = company.reviews || [];
    const totalReviews = reviews.length;

    if (totalReviews === 0) return 0;

    const averageRating =
      reviews.reduce(
        (sum, review) => sum + (review.rating !== null ? review.rating : 0),
        0
      ) / totalReviews;
    const ratingScore = (5 - averageRating) * 20;
    const reviewWeight = Math.min(totalReviews / 10, 1);

    const recentNegativeReviews = reviews.filter((review) => {
      if (!review.created_at) return false;
      const isRecent =
        new Date(review.created_at) >
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      return isRecent && review.rating !== null && review.rating <= 2;
    }).length;

    const recentReviewBonus = recentNegativeReviews * 5;
    return ratingScore * reviewWeight + recentReviewBonus;
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Shame List</h1>
      <ShameList companies={companies} />
    </div>
  );
}
