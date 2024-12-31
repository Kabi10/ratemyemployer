// components/CompanyCard.tsx
'use client';

import { Company } from '@/types';
import Link from 'next/link';
import { Card } from './ui/card';

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link href={`/companies/${company.id}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{company.name}</h3>
            <p className="text-sm text-gray-600">{company.industry}</p>
            <p className="text-sm text-gray-500">{company.location}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{company.average_rating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">{company.total_reviews} reviews</div>
          </div>
        </div>
        {company.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{company.description}</p>
        )}
      </Card>
    </Link>
  );
}
