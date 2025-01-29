'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
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

interface CompanyListProps {
  selectedLocation: string;
  selectedIndustry: string;
  searchQuery: string;
}

export const CompanyList = ({
  selectedLocation,
  selectedIndustry,
  searchQuery,
}: CompanyListProps) => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching companies with filters:', {
          location: selectedLocation,
          industry: selectedIndustry,
          search: searchQuery,
          sort: sortBy,
          page
        });

        let query = supabase
          .from('companies')
          .select(`
            id,
            name,
            industry,
            location,
            website,
            logo_url,
            created_at,
            updated_at,
            reviews!company_id (
              rating
            )
          `, { count: 'exact' });

        // Apply filters
        if (selectedLocation && selectedLocation !== 'all') {
          query = query.eq('location', selectedLocation);
        }
        if (selectedIndustry && selectedIndustry !== 'all') {
          query = query.eq('industry', selectedIndustry);
        }
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        // Apply sorting
        if (sortBy.column === 'average_rating') {
          // For rating-based sorting, we'll sort after fetching
          query = query.order('name', { ascending: true });
        } else {
          query = query.order(sortBy.column, { ascending: sortBy.direction === 'asc' });
        }

        // Apply pagination
        const start = (page - 1) * ITEMS_PER_PAGE;
        query = query.range(start, start + ITEMS_PER_PAGE - 1);

        console.log('Executing Supabase query...');
        const { data, error, count } = await query;
        console.log('Query response:', { data, error, count });

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(error.message || 'Failed to fetch companies');
        }

        if (!data) {
          console.log('No data returned from Supabase');
          setCompanies([]);
          setTotalCount(0);
          return;
        }

        // Calculate average ratings and total reviews
        const companiesWithStats = data.map(company => {
          const reviews = company.reviews || [];
          const totalReviews = reviews.length;
          const averageRating = totalReviews > 0
            ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews
            : 0;

          return {
            ...company,
            average_rating: averageRating,
            total_reviews: totalReviews,
            reviews: undefined // Remove the reviews array as we don't need it anymore
          };
        });

        // Sort by rating if needed
        if (sortBy.column === 'average_rating') {
          companiesWithStats.sort((a, b) => {
            return sortBy.direction === 'asc'
              ? (a.average_rating || 0) - (b.average_rating || 0)
              : (b.average_rating || 0) - (a.average_rating || 0);
          });
        }

        console.log(`Successfully fetched ${companiesWithStats.length} companies`);
        setCompanies(companiesWithStats);
        setTotalCount(count || 0);
      } catch (err) {
        console.error('Error details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [selectedLocation, selectedIndustry, searchQuery, page, sortBy, supabase]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => setPage(1)} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

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

      {companies.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No companies found</p>
        </div>
      ) : (
        <List<Company>
          items={companies}
          renderItem={(company) => <CompanyCard company={company} />}
          keyExtractor={(company) => String(company.id)}
          gridCols={viewMode === 'grid' ? { default: 1, md: 2, lg: 3 } : { default: 1 }}
          pagination={{
            page,
            totalPages,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
};