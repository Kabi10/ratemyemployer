/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function LocationAutocomplete({ value, onChange, error }: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds total

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        if (retryCount < maxRetries) {
          retryCount++;
          timeoutId = setTimeout(initAutocomplete, 100);
          return;
        }
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        fields: ['formatted_address'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          onChange(place.formatted_address);
        }
      });

      setIsLoaded(true);
    };

    initAutocomplete();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [onChange]);

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1"
        placeholder="Enter location"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
