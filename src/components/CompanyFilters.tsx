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
  X,
  Star,
  MapPin,
  Building2
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CompanyFiltersProps {
  industries: string[];
  onFiltersChange: (filters: CompanyFilters) => void;
  initialFilters?: Partial<CompanyFilters>;
  showSortOptions?: boolean;
  locations?: string[];
  sizes?: string[];
}

export interface CompanyFilters {
  search: string;
  industry: string;
  location?: string;
  size?: string;
  minRating?: number;
  maxRating?: number;
  hasNews?: boolean;
  sortBy: 'rating-desc' | 'rating-asc' | 'reviews-desc' | 'name-asc' | 'recommend-desc';
}

export function CompanyFilters({ 
  industries, 
  onFiltersChange,
  initialFilters = {},
  showSortOptions = false,
  locations = [],
  sizes = []
}: CompanyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<CompanyFilters>({
    search: initialFilters.search || searchParams.get('search') || '',
    industry: initialFilters.industry || searchParams.get('industry') || '',
    location: initialFilters.location || searchParams.get('location') || '',
    size: initialFilters.size || searchParams.get('size') || '',
    minRating: initialFilters.minRating || Number(searchParams.get('minRating')) || 0,
    maxRating: initialFilters.maxRating || Number(searchParams.get('maxRating')) || 5,
    hasNews: initialFilters.hasNews || searchParams.get('hasNews') === 'true' || false,
    sortBy: (initialFilters.sortBy || searchParams.get('sortBy') || 'rating-desc') as CompanyFilters['sortBy']
  });
  
  const [expanded, setExpanded] = useState(false);
  const debouncedSearch = useDebounce(filters.search, 300);
  const [ratingRange, setRatingRange] = useState<[number, number]>([
    filters.minRating || 0, 
    filters.maxRating || 5
  ]);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.industry) params.set('industry', filters.industry);
    if (filters.location) params.set('location', filters.location);
    if (filters.size) params.set('size', filters.size);
    if (filters.minRating > 0) params.set('minRating', filters.minRating.toString());
    if (filters.maxRating < 5) params.set('maxRating', filters.maxRating.toString());
    if (filters.hasNews) params.set('hasNews', 'true');
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : '', { scroll: false });
    
    // Notify parent component
    onFiltersChange(filters);
  }, [
    debouncedSearch, 
    filters.industry, 
    filters.location,
    filters.size,
    filters.minRating,
    filters.maxRating,
    filters.hasNews,
    filters.sortBy, 
    onFiltersChange, 
    router
  ]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };
  
  const handleIndustryChange = (value: string) => {
    setFilters(prev => ({ ...prev, industry: value }));
  };
  
  const handleLocationChange = (value: string) => {
    setFilters(prev => ({ ...prev, location: value }));
  };
  
  const handleSizeChange = (value: string) => {
    setFilters(prev => ({ ...prev, size: value }));
  };
  
  const handleRatingRangeChange = (value: [number, number]) => {
    setRatingRange(value);
    setFilters(prev => ({ 
      ...prev, 
      minRating: value[0], 
      maxRating: value[1] 
    }));
  };
  
  const handleHasNewsChange = (checked: boolean) => {
    setFilters(prev => ({ ...prev, hasNews: checked }));
  };
  
  const handleSortChange = (value: CompanyFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      industry: '',
      location: '',
      size: '',
      minRating: 0,
      maxRating: 5,
      hasNews: false,
      sortBy: 'rating-desc'
    });
    setRatingRange([0, 5]);
  };
  
  const hasActiveFilters = 
    filters.search || 
    filters.industry || 
    filters.location || 
    filters.size || 
    filters.minRating > 0 || 
    filters.maxRating < 5 || 
    filters.hasNews || 
    filters.sortBy !== 'rating-desc';
  
  // Generate active filter badges
  const getActiveFilterBadges = () => {
    const badges = [];
    
    if (filters.industry) {
      badges.push(
        <Badge key="industry" variant="secondary" className="flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {filters.industry}
          <button 
            onClick={() => handleIndustryChange('')}
            className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      );
    }
    
    if (filters.location) {
      badges.push(
        <Badge key="location" variant="secondary" className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {filters.location}
          <button 
            onClick={() => handleLocationChange('')}
            className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      );
    }
    
    if (filters.size) {
      badges.push(
        <Badge key="size" variant="secondary" className="flex items-center gap-1">
          {filters.size}
          <button 
            onClick={() => handleSizeChange('')}
            className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      );
    }
    
    if (filters.minRating > 0 || filters.maxRating < 5) {
      badges.push(
        <Badge key="rating" variant="secondary" className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {filters.minRating} - {filters.maxRating}
          <button 
            onClick={() => handleRatingRangeChange([0, 5])}
            className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      );
    }
    
    if (filters.hasNews) {
      badges.push(
        <Badge key="hasNews" variant="secondary" className="flex items-center gap-1">
          Has News
          <button 
            onClick={() => handleHasNewsChange(false)}
            className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      );
    }
    
    return badges;
  };
  
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
          
          {/* Active filter badges */}
          {hasActiveFilters && !expanded && (
            <div className="flex flex-wrap gap-2">
              {getActiveFilterBadges()}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-7 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
          )}
          
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
                
                {locations.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Select
                      value={filters.location}
                      onValueChange={handleLocationChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        {locations.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {sizes.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Size</label>
                    <Select
                      value={filters.size}
                      onValueChange={handleSizeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Size</SelectItem>
                        {sizes.map(size => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
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
                      {showSortOptions && (
                        <SelectItem value="recommend-desc">Most Recommended</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating Range</label>
                <div className="px-2">
                  <Slider
                    value={ratingRange}
                    min={0}
                    max={5}
                    step={0.5}
                    onValueChange={handleRatingRangeChange}
                    className="my-6"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{ratingRange[0]}</span>
                    <span>{ratingRange[1]}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasNews"
                  checked={filters.hasNews}
                  onCheckedChange={handleHasNewsChange}
                />
                <Label htmlFor="hasNews">Only show companies with news</Label>
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