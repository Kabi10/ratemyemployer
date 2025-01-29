'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/solid';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import type { Company } from '@/types/database';
import { Button } from './ui/button';
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
  const fallbackLogo = `/images/company-placeholder.png`;

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
          {/* Company Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={imageError ? fallbackLogo : company.logo_url || fallbackLogo}
                alt={`${company.name} logo`}
                className="w-16 h-16 object-contain"
                onError={() => setImageError(true)}
              />
              <div>
                <Link href={`/companies/${company.id}`} className="block">
                  <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600">
                    {company.name}
                  </h3>
                </Link>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span>{company.location}</span>
                </div>
              </div>
            </div>
            {showActions && <CompanyActions company={company} isAdmin={isAdmin} />}
          </div>

          {/* Company Info */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <UsersIcon className="w-4 h-4 mr-1" />
              <span>{company.size ? `${company.size} employees` : 'Size not specified'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <BriefcaseIcon className="w-4 h-4 mr-1" />
              <span>{company.industry}</span>
            </div>
          </div>

          {/* Rating and Links */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <span className="ml-1 text-lg font-semibold">
                {rating > 0 ? rating.toFixed(1) : 'No ratings'}
              </span>
              <span className="ml-2 text-sm text-gray-600">
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Visit Website →
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}