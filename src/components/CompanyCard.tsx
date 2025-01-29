'use client'

import { useState, useEffect } from 'react';
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
  const [showAddReview, setShowAddReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rating = company.average_rating || 0;
  const totalReviews = company.total_reviews || 0;
  const ratingPercentage = (rating / 5) * 100;

  const fallbackLogo = `/images/company-placeholder.png`; // Make sure this exists in your public folder

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

  const handleReviewSubmit = async (reviewData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          company_id: company.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Review submitted successfully! It will be visible after moderation.');
      setIsReviewModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!company.logo_url) {
      setImageError(true);
    }
  }, [company.logo_url]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={imageError ? fallbackLogo : company.logo_url || fallbackLogo}
                alt={`${company.name} logo`}
                className="w-16 h-16 object-contain"
                onError={() => setImageError(true)}
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  <Link href={`/companies/${company.id}`} className="hover:text-indigo-600">
                    {company.name}
                  </Link>
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span>{company.location}</span>
                </div>
              </div>
            </div>
            {showActions && <CompanyActions company={company} isAdmin={isAdmin} />}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <UsersIcon className="w-4 h-4 mr-1" />
              <span>{company.size || 'Size not specified'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <BriefcaseIcon className="w-4 h-4 mr-1" />
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Visit Website
                </a>
              ) : (
                <span>Website not available</span>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="ml-1 text-lg font-semibold">
                {company.average_rating?.toFixed(1) || 'No ratings'}
              </span>
              <span className="ml-2 text-sm text-gray-600">
                ({company.total_reviews || 0} reviews)
              </span>
            </div>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Write Review
            </button>
          </div>

          {company.industry && (
            <div className="mt-4 flex items-center">
              <CheckBadgeIcon className="w-4 h-4 mr-1 text-gray-600" />
              <span className="text-sm text-gray-600">{company.industry}</span>
            </div>
          )}
        </div>
      </motion.div>

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
                          onSubmit={handleReviewSubmit}
                          isLoading={isLoading}
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