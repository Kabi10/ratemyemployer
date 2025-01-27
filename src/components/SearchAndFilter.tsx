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
  onSearch: (query: string) => void;
  onIndustryChange: (industry: string) => void;
  onLocationChange: (location: string) => void;
  selectedIndustry: string;
  selectedLocation: string;
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
  onSearch,
  onIndustryChange,
  onLocationChange,
  selectedIndustry,
  selectedLocation
}: SearchAndFilterProps) {
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch unique industries
        const { data: industryData } = await supabase
          .from('companies')
          .select('industry')
          .not('industry', 'is', null);

        if (industryData) {
          const uniqueIndustries = Array.from(
            new Set(
              industryData
                .map(item => item.industry)
                .filter((industry): industry is string => !!industry)
            )
          ).sort();
          setIndustries(uniqueIndustries);
        }

        // Fetch unique locations
        const { data: locationData } = await supabase
          .from('companies')
          .select('location')
          .not('location', 'is', null);

        if (locationData) {
          const uniqueLocations = Array.from(
            new Set(
              locationData
                .map(item => item.location)
                .filter((location): location is string => !!location)
            )
          ).sort();
          setLocations(uniqueLocations);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchFilters();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Search companies..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Industry
          </label>
          <select
            value={selectedIndustry}
            onChange={(e) => onIndustryChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Industries</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}