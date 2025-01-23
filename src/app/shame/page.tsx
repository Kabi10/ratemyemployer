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
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('average_rating', { ascending: true })
          .limit(10);

        if (error) throw error;

        // Calculate shame score for each company
        const companiesWithScore = data.map(company => ({
          ...company,
          shame_score: calculateShameScore(company)
        }));

        // Sort by shame score
        const sortedCompanies = companiesWithScore
          .sort((a, b) => (b.shame_score || 0) - (a.shame_score || 0))
          .slice(0, 5); // Only show top 5 worst companies

        setCompanies(sortedCompanies);

        // Fetch news using SerpAPI for all companies at once
        const companyNames = sortedCompanies.map(c => c.name);
        await fetchAndStoreCompanyNews(companyNames, false);
        
        // Get cached news from the database
        const newsResults = await fetchNewsForCompanies(companyNames);
        setCompanyNews(newsResults);
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

    // Base score from poor ratings
    const ratingScore = (5 - company.average_rating) * 20;

    // Weight by number of reviews (more reviews = more reliable score)
    const reviewWeight = Math.min(company.total_reviews / 10, 1); // Cap at 10 reviews

    return ratingScore * reviewWeight;
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
        number of reviews, and recent negative news coverage.
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
              {companyNews[company.name]?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Recent Negative News</h3>
                  <div className="space-y-3">
                    {companyNews[company.name].map((article, index) => (
                      <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {article.title}
                        </a>
                        <p className="mt-1 text-sm text-gray-600">
                          {article.description}
                        </p>
                        <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                          <span>{article.source.name}</span>
                          <span>•</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
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