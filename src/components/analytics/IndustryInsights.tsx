'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useIndustryStatistics } from '@/hooks/useMCPQuery';
import { Building2, TrendingUp, TrendingDown, Users } from 'lucide-react';

interface IndustryInsightsProps {
  limit?: number;
  showTrends?: boolean;
  className?: string;
}

export function IndustryInsights({ 
  limit = 10, 
  showTrends = true, 
  className = '' 
}: IndustryInsightsProps) {
  const { data: industryStats, loading, error } = useIndustryStatistics({
    enabled: true,
    refreshInterval: 300000 // 5 minutes
  });

  const getRatingColor = (rating: number): string => {
    if (rating < 2.5) return 'text-red-500';
    if (rating < 3.5) return 'text-amber-500';
    return 'text-green-500';
  };

  const getRatingBgColor = (rating: number): string => {
    if (rating < 2.5) return 'bg-red-100';
    if (rating < 3.5) return 'bg-amber-100';
    return 'bg-green-100';
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Industry Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Industry Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            <p>Unable to load industry insights at this time.</p>
            <p className="text-sm mt-1">Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!industryStats || industryStats.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Industry Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No industry data available.</p>
        </CardContent>
      </Card>
    );
  }

  const ratingOf = (s: { average_rating?: number | null; avg_rating?: number | null }) =>
    s.average_rating ?? s.avg_rating ?? 0;

  const topIndustries = [...industryStats]
    .sort((a, b) => ratingOf(b) - ratingOf(a))
    .slice(0, limit);
  const maxRating = Math.max(...topIndustries.map(stat => ratingOf(stat)));
  const totalCompanies = topIndustries.reduce((sum, stat) => sum + stat.company_count, 0);
  const totalReviews = topIndustries.reduce((sum, stat) => sum + stat.review_count, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Industry Insights
        </CardTitle>
        <p className="text-sm text-gray-600">
          Workplace satisfaction across {topIndustries.length} industries
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{topIndustries.length}</div>
            <div className="text-sm text-gray-600">Industries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatNumber(totalCompanies)}</div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatNumber(totalReviews)}</div>
            <div className="text-sm text-gray-600">Reviews</div>
          </div>
        </div>

        {/* Industry Rankings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Industry Rankings</h4>
          {topIndustries.map((stat, index) => (
            <div key={stat.industry} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="font-medium">{stat.industry}</span>
                  {showTrends && index < 3 && (
                    <div className="flex items-center gap-1">
                      {index === 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getRatingColor(ratingOf(stat))}`}>
                    {Number(ratingOf(stat)).toFixed(1)}
                  </span>
                  <div className={`px-2 py-1 rounded text-xs ${getRatingBgColor(ratingOf(stat))}`}>
                    {ratingOf(stat) >= 4 ? 'Excellent' :
                     ratingOf(stat) >= 3.5 ? 'Good' :
                     ratingOf(stat) >= 2.5 ? 'Fair' : 'Poor'}
                  </div>
                </div>
              </div>

              <div className="ml-9">
                <Progress
                  value={(ratingOf(stat) / 5) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {formatNumber(stat.company_count)} companies
                  </span>
                  <span>{formatNumber(stat.review_count)} reviews</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Insights */}
        {topIndustries.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Key Insights</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • <strong>{topIndustries[0].industry}</strong> leads with {Number(ratingOf(topIndustries[0])).toFixed(1)}/5 rating
              </li>
              {topIndustries.length > 1 && (
                <li>
                  • Rating gap of {Number(ratingOf(topIndustries[0]) - ratingOf(topIndustries[topIndustries.length - 1])).toFixed(1)} points between top and bottom industries
                </li>
              )}
              <li>
                • {topIndustries.filter(stat => ratingOf(stat) >= 4).length} industries rated "Excellent" (4.0+)
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
