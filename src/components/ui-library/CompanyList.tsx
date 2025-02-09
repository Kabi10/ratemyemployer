'use client'

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';
import { LoadingSpinner } from '@/components/ui-library/loading-spinner';
import { CompanyCard } from '@/components/ui-library/CompanyCard';
import type { Database } from '@/types/supabase';
import { List } from '@/components/ui-library/List';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui-library/select';
import { Button } from '@/components/ui-library/button';
import { GridIcon, ListIcon } from 'lucide-react';
import { CompanyWithStats } from '@/types/types';
import { Company } from '@/types/company';

type SortOption = {
  label: string;
  value: string;
  column: string;
  direction: 'asc' | 'desc';
};

const SORT_OPTIONS: SortOption[] = [
  { label: 'Highest Rated', value: 'rating-desc', column: 'average_rating', direction: 'desc' },
  { label: 'Lowest Rated', value: 'rating-asc', column: 'average_rating', direction: 'asc' },
  { label: 'Most Reviews', value: 'reviews-desc', column: 'total_reviews', direction: 'desc' },
  { label: 'Newest', value: 'created-desc', column: 'created_at', direction: 'desc' },
  { label: 'Oldest', value: 'created-asc', column: 'created_at', direction: 'asc' },
  { label: 'Name A-Z', value: 'name-asc', column: 'name', direction: 'asc' },
  { label: 'Name Z-A', value: 'name-desc', column: 'name', direction: 'desc' },
];

const ITEMS_PER_PAGE = 9;

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];

interface CompanyWithReviews extends CompanyRow {
  reviews: ReviewRow[];
  average_rating?: number;
  total_reviews?: number;
  recommendation_rate?: number;
}

interface CompanyListProps {
  selectedLocation?: string;
  selectedIndustry?: string;
  searchQuery?: string;
  companies?: CompanyWithStats[];
  onCompanyClick?: (company: CompanyWithStats) => void;
  simple?: boolean;
}

export function CompanyList({
  selectedLocation,
  selectedIndustry,
  searchQuery,
  companies: initialCompanies = [],
  onCompanyClick,
  simple = false
}: CompanyListProps) {
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithStats[]>(initialCompanies || []);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  if (simple) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(initialCompanies || []).map(company => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    );
  }

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await createClient()
          .from('companies')
          .select('*, reviews(*)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setFilteredCompanies(data || []);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch companies'));
        setIsLoading(false);
      }
    };

    if (!initialCompanies || initialCompanies.length === 0) {
      fetchCompanies();
    } else {
      setIsLoading(false);
    }
  }, [initialCompanies]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  useEffect(() => {
    let filtered = [...(initialCompanies || [])];

    if (selectedLocation) {
      filtered = filtered.filter(company => 
        company.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedIndustry) {
      filtered = filtered.filter(company => 
        company.industry?.toLowerCase() === selectedIndustry.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortOption.column as keyof CompanyWithStats] ?? 0;
      const bValue = b[sortOption.column as keyof CompanyWithStats] ?? 0;

      if (sortOption.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    if (JSON.stringify(filtered) !== JSON.stringify(filteredCompanies)) {
      setFilteredCompanies(filtered);
    }
  }, [initialCompanies, selectedLocation, selectedIndustry, searchQuery, sortOption, filteredCompanies]);

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = filteredCompanies.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleCompanyClick = useCallback((company: CompanyWithStats) => {
    if (onCompanyClick) {
      onCompanyClick(company);
    } else {
      router.push(`/companies/${company.id}`);
    }
  }, [onCompanyClick, router]);

  if (filteredCompanies.length === 0) {
    return <div>No companies found.</div>;
  }

  return (
    <div>
      <h1>Company List Loaded</h1>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Select
            value={sortOption.value}
            onValueChange={(value) => {
              const newOption = SORT_OPTIONS.find(opt => opt.value === value);
              if (newOption) setSortOption(newOption);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCompanies.map(company => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={() => handleCompanyClick(company)}
              />
            ))}
          </div>
        ) : (
          <List
            items={paginatedCompanies}
            renderItem={(company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={() => handleCompanyClick(company)}
                variant="list"
              />
            )}
            keyExtractor={(company) => company.id.toString()}
          />
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={page === i + 1 ? 'default' : 'outline'}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

CompanyList.defaultProps = {
  initialCompanies: [],
}; 