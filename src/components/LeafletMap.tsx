import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, MapPin, Navigation, Loader2, Compass, Check, X } from 'lucide-react';

// Custom University Blue Leaflet Pin Icon
const pinIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div style="
      background-color: #2563eb;
      width: 34px;
      height: 34px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #ffffff;
      box-shadow: 0 4px 14px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: #ffffff;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  marker?: {
    lat: number;
    lng: number;
    title?: string;
    description?: string;
  };
  interactive?: boolean; // If true, user can click or drag pin and search places
  onLocationSelect?: (loc: { lat: number; lng: number; address?: string }) => void;
  height?: string;
  className?: string;
  showSearchBar?: boolean;
}

interface PlaceSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center = [37.4275, -122.1697], // Default to campus center
  zoom = 15,
  marker,
  interactive = false,
  onLocationSelect,
  height = '360px',
  className = '',
  showSearchBar = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [resolvedAddress, setResolvedAddress] = useState<string>('');

  // Reverse geocode coordinate using OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: { 'Accept': 'application/json' },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      }
    } catch {
      // Fallback
    }
    return `Campus Coordinate (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  // Place or move the pin with full draggable support
  const setPin = (lat: number, lng: number, popupContent?: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([lat, lng]);
    } else {
      const newMarker = L.marker([lat, lng], {
        icon: pinIcon,
        draggable: interactive,
      }).addTo(map);

      // Listen to marker drag events
      if (interactive) {
        newMarker.on('dragend', async () => {
          const pos = newMarker.getLatLng();
          setStatusText('Resolving dropped pin coordinates...');
          const addr = await reverseGeocode(pos.lat, pos.lng);
          setResolvedAddress(addr);
          setStatusText('');
          newMarker.setPopupContent(
            `<div style="font-family: inherit; font-size: 11px; line-height: 1.4;">
              <strong style="color: #1e3a8a;">Selected Location (Pin Dropped)</strong><br/>
              ${addr}
            </div>`
          ).openPopup();

          if (onLocationSelect) {
            onLocationSelect({ lat: pos.lat, lng: pos.lng, address: addr });
          }
        });
      }

      markerInstanceRef.current = newMarker;
    }

    if (popupContent) {
      markerInstanceRef.current.bindPopup(popupContent).openPopup();
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = marker
        ? [marker.lat, marker.lng]
        : center;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom,
        zoomControl: false,
        attributionControl: true,
      });

      // Bottom-right zoom controls
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle interactive click to drop pin anywhere
      if (interactive) {
        map.on('click', async (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setPin(lat, lng, '<strong>Selected Location</strong><br/>Resolving address...');

          setStatusText('Pin placed. Resolving address...');
          const addr = await reverseGeocode(lat, lng);
          setResolvedAddress(addr);
          setStatusText('');

          if (markerInstanceRef.current) {
            markerInstanceRef.current.setPopupContent(
              `<div style="font-family: inherit; font-size: 11px; line-height: 1.4;">
                <strong style="color: #1e3a8a;">Selected Location</strong><br/>
                ${addr}
              </div>`
            ).openPopup();
          }

          if (onLocationSelect) {
            onLocationSelect({ lat, lng, address: addr });
          }
        });
      }
    }

    const map = mapInstanceRef.current;

    // Synchronize marker prop if provided
    if (marker) {
      setPin(
        marker.lat,
        marker.lng,
        `<div style="font-family: inherit; font-size: 11px; line-height: 1.4;">
          <strong style="color: #1e3a8a;">${marker.title || 'Reported Location'}</strong>
          ${marker.description ? `<br/><span style="color: #64748b;">${marker.description}</span>` : ''}
        </div>`
      );
      map.setView([marker.lat, marker.lng], zoom);
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [center, zoom, marker, interactive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Search places using Nominatim with suggestion list
  const searchPlaces = async (queryText: string) => {
    if (!queryText.trim() || queryText.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          queryText.trim()
        )}&limit=5`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data || []);
        setShowDropdown(true);
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    setStatusText('Searching campus locations...');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=4`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (response.ok) {
        const results = await response.json();
        if (results && results.length > 0) {
          selectPlace(results[0]);
        } else {
          setStatusText('No matching locations found. Try including university or city name.');
          setTimeout(() => setStatusText(''), 4000);
        }
      }
    } catch {
      setStatusText('Network search error. You can click on the map to drop a pin.');
      setTimeout(() => setStatusText(''), 4000);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPlace = (place: PlaceSuggestion) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const addr = place.display_name;

    setShowDropdown(false);
    setSearchQuery(addr.split(',')[0]);
    setResolvedAddress(addr);

    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([lat, lng], 16, { duration: 1.2 });
    }

    setPin(
      lat,
      lng,
      `<div style="font-family: inherit; font-size: 11px; line-height: 1.4;">
        <strong style="color: #1e3a8a;">Search Result:</strong><br/>
        ${addr}
      </div>`
    );

    if (onLocationSelect) {
      onLocationSelect({ lat, lng, address: addr });
    }

    setStatusText('Location selected & pin placed!');
    setTimeout(() => setStatusText(''), 3000);
  };

  // Real GPS Geolocation with high accuracy
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusText('Geolocation is not supported by your browser.');
      setTimeout(() => setStatusText(''), 3500);
      return;
    }

    setIsLocating(true);
    setStatusText('Acquiring real-time GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const map = mapInstanceRef.current;

        if (map) {
          map.flyTo([lat, lng], 17, { duration: 1.2 });
        }

        setPin(lat, lng, '<strong>Your Current Location</strong><br/>Resolving address...');
        const addr = await reverseGeocode(lat, lng);
        setResolvedAddress(addr);

        if (markerInstanceRef.current) {
          markerInstanceRef.current.setPopupContent(
            `<div style="font-family: inherit; font-size: 11px; line-height: 1.4;">
              <strong style="color: #1e3a8a;">Your Current Location (GPS)</strong><br/>
              ${addr}
            </div>`
          ).openPopup();
        }

        if (onLocationSelect) {
          onLocationSelect({ lat, lng, address: addr });
        }

        setIsLocating(false);
        setStatusText('Device GPS location captured successfully!');
        setTimeout(() => setStatusText(''), 3500);
      },
      () => {
        setIsLocating(false);
        setStatusText('Location permission denied or unavailable. You can click anywhere on the map to drop a pin.');
        setTimeout(() => setStatusText(''), 4500);
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 ${className}`}
      style={{ height }}
    >
      {/* Map Interactive Control Header */}
      {interactive && showSearchBar && (
        <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 relative flex items-center bg-white/95 backdrop-blur-md shadow-lg rounded-xl border border-slate-200/90 overflow-hidden px-2 py-1"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchPlaces(e.target.value);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                placeholder="Search campus building, library, hall, or address..."
                className="w-full px-2.5 py-1 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowDropdown(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isSearching}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* GPS Current Location Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              title="Use Real GPS Device Location"
              className="flex items-center gap-1.5 px-3 py-2 bg-white/95 hover:bg-white text-blue-600 font-bold text-xs rounded-xl shadow-lg border border-slate-200 cursor-pointer backdrop-blur-md transition-all active:scale-95 shrink-0"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Use Current Location</span>
            </button>
          </div>

          {/* Place Search Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
              {suggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onClick={() => selectPlace(item)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50/70 transition-colors flex items-start gap-2 text-xs cursor-pointer group"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 group-hover:text-blue-900 line-clamp-1">
                    {item.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Interactive Helper Banner */}
      {interactive && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-xl pointer-events-none flex items-center gap-2 shadow-md border border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Click to drop pin · Drag pin to fine-tune</span>
        </div>
      )}

      {/* Temporary Status Toast on Map */}
      {statusText && (
        <div className="absolute bottom-3 right-12 z-[1000] bg-blue-900/90 backdrop-blur text-white text-xs px-3.5 py-1.5 rounded-xl shadow-xl border border-blue-700 animate-in fade-in duration-150">
          {statusText}
        </div>
      )}
    </div>
  );
};
