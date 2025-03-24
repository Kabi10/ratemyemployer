'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, SlidersHorizontal } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ReviewCard } from './ReviewCard';
import { LoadingSpinner } from './LoadingSpinner';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Sheet, 
  SheetClose, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from './ui/sheet';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { Review } from '@/types/database';
import { Badge } from './ui/badge';
import { SpamIndicator } from './SpamIndicator';
import { useAuth } from '@/contexts/AuthContext';

// Define employment status options
const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Employment Statuses' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
];

// Define sort options
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'most_helpful', label: 'Most Helpful' },
];

// Define time period options
const TIME_PERIOD_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'month', label: 'Last Month' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: 'year', label: 'Last Year' },
];

const ITEMS_PER_PAGE = 5;

interface EnhancedReviewListProps {
  reviews?: Review[];
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  companyId?: string | number;
  fetchReviews?: (filters: Record<string, any>) => Promise<{
    data: Review[] | null;
    error: Error | null;
    count?: number;
  }>;
  totalCount?: number;
  showCreateReview?: boolean;
  onCreateReview?: () => void;
}

export const EnhancedReviewList = ({
  reviews: initialReviews = [],
  loading: initialLoading = false,
  error: initialError = null,
  emptyMessage = 'No reviews found',
  companyId,
  fetchReviews,
  totalCount: initialTotalCount = 0,
  showCreateReview = false,
  onCreateReview
}: EnhancedReviewListProps) => {
  const { session, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Local state for reviews and pagination
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<Error | null>(initialError);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  
  // Get filters from URL or use defaults
  const page = Number(searchParams.get('page') || '1');
  const minRating = Number(searchParams.get('minRating') || '0');
  const employmentStatus = searchParams.get('employmentStatus') || 'all';
  const timePeriod = searchParams.get('timePeriod') || 'all';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const showVerifiedOnly = searchParams.get('verifiedOnly') === 'true';
  const showCurrentEmployees = searchParams.get('currentEmployees') === 'true';

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Effect to fetch reviews when filters change
  useEffect(() => {
    if (!fetchReviews) {
      // If no fetch function provided, use the passed reviews
      return;
    }

    const loadReviews = async () => {
      setLoading(true);
      
      try {
        // Build filters object
        const filters: Record<string, any> = {
          page: page,
          limit: ITEMS_PER_PAGE,
          companyId: companyId,
          sortBy: sortBy,
        };

        // Add rating filter if set
        if (minRating > 0) {
          filters.minRating = minRating;
        }

        // Add employment status filter if not 'all'
        if (employmentStatus !== 'all') {
          filters.employmentStatus = employmentStatus;
        }

        // Add time period filter
        if (timePeriod !== 'all') {
          const now = new Date();
          let startDate: Date;
          
          switch (timePeriod) {
            case 'month':
              startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
              break;
            case '3months':
              startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
              break;
            case '6months':
              startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
              break;
            case 'year':
              startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
              break;
            default:
              startDate = new Date(0); // epoch
          }
          
          filters.fromDate = startDate.toISOString();
        }

        // Add verified-only filter
        if (showVerifiedOnly) {
          filters.verified = true;
        }

        // Add current employees filter
        if (showCurrentEmployees) {
          filters.isCurrentEmployee = true;
        }

        // Fetch reviews with filters
        const result = await fetchReviews(filters);
        
        if (result.error) {
          setError(result.error);
          setReviews([]);
        } else {
          setReviews(result.data || []);
          setTotalCount(result.count || 0);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [
    fetchReviews,
    page,
    minRating,
    employmentStatus,
    timePeriod,
    sortBy,
    showVerifiedOnly,
    showCurrentEmployees,
    companyId
  ]);

  // Function to update URL with new filters
  const updateFilters = (newFilters: Record<string, string | number | boolean>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update each filter in the URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || 
          (typeof value === 'boolean' && !value) || 
          (typeof value === 'number' && value === 0) ||
          (typeof value === 'string' && value === 'all')) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    
    // Reset to page 1 when filters change
    if (!('page' in newFilters)) {
      params.set('page', '1');
    }
    
    // Update URL
    router.push(`${pathname}?${params.toString()}`);
  };

  // Helper to handle page change
  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage });
  };

  // Helper to reset all filters
  const resetFilters = () => {
    router.push(pathname);
  };
  
  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (minRating > 0) count++;
    if (employmentStatus !== 'all') count++;
    if (timePeriod !== 'all') count++;
    if (showVerifiedOnly) count++;
    if (showCurrentEmployees) count++;
    if (sortBy !== 'newest') count++;
    return count;
  };
  
  const activeFilterCount = countActiveFilters();

  // Render loading state
  if (loading && !reviews.length) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-800 animate-pulse h-40 rounded-lg"
          />
        ))}
      </div>
    );
  }

  // Render error state
  if (error && !reviews.length) {
    return (
      <div className="text-red-500 dark:text-red-400 text-center p-4 border border-red-200 dark:border-red-800 rounded-lg">
        {error.message || 'An error occurred while loading reviews'}
      </div>
    );
  }

  // Render empty state
  if (!reviews?.length) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Reviews</h3>
          <div className="flex gap-2">
            <FilterDialog 
              minRating={minRating}
              employmentStatus={employmentStatus}
              timePeriod={timePeriod}
              sortBy={sortBy}
              showVerifiedOnly={showVerifiedOnly}
              showCurrentEmployees={showCurrentEmployees}
              onUpdateFilters={updateFilters}
              onResetFilters={resetFilters}
              activeFilterCount={activeFilterCount}
            />
            
            {showCreateReview && session && (
              <Button onClick={onCreateReview}>
                Write a Review
              </Button>
            )}
          </div>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-center p-8 border border-gray-200 dark:border-gray-800 rounded-lg">
          {emptyMessage}
        </div>
      </div>
    );
  }

  // Main render for reviews list
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          Reviews
          {totalCount > 0 && (
            <span className="ml-2 text-sm text-gray-500">({totalCount})</span>
          )}
        </h3>
        <div className="flex gap-2">
          <FilterDialog 
            minRating={minRating}
            employmentStatus={employmentStatus}
            timePeriod={timePeriod}
            sortBy={sortBy}
            showVerifiedOnly={showVerifiedOnly}
            showCurrentEmployees={showCurrentEmployees}
            onUpdateFilters={updateFilters}
            onResetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
          />
          
          {showCreateReview && session && (
            <Button onClick={onCreateReview}>
              Write a Review
            </Button>
          )}
        </div>
      </div>
      
      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {minRating > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              {minRating}+ Stars
              <button 
                onClick={() => updateFilters({ minRating: 0 })}
                className="ml-1 text-xs hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
          
          {employmentStatus !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              {EMPLOYMENT_STATUS_OPTIONS.find(o => o.value === employmentStatus)?.label || employmentStatus}
              <button 
                onClick={() => updateFilters({ employmentStatus: 'all' })}
                className="ml-1 text-xs hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
          
          {timePeriod !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              {TIME_PERIOD_OPTIONS.find(o => o.value === timePeriod)?.label || timePeriod}
              <button 
                onClick={() => updateFilters({ timePeriod: 'all' })}
                className="ml-1 text-xs hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
          
          {showVerifiedOnly && (
            <Badge variant="outline" className="flex items-center gap-1">
              Verified Only
              <button 
                onClick={() => updateFilters({ verifiedOnly: false })}
                className="ml-1 text-xs hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
          
          {showCurrentEmployees && (
            <Badge variant="outline" className="flex items-center gap-1">
              Current Employees Only
              <button 
                onClick={() => updateFilters({ currentEmployees: false })}
                className="ml-1 text-xs hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
          
          {sortBy !== 'newest' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label || sortBy}
              <button 
                onClick={() => updateFilters({ sortBy: 'newest' })}
                className="ml-1 text-xs hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="relative">
            {user?.role === 'admin' && (
              <div className="absolute right-4 top-4 z-10">
                <SpamIndicator 
                  reviewTitle={review.title || ''}
                  reviewContent={(review.pros || '') + ' ' + (review.cons || '')}
                  reviewerId={review.reviewer_id || ''}
                />
              </div>
            )}
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Filter Dialog/Sheet Component
interface FilterDialogProps {
  minRating: number;
  employmentStatus: string;
  timePeriod: string;
  sortBy: string;
  showVerifiedOnly: boolean;
  showCurrentEmployees: boolean;
  onUpdateFilters: (filters: Record<string, string | number | boolean>) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

const FilterDialog = ({
  minRating,
  employmentStatus,
  timePeriod,
  sortBy,
  showVerifiedOnly,
  showCurrentEmployees,
  onUpdateFilters,
  onResetFilters,
  activeFilterCount
}: FilterDialogProps) => {
  // Local state for filters (to avoid updating URL until Apply is clicked)
  const [localMinRating, setLocalMinRating] = useState<number>(minRating);
  const [localEmploymentStatus, setLocalEmploymentStatus] = useState<string>(employmentStatus);
  const [localTimePeriod, setLocalTimePeriod] = useState<string>(timePeriod);
  const [localSortBy, setLocalSortBy] = useState<string>(sortBy);
  const [localShowVerifiedOnly, setLocalShowVerifiedOnly] = useState<boolean>(showVerifiedOnly);
  const [localShowCurrentEmployees, setLocalShowCurrentEmployees] = useState<boolean>(showCurrentEmployees);

  // Reset local state when props change
  useEffect(() => {
    setLocalMinRating(minRating);
    setLocalEmploymentStatus(employmentStatus);
    setLocalTimePeriod(timePeriod);
    setLocalSortBy(sortBy);
    setLocalShowVerifiedOnly(showVerifiedOnly);
    setLocalShowCurrentEmployees(showCurrentEmployees);
  }, [minRating, employmentStatus, timePeriod, sortBy, showVerifiedOnly, showCurrentEmployees]);

  // Apply filters
  const applyFilters = () => {
    onUpdateFilters({
      minRating: localMinRating,
      employmentStatus: localEmploymentStatus,
      timePeriod: localTimePeriod,
      sortBy: localSortBy,
      verifiedOnly: localShowVerifiedOnly,
      currentEmployees: localShowCurrentEmployees
    });
  };

  // Reset filters
  const resetLocalFilters = () => {
    setLocalMinRating(0);
    setLocalEmploymentStatus('all');
    setLocalTimePeriod('all');
    setLocalSortBy('newest');
    setLocalShowVerifiedOnly(false);
    setLocalShowCurrentEmployees(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md w-[90vw]">
        <SheetHeader>
          <SheetTitle>Filter Reviews</SheetTitle>
          <SheetDescription>
            Customize which reviews to display based on your preferences.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          {/* Rating Filter */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Minimum Rating</h4>
            <div className="flex items-center gap-4 pt-2">
              <Slider
                value={[localMinRating]}
                min={0}
                max={5}
                step={1}
                onValueChange={(values) => setLocalMinRating(values[0])}
                className="flex-1"
              />
              <span className="w-10 text-center">
                {localMinRating > 0 ? `${localMinRating}★` : 'All'}
              </span>
            </div>
          </div>
          
          {/* Employment Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Employment Status</h4>
            <Select 
              value={localEmploymentStatus} 
              onValueChange={setLocalEmploymentStatus}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Employment Status" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Time Period */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Time Period</h4>
            <Select 
              value={localTimePeriod} 
              onValueChange={setLocalTimePeriod}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Time Period" />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIOD_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort By */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Sort Reviews By</h4>
            <RadioGroup value={localSortBy} onValueChange={setLocalSortBy}>
              {SORT_OPTIONS.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`sort-${option.value}`} />
                  <Label htmlFor={`sort-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Additional Filters */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Additional Filters</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="verified-only" 
                  checked={localShowVerifiedOnly}
                  onCheckedChange={(checked) => setLocalShowVerifiedOnly(checked === true)}
                />
                <Label htmlFor="verified-only">Show verified reviews only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="current-employees" 
                  checked={localShowCurrentEmployees}
                  onCheckedChange={(checked) => setLocalShowCurrentEmployees(checked === true)}
                />
                <Label htmlFor="current-employees">Show current employees only</Label>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="sm:justify-between gap-3 flex-col sm:flex-row">
          <Button 
            variant="outline" 
            onClick={() => {
              resetLocalFilters();
              onResetFilters();
            }}
          >
            Reset All
          </Button>
          <div className="flex gap-3">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <SheetClose asChild>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}; 