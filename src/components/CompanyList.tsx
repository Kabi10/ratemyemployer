'use client';

import { useState } from 'react';
import { CompanyCard } from '@/components/CompanyCard';
import { useCompanies } from '@/hooks/useCompany';
import { List } from '@/components/ui/List';
import type { Company } from '@/types';

const ITEMS_PER_PAGE = 9;

export default function CompanyList() {
  const [page, setPage] = useState(1);
  const { companies, totalCount, isLoading, error } = useCompanies({
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <List<Company>
      items={companies}
      renderItem={(company) => <CompanyCard company={company} />}
      keyExtractor={(company) => company.id}
      isLoading={isLoading}
      error={error}
      emptyMessage="No companies found."
      loadingItemCount={ITEMS_PER_PAGE}
      gridCols={{ default: 1, md: 2, lg: 3 }}
      pagination={{
        page,
        totalPages,
        onPageChange: setPage,
      }}
    />
  );
}
