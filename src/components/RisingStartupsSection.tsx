'use client';

/**
 * Rising Startups Section Component
 * Displays promising startups and rapidly growing companies with growth indicators
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Rocket, 
  Building2, 
  MapPin, 
  Calendar,
  ExternalLink,
  Filter,
  DollarSign,
  Users,
  Award,
  Briefcase,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getRisingStartupCompanies, getGrowthStatistics } from '@/lib/companySectionsApi';
import type { 
  CompanyWithGrowthData, 
  GrowthFilters, 
  GrowthStatistics,
  GrowthIndicatorType 
} from '@/types/companySections';
import { 
  GROWTH_INDICATOR_LABELS, 
  GROWTH_SCORE_LABELS, 
  GROWTH_COLORS,
  getGrowthCategory 
} from '@/types/companySections';

interface RisingStartupsSectionProps {
  limit?: number;
  showFilters?: boolean;
  showStatistics?: boolean;
}

export function RisingStartupsSection({ 
  limit = 20, 
  showFilters = true,
  showStatistics = true 
}: RisingStartupsSectionProps) {
  const [companies, setCompanies] = useState<CompanyWithGrowthData[]>([]);
  const [statistics, setStatistics] = useState<GrowthStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GrowthFilters>({
    sort_by: 'growth_score',
    sort_order: 'desc',
    verified_only: true
  });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [filters, currentPage]);

  useEffect(() => {
    if (showStatistics) {
      fetchStatistics();
    }
  }, [showStatistics]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (currentPage - 1) * itemsPerPage;
      const response = await getRisingStartupCompanies(filters, itemsPerPage, offset);
      
      setCompanies(response.companies);
      setTotalCount(response.total_count);
    } catch (err) {
      console.error('Error fetching rising startups:', err);
      setError('Failed to load rising startups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getGrowthStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching growth statistics:', err);
    }
  };

  const handleFilterChange = (key: keyof GrowthFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement search logic here
  };

  const getGrowthColor = (score: number) => {
    const category = getGrowthCategory(score);
    return GROWTH_COLORS[category];
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Rocket className="h-8 w-8 text-green-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rising Startups
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Discover promising startups and rapidly growing companies. Track funding rounds, 
          expansion plans, and growth indicators to identify the next big opportunities.
        </p>
      </div>

      {/* Statistics Overview */}
      {showStatistics && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Rising Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.total_companies}
              </div>
              <p className="text-xs text-gray-500">
                Companies with growth indicators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Average Growth Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: getGrowthColor(statistics.average_score) }}>
                {statistics.average_score}/100
              </div>
              <Progress 
                value={statistics.average_score} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Total Funding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(statistics.total_funding)}
              </div>
              <p className="text-xs text-gray-500">
                Across all tracked companies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Top Industry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {statistics.by_industry[0]?.industry || 'N/A'}
              </div>
              <p className="text-xs text-gray-500">
                {statistics.by_industry[0]?.count || 0} companies
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Search Companies</label>
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Industry</label>
                <Select 
                  value={filters.industry || ''} 
                  onValueChange={(value) => handleFilterChange('industry', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Industries</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Growth Level</label>
                <Select 
                  value={filters.min_growth_score?.toString() || ''} 
                  onValueChange={(value) => handleFilterChange('min_growth_score', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="25">Moderate+ (25+)</SelectItem>
                    <SelectItem value="50">High+ (50+)</SelectItem>
                    <SelectItem value="75">Exceptional (75+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <Select 
                  value={filters.sort_by || 'growth_score'} 
                  onValueChange={(value) => handleFilterChange('sort_by', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="growth_score">Growth Score</SelectItem>
                    <SelectItem value="latest_funding">Latest Funding</SelectItem>
                    <SelectItem value="indicator_count">Indicator Count</SelectItem>
                    <SelectItem value="company_name">Company Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Companies List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : companies.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Rising Startups Found
              </h3>
              <p className="text-gray-500">
                No companies match your current filters. Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow border-l-4" 
                    style={{ borderLeftColor: getGrowthColor(company.growth_score) }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                            <Rocket className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {company.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {company.industry && (
                              <span className="flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {company.industry}
                              </span>
                            )}
                            {company.location && (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {company.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Growth Score</span>
                          <Badge 
                            variant="outline" 
                            style={{ 
                              borderColor: getGrowthColor(company.growth_score),
                              color: getGrowthColor(company.growth_score)
                            }}
                          >
                            {company.growth_score}/100
                          </Badge>
                        </div>
                        <Progress 
                          value={company.growth_score} 
                          className="h-2"
                        />

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {company.indicator_count} growth indicators
                          </span>
                          <div className="flex items-center space-x-3">
                            {company.latest_funding && (
                              <span className="text-green-600 font-medium">
                                💰 {formatCurrency(company.latest_funding)}
                              </span>
                            )}
                            {company.average_rating && (
                              <span className="text-gray-600">
                                ⭐ {company.average_rating.toFixed(1)} rating
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Latest:</strong> {company.latest_indicator}
                          </p>
                        </div>

                        {/* Recent Indicators */}
                        {company.growth_indicators.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {company.growth_indicators.slice(0, 3).map((indicator) => (
                                <Badge 
                                  key={indicator.id} 
                                  variant="secondary"
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  {GROWTH_INDICATOR_LABELS[indicator.indicator_type]}
                                </Badge>
                              ))}
                              {company.growth_indicators.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{company.growth_indicators.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {company.website && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Website
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} companies
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
