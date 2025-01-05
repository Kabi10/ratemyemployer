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
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const options = {
      types: ['(cities)'],
    };

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.formatted_address) {
        setInputValue(place.formatted_address);
        onChange(place.formatted_address);
      }
    });

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
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        onChange(e.target.value);
      }}
      className={className}
      placeholder={placeholder}
      required={required}
    />
  );
}
