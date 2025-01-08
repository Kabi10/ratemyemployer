'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';

interface SearchAndFilterProps {
  onLocationChange?: (location: string) => void;
  onIndustryChange?: (industry: string) => void;
  onSearchChange?: (search: string) => void;
}

export default function SearchAndFilter({ onLocationChange, onIndustryChange, onSearchChange }: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // Fetch industries
      const { data: industryData, error: industryError } = await supabase
        .from('companies')
        .select('industry');

      if (industryError) {
        console.error('Error fetching industries:', industryError);
      } else {
        const uniqueIndustries = Array.from(new Set(industryData
          .map(item => item.industry)
          .filter((industry): industry is string => industry !== null)))
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
          .filter((location): location is string => location !== null)))
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

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={e => handleSearchChange(e.target.value)}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        <select
          value={selectedIndustry}
          onChange={e => handleIndustryChange(e.target.value)}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="all">All Industries</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
        <select
          value={selectedLocation}
          onChange={e => handleLocationChange(e.target.value)}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="all">All Locations</option>
          {locations.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
