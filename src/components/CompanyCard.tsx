'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, CheckBadgeIcon, MapPinIcon, UsersIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';
import { Card } from './ui/card';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import type { JoinedCompany, CompanyWithReviews } from '@/types/database';
import { Badge } from './ui/badge';

interface CompanyCardProps {
  company: Company & {
    metadata?: {
      benefits?: string[]
      values?: string[]
      ceo?: string
    }
  };
  showActions?: boolean;
  className?: string;
}

export const CompanyCard = ({ company, showActions = true, className }: CompanyCardProps) => {
  const rating = company.average_rating || 0;
  const totalReviews = company.total_reviews || 0;
  const ratingPercentage = (rating / 5) * 100;

  const benefits = company.metadata?.benefits || [];
  const companyValues = company.metadata?.values || [];
  const ceo = company.metadata?.ceo || '';

  // Get color based on rating
  const getProgressColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 3) return 'bg-yellow-500';
    if (rating >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Link href={`/companies/${company.id}`}>
      <Card className={`p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 ${className || ''}`}>
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={company.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`}
              alt={company.name}
              className="rounded-lg object-cover"
              fill
              sizes="64px"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{company.name}</h3>
                  {company.verified && (
                    <CheckBadgeIcon className="w-5 h-5 text-blue-500" title="Verified Company" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mt-1">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span>{company.industry || 'Industry not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{company.location}</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-1">{rating.toFixed(1)}</span>
                  <StarIcon className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{totalReviews} reviews</div>
              </div>
            </div>

            {/* Rating Progress Bar */}
            <div className="mt-4">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getProgressColor(rating)}`}
                  style={{ width: `${ratingPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={rating}
                  aria-valuemin={0}
                  aria-valuemax={5}
                />
              </div>
            </div>
            
            {company.company_values && (
              <p className="mt-4 text-gray-700 dark:text-gray-300 line-clamp-2">{company.company_values}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {company.ceo && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  <UsersIcon className="w-4 h-4" />
                  CEO: {company.ceo}
                </span>
              )}
              {company.benefits && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Has Benefits
                </span>
              )}
            </div>

            {/* Key Metrics from Reviews */}
            {company.reviews && company.reviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {(company.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / company.reviews.length).toFixed(1)}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {company.reviews.length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {((company.reviews.filter(r => r.rating && r.rating >= 4).length / company.reviews.length) * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Recommend</div>
                </div>
              </div>
            )}

            {company.size && (
              <Badge variant="outline" className="text-sm">
                {company.size.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            )}

            {showActions && (
              <div className="mt-4 flex space-x-4">
                <Link
                  href={`/reviews/new?companyId=${company.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Write a Review
                </Link>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};