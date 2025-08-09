/**
 * Financial Distress Section Component
 * Displays companies experiencing financial difficulties with detailed indicators
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  TrendingDown, 
  Building2, 
  MapPin, 
  Calendar,
  ExternalLink,
  Filter,
  SortAsc,
  SortDesc,
  Users,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getFinancialDistressCompanies, getDistressStatistics } from '@/lib/companySectionsApi';
import type { 
  CompanyWithDistressData, 
  DistressFilters, 
  DistressStatistics,
  DistressIndicatorType 
} from '@/types/companySections';
import { 
  DISTRESS_INDICATOR_LABELS, 
  SEVERITY_LABELS, 
  DISTRESS_COLORS,
  getDistressCategory 
} from '@/types/companySections';

interface FinancialDistressSectionProps {
  limit?: number;
  showFilters?: boolean;
  showStatistics?: boolean;
}

export function FinancialDistressSection({ 
  limit = 20, 
  showFilters = true,
  showStatistics = true 
}: FinancialDistressSectionProps) {
  const [companies, setCompanies] = useState<CompanyWithDistressData[]>([]);
  const [statistics, setStatistics] = useState<DistressStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DistressFilters>({
    sort_by: 'distress_score',
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
      const response = await getFinancialDistressCompanies(filters, itemsPerPage, offset);
      
      setCompanies(response.companies);
      setTotalCount(response.total_count);
    } catch (err) {
      console.error('Error fetching distress companies:', err);
      setError('Failed to load companies in financial distress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getDistressStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching distress statistics:', err);
    }
  };

  const handleFilterChange = (key: keyof DistressFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement search logic here
  };

  const getDistressColor = (score: number) => {
    const category = getDistressCategory(score);
    return DISTRESS_COLORS[category];
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
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financial Distress Monitor
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Track companies experiencing financial difficulties, layoffs, and other distress indicators. 
          Stay informed about workplace stability and make better career decisions.
        </p>
      </div>

      {/* Statistics Overview */}
      {showStatistics && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Companies Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statistics.total_companies}
              </div>
              <p className="text-xs text-gray-500">
                Companies with distress indicators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingDown className="h-4 w-4 mr-2" />
                Average Distress Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: getDistressColor(statistics.average_score) }}>
                {statistics.average_score}/100
              </div>
              <Progress 
                value={statistics.average_score} 
                className="mt-2"
                style={{ backgroundColor: getDistressColor(statistics.average_score) }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Most Affected Industry
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
                <label className="block text-sm font-medium mb-1">Distress Level</label>
                <Select 
                  value={filters.min_distress_score?.toString() || ''} 
                  onValueChange={(value) => handleFilterChange('min_distress_score', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="25">Medium+ (25+)</SelectItem>
                    <SelectItem value="50">High+ (50+)</SelectItem>
                    <SelectItem value="75">Critical (75+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <Select 
                  value={filters.sort_by || 'distress_score'} 
                  onValueChange={(value) => handleFilterChange('sort_by', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distress_score">Distress Score</SelectItem>
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
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Companies Found
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
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          <Building2 className="h-8 w-8 text-gray-400" />
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
                          <span className="text-sm font-medium">Distress Score</span>
                          <Badge 
                            variant="outline" 
                            style={{ 
                              borderColor: getDistressColor(company.distress_score),
                              color: getDistressColor(company.distress_score)
                            }}
                          >
                            {company.distress_score}/100
                          </Badge>
                        </div>
                        <Progress 
                          value={company.distress_score} 
                          className="h-2"
                        />

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {company.indicator_count} indicators
                          </span>
                          {company.average_rating && (
                            <span className="text-gray-600">
                              ⭐ {company.average_rating.toFixed(1)} rating
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Latest:</strong> {company.latest_indicator}
                          </p>
                        </div>

                        {/* Recent Indicators */}
                        {company.distress_indicators.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {company.distress_indicators.slice(0, 3).map((indicator) => (
                                <Badge 
                                  key={indicator.id} 
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {DISTRESS_INDICATOR_LABELS[indicator.indicator_type]}
                                </Badge>
                              ))}
                              {company.distress_indicators.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{company.distress_indicators.length - 3} more
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
