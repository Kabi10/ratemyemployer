'use client'

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fetchCompanyNews, NewsArticle } from '@/lib/newsApi';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import type { Company, CompanyWithReviews } from '@/types/database';
import { EnhancedCompanyCard } from '@/components/EnhancedCompanyCard';
import { CompanyFilters, CompanyFilters as CompanyFiltersType } from '@/components/CompanyFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';

export default function WallOfFame() {
  const [companies, setCompanies] = useState<CompanyWithReviews[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyNews, setCompanyNews] = useState<{ [key: string]: NewsArticle[] }>({});
  const [industries, setIndustries] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Fetch companies with high ratings
  const fetchTopCompanies = async () => {
    try {
      setLoading(true);
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
          description,
          logo_url,
          website_url,
          size,
          founded_year,
          reviews (
            id,
            rating,
            title,
            pros,
            cons,
            recommend,
            created_at
          )
        `)
        .order('id', { ascending: true });

      if (companiesError) {
        console.error('Companies query error:', {
          code: companiesError.code,
          message: companiesError.message,
          details: companiesError.details
        });
        throw companiesError;
      }

      if (!companiesData || companiesData.length === 0) {
        console.log('No companies found');
        setCompanies([]);
        setFilteredCompanies([]);
        return;
      }

      console.log(`Found ${companiesData.length} companies`);

      // Process companies to calculate average ratings and other metrics
      const processedCompanies: CompanyWithReviews[] = companiesData.map(company => {
        const reviews = company.reviews || [];
        const validRatings = reviews.filter(review => review.rating >= 1 && review.rating <= 5);
        
        const averageRating = validRatings.length > 0
          ? validRatings.reduce((sum, review) => sum + review.rating, 0) / validRatings.length
          : 0;
        
        const recommendCount = reviews.filter(review => review.recommend).length;
        const recommendPercentage = reviews.length > 0
          ? Math.round((recommendCount / reviews.length) * 100)
          : 0;
        
        return {
          ...company,
          average_rating: averageRating,
          recommend_percentage: recommendPercentage
        };
      });

      // Sort by average rating (highest first)
      const sortedCompanies = processedCompanies
        .filter(company => company.average_rating > 0)
        .sort((a, b) => b.average_rating - a.average_rating);

      // Get top 10 companies
      const topCompanies = sortedCompanies.slice(0, 10);
      
      // Extract unique industries
      const uniqueIndustries = Array.from(
        new Set(processedCompanies.map(company => company.industry).filter(Boolean))
      ) as string[];
      
      setIndustries(uniqueIndustries);
      setCompanies(topCompanies);
      setFilteredCompanies(topCompanies);
      
      // Fetch news for top companies
      fetchNewsForTopCompanies(topCompanies);
      
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError('Failed to fetch top companies');
    } finally {
      setLoading(false);
    }
  };

  // Fetch news for top companies
  const fetchNewsForTopCompanies = async (companies: CompanyWithReviews[]) => {
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
  
  // Handle filter changes
  const handleFiltersChange = useCallback((filters: CompanyFiltersType) => {
    let filtered = [...companies];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchLower) ||
        (company.description && company.description.toLowerCase().includes(searchLower)) ||
        (company.industry && company.industry.toLowerCase().includes(searchLower)) ||
        (company.location && company.location.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply industry filter
    if (filters.industry) {
      filtered = filtered.filter(company => company.industry === filters.industry);
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'rating-desc':
        filtered.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'rating-asc':
        filtered.sort((a, b) => a.average_rating - b.average_rating);
        break;
      case 'reviews-desc':
        filtered.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    setFilteredCompanies(filtered);
  }, [companies]);
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === 'all') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company => company.industry === value);
      setFilteredCompanies(filtered);
    }
  };

  useEffect(() => {
    fetchTopCompanies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center mb-8"
          >
            <Trophy className="h-8 w-8 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold text-blue-800">Wall of Fame</h1>
          </motion.div>
          
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white/50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Trophy className="h-8 w-8 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold text-blue-800">Wall of Fame</h1>
          </div>
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
          <div className="flex items-center mb-8">
            <Trophy className="h-8 w-8 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold text-blue-800">Wall of Fame</h1>
          </div>
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Top-Rated Companies Yet</h2>
            <p className="text-gray-600">
              As more reviews are added, top-rated companies will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-8"
        >
          <Trophy className="h-8 w-8 text-amber-500 mr-3" />
          <h1 className="text-4xl font-bold text-blue-800">Wall of Fame</h1>
        </motion.div>
        
        <div className="mb-8">
          <p className="text-lg text-blue-700 mb-4">
            Discover the highest-rated employers based on employee reviews. These companies have earned their place on our Wall of Fame through exceptional workplace practices and employee satisfaction.
          </p>
        </div>
        
        <CompanyFilters 
          industries={industries}
          onFiltersChange={handleFiltersChange}
        />
        
        {industries.length > 0 && (
          <Tabs defaultValue="all" className="mb-8" onValueChange={handleTabChange}>
            <TabsList className="mb-4 flex flex-wrap h-auto">
              <TabsTrigger value="all">All Industries</TabsTrigger>
              {industries.slice(0, 5).map(industry => (
                <TabsTrigger key={industry} value={industry}>
                  {industry}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        
        <div className="space-y-8">
          {filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Companies Match Your Filters</h2>
              <p className="text-gray-600">
                Try adjusting your search criteria to see more results.
              </p>
            </div>
          ) : (
            filteredCompanies.map((company, index) => (
              <EnhancedCompanyCard
                key={company.id}
                company={company}
                rank={index + 1}
                news={companyNews[company.name] || []}
                isWallOfFame={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}