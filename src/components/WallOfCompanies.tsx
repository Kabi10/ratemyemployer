'use client'

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fetchCompanyNews, NewsArticle } from '@/lib/newsApi';
import { supabase, isSupabaseConfigured, getSupabaseConfig } from '@/lib/supabaseClient';
import type { CompanyWithReviews } from '@/types/database';
import { EnhancedCompanyCard } from '@/components/EnhancedCompanyCard';
import { CompanyFilters } from '@/components/CompanyFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Trophy, TrendingDown, TrendingUp, Building2, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useIndustryStatistics, useLocationStatistics } from '@/hooks/useMCPQuery';
import { IndustryStatistic, LocationStatistic } from '@/types/mcp';

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
  const [companyNews, setCompanyNews] = useState<{ [key: number]: NewsArticle[] }>({});
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  // MCP-powered statistics hooks
  const {
    data: industryStats,
    loading: industryLoading
  } = useIndustryStatistics({
    enabled: true,
    refreshInterval: 300000 // 5 minutes
  });

  const {
    data: locationStats,
    loading: locationLoading
  } = useLocationStatistics({
    enabled: true,
    refreshInterval: 300000 // 5 minutes
  });

  const [showStats, setShowStats] = useState(false);

  // Fetch companies with ratings
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting companies fetch...');

      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        const config = getSupabaseConfig();
        console.error('Supabase configuration issue:', config);
        throw new Error(
          `Database not configured. Please check your environment variables:\n` +
          `- NEXT_PUBLIC_SUPABASE_URL: ${config.hasUrl ? '✓' : '✗'}\n` +
          `- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${config.hasKey ? '✓' : '✗'}`
        );
      }

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
          reviews (
            id,
            rating,
            title,
            pros,
            cons,
            recommend,
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

        const recommendCount = reviews.filter(review => review.recommend).length;
        const recommendPercentage = reviews.length > 0
          ? Math.round((recommendCount / reviews.length) * 100)
          : 0;

        return {
          ...company,
          average_rating: averageRating,
          recommend_percentage: recommendPercentage,
          review_count: reviews.length,
          reviews
        };
      });

      // Filter companies with at least 3 reviews and a valid average rating
      const companiesWithReviews = processedCompanies.filter(
        company => company.average_rating > 0 && company.reviews && company.reviews.length >= 3
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
      
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      setError(`Failed to fetch ${type === 'fame' ? 'top' : 'low'}-rated companies: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch news for companies
  const fetchNewsForCompanies = async (companies: CompanyWithReviews[]) => {
    const newsData: { [key: number]: NewsArticle[] } = {};
    await Promise.all(
      companies.map(async company => {
        try {
          const articles = await fetchCompanyNews(company.name);
          newsData[company.id] = articles;
        } catch (err) {
          console.error(`Error fetching news for ${company.name}:`, err);
          newsData[company.id] = [];
        }
      })
    );
    setCompanyNews(newsData);
  };
  
  // Process MCP statistics data based on wall type
  const processedIndustryStats = industryStats ? [...industryStats]
    .sort((a, b) => {
      if (type === 'fame') {
        return b.average_rating - a.average_rating;
      } else {
        return a.average_rating - b.average_rating;
      }
    })
    .slice(0, 5) : [];

  const processedLocationStats = locationStats ? [...locationStats]
    .sort((a, b) => {
      if (type === 'fame') {
        return b.average_rating - a.average_rating;
      } else {
        return a.average_rating - b.average_rating;
      }
    })
    .slice(0, 5) : [];
  
  useEffect(() => {
    // Extract unique locations from companies
    if (companies.length > 0) {
      const uniqueLocations = Array.from(new Set(companies.map(company => company.location).filter(Boolean)));
      setLocations(uniqueLocations as string[]);
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
    switch (filters.sortBy) {
      case 'rating-desc':
        filtered = filtered.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'rating-asc':
        filtered = filtered.sort((a, b) => a.average_rating - b.average_rating);
        break;
      case 'reviews-desc':
        filtered = filtered.sort((a, b) => b.review_count - a.review_count);
        break;
      case 'name-asc':
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recommend-desc':
        filtered = filtered.sort((a, b) => (b.recommend_percentage || 0) - (a.recommend_percentage || 0));
        break;
      default:
        // Default to rating-desc for fame, rating-asc for shame
        filtered = filtered.sort((a, b) =>
          type === 'fame'
            ? b.average_rating - a.average_rating
            : a.average_rating - b.average_rating
        );
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
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No companies found</h2>
            <p className="text-gray-600 mb-4">
              There are not enough companies with reviews to display on the {title}.
            </p>
            <Button asChild>
              <a href="/companies">Browse All Companies</a>
            </Button>
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
          className="flex flex-col mb-8"
        >
          <div className="flex items-center">
            {styles.icon}
            <h1 className={`text-4xl font-bold ${styles.textColor}`}>{title}</h1>
          </div>
          <p className="mt-2 text-gray-600 max-w-3xl">
            {description}
          </p>
        </motion.div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className={`${styles.statsColor} border`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {styles.statsIcon}
                  <span className="text-3xl font-bold ml-2">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : stats.totalCompanies}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className={`${styles.statsColor} border`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {styles.statsIcon}
                  <span className="text-3xl font-bold ml-2">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : stats.totalReviews}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className={`${styles.statsColor} border`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {styles.statsIcon}
                  <span className="text-3xl font-bold ml-2">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      stats.averageRating.toFixed(1)
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Detailed Statistics Toggle */}
        <div className="mb-8">
          <Button 
            onClick={() => setShowStats(!showStats)}
            variant="outline"
            className="mb-4"
          >
            {showStats ? 'Hide Detailed Statistics' : 'Show Detailed Statistics'}
          </Button>
          
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Industry Statistics */}
              {industryStats?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {type === 'fame' ? 'Top Rated Industries' : 'Lowest Rated Industries'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {industryLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : processedIndustryStats.map((stat) => (
                      <div key={stat.industry} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{stat.industry}</span>
                          <span className={getRatingColor(stat.average_rating)}>
                            {stat.average_rating.toFixed(1)}
                            {type === 'fame' ? (
                              <TrendingUp className="ml-1 inline h-4 w-4" />
                            ) : (
                              <TrendingDown className="ml-1 inline h-4 w-4" />
                            )}
                          </span>
                        </div>
                        <Progress 
                          value={stat.average_rating * 20} 
                          className="h-2"
                          indicatorClassName={getProgressColor(stat.average_rating)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stat.company_count} companies</span>
                          <span>{stat.review_count} reviews</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {/* Location Statistics */}
              {locationStats?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {type === 'fame' ? 'Top Rated Locations' : 'Lowest Rated Locations'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {locationLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : processedLocationStats.map((stat) => (
                      <div key={stat.location} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{stat.location}</span>
                          <span className={getRatingColor(stat.average_rating)}>
                            {stat.average_rating.toFixed(1)}
                            {type === 'fame' ? (
                              <TrendingUp className="ml-1 inline h-4 w-4" />
                            ) : (
                              <TrendingDown className="ml-1 inline h-4 w-4" />
                            )}
                          </span>
                        </div>
                        <Progress 
                          value={stat.average_rating * 20} 
                          className="h-2"
                          indicatorClassName={getProgressColor(stat.average_rating)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stat.company_count} companies</span>
                          <span>{stat.review_count} reviews</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              

            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="mb-8">
          <CompanyFilters
            industries={industries}
            locations={locations}
            onFiltersChange={handleFiltersChange}
            initialFilters={{
              search: searchTerm,
              industry: selectedIndustry,
              sortBy: type === 'fame' ? 'rating-desc' : 'rating-asc',
            }}
            showSortOptions={true}
          />
        </div>
        
        {/* Industry Tabs */}
        {industries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mb-8"
          >
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-4 flex flex-wrap">
                <TabsTrigger value="all">All Industries</TabsTrigger>
                {industries.map(industry => (
                  <TabsTrigger key={industry} value={industry}>
                    {industry}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>
        )}
        
        {/* Company Cards */}
        <div className="space-y-8">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company, index) => (
              <EnhancedCompanyCard
                key={company.id}
                company={company}
                rank={index + 1}
                news={companyNews[company.id] || []}
                isWallOfFame={type === 'fame'}
              />
            ))
          ) : (
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">No matching companies</h2>
              <p className="text-gray-600">
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 