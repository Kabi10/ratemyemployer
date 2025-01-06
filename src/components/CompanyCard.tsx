// components/CompanyCard.tsx
'use client';

import { Company } from '@/types';
import Link from 'next/link';
import { Card } from './ui/card';

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const rating = company.average_rating || 0;
  const totalReviews = company.total_reviews || 0;

  return (
    <Link href={`/companies/${company.id}`}>
      <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{company.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{company.industry}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{company.location}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{rating.toFixed(1)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{totalReviews} reviews</div>
          </div>
        </div>
        
        {company.description && (
          <p className="mt-4 text-gray-700 dark:text-gray-300 line-clamp-2">{company.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {company.benefits && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Benefits
            </span>
          )}
          {company.company_values && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              Values
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
