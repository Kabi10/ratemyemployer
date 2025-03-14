'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import { fetchCompanyNews, fetchNewsForCompanies, NewsArticle } from '@/lib/newsApi';
import { fetchNewsWithKluster } from '@/lib/klusterAi';
import type { Company, Review, CompanyWithReviews } from '@/types/database';

interface CompanyWithShameData extends CompanyWithReviews {
  shame_score?: number;
  score_breakdown?: {
    base_score: number;
    weight: number;
    recent_negative_count: number;
    recent_bonus: number;
  };
  recent_reviews?: Review[];
}

export default function WallOfShame() {
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
    async function fetchCompanies() {
      try {
        console.log('Fetching companies...');
        
        // First, let's check what reviews we have
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*');

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          throw new Error(reviewsError.message);
        }

        console.log('All reviews:', reviewsData?.map(r => ({
          id: r.id,
          company_id: r.company_id,
          rating: r.rating,
          created_at: r.created_at
        })));
        
        // Fetch companies with their reviews
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select(`
            id,
            name,
            industry,
            location,
            description,
            logo_url,
            website,
            created_at,
            updated_at,
            reviews (
              id,
              rating,
              pros,
              cons,
              position,
              employment_status,
              is_current_employee,
              created_at,
              updated_at,
              status,
              user_id
            )
          `)
          .eq('reviews.status', 'approved');

        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
          throw new Error(companiesError.message);
        }

        if (!companiesData || companiesData.length === 0) {
          console.log('No companies found');
          setCompanies([]);
          return;
        }

        console.log('Raw companies data:', companiesData.map(c => ({
          id: c.id,
          name: c.name,
          reviewCount: c.reviews?.length || 0
        })));

        // Process companies and calculate ratings
        const processedCompanies = companiesData
          .map(company => {
            // Calculate average rating and total reviews
            const reviews = (company.reviews || []).map(review => ({
              id: review.id,
              rating: review.rating,
              pros: review.pros || '',
              cons: review.cons || '',
              position: review.position || '',
              employment_status: review.employment_status,
              is_current_employee: review.is_current_employee,
              company_id: company.id,
              user_id: review.user_id || null,
              created_at: review.created_at,
              updated_at: review.updated_at || null
            }));
            const totalReviews = reviews.length;
            
            // Log individual review ratings for this company
            console.log(`Reviews for ${company.name}:`, reviews.map(r => ({
              id: r.id,
              rating: r.rating,
              created_at: r.created_at
            })));

            const averageRating = totalReviews > 0
              ? reviews.reduce((sum, review) => {
                  const rating = Number(review.rating);
                  if (isNaN(rating)) {
                    console.warn(`Invalid rating for review ${review.id} in company ${company.name}`);
                    return sum;
                  }
                  return sum + rating;
                }, 0) / totalReviews
              : 0;

            console.log(`Company ${company.name}: ${totalReviews} reviews, avg rating ${averageRating.toFixed(1)}`);

            const processedCompany: CompanyWithShameData = {
              id: company.id,
              name: company.name,
              industry: company.industry,
              location: company.location,
              description: company.description,
              logo_url: company.logo_url,
              website: company.website,
              created_at: company.created_at,
              updated_at: company.updated_at,
              reviews: reviews,
              average_rating: averageRating,
              total_reviews: totalReviews
            };

            return processedCompany;
          })
          .filter(company => company.total_reviews > 0); // Only include companies with reviews

        console.log('Processed companies:', processedCompanies.map(c => ({
          name: c.name,
          totalReviews: c.total_reviews,
          avgRating: c.average_rating.toFixed(1)
        })));

        // Calculate shame score for companies with reviews
        const companiesWithScore = processedCompanies.map(company => {
          const shameScore = calculateShameScore(company);
          console.log(`Calculated shame score for ${company.name}: ${shameScore}`);
          
          return {
            ...company,
            shame_score: shameScore,
            recent_reviews: company.reviews
              ?.filter(review => review.rating <= 2)
              ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              ?.slice(0, 3)
          };
        });

        // Sort by shame score and take top 5
        const sortedCompanies = companiesWithScore
          .sort((a, b) => (b.shame_score || 0) - (a.shame_score || 0))
          .slice(0, 5);

        console.log('Final top 5 companies:', sortedCompanies.map(c => ({ 
          name: c.name, 
          score: c.shame_score,
          avgRating: c.average_rating.toFixed(1),
          totalReviews: c.total_reviews,
          recentBadReviews: c.recent_reviews?.length || 0
        })));
        
        setCompanies(sortedCompanies);

        // Fetch news for each company
        sortedCompanies.forEach(async (company) => {
          try {
            setLoadingNews(prev => ({ ...prev, [company.name]: true }));
            const news = await fetchNewsWithKluster(company.name);
            setCompanyNews(prev => ({ ...prev, [company.name]: news }));
          } catch (newsError) {
            console.error(`Error fetching news for ${company.name}:`, newsError);
          } finally {
            setLoadingNews(prev => ({ ...prev, [company.name]: false }));
          }
        });
      } catch (err) {
        console.error('Error in fetchCompanies:', err);
        setError(err instanceof Error ? err.message : 'Failed to load the Wall of Shame. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  function calculateShameScore(company: CompanyWithShameData): number {
    if (!company.average_rating || !company.total_reviews) {
      console.log(`Skipping shame score calculation for ${company.name} - missing rating or reviews`);
      return 0;
    }

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

    const finalScore = (ratingScore * reviewWeight) + recentReviewBonus;

    console.log(`Shame score breakdown for ${company.name}:`, {
      ratingScore,
      reviewWeight,
      recentNegativeReviews,
      recentReviewBonus,
      finalScore
    });

    // Store the breakdown for display
    company.score_breakdown = {
      base_score: ratingScore,
      weight: reviewWeight,
      recent_negative_count: recentNegativeReviews,
      recent_bonus: recentReviewBonus
    };

    return finalScore;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Wall of Shame</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
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

  if (companies.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">Wall of Shame</h1>
        
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="mb-4">
                <span role="img" aria-label="celebration" className="text-4xl">🎉</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Good News!</h2>
              <p className="text-gray-600">
                Currently, all companies have positive ratings. There are no companies that qualify for the Wall of Shame.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Companies appear here only when they have consistently poor ratings (2 stars or below) or recent negative reviews.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <div className="bg-gray-50 rounded-lg">
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-500">Wall of Shame</h1>
        <button
          onClick={() => setIsExplanationOpen(!isExplanationOpen)}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          How are scores calculated?
          {isExplanationOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </div>

      {isExplanationOpen && (
        <Alert>
          <AlertDescription className="text-sm">
            The shame score is calculated based on several factors:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Average rating (lower ratings increase the score)</li>
              <li>Number of reviews (more reviews give the score more weight)</li>
              <li>Recent negative reviews (reviews in the last 6 months have extra impact)</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {companies.map((company, index) => (
          <Card key={company.id} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-16 h-16 bg-red-600 dark:bg-red-500 transform -rotate-45 -translate-x-8 -translate-y-8" />
            <div className="absolute top-1 left-1 text-white font-bold">#{index + 1}</div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{company.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{company.industry}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Shame Score:</span>
                      <span className="font-bold text-red-600 dark:text-red-500">
                        {company.shame_score?.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Rating:</span>
                      <span className="font-bold">
                        {company.average_rating?.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Reviews:</span>
                      <span>{company.total_reviews}</span>
                    </div>
                  </div>

                  {company.recent_reviews && company.recent_reviews.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Recent Poor Reviews:</h3>
                      <div className="space-y-3">
                        {company.recent_reviews.map((review) => (
                          <div key={review.id} className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{review.position}</span>
                              <span className="text-red-600 dark:text-red-500">{review.rating}/5</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">{review.cons}</p>
                            <div className="mt-1 text-xs text-gray-500">
                              {formatEmploymentStatus(review.employment_status)}
                              {review.is_current_employee !== null && (
                                <span> • {review.is_current_employee ? 'Current Employee' : 'Former Employee'}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Recent News:</h3>
                  {loadingNews[company.name] ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : companyNews[company.name]?.length > 0 ? (
                    <div className="space-y-3">
                      {companyNews[company.name].map((article, i) => (
                        article.url ? (
                          <a
                            key={i}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-gray-50 dark:bg-gray-800 p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-medium text-sm">{article.title}</h4>
                              <ExternalLinkIcon className="h-4 w-4 flex-shrink-0 mt-1" />
                            </div>
                            {article.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {article.description}
                              </p>
                            )}
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                              <span>{article.source.name}</span>
                              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            </div>
                          </a>
                        ) : (
                          <div
                            key={i}
                            className="block bg-gray-50 dark:bg-gray-800 p-3 rounded"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-medium text-sm">{article.title}</h4>
                            </div>
                            {article.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {article.description}
                              </p>
                            )}
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                              <span>{article.source.name}</span>
                              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent news articles found.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}