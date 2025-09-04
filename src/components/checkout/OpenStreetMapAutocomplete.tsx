import React, { useState, useCallback } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface OpenCageGeometry {
  lat: number;
  lng: number;
}

interface OpenCageComponents {
  road?: string;
  city?: string;
  state?: string;
  county?: string;
  suburb?: string;
  country?: string;
}

interface OpenCageResult {
  formatted: string;
  geometry: OpenCageGeometry;
  components: OpenCageComponents;
}

interface OpenCageResponse {
  results: OpenCageResult[];
}

interface Location {
  display_name: string;
  lat: number;
  lon: number;
  address?: OpenCageComponents;
}

interface LocationData {
  name: string;
  coordinates: { lat: number; lng: number };
}

interface Props {
  onAddressSelect: (location: LocationData) => void;
  onAddressChange?: (address: string) => void; // ✅ Added support for manual typing
  defaultValue?: string;
  className?: string;
  apiKey: string;
}

export const OpenCageAutocomplete: React.FC<Props> = ({
  onAddressSelect,
  onAddressChange,
  defaultValue = '',
  className = '',
  apiKey,
}) => {
  const [searchText, setSearchText] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 🔹 Fetch address suggestions from OpenCage API
  const searchAddress = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        if (!apiKey) throw new Error('OpenCage API key is missing');

        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query + ', Uganda'
        )}&key=${apiKey}&limit=5&no_annotations=1`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch geocoding data');

        const data = await res.json();
        const response = data as OpenCageResponse;
        const results: Location[] = (response.results || []).map((item: OpenCageResult) => ({
          display_name: item.formatted,
          lat: item.geometry.lat,
          lon: item.geometry.lng,
          address: item.components,
        }));

        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error('OpenCage search error:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey]
  );

  // 🔹 When user selects a suggestion
  const handleSelect = (location: Location) => {
    const lat = Number(location.lat);
    const lng = Number(location.lon);
    if (isNaN(lat) || isNaN(lng)) return;

    setSelectedLocation({ lat, lng });
    setSearchText(location.display_name);
    setShowSuggestions(false);

    onAddressSelect({
      name: location.display_name,
      coordinates: { lat, lng },
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchText}
          placeholder="Start typing your address in Uganda..."
          className={`w-full px-3 py-2 border rounded-md ${className}`}
          onChange={(e) => {
            const value = e.target.value;
            setSearchText(value);

            // ✅ Call parent callback for manual typing
            if (onAddressChange) {
              onAddressChange(value);
            }

            // Delay search to reduce API calls
            setTimeout(() => searchAddress(value), 200);
          }}
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-teal-600" />
          </div>
        )}

        {/* Dropdown suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
            <ul className="py-1">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleSelect(s)}
                >
                  <MapPin className="mr-2 h-4 w-4 text-teal-600" />
                  {s.display_name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Selected location summary */}
      {selectedLocation && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-green-700">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Location Selected</span>
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${selectedLocation.lat}&mlon=${selectedLocation.lng}&zoom=16`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              View on Map
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};
