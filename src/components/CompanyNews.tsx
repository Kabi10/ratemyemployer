'use client';

import { useEffect, useState } from 'react';
import { fetchCompanyNews, type NewsArticle } from '@/lib/newsApi';

interface CompanyNewsProps {
  companyName: string;
}

export function CompanyNews({ companyName }: CompanyNewsProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      const articles = await fetchCompanyNews(companyName);
      setNews(articles);
      setLoading(false);
    }

    loadNews();
  }, [companyName]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No workplace violations or issues found for {companyName}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((article, index) => (
        <article 
          key={index} 
          className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
        >
          <h3 className="font-semibold text-lg mb-2 text-red-700 dark:text-red-400">
            {article.title}
          </h3>
          {article.description && (
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
              {article.description}
            </p>
          )}
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">{article.source.name}</span>
            <time dateTime={article.publishedAt} className="text-red-600 dark:text-red-400">
              {new Date(article.publishedAt).toLocaleDateString()}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
}