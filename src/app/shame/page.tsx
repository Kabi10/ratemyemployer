'use client'

import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui-library/card';
import { Skeleton } from '@/components/ui-library/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui-library/alert';
import { ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
// import { fetchAndStoreCompanyNews, fetchNewsForCompanies, fetchNewsFromRSS } from '@/lib/newsApi';
import type { Company, Review } from '@/types/database';
import { CompanyWithStats } from '@/types/types';
import { ShameList } from '@/components/ShameList';
import { Database } from './supabase';

// Interface for the data we'll use in this component.
interface CompanyWithShameData extends Database['public']['Tables']['companies']['Row'] {
  reviews: Database['public']['Tables']['reviews']['Row'][];
  shame_score: number;
  recent_reviews: Database['public']['Tables']['reviews']['Row'][];
  average_rating: number;
  total_reviews: number;
  score_breakdown?: {
    base_score: number;
    weight: number;
    recent_negative_count: number;
    recent_bonus: number;
  };
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
  publishedAt: string;
}

export default function ShamePage() {
  const [companies, setCompanies] = useState<CompanyWithShameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyNews, setCompanyNews] = useState<{ [key: string]: NewsArticle[] }>({});
  const [loadingNews, setLoadingNews] = useState<{ [key: string]: boolean }>({});
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const formatEmploymentStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'FULL_TIME': 'Full-time',
      'PART_TIME': 'Part-time',
      'CONTRACT': 'Contract',
      'INTERN': 'Intern'
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    const fetchShameCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*, reviews(*)')
          .order('shame_score', { ascending: false })
          .limit(10);

        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      } finally {
        setLoading(false);
      }
    };

    fetchShameCompanies();
  }, []);

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .limit(1);

        if (error) throw error;
        console.log('Connection Test:', data);
      } catch (err) {
        console.error('Connection Test Error:', err);
      }
    }
    testConnection();
  }, []);

  function calculateShameScore(company: CompanyWithShameData): number {
    // Ensure reviews exist before calculating
    const reviews = company.reviews || [];

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0; // Default to 0 if no reviews

    // Base score from poor ratings (0-100 scale)
    const ratingScore = (5 - averageRating) * 20;

    // Weight by number of reviews (more reviews = more reliable score)
    const reviewWeight = Math.min(totalReviews / 10, 1); // Cap at 10 reviews

    // Count recent negative reviews (last 3 months)
    const recentNegativeReviews = reviews.filter(review => {
      if(!review.created_at) return false;
      const isRecent = new Date(review.created_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      return isRecent && review.rating <= 2;
    }).length;

    // Add bonus points for recent negative reviews
    const recentReviewBonus = recentNegativeReviews * 5;

    const finalScore = (ratingScore * reviewWeight) + recentReviewBonus;

    console.log(`Shame score breakdown for ${company.name}:`, {
      ratingScore,
      reviewWeight,
      recentNegativeReviews,
      recentReviewBonus,
      finalScore
    });

    // Return the breakdown for display
    return finalScore;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Shame List</h1>
      <ShameList companies={companies} />
    </div>
  );
}