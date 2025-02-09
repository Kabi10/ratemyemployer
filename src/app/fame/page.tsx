'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import type { Company, Review } from '@/types/database';

interface CompanyWithStats extends Company {
  average_rating: number;
  total_reviews: number;
}

export default function WallOfFame() {
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyNews, setCompanyNews] = useState<{ [key: string]: NewsArticle[] }>({});

  useEffect(() => {
    fetchTopCompanies();
  }, []);

  const fetchTopCompanies = async () => {
    try {
      console.log('Starting companies fetch...');

      // First, test a simple query
      const { data: testData, error: testError } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1);

      console.log('Test query result:', { testData, testError });

      if (testError) {
        console.error('Test query error:', {
          code: testError.code,
          message: testError.message,
          details: testError.details
        });
        throw testError;
      }

      // If test succeeds, try the full query
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          industry,
          location,
          website,
          description,
          logo_url,
          created_at,
          updated_at,
          reviews (
            id,
            rating,
            status
          )
        `)
        .eq('reviews.status', 'approved');

      console.log('Full query response:', { companiesData, companiesError });

      if (companiesError) {
        console.error('Full query error:', {
          code: companiesError.code,
          message: companiesError.message,
          details: companiesError.details
        });
        throw companiesError;
      }

      if (!companiesData) {
        console.log('No companies found');
        setCompanies([]);
        return;
      }

      // Process companies...
      const processedCompanies = companiesData
        .map(company => {
          const reviews = (company.reviews || []).filter(r => r.status === 'approved');
          const totalReviews = reviews.length;
          
          const averageRating = totalReviews > 0
            ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / totalReviews
            : 0;

          return {
            ...company,
            average_rating: averageRating,
            total_reviews: totalReviews,
            created_at: company.created_at,
            updated_at: company.updated_at,
          };
        })
        .filter(company => company.total_reviews > 0 && company.average_rating > 4.0)
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 10);

      console.log('Processed companies:', processedCompanies.map(c => ({
        name: c.name,
        avgRating: c.average_rating.toFixed(1),
        totalReviews: c.total_reviews
      })));

      setCompanies(processedCompanies);
      
      if (processedCompanies.length > 0) {
        fetchNewsForTopCompanies(processedCompanies);
      }
    } catch (err) {
      console.error('Error in fetchTopCompanies:', err);
      setError('Failed to fetch top companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsForTopCompanies = async (companies: CompanyWithStats[]) => {
    const newsData: { [key: string]: NewsArticle[] } = {};
    for (const company of companies) {
      try {
        const articles = await fetchCompanyNews(company.name);
        newsData[company.name] = articles;
      } catch (err) {
        console.error(`Error fetching news for ${company.name}:`, err);
        newsData[company.name] = [];
      }
    }
    setCompanyNews(newsData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-800 mb-8">Wall of Fame</h1>
          <div className="space-y-8">
            <div className="h-32 bg-white/50 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-white/50 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-800 mb-8">Wall of Fame</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-800 mb-8">Wall of Fame</h1>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">No Top-Rated Companies Yet</h2>
              <p className="text-blue-700">
                Companies with an average rating above 4.0 stars will be featured here.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-800 mb-8">Wall of Fame</h1>
        <p className="text-lg text-blue-700 mb-8">
          Celebrating companies that prioritize employee well-being, maintain excellent workplace practices, 
          and consistently receive high ratings from their workforce.
        </p>

        <div className="space-y-8">
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-blue-900">{company.name}</h2>
                  <div className="flex items-center mt-2">
                    <span className="text-lg font-medium text-blue-600">
                      Rating: {company.average_rating.toFixed(1)}
                    </span>
                    <span className="mx-2 text-blue-300">•</span>
                    <span className="text-blue-600">
                      {company.total_reviews} reviews
                    </span>
                  </div>
                  {company.industry && (
                    <div className="mt-1 text-blue-600">
                      Industry: {company.industry}
                    </div>
                  )}
                  {company.location && (
                    <div className="mt-1 text-blue-600">
                      Location: {company.location}
                    </div>
                  )}
                </div>
                <img src={company.logo_url} alt={`${company.name} logo`} className="w-16 h-16 rounded-full" />
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Recent News</h3>
                {companyNews[company.name]?.length > 0 ? (
                  <div className="space-y-3">
                    {companyNews[company.name].map((article, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-50 border border-blue-100 rounded-md p-4"
                      >
                        <h4 className="font-medium text-blue-900">{article.title}</h4>
                        <p className="text-blue-700 mt-1">{article.description}</p>
                        <div className="mt-2 text-sm text-blue-600">
                          <span>{article.source.name}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-blue-600 italic">
                    No recent news available for this company.
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}