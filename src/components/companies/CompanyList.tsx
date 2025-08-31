'use client'

import type { Database } from '@/types/supabase';

import { CompanyCard } from '../CompanyCard';

type Company = Database['public']['Tables']['companies']['Row'];

export function CompanyList({ companies }: { companies: Company[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map(company => (
        <CompanyCard key={company.id} company={company as any} />
      ))}
    </div>
  );
}
