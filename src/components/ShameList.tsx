import React from 'react';
import { CompanyWithShameData } from '@/types/types';
import { CompanyCard } from '@/components/ui-library/CompanyCard';
import { Database } from '@/types/supabase';

interface ShameListProps {
  companies: Database['public']['Tables']['companies']['Row'][];
}

export function ShameList({ companies }: ShameListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          variant="shame"
        />
      ))}
    </div>
  );
} 