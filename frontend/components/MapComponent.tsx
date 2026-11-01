"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface MapProps {
  center?: [number, number]
  zoom?: number
  onLocationSelect?: (lat: number, lng: number, address?: string) => void
  showMarker?: boolean
  initialMarker?: [number, number]
  height?: string
  className?: string
  searchEnabled?: boolean
}

interface LocationPickerProps {
  value: [number, number] | null
  address: string
  onChange: (lat: number, lng: number, address?: string) => void
  height?: string
}

// Client-only map implementation loaded dynamically to avoid SSR window issues
const MapComponentImpl = React.lazy(() => import('./MapComponentImpl').then((mod) => ({ default: mod.MapComponent })))
const LocationPickerImpl = React.lazy(() => import('./MapComponentImpl').then((mod) => ({ default: mod.LocationPicker })))

export default function MapComponent({
  center = [31.2304, 121.4737],
  zoom = 15,
  onLocationSelect,
  showMarker = true,
  initialMarker,
  height = '400px',
  className = '',
  searchEnabled = true,
}: MapProps) {
  const [impl, setImpl] = useState<any>(null)

  useEffect(() => {
    import('./MapComponentImpl').then((mod) => setImpl(mod.MapComponent))
  }, [])

  if (!impl) {
    return <div className={`border rounded-3 ${className}`} style={{ height, background: '#f8f9fa' }} />
  }

  return React.createElement(impl, {
    center, zoom, onLocationSelect, showMarker, initialMarker, height, className, searchEnabled
  })
}

export function LocationPicker({ value, address, onChange, height = '350px' }: LocationPickerProps) {
  const [impl, setImpl] = useState<any>(null)

  useEffect(() => {
    import('./MapComponentImpl').then((mod) => setImpl(mod.LocationPicker))
  }, [])

  if (!impl) {
    return <div className="border rounded-3 shadow-sm" style={{ height, background: '#f8f9fa' }} />
  }

  return React.createElement(impl, { value, address, onChange, height })
}
