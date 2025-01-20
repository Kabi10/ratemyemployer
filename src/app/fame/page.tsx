'use client'


import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { fetchCompanyNews, NewsArticle } from '@/lib/newsApi';

import { supabase } from '@/lib/supabaseClient';

import { Database } from '@/types/supabase';

type Company = Database['public']['Tables']['companies']['Row'];

export default function WallOfFame() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyNews, setCompanyNews] = useState<{ [key: string]: NewsArticle[] }>({});

  useEffect(() => {
    fetchTopCompanies();
  }, []);

  const fetchTopCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .gt('average_rating', 4.0)
        .order('average_rating', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setCompanies(data);
        fetchNewsForTopCompanies(data);
      }
    } catch (err) {
      setError('Failed to fetch top companies');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsForTopCompanies = async (companies: Company[]) => {
    const newsData: { [key: string]: NewsArticle[] } = {};
    for (const company of companies) {
      const articles = await fetchCompanyNews(company.name, true);
      newsData[company.name] = articles;
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
                      Rating: {company.rating?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="mx-2 text-blue-300">•</span>
                    <span className="text-blue-600">
                      {company.review_count} reviews
                    </span>
                  </div>
                </div>
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