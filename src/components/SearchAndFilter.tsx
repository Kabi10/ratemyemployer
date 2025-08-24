'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Company } from '@/types/database';
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
  onSearch?: (query: string) => void;
  onIndustryChange?: (industry: string) => void;
  onLocationChange?: (location: string) => void;
  selectedIndustry?: string;
  selectedLocation?: string;
  /** Pre-fills the search input, typically from a `?search=` URL param */
  initialQuery?: string;
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

const SearchAndFilter = ({ 
  onSearch, 
  onIndustryChange, 
  onLocationChange,
  selectedIndustry = '',
  selectedLocation = '',
  initialQuery = ''
}: SearchAndFilterProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch unique industries
        const { data: industryData } = await supabase
          .from('companies')
          .select('industry')
          .not('industry', 'is', null);
        
        if (industryData) {
          const uniqueIndustries = [...new Set(industryData.map(item => item.industry))];
          setIndustries(uniqueIndustries);
        }

        // Fetch unique locations
        const { data: locationData } = await supabase
          .from('companies')
          .select('location')
          .not('location', 'is', null);
        
        if (locationData) {
          const uniqueLocations = [...new Set(locationData.map(item => item.location))];
          setLocations(uniqueLocations);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchFilters();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleIndustryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const industry = event.target.value;
    onIndustryChange?.(industry);
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const location = event.target.value;
    onLocationChange?.(location);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full"
          />
        </div>

        {/* Industry Filter */}
        <div className="w-full md:w-48">
          <Select
            value={selectedIndustry || "all"}
            onValueChange={(value) => onIndustryChange?.(value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="w-full md:w-48">
          <Select
            value={selectedLocation || "all"}
            onValueChange={(value) => onLocationChange?.(value === "all" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;