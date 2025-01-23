'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { fetchAndStoreCompanyNews, fetchNewsForCompanies } from '@/lib/newsApi';

interface Company {
  id: number;
  name: string;
  average_rating: number;
  total_reviews: number;
  shame_score?: number;
  recent_reviews?: {
    title: string;
    content: string;
    rating: number;
    created_at: string;
  }[];
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

export default function WallOfShame() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyNews, setCompanyNews] = useState<{ [key: string]: NewsArticle[] }>({});

  const supabase = createClient();

  useEffect(() => {
    async function fetchCompanies() {
      try {
        // Fetch companies with their reviews
        const { data, error } = await supabase
          .from('companies')
          .select(`
            id,
            name,
            average_rating,
            total_reviews,
            reviews (
              title,
              content,
              rating,
              created_at
            )
          `)
          .order('average_rating', { ascending: true })
          .limit(10);

        if (error) throw error;

        // Calculate shame score and process reviews
        const companiesWithScore = data.map(company => ({
          ...company,
          shame_score: calculateShameScore(company),
          recent_reviews: company.reviews
            ?.filter(review => review.rating <= 2) // Only show negative reviews
            ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            ?.slice(0, 3) // Show only 3 most recent negative reviews
        }));

        // Sort by shame score and take top 5
        const sortedCompanies = companiesWithScore
          .sort((a, b) => (b.shame_score || 0) - (a.shame_score || 0))
          .slice(0, 5);

        setCompanies(sortedCompanies);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load the Wall of Shame. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  function calculateShameScore(company: Company): number {
    if (!company.average_rating || !company.total_reviews) return 0;

    // Base score from poor ratings (0-100 scale)
    const ratingScore = (5 - company.average_rating) * 20;

    // Weight by number of reviews (more reviews = more reliable score)
    const reviewWeight = Math.min(company.total_reviews / 10, 1); // Cap at 10 reviews

    // Count recent negative reviews (last 3 months)
    const recentNegativeReviews = company.reviews?.filter(review => {
      const isRecent = new Date(review.created_at) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      return isRecent && review.rating <= 2;
    })?.length || 0;

    // Add bonus points for recent negative reviews
    const recentReviewBonus = recentNegativeReviews * 5;

    return (ratingScore * reviewWeight) + recentReviewBonus;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Wall of Shame</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Wall of Shame</h1>
      <p className="text-sm text-gray-500 mb-8">
        Companies are ranked based on their shame score, which considers average ratings, 
        number of reviews, and recent negative employee experiences.
      </p>
      <div className="space-y-8">
        {companies.map((company) => (
          <Card key={company.id} className="w-full">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-semibold">{company.name}</h2>
                    <div className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                      Shame Score: {company.shame_score?.toFixed(1)}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Average Rating: <span className="font-medium">{company.average_rating?.toFixed(1)}</span>
                      <span className="mx-2">•</span>
                      <span>{company.total_reviews} reviews</span>
                    </p>
                  </div>
                </div>
              </div>

              {company.recent_reviews?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Recent Employee Experiences</h3>
                  <div className="space-y-3">
                    {company.recent_reviews.map((review, index) => (
                      <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                        <div className="font-medium">{review.title}</div>
                        <p className="mt-1 text-sm text-gray-600">
                          {review.content}
                        </p>
                        <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                          <span>Rating: {review.rating}/5</span>
                          <span>•</span>
                          <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}