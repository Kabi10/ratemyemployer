'use client'

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fetchCompanyNews, NewsArticle } from '@/lib/newsApi';
import { supabase } from '@/lib/supabaseClient';
import type { CompanyWithReviews } from '@/types/database';
import { EnhancedCompanyCard } from '@/components/EnhancedCompanyCard';
import { CompanyFilters } from '@/components/CompanyFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Trophy, TrendingDown, TrendingUp, Building2, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface WallOfCompaniesProps {
  type: 'fame' | 'shame';
  title: string;
  description: string;
  limit?: number;
}

export function WallOfCompanies({ 
  type, 
  title, 
  description,
  limit = 10
}: WallOfCompaniesProps) {
  const [companies, setCompanies] = useState<CompanyWithReviews[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyNews, setCompanyNews] = useState<{ [key: string]: NewsArticle[] }>({});
  const [industries, setIndustries] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalCompanies: number;
    totalReviews: number;
    averageRating: number;
  }>({
    totalCompanies: 0,
    totalReviews: 0,
    averageRating: 0
  });
  const [locations, setLocations] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  
  // New state for statistics
  const [industryStats, setIndustryStats] = useState<any[]>([]);
  const [locationStats, setLocationStats] = useState<any[]>([]);
  const [sizeStats, setSizeStats] = useState<any[]>([]);
  const [showStats, setShowStats] = useState(false);

  // Fetch companies with ratings
  const fetchCompanies = async () => {
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
          website,
          size,
          founded_year,
          reviews (
            id,
            rating,
            title,
            pros,
            cons,
            created_at,
            status
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
        // Only include approved reviews
        const reviews = (company.reviews || []).filter(review => review.status === 'approved');
        const validRatings = reviews.filter(review => review.rating >= 1 && review.rating <= 5);
        
        const averageRating = validRatings.length > 0
          ? validRatings.reduce((sum, review) => sum + review.rating, 0) / validRatings.length
          : 0;
        
        // Use a default recommendation percentage since the field doesn't exist
        const recommendPercentage = 0;
        
        return {
          ...company,
          average_rating: averageRating,
          recommend_percentage: recommendPercentage,
          reviews: reviews
        };
      });

      // Filter companies with at least 1 review and a valid average rating
      const companiesWithReviews = processedCompanies.filter(
        company => company.average_rating > 0 && company.reviews && company.reviews.length >= 1
      );

      // Sort by average rating (highest or lowest first based on type)
      const sortedCompanies = type === 'fame'
        ? companiesWithReviews.sort((a, b) => b.average_rating - a.average_rating)
        : companiesWithReviews.sort((a, b) => a.average_rating - b.average_rating);

      // Get top/bottom companies
      const selectedCompanies = sortedCompanies.slice(0, limit);
      
      // Extract unique industries
      const uniqueIndustries = Array.from(
        new Set(processedCompanies.map(company => company.industry).filter(Boolean))
      ) as string[];
      
      setIndustries(uniqueIndustries);
      setCompanies(selectedCompanies);
      setFilteredCompanies(selectedCompanies);
      
      // Calculate stats
      const totalReviews = companiesWithReviews.reduce(
        (sum, company) => sum + (company.reviews?.length || 0), 
        0
      );
      
      const overallAverageRating = companiesWithReviews.length > 0
        ? companiesWithReviews.reduce((sum, company) => sum + company.average_rating, 0) / companiesWithReviews.length
        : 0;
        
      setStats({
        totalCompanies: companiesWithReviews.length,
        totalReviews,
        averageRating: overallAverageRating
      });
      setStatsLoading(false);
      
      // Fetch news for companies
      fetchNewsForCompanies(selectedCompanies);
      
      // Fetch statistics
      fetchStatistics();
      
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError(`Failed to fetch ${type === 'fame' ? 'top' : 'low'}-rated companies`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch news for companies
  const fetchNewsForCompanies = async (companies: CompanyWithReviews[]) => {
    try {
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
    } catch (err) {
      console.error('Error in fetchNewsForCompanies:', err);
      setCompanyNews({});
    }
  };
  
  // Fetch statistics using direct queries instead of stored procedures
  const fetchStatistics = async () => {
    try {
      // Fetch industry statistics
      const { data: industryData, error: industryError } = await supabase
        .from('companies')
        .select(`
          industry,
          reviews!inner (
            rating
          )
        `)
        .not('industry', 'is', null);
      
      if (industryError) {
        console.error('Error fetching industry statistics:', industryError);
        setIndustryStats([]);
      } else {
        // Process the data to get statistics
        const industryStats = processIndustryStats(industryData);
        
        // Sort based on type (fame = highest ratings first, shame = lowest ratings first)
        const sortedIndustryData = [...industryStats].sort((a, b) => {
          if (type === 'fame') {
            return b.average_rating - a.average_rating;
          } else {
            return a.average_rating - b.average_rating;
          }
        });
        
        setIndustryStats(sortedIndustryData.slice(0, 5));
      }
      
      // Fetch location statistics
      const { data: locationData, error: locationError } = await supabase
        .from('companies')
        .select(`
          location,
          reviews!inner (
            rating
          )
        `)
        .not('location', 'is', null);
      
      if (locationError) {
        console.error('Error fetching location statistics:', locationError);
        setLocationStats([]);
      } else {
        // Process the data to get statistics
        const locationStats = processLocationStats(locationData);
        
        // Sort based on type
        const sortedLocationData = [...locationStats].sort((a, b) => {
          if (type === 'fame') {
            return b.average_rating - a.average_rating;
          } else {
            return a.average_rating - b.average_rating;
          }
        });
        
        setLocationStats(sortedLocationData.slice(0, 5));
      }
      
      // Fetch size statistics
      const { data: sizeData, error: sizeError } = await supabase
        .from('companies')
        .select(`
          size,
          reviews!inner (
            rating
          )
        `)
        .not('size', 'is', null);
      
      if (sizeError) {
        console.error('Error fetching size statistics:', sizeError);
        setSizeStats([]);
      } else {
        // Process the data to get statistics
        const sizeStats = processSizeStats(sizeData);
        
        // Sort based on type
        const sortedSizeData = [...sizeStats].sort((a, b) => {
          if (type === 'fame') {
            return b.average_rating - a.average_rating;
          } else {
            return a.average_rating - b.average_rating;
          }
        });
        
        setSizeStats(sortedSizeData.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      // Set empty arrays for all statistics
      setIndustryStats([]);
      setLocationStats([]);
      setSizeStats([]);
    }
  };
  
  // Helper function to process industry statistics
  const processIndustryStats = (data: any[]) => {
    const industryMap = new Map<string, { 
      ratings: number[], 
      companies: Set<number>,
      reviews: number
    }>();
    
    // Group by industry
    data.forEach(item => {
      const industry = item.industry;
      if (!industryMap.has(industry)) {
        industryMap.set(industry, { 
          ratings: [], 
          companies: new Set(),
          reviews: 0
        });
      }
      
      const stats = industryMap.get(industry)!;
      stats.companies.add(item.id);
      item.reviews.forEach((review: any) => {
        stats.ratings.push(review.rating);
        stats.reviews++;
      });
    });
    
    // Calculate statistics
    return Array.from(industryMap.entries()).map(([industry, stats]) => {
      const average_rating = stats.ratings.length > 0
        ? stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length
        : 0;
        
      return {
        industry,
        average_rating,
        company_count: stats.companies.size,
        review_count: stats.reviews
      };
    });
  };
  
  // Helper function to process location statistics
  const processLocationStats = (data: any[]) => {
    const locationMap = new Map<string, { 
      ratings: number[], 
      companies: Set<number>,
      reviews: number
    }>();
    
    // Group by location
    data.forEach(item => {
      const location = item.location;
      if (!locationMap.has(location)) {
        locationMap.set(location, { 
          ratings: [], 
          companies: new Set(),
          reviews: 0
        });
      }
      
      const stats = locationMap.get(location)!;
      stats.companies.add(item.id);
      item.reviews.forEach((review: any) => {
        stats.ratings.push(review.rating);
        stats.reviews++;
      });
    });
    
    // Calculate statistics
    return Array.from(locationMap.entries()).map(([location, stats]) => {
      const average_rating = stats.ratings.length > 0
        ? stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length
        : 0;
        
      return {
        location,
        average_rating,
        company_count: stats.companies.size,
        review_count: stats.reviews
      };
    });
  };
  
  // Helper function to process size statistics
  const processSizeStats = (data: any[]) => {
    const sizeMap = new Map<string, { 
      ratings: number[], 
      companies: Set<number>,
      reviews: number
    }>();
    
    // Group by size
    data.forEach(item => {
      const size = item.size;
      if (!sizeMap.has(size)) {
        sizeMap.set(size, { 
          ratings: [], 
          companies: new Set(),
          reviews: 0
        });
      }
      
      const stats = sizeMap.get(size)!;
      stats.companies.add(item.id);
      item.reviews.forEach((review: any) => {
        stats.ratings.push(review.rating);
        stats.reviews++;
      });
    });
    
    // Calculate statistics
    return Array.from(sizeMap.entries()).map(([size, stats]) => {
      const average_rating = stats.ratings.length > 0
        ? stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length
        : 0;
        
      return {
        size,
        average_rating,
        company_count: stats.companies.size,
        review_count: stats.reviews
      };
    });
  };

  useEffect(() => {
    // Extract unique locations and sizes from companies
    if (companies.length > 0) {
      const uniqueLocations = Array.from(new Set(companies.map(company => company.location).filter(Boolean)));
      const uniqueSizes = Array.from(new Set(companies.map(company => company.size).filter(Boolean)));
      
      setLocations(uniqueLocations as string[]);
      setSizes(uniqueSizes as string[]);
    }
  }, [companies]);

  const handleFiltersChange = useCallback((filters: any) => {
    setSearchTerm(filters.search || '');
    setSelectedIndustry(filters.industry || '');
    setSortBy(filters.sortBy || 'rating');
    
    let filtered = [...companies];
    
    // Filter by search term
    if (filters.search) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Filter by industry
    if (filters.industry) {
      filtered = filtered.filter(company => 
        company.industry === filters.industry
      );
    }
    
    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(company => 
        company.location === filters.location
      );
    }
    
    // Filter by size
    if (filters.size) {
      filtered = filtered.filter(company => 
        company.size === filters.size
      );
    }
    
    // Filter by rating range
    if (filters.minRating !== undefined) {
      filtered = filtered.filter(company => 
        company.average_rating >= filters.minRating
      );
    }
    
    if (filters.maxRating !== undefined) {
      filtered = filtered.filter(company => 
        company.average_rating <= filters.maxRating
      );
    }
    
    // Filter by news availability
    if (filters.hasNews) {
      filtered = filtered.filter(company => 
        companyNews[company.id]?.length > 0
      );
    }
    
    // Sort companies
    if (filters.sortBy === 'rating') {
      filtered = filtered.sort((a, b) => 
        type === 'fame' 
          ? b.average_rating - a.average_rating 
          : a.average_rating - b.average_rating
      );
    } else if (filters.sortBy === 'reviews') {
      filtered = filtered.sort((a, b) => b.review_count - a.review_count);
    } else if (filters.sortBy === 'name') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setFilteredCompanies(filtered);
  }, [companies, companyNews, type]);
  
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
    fetchCompanies();
  }, [type]);

  // Get the appropriate icon and colors based on type
  const getTypeStyles = () => {
    if (type === 'fame') {
      return {
        icon: <Trophy className="h-8 w-8 text-amber-500 mr-3" />,
        gradient: 'from-blue-50 to-blue-100',
        textColor: 'text-blue-800',
        statsIcon: <TrendingUp className="h-5 w-5 text-green-500" />,
        statsColor: 'bg-blue-50 border-blue-200'
      };
    } else {
      return {
        icon: <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />,
        gradient: 'from-red-50 to-red-100',
        textColor: 'text-red-800',
        statsIcon: <TrendingDown className="h-5 w-5 text-red-500" />,
        statsColor: 'bg-red-50 border-red-200'
      };
    }
  };
  
  const getRatingColor = (rating: number) => {
    if (rating < 2.5) return 'text-red-500';
    if (rating < 3.5) return 'text-amber-500';
    return 'text-green-500';
  };
  
  const getProgressColor = (rating: number) => {
    if (rating < 2.5) return 'bg-red-500';
    if (rating < 3.5) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const styles = getTypeStyles();

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${styles.gradient} p-8`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center mb-8"
          >
            {styles.icon}
            <h1 className={`text-4xl font-bold ${styles.textColor}`}>{title}</h1>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${styles.gradient} p-8`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            {styles.icon}
            <h1 className={`text-4xl font-bold ${styles.textColor}`}>{title}</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
            <div className="mt-4">
              <Button onClick={fetchCompanies}>Retry</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${styles.gradient} p-8`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            {styles.icon}
            <h1 className={`text-4xl font-bold ${styles.textColor}`}>{title}</h1>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No companies found with sufficient reviews to display on the {type === 'fame' ? 'Wall of Fame' : 'Wall of Shame'}.
            </p>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Companies need at least one review to be eligible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${styles.gradient} p-8`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-8"
        >
          {styles.icon}
          <h1 className={`text-4xl font-bold ${styles.textColor}`}>{title}</h1>
        </motion.div>
        
        <p className="text-lg mb-6">{description}</p>
        
        {/* Statistics Cards */}
        {!statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className={`${styles.statsColor} border`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalCompanies}</div>
                <p className="text-sm text-gray-500 mt-1">
                  {type === 'fame' ? 'Top-rated' : 'Low-rated'} companies
                </p>
              </CardContent>
            </Card>
            
            <Card className={`${styles.statsColor} border`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalReviews}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Total employee reviews
                </p>
              </CardContent>
            </Card>
            
            <Card className={`${styles.statsColor} border`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  {styles.statsIcon}
                  <span className="ml-2">Average Rating</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  <span className={getRatingColor(stats.averageRating)}>
                    {stats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">/5</span>
                </div>
                <Progress 
                  value={stats.averageRating * 20} 
                  className="h-2 mt-2"
                  indicatorClassName={getProgressColor(stats.averageRating)}
                />
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Filters */}
        <div className="mb-8">
          <CompanyFilters 
            industries={industries}
            locations={locations}
            sizes={sizes}
            onFiltersChange={handleFiltersChange}
            type={type}
          />
        </div>
        
        {/* Industry Tabs */}
        {industries.length > 0 && (
          <Tabs defaultValue="all" className="mb-8" onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Industries</TabsTrigger>
              {industries.map(industry => (
                <TabsTrigger key={industry} value={industry}>
                  {industry}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="space-y-6">
                {filteredCompanies.map((company, index) => (
                  <EnhancedCompanyCard
                    key={company.id}
                    company={company}
                    news={companyNews[company.name] || []}
                    type={type}
                    rank={index < 3 ? index + 1 : undefined}
                  />
                ))}
                
                {filteredCompanies.length === 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No companies match your filter criteria.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {industries.map(industry => (
              <TabsContent key={industry} value={industry} className="mt-0">
                <div className="space-y-6">
                  {filteredCompanies
                    .filter(company => company.industry === industry)
                    .map((company, index) => (
                      <EnhancedCompanyCard
                        key={company.id}
                        company={company}
                        news={companyNews[company.name] || []}
                        type={type}
                        rank={index < 3 ? index + 1 : undefined}
                      />
                    ))}
                    
                  {filteredCompanies.filter(company => company.industry === industry).length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        No companies in this industry match your filter criteria.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}