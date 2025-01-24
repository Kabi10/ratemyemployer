'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { fetchAndStoreCompanyNews, fetchNewsForCompanies } from '@/lib/newsApi';

interface Company {
  id: number;
  name: string;
  average_rating: number;
  total_reviews: number;
  shame_score?: number;
  score_breakdown?: {
    base_score: number;
    weight: number;
    recent_negative_count: number;
    recent_bonus: number;
  };
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
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

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

    // Store the breakdown for display
    company.score_breakdown = {
      base_score: ratingScore,
      weight: reviewWeight,
      recent_negative_count: recentNegativeReviews,
      recent_bonus: recentReviewBonus
    };

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
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Wall of Shame</h1>
      
      <div className="bg-gray-50 rounded-lg mb-8">
        <button 
          onClick={() => setIsExplanationOpen(!isExplanationOpen)}
          className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-lg font-semibold">How Shame Scores Are Calculated</h2>
          {isExplanationOpen ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
        
        {isExplanationOpen && (
          <div className="p-4 pt-0 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-1">1. Base Score (0-100)</h3>
                <p className="text-gray-600">
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    (5 - Rating) × 20
                  </code>
                  <br />
                  • 1★ = 80pts
                  <br />
                  • 2★ = 60pts
                  <br />
                  • 3★ = 40pts
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">2. Review Weight</h3>
                <p className="text-gray-600">
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    min(Reviews ÷ 10, 1)
                  </code>
                  <br />
                  • 10+ reviews = 100%
                  <br />
                  • 5 reviews = 50%
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">3. Recent Bad Reviews</h3>
                <p className="text-gray-600">
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    Bad Reviews × 5
                  </code>
                  <br />
                  • Last 90 days
                  <br />
                  • Rating ≤ 2 stars
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">4. Final Score</h3>
                <p className="text-gray-600">
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    (Base × Weight) + Bonus
                  </code>
                  <br />
                  Higher score = worse rating
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-8">
        Companies are ranked based on their shame score. Higher scores indicate more negative employee experiences,
        with extra weight given to recent negative reviews.
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
                  {company.score_breakdown && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-semibold mb-2">Company Score Calculation:</h3>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div>
                          <div className="flex justify-between items-center">
                            <span>1. Base Score (from {company.average_rating.toFixed(1)}/5 rating)</span>
                            <span className="font-medium">{company.score_breakdown.base_score.toFixed(1)}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            (5 - {company.average_rating.toFixed(1)}) × 20 = {company.score_breakdown.base_score.toFixed(1)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center">
                            <span>2. Weight (from {company.total_reviews} reviews)</span>
                            <span className="font-medium">{(company.score_breakdown.weight * 100).toFixed()}%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            min({company.total_reviews} ÷ 10, 1) = {company.score_breakdown.weight.toFixed(2)}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center">
                            <span>3. Recent Review Bonus ({company.score_breakdown.recent_negative_count} bad reviews)</span>
                            <span className="font-medium">+{company.score_breakdown.recent_bonus}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {company.score_breakdown.recent_negative_count} × 5 = {company.score_breakdown.recent_bonus}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center font-medium">
                            <span>Final Score</span>
                            <span>{company.shame_score?.toFixed(1)}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ({company.score_breakdown.base_score.toFixed(1)} × {company.score_breakdown.weight.toFixed(2)}) + {company.score_breakdown.recent_bonus} = {company.shame_score?.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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