'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, CheckBadgeIcon, MapPinIcon, UsersIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';
import { Card } from './ui/card';
import type { Database } from '@/types/supabase';

type Company = Database['public']['Tables']['companies']['Row'];

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const rating = company.rating || 0;
  const totalReviews = company.review_count || 0;
  const ratingPercentage = (rating / 5) * 100;

  // Get color based on rating
  const getProgressColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 3) return 'bg-yellow-500';
    if (rating >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Link href={`/companies/${company.id}`}>
      <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
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
                  {company.is_verified && (
                    <CheckBadgeIcon className="w-5 h-5 text-blue-500" title="Verified Company" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mt-1">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span>{company.industry}</span>
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
            
            {company.description && (
              <p className="mt-4 text-gray-700 dark:text-gray-300 line-clamp-2">{company.description}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {company.size && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  <UsersIcon className="w-4 h-4" />
                  {company.size}
                </span>
              )}
              {company.founded && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  Founded {company.founded}
                </span>
              )}
              {company.benefits_count > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  {company.benefits_count} Benefits
                </span>
              )}
            </div>

            {/* Key Metrics */}
            {(company.work_life_rating || company.career_growth_rating || company.salary_rating) && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                {company.work_life_rating && (
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{company.work_life_rating.toFixed(1)}</div>
                    <div className="text-gray-500 dark:text-gray-400">Work-Life</div>
                  </div>
                )}
                {company.career_growth_rating && (
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{company.career_growth_rating.toFixed(1)}</div>
                    <div className="text-gray-500 dark:text-gray-400">Growth</div>
                  </div>
                )}
                {company.salary_rating && (
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{company.salary_rating.toFixed(1)}</div>
                    <div className="text-gray-500 dark:text-gray-400">Salary</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}