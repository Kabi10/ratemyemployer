'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, CheckBadgeIcon, MapPinIcon, UsersIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';
import { Card, CardContent } from './ui/card';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import type { Company } from '@/types/database';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { ReviewForm } from '@/components/ReviewForm';
import { X } from 'lucide-react';

interface CompanyCardProps {
  company: Company;
  showActions?: boolean;
  className?: string;
}

export function CompanyCard({ company, showActions = true, className }: CompanyCardProps) {
  const [showAddReview, setShowAddReview] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const rating = company.average_rating || 0;
  const totalReviews = company.total_reviews || 0;
  const ratingPercentage = (rating / 5) * 100;

  // Get color based on rating
  const getProgressColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 3) return 'bg-yellow-500';
    if (rating >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleWriteReview = () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    setShowAddReview(true);
  };

  return (
    <>
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
                  <Link href={`/companies/${company.id}`} className="hover:text-blue-600">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{company.name}</h3>
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mt-1">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  <span>{company.industry || 'Industry not specified'}</span>
                </div>
                {company.location && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{company.location}</span>
                  </div>
                )}
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
                <Button
                  onClick={handleWriteReview}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Write a Review
                </Button>
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

      {showAddReview && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setShowAddReview(false)}
            />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex animate-slide-in-right">
              <div className="relative w-screen max-w-2xl">
                <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Write a Review
                          </h2>
                          <p className="mt-1 text-sm text-gray-500">
                            for {company.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowAddReview(false)}
                        >
                          <X className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="mt-6">
                        <ReviewForm
                          companyId={company.id}
                          onSuccess={() => {
                            setShowAddReview(false);
                            router.refresh();
                          }}
                          onSubmit={async (data) => {
                            try {
                              const supabase = createClient();
                              const { error } = await supabase
                                .from('reviews')
                                .insert({ ...data, company_id: company.id });
                              
                              if (error) throw error;
                              return Promise.resolve();
                            } catch (error) {
                              return Promise.reject(error);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}