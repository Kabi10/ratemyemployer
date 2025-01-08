/// <reference types="@types/google.maps" />
import { useLoadScript } from '@react-google-maps/api';
import { useEffect, useRef, useState } from 'react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function LocationAutocomplete({
  value,
  onChange,
  className = '',
  placeholder = 'Enter a location',
  required = false,
}: LocationAutocompleteProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const options = {
      types: ['(cities)'],
      fields: ['formatted_address', 'geometry', 'name'],
    };

    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        options
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) {
          setInputValue(place.formatted_address);
          onChange(place.formatted_address);
          setError(null);
        } else {
          setError('Please select a location from the dropdown');
        }
      });
    } catch (err) {
      console.error('Error initializing Google Maps autocomplete:', err);
      setError('Error loading location search');
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
        }}
        className={`${className} ${error ? 'border-red-500' : ''}`}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'location-error' : undefined}
      />
      {error && (
        <p id="location-error" className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
