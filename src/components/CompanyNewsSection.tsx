'use client';

import { useState, useEffect } from 'react';
import { NewsArticle, fetchCompanyNews } from '@/lib/newsApi';
import { NewsCard } from '@/components/NewsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CompanyNewsSectionProps {
  companyName: string;
  initialNews?: NewsArticle[];
}

export function CompanyNewsSection({ companyName, initialNews = [] }: CompanyNewsSectionProps) {
  const [news, setNews] = useState<NewsArticle[]>(initialNews);
  const [loading, setLoading] = useState<boolean>(!initialNews.length);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNews = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    
    try {
      const articles = await fetchCompanyNews(companyName);
      setNews(articles);
    } catch (err) {
      console.error(`Error fetching news for ${companyName}:`, err);
      setError('Failed to load news articles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!initialNews.length) {
      fetchNews();
    }
  }, [companyName, initialNews.length]);

  const handleRefresh = () => {
    fetchNews(true);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Latest News</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={loading || refreshing}
          className="h-8 px-2"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : news.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No recent news found for {companyName}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((article, index) => (
              <NewsCard 
                key={`${article.title}-${index}`} 
                article={article} 
                companyName={companyName} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 