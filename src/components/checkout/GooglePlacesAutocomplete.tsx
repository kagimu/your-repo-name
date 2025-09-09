import React from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

interface Props {
  onAddressSelect: (address: string, placeDetails: google.maps.places.PlaceResult) => void;
  defaultValue?: string;
  className?: string;
}

export const GooglePlacesAutocomplete: React.FC<Props> = ({ onAddressSelect, defaultValue = "", className = "" }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [autocomplete, setAutocomplete] = React.useState<google.maps.places.Autocomplete | null>(null);

  const onLoad = (autoComplete: google.maps.places.Autocomplete) => {
    // Restrict to Uganda
    autoComplete.setComponentRestrictions({
      country: ["ug"],
    });
    setAutocomplete(autoComplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const formattedAddress = place.formatted_address || "";
      onAddressSelect(formattedAddress, place);
    }
  };

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
    >
      <input
        type="text"
        placeholder="Start typing your address..."
        defaultValue={defaultValue}
        className={`w-full px-3 py-2 border rounded-md border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      />
    </Autocomplete>
  );
};
