/**
 * Free Location Autocomplete Component
 * Replaces Google Maps API with free alternatives
 */

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface FreeLocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

// Common US cities and states for offline fallback
const COMMON_LOCATIONS = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
  'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
  'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
  'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
  'Kansas City, MO', 'Mesa, AZ', 'Atlanta, GA', 'Omaha, NE', 'Colorado Springs, CO',
  'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA', 'Oakland, CA', 'Minneapolis, MN',
  'Tulsa, OK', 'Arlington, TX', 'Tampa, FL', 'New Orleans, LA', 'Wichita, KS',
  // Add states
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

export function FreeLocationAutocomplete({
  value,
  onChange,
  className = '',
  placeholder = 'Enter a location',
  required = false,
}: FreeLocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [useOnlineSearch, setUseOnlineSearch] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value.length >= 2) {
        searchLocations(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (query: string) => {
    setIsLoading(true);
    
    try {
      let results: string[] = [];
      
      if (useOnlineSearch) {
        // Try Nominatim (OpenStreetMap) API first - completely free
        results = await searchWithNominatim(query);
        
        // If no results, fall back to offline search
        if (results.length === 0) {
          results = searchOffline(query);
        }
      } else {
        // Use offline search only
        results = searchOffline(query);
      }
      
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.warn('Location search failed, using offline fallback:', error);
      // Fall back to offline search
      const offlineResults = searchOffline(query);
      setSuggestions(offlineResults);
      setShowSuggestions(offlineResults.length > 0);
      setUseOnlineSearch(false); // Disable online search for this session
    } finally {
      setIsLoading(false);
    }
  };

  const searchWithNominatim = async (query: string): Promise<string[]> => {
    // Nominatim is the free geocoding service behind OpenStreetMap
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&countrycodes=us&q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RateMyEmployer/1.0 (location-autocomplete)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: LocationSuggestion[] = await response.json();
    
    return data
      .filter(item => item.importance > 0.3) // Filter by relevance
      .map(item => formatLocationName(item.display_name))
      .slice(0, 6);
  };

  const searchOffline = (query: string): string[] => {
    const lowerQuery = query.toLowerCase();
    return COMMON_LOCATIONS
      .filter(location => 
        location.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 6);
  };

  const formatLocationName = (displayName: string): string => {
    // Extract city, state from Nominatim format
    const parts = displayName.split(', ');
    if (parts.length >= 3) {
      const city = parts[0];
      const state = parts[parts.length - 2];
      return `${city}, ${state}`;
    }
    return displayName;
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setShowSuggestions(suggestions.length > 0)}
          placeholder={placeholder}
          required={required}
          className={`pl-10 pr-10 ${className}`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        {!useOnlineSearch && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-gray-400" title="Using offline location data">📍</span>
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none first:rounded-t-md last:rounded-b-md"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center">
                <MapPin className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </div>
            </button>
          ))}
          
          {!useOnlineSearch && (
            <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700">
              Using offline location data
            </div>
          )}
        </div>
      )}
    </div>
  );
}
