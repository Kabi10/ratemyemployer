'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useLocationStatistics } from '@/hooks/useMCPQuery';
import { MapPin, Star, Building, MessageSquare } from 'lucide-react';

interface LocationInsightsProps {
  limit?: number;
  showMap?: boolean;
  className?: string;
}

export function LocationInsights({ 
  limit = 8, 
  showMap = false, 
  className = '' 
}: LocationInsightsProps) {
  const { data: locationStats, loading, error } = useLocationStatistics({
    enabled: true,
    refreshInterval: 300000 // 5 minutes
  });

  const getRatingColor = (rating: number): string => {
    if (rating < 2.5) return 'text-red-500';
    if (rating < 3.5) return 'text-amber-500';
    return 'text-green-500';
  };

  const getRatingBadgeColor = (rating: number): string => {
    if (rating < 2.5) return 'bg-red-100 text-red-700';
    if (rating < 3.5) return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const getLocationSize = (companyCount: number): string => {
    if (companyCount >= 100) return 'Major Hub';
    if (companyCount >= 50) return 'Large Market';
    if (companyCount >= 20) return 'Growing Market';
    return 'Emerging Market';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-2 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
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
            <MapPin className="h-5 w-5" />
            Location Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            <p>Unable to load location insights at this time.</p>
            <p className="text-sm mt-1">Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!locationStats || locationStats.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No location data available.</p>
        </CardContent>
      </Card>
    );
  }

  const topLocations = locationStats.slice(0, limit);
  const totalCompanies = topLocations.reduce((sum, stat) => sum + stat.company_count, 0);
  const totalReviews = topLocations.reduce((sum, stat) => sum + stat.review_count, 0);
  const averageRating =
    topLocations.reduce(
      (sum, stat) => sum + (stat.average_rating ?? stat.avg_rating ?? 0),
      0
    ) / topLocations.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Insights
        </CardTitle>
        <p className="text-sm text-gray-600">
          Workplace satisfaction across {topLocations.length} locations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{topLocations.length}</div>
            <div className="text-xs text-gray-600">Locations</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{formatNumber(totalCompanies)}</div>
            <div className="text-xs text-gray-600">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{formatNumber(totalReviews)}</div>
            <div className="text-xs text-gray-600">Reviews</div>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${getRatingColor(averageRating)}`}>
              {Number(averageRating ?? 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Avg Rating</div>
          </div>
        </div>

        {/* Top Locations */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Top Rated Locations</h4>
          <div className="grid gap-4">
            {topLocations.map((stat, index) => (
              <div key={stat.location} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{stat.location}</h5>
                      <p className="text-sm text-gray-500">{getLocationSize(stat.company_count)}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-sm font-medium ${getRatingBadgeColor(stat.average_rating ?? stat.avg_rating ?? 0)}`}>
                    {Number(stat.average_rating ?? stat.avg_rating ?? 0).toFixed(2)}
                  </div>
                </div>

                <div className="mb-3">
                  <Progress
                    value={((stat.average_rating ?? stat.avg_rating ?? 0) / 5) * 100}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Building className="h-3 w-3" />
                    <span>{formatNumber(stat.company_count)}</span>
                    <span className="text-xs">companies</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MessageSquare className="h-3 w-3" />
                    <span>{formatNumber(stat.review_count)}</span>
                    <span className="text-xs">reviews</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Star className="h-3 w-3" />
                    <span className="text-xs">
                      {(stat.average_rating ?? stat.avg_rating ?? 0) >= 4 ? 'Excellent' :
                       (stat.average_rating ?? stat.avg_rating ?? 0) >= 3.5 ? 'Good' :
                       (stat.average_rating ?? stat.avg_rating ?? 0) >= 2.5 ? 'Fair' : 'Poor'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Analysis */}
        {topLocations.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Market Analysis</h4>
            <div className="text-sm text-green-700 space-y-1">
                <p>
                  • <strong>{topLocations[0].location}</strong> leads with {Number(topLocations[0].average_rating ?? topLocations[0].avg_rating ?? 0).toFixed(2)}/5 rating
                </p>
              <p>
                • {topLocations.filter(stat => stat.company_count >= 50).length} major employment hubs identified
              </p>
              <p>
                • {topLocations.filter(stat => (stat.average_rating ?? stat.avg_rating ?? 0) >= 4).length} locations rated "Excellent" (4.0+)
              </p>
              {topLocations.length > 1 && (
                  <p>
                    • Rating spread: {Number((topLocations[0].average_rating ?? topLocations[0].avg_rating ?? 0) - (topLocations[topLocations.length - 1].average_rating ?? topLocations[topLocations.length - 1].avg_rating ?? 0)).toFixed(2)} points
                  </p>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
