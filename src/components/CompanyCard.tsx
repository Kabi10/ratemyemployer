'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/solid';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import { Star, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import type { Company } from '@/types/database';
import { Button } from './ui/button';
import { EnhancedCard, EnhancedCardHeader, EnhancedCardContent } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ReviewForm } from '@/components/ReviewForm';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { CompanyActions } from './companies/CompanyActions';

interface CompanyCardProps {
  company: Company;
  showActions?: boolean;
  isAdmin?: boolean;
}

export function CompanyCard({ company, showActions = true, isAdmin = false }: CompanyCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const rating = company.average_rating || 0;
  const totalReviews = company.total_reviews || 0;
  const fallbackLogo = `/images/company-placeholder.svg`;

  useEffect(() => {
    if (!company.logo_url) {
      setImageError(true);
    }
  }, [company.logo_url]);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    if (rating >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return { label: 'Excellent', variant: 'default' as const };
    if (rating >= 3.5) return { label: 'Good', variant: 'secondary' as const };
    if (rating >= 2.5) return { label: 'Average', variant: 'outline' as const };
    if (rating >= 1.5) return { label: 'Poor', variant: 'destructive' as const };
    return { label: 'Very Poor', variant: 'destructive' as const };
  };

  const ratingBadge = getRatingBadge(rating);

  return (
    <EnhancedCard
      variant="elevated"
      hoverEffect="lift"
      interactive
      className="group cursor-pointer"
      onClick={() => router.push(`/companies/${company.id}`)}
      header={
        <EnhancedCardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={imageError ? fallbackLogo : company.logo_url || fallbackLogo}
                  alt={`${company.name} logo`}
                  className="w-12 h-12 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                  onError={() => setImageError(true)}
                />
                {rating >= 4.5 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Award className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {company.name}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span>{company.location}</span>
                </div>
              </div>
            </div>
            {showActions && <CompanyActions company={company} isAdmin={isAdmin} />}
          </div>
        </EnhancedCardHeader>
      }
    >

      <EnhancedCardContent>
        <div className="space-y-4">
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className={`font-semibold ${getRatingColor(rating)}`}>
                {rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            <Badge variant={ratingBadge.variant} className="text-xs">
              {ratingBadge.label}
            </Badge>
          </div>

          {/* Company Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <UsersIcon className="w-4 h-4 mr-2 text-blue-500" />
              <span>{company.size ? `${company.size} employees` : 'Size not specified'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <BriefcaseIcon className="w-4 h-4 mr-2 text-purple-500" />
              <span>{company.industry}</span>
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {company.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-2">
              <EnhancedButton
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/companies/${company.id}`);
                }}
              >
                View Details
              </EnhancedButton>
              {company.website && (
                <EnhancedButton
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(company.website as string, '_blank');
                  }}
                >
                  Website
                </EnhancedButton>
              )}
            </div>

            {rating >= 4.5 && (
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                Top Rated
              </div>
            )}
          </div>
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  );
}
