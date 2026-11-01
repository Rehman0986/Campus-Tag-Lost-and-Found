"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon for Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

interface MapProps {
  center: [number, number]
  zoom?: number
  onLocationSelect?: (lat: number, lng: number, address?: string) => void
  showMarker?: boolean
  initialMarker?: [number, number]
  height?: string
  className?: string
  searchEnabled?: boolean
}

interface SearchResult {
  lat: number
  lng: number
  display_name: string
}

export function MapComponent({
  center = [31.2304, 121.4737],
  zoom = 15,
  onLocationSelect,
  showMarker = true,
  initialMarker,
  height = '400px',
  className = '',
  searchEnabled = true,
}: MapProps) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(initialMarker || null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null)
  const mapRef = useRef<any>(null)

  const centerMarker = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.panTo(new L.LatLng(center[0], center[1]))
    }
  }, [center])

  const handleMapClick = useCallback((e: any) => {
    const { lat, lng } = e.latlng
    setMarkerPosition([lat, lng])
    if (onLocationSelect) {
      onLocationSelect(lat, lng)
    }
  }, [onLocationSelect])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setSearchResults(data.map((r: any) => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        display_name: r.display_name,
      })))
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery])

  const handleSelectResult = useCallback((result: SearchResult) => {
    setMarkerPosition([result.lat, result.lng])
    setSearchResults([])
    setSearchQuery('')
    if (onLocationSelect) {
      onLocationSelect(result.lat, result.lng, result.display_name)
    }
    if (mapRef.current) {
      mapRef.current.panTo(new L.LatLng(result.lat, result.lng))
      mapRef.current.setZoom(16)
    }
  }, [onLocationSelect])

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCurrentLocation([latitude, longitude])
        setMarkerPosition([latitude, longitude])
        if (onLocationSelect) {
          onLocationSelect(latitude, longitude)
        }
        if (mapRef.current) {
          mapRef.current.panTo(new L.LatLng(latitude, longitude))
          mapRef.current.setZoom(16)
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        alert('Unable to retrieve your location. Please allow location access.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [onLocationSelect])

  return (
    <div className={`position-relative ${className}`} style={{ height }}>
      {searchEnabled && (
        <div className="position-absolute top-0 start-0 translate-middle-y p-2" style={{ zIndex: 1000 }}>
          <div className="input-group input-group-sm shadow-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-outline-secondary" onClick={handleSearch} disabled={isSearching}>
              {isSearching ? '...' : 'Search'}
            </button>
          </div>
          {searchResults.length > 0 && !isSearching && (
            <div className="dropdown-menu position-absolute w-100 bg-white shadow-sm small">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  className="dropdown-item text-start text-truncate"
                  onClick={() => handleSelectResult(r)}
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-3 border border-light"
      >
        <MapRefCapture onMapReady={(map) => { mapRef.current = map }} />
        <MapClickHandler onClick={handleMapClick} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {showMarker && markerPosition && (
          <Marker position={markerPosition}>
            <Popup>Selected location</Popup>
          </Marker>
        )}
        {currentLocation && (
          <Marker position={currentLocation} icon={defaultIcon}>
            <Popup>Your current location</Popup>
          </Marker>
        )}
        <MapControls
          onCurrentLocation={handleCurrentLocation}
          onCenter={centerMarker}
        />
      </MapContainer>
    </div>
  )
}

interface MapClickHandlerProps {
  onClick: (e: any) => void
}

function MapClickHandler({ onClick }: MapClickHandlerProps) {
  const map = useMap()
  useEffect(() => {
    const handler = (e: any) => onClick(e)
    map.on('click', handler)
    return () => {
      map.off('click', handler)
      return undefined
    }
  }, [map, onClick])
  return null
}

function MapRefCapture({ onMapReady }: { onMapReady: (map: any) => void }) {
  const map = useMap()
  useEffect(() => {
    onMapReady(map)
    return undefined
  }, [map, onMapReady])
  return null
}

interface MapControlsProps {
  onCurrentLocation: () => void
  onCenter: () => void
}

function MapControls({ onCurrentLocation, onCenter }: MapControlsProps) {
  const map = useMap()

  useEffect(() => {
    const control = (L as any).control({ position: 'bottomright' })
    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom')
      div.style.background = 'white'
      div.style.padding = '5px'
      div.style.borderRadius = '4px'
      div.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'

      const btnLoc = L.DomUtil.create('button', 'btn btn-sm btn-primary mb-2', div)
      btnLoc.innerHTML = 'My Location'
      btnLoc.title = 'Use current location'
      L.DomEvent.on(btnLoc, 'click', onCurrentLocation)

      const btnCenter = L.DomUtil.create('button', 'btn btn-sm btn-outline-secondary', div)
      btnCenter.innerHTML = 'Center'
      btnCenter.title = 'Center map'
      L.DomEvent.on(btnCenter, 'click', onCenter)

      return div
    }
    control.addTo(map)
    return () => {
      map.removeControl(control)
      return undefined
    }
  }, [map, onCurrentLocation, onCenter])

  return null
}

interface LocationPickerProps {
  value: [number, number] | null
  address: string
  onChange: (lat: number, lng: number, address?: string) => void
  height?: string
}

export function LocationPicker({ value, address, onChange, height = '350px' }: LocationPickerProps) {
  return (
    <MapComponent
      center={value || [31.2304, 121.4737]}
      onLocationSelect={(lat, lng, addr) => onChange(lat, lng, addr)}
      showMarker
      initialMarker={value}
      height={height}
      searchEnabled
      className="shadow-sm"
    />
  )
}
