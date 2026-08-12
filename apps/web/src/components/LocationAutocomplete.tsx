import React, { useRef, useEffect } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Search } from 'lucide-react';

export interface SelectedPlace {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
  name?: string;
  city?: string;
  country?: string;
}

interface LocationAutocompleteProps {
  onPlaceSelect: (place: SelectedPlace) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onPlaceSelect,
  defaultValue = "",
  placeholder = "Search venue, street address, or city...",
  className = ""
}) => {
  const placesLib = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components'],
      types: ['establishment', 'geocode'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        let city = '';
        let country = '';

        place.address_components?.forEach(comp => {
          if (comp.types.includes('locality')) city = comp.long_name;
          if (comp.types.includes('country')) country = comp.long_name;
        });

        onPlaceSelect({
          address: place.formatted_address || place.name || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id || '',
          name: place.name || '',
          city,
          country
        });
      }
    });
  }, [placesLib, onPlaceSelect]);

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <MapPin className="absolute left-3.5 h-4 w-4 text-white/40 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-[#141416] text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] transition"
      />
    </div>
  );
};
