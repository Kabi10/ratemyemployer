"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationAutocomplete = void 0;
/// <reference types="@types/google.maps" />
const api_1 = require("@react-google-maps/api");
const react_1 = require("react");
function LocationAutocomplete({ value, onChange, className = '', placeholder = 'Enter a location', required = false, }) {
    const { isLoaded } = (0, api_1.useLoadScript)({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: ['places'],
    });
    const [inputValue, setInputValue] = (0, react_1.useState)(value);
    const [error, setError] = (0, react_1.useState)(null);
    const autocompleteRef = (0, react_1.useRef)(null);
    const inputRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!isLoaded || !inputRef.current)
            return;
        const options = {
            types: ['(cities)'],
            fields: ['formatted_address', 'geometry', 'name'],
        };
        try {
            autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, options);
            autocompleteRef.current.addListener('place_changed', () => {
                var _a;
                const place = (_a = autocompleteRef.current) === null || _a === void 0 ? void 0 : _a.getPlace();
                if (place === null || place === void 0 ? void 0 : place.formatted_address) {
                    setInputValue(place.formatted_address);
                    onChange(place.formatted_address);
                    setError(null);
                }
                else {
                    setError('Please select a location from the dropdown');
                }
            });
        }
        catch (err) {
            console.error('Error initializing Google Maps autocomplete:', err);
            setError('Error loading location search');
        }
        return () => {
            if (autocompleteRef.current) {
                google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [isLoaded, onChange]);
    (0, react_1.useEffect)(() => {
        setInputValue(value);
    }, [value]);
    return (<div>
      <input ref={inputRef} type="text" value={inputValue} onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
        }} className={`${className} ${error ? 'border-red-500' : ''}`} placeholder={placeholder} required={required} aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? 'location-error' : undefined}/>
      {error && (<p id="location-error" className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>)}
    </div>);
}
exports.LocationAutocomplete = LocationAutocomplete;
