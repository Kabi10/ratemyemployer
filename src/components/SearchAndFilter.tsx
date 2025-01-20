'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { FilterIcon, XIcon } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

interface SearchAndFilterProps {
  onLocationChange?: (location: string) => void;
  onIndustryChange?: (industry: string) => void;
  onSearchChange?: (search: string) => void;
  onSizeChange?: (size: string) => void;
  onRatingRangeChange?: (range: [number, number]) => void;
  onVerifiedChange?: (verified: boolean) => void;
}

const COMPANY_SIZES = [
  'All Sizes',
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5000+'
];

export default function SearchAndFilter({
  onLocationChange,
  onIndustryChange,
  onSearchChange,
  onSizeChange,
  onRatingRangeChange,
  onVerifiedChange
}: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSize, setSelectedSize] = useState('All Sizes');
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 5]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch industries
      const { data: industryData, error: industryError } = await supabase
        .from('companies')
        .select('industry');

      if (industryError) {
        console.error('Error fetching industries:', industryError);
      } else {
        const uniqueIndustries = Array.from(new Set(industryData
          .map(item => item.industry)
          .filter((industry): industry is string => 
            industry !== null && 
            industry !== undefined && 
            industry.trim() !== ''
          )))
          .sort();
        setIndustries(uniqueIndustries);
      }

      // Fetch locations
      const { data: locationData, error: locationError } = await supabase
        .from('companies')
        .select('location');

      if (locationError) {
        console.error('Error fetching locations:', locationError);
      } else {
        const uniqueLocations = Array.from(new Set(locationData
          .map(item => item.location)
          .filter((location): location is string => 
            location !== null && 
            location !== undefined && 
            location.trim() !== ''
          )))
          .sort();
        setLocations(uniqueLocations);
      }
    }

    fetchData();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    onIndustryChange?.(value);
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    onLocationChange?.(value);
  };

  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    onSizeChange?.(value);
  };

  const handleRatingRangeChange = (value: [number, number]) => {
    setRatingRange(value);
    onRatingRangeChange?.(value);
  };

  const handleVerifiedChange = (value: boolean) => {
    setVerifiedOnly(value);
    onVerifiedChange?.(value);
  };

  const handleClearFilters = () => {
    setSelectedIndustry('all');
    setSelectedLocation('all');
    setSelectedSize('All Sizes');
    setRatingRange([0, 5]);
    setVerifiedOnly(false);
    onIndustryChange?.('all');
    onLocationChange?.('all');
    onSizeChange?.('All Sizes');
    onRatingRangeChange?.([0, 5]);
    onVerifiedChange?.(false);
  };

  const activeFilterCount = [
    selectedIndustry !== 'all',
    selectedLocation !== 'all',
    selectedSize !== 'All Sizes',
    ratingRange[0] !== 0 || ratingRange[1] !== 5,
    verifiedOnly
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={e => handleSearchChange(e.target.value)}
          className="w-full"
        />
        <Select value={selectedIndustry} onValueChange={handleIndustryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map(industry => (
              industry && (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              )
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedLocation} onValueChange={handleLocationChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(location => (
              location && (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              )
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2"
        >
          <FilterIcon className="w-4 h-4" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-2 text-gray-500"
          >
            <XIcon className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Size</label>
            <Select value={selectedSize} onValueChange={handleSizeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Size" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating Range</label>
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={ratingRange}
              onValueChange={handleRatingRangeChange}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{ratingRange[0]}</span>
              <span>{ratingRange[1]}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Other Filters</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verifiedOnly"
                checked={verifiedOnly}
                onChange={(e) => handleVerifiedChange(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="verifiedOnly" className="text-sm">
                Verified Companies Only
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}