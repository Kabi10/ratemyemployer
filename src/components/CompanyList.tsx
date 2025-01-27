'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanies } from '@/hooks/useCompany';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CompanyCard } from '@/components/CompanyCard';
import type { Database } from '@/types/supabase';
import { List } from '@/components/ui/List';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GridIcon, ListIcon } from 'lucide-react';
import type { Company } from '@/types/database';
import useSWR from 'swr';

type Company = Database['public']['Tables']['companies']['Row'];

const ITEMS_PER_PAGE = 9;

type SortOption = {
  label: string;
  value: string;
  column: string;
  direction: 'asc' | 'desc';
};

const SORT_OPTIONS: SortOption[] = [
  { label: 'Highest Rated', value: 'rating-desc', column: 'rating', direction: 'desc' },
  { label: 'Lowest Rated', value: 'rating-asc', column: 'rating', direction: 'asc' },
  { label: 'Most Reviews', value: 'reviews-desc', column: 'review_count', direction: 'desc' },
  { label: 'Newest', value: 'created-desc', column: 'created_at', direction: 'desc' },
  { label: 'Oldest', value: 'created-asc', column: 'created_at', direction: 'asc' },
  { label: 'Name A-Z', value: 'name-asc', column: 'name', direction: 'asc' },
  { label: 'Name Z-A', value: 'name-desc', column: 'name', direction: 'desc' },
];

interface CompanyListProps {
  selectedLocation: string;
  selectedIndustry: string;
  searchQuery: string;
  fallbackData: Company[];
}

const fetchCompanies = async () => {
  return [];
};

export const CompanyList = ({
  selectedLocation,
  selectedIndustry,
  searchQuery,
  fallbackData
}: CompanyListProps) => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const companies = fallbackData;
  
  const { totalCount } = useCompanies({
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
    location: selectedLocation !== 'all' ? selectedLocation : '',
    industry: selectedIndustry !== 'all' ? selectedIndustry : '',
    searchQuery: searchQuery,
    orderBy: {
      column: sortBy.column,
      direction: sortBy.direction,
    },
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const keyExtractor = (company: Company) => String(company.id || '');

  const handleRetry = () => {
    // Implement the retry logic here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={sortBy.value} onValueChange={(value) => {
            const option = SORT_OPTIONS.find(opt => opt.value === value);
            if (option) setSortBy(option);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <GridIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {totalCount} {totalCount === 1 ? 'company' : 'companies'} found
        </div>
      </div>

      <List<Company>
        items={companies}
        renderItem={(company) => <CompanyCard company={company} />}
        keyExtractor={keyExtractor}
        gridCols={viewMode === 'grid' ? { default: 1, md: 2, lg: 3 } : { default: 1 }}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};