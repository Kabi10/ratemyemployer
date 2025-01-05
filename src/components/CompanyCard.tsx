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
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
            <p className="text-gray-600">{company.industry}</p>
            <p className="text-gray-500 text-sm">{company.location}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-lg font-bold">{rating.toFixed(1)}</div>
            <div className="text-sm text-gray-500">{totalReviews} reviews</div>
          </div>
        </div>
        
        {company.description && (
          <p className="mt-4 text-gray-700 line-clamp-2">{company.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {company.benefits && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Benefits
            </span>
          )}
          {company.company_values && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Values
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
