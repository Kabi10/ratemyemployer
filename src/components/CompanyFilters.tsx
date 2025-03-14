import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  SlidersHorizontal, 
  Search, 
  X 
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface CompanyFiltersProps {
  industries: string[];
  onFiltersChange: (filters: CompanyFilters) => void;
  initialFilters?: Partial<CompanyFilters>;
}

export interface CompanyFilters {
  search: string;
  industry: string;
  sortBy: 'rating-desc' | 'rating-asc' | 'reviews-desc' | 'name-asc';
}

export function CompanyFilters({ 
  industries, 
  onFiltersChange,
  initialFilters = {}
}: CompanyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<CompanyFilters>({
    search: initialFilters.search || searchParams.get('search') || '',
    industry: initialFilters.industry || searchParams.get('industry') || '',
    sortBy: (initialFilters.sortBy || searchParams.get('sortBy') || 'rating-desc') as CompanyFilters['sortBy']
  });
  
  const [expanded, setExpanded] = useState(false);
  const debouncedSearch = useDebounce(filters.search, 300);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.industry) params.set('industry', filters.industry);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : '', { scroll: false });
    
    // Notify parent component
    onFiltersChange(filters);
  }, [debouncedSearch, filters.industry, filters.sortBy, onFiltersChange, router]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };
  
  const handleIndustryChange = (value: string) => {
    setFilters(prev => ({ ...prev, industry: value }));
  };
  
  const handleSortChange = (value: CompanyFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      industry: '',
      sortBy: 'rating-desc'
    });
  };
  
  const hasActiveFilters = filters.search || filters.industry || filters.sortBy !== 'rating-desc';
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Filters</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="h-8 px-2"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            {expanded ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search companies..."
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
          
          {expanded && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <Select
                    value={filters.industry}
                    onValueChange={handleIndustryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Industries</SelectItem>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating-desc">Highest Rating</SelectItem>
                      <SelectItem value="rating-asc">Lowest Rating</SelectItem>
                      <SelectItem value="reviews-desc">Most Reviews</SelectItem>
                      <SelectItem value="name-asc">Company Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-8"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 