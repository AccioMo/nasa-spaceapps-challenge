'use client'

import { useEffect, useState, useCallback } from 'react'
import { getGeographicData, getCropSuitability, GeographicData } from '@/utils/geographicData'

export interface Farm {
  id: string
  name: string
  location: {
    lat: number
    lng: number
  }
  type: string
  country: string
  description: string
  geographicData?: GeographicData
  suitabilityScore?: number
}

interface OpenStreetMapProps {
  onFarmSelect: (farm: Farm) => void
  selectedFarm: Farm | null
  cropType?: string
}

// Leaflet Map Component (will be dynamically imported)
function LeafletMap({ 
  center, 
  selectedLocation, 
  onLocationSelect 
}: { 
  center: [number, number], 
  selectedLocation: { lat: number, lng: number } | null,
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  const [map, setMap] = useState<any>(null)
  const [L, setL] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)

  useEffect(() => {
    // Dynamic import of Leaflet
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
      
      // Import CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    })
  }, [])

  useEffect(() => {
    if (!L || map) return

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Check if the map container exists
      const mapContainer = document.getElementById('leaflet-map')
      if (!mapContainer) return

      try {
        // Create map
        const mapInstance = L.map('leaflet-map').setView(center, 4)

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance)

        // Add click event - store reference to avoid dependency issues
        const handleMapClick = (e: any) => {
          const { lat, lng } = e.latlng
          onLocationSelect(lat, lng)
        }
        
        mapInstance.on('click', handleMapClick)

        setMap(mapInstance)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [L])

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (map) {
        try {
          map.remove()
        } catch (error) {
          console.warn('Error removing map:', error)
        }
      }
    }
  }, [])

  // Update marker when selected location changes
  useEffect(() => {
    if (!L || !map || !selectedLocation) return

    // Remove existing marker
    if (marker) {
      try {
        map.removeLayer(marker)
      } catch (error) {
        console.warn('Error removing marker:', error)
      }
    }

    // Create custom icon
    const customIcon = L.divIcon({
      className: 'custom-farm-marker',
      html: '<div style="background: #d4af37; border: 2px solid #b8860b; border-radius: 50%; width: 16px; height: 16px;"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    })

    try {
      // Add new marker
      const newMarker = L.marker([selectedLocation.lat, selectedLocation.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: monospace; font-size: 12px;">
            <div style="font-weight: bold; color: #d4af37;">🌾 FARM LOCATION</div>
            <div style="margin-top: 8px;">
              <div>Lat: ${selectedLocation.lat.toFixed(4)}</div>
              <div>Lng: ${selectedLocation.lng.toFixed(4)}</div>
            </div>
          </div>
        `)

      setMarker(newMarker)
      
      // Only update view if map is ready
      if (map && map.getZoom) {
        map.setView([selectedLocation.lat, selectedLocation.lng], Math.max(map.getZoom(), 6))
      }
    } catch (error) {
      console.error('Error adding marker:', error)
    }
  }, [L, map, selectedLocation])

  return <div id="leaflet-map" style={{ height: '100%', width: '100%' }} />
}

export default function OpenStreetMapComponent({ onFarmSelect, selectedFarm, cropType = 'Corn Production' }: OpenStreetMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]) // Center of USA
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null)

  // Generate farm data from coordinates
  const generateFarmFromCoordinates = useCallback((lat: number, lng: number): Farm => {
    const geoData = getGeographicData(lat, lng)
    const suitabilityScore = getCropSuitability(geoData, cropType)
    
    // Get country/region name (simplified)
    const getRegionName = (lat: number, lng: number): string => {
      if (lat > 49 && lng > -125 && lng < -60) return 'Canada'
      if (lat > 25 && lat < 49 && lng > -125 && lng < -65) return 'USA'
      if (lat > -35 && lat < 25 && lng > -120 && lng < -30) return 'Central/South America'
      if (lat > 35 && lng > -10 && lng < 70) return 'Europe/Middle East'
      if (lat > -35 && lng > 70 && lng < 180) return 'Asia/Oceania'
      if (lat > -35 && lng > -20 && lng < 55) return 'Africa'
      return 'International Waters'
    }
    
    const region = getRegionName(lat, lng)
    const farmId = `farm-${lat.toFixed(4)}-${lng.toFixed(4)}`
    
    return {
      id: farmId,
      name: `${cropType.split(' ')[0]} Farm`,
      location: { lat, lng },
      type: cropType,
      country: region,
      description: `Custom ${cropType.toLowerCase()} farm at coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}. 
        Climate: ${geoData.temperature}°C, ${geoData.rainfall}mm rainfall annually. 
        Soil: ${geoData.soilType} with pH ${geoData.soilPH}. 
        Elevation: ${geoData.elevation}m above sea level.`,
      geographicData: geoData,
      suitabilityScore
    }
  }, [cropType])

  // Handle map click
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    const farm = generateFarmFromCoordinates(lat, lng)
    onFarmSelect(farm)
  }, [generateFarmFromCoordinates, onFarmSelect])

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update map center when selected farm changes
  useEffect(() => {
    if (selectedFarm) {
      setMapCenter([selectedFarm.location.lat, selectedFarm.location.lng])
      setSelectedLocation(selectedFarm.location)
    }
  }, [selectedFarm])

  // Demo locations
  const demoLocations = [
    { lat: 42.0308, lng: -93.6319, name: 'Iowa, USA', climate: 'Continental' },
    { lat: 38.5266, lng: -96.7265, name: 'Kansas, USA', climate: 'Continental' },
    { lat: 10.4583, lng: 106.3417, name: 'Vietnam', climate: 'Tropical' },
    { lat: 4.5709, lng: -75.6173, name: 'Colombia', climate: 'Tropical' },
    { lat: -15.7801, lng: -47.9292, name: 'Brazil', climate: 'Tropical' },
    { lat: 36.7213, lng: -4.4214, name: 'Spain', climate: 'Mediterranean' },
    { lat: -11.0853, lng: -77.0438, name: 'Peru', climate: 'Mountain' },
    { lat: -43.5321, lng: 172.6362, name: 'New Zealand', climate: 'Temperate' }
  ]

  // Show loading if not client-side yet
  if (!isClient) {
    return (
      <div className="w-full h-full luxury-border border-2 luxury-shadow-lg luxury-bg relative rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto"></div>
          <div className="luxury-accent font-mono">Loading OpenStreetMap...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full luxury-border border-2 luxury-shadow-lg luxury-bg relative rounded-lg overflow-hidden">
      {/* Custom CSS for Leaflet */}
      <style jsx global>{`
        .leaflet-control-zoom {
          border: 2px solid #d4af37 !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        
        .leaflet-control-zoom a {
          background-color: white !important;
          border: none !important;
          color: #d4af37 !important;
          font-weight: bold !important;
          transition: all 0.2s ease;
        }
        
        .leaflet-control-zoom a:hover {
          background-color: #d4af37 !important;
          color: white !important;
        }
        
        .leaflet-popup-content-wrapper {
          background: white;
          border: 2px solid #d4af37;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-popup-tip {
          background: #d4af37;
        }

        .custom-farm-marker {
          border: none !important;
          background: transparent !important;
        }
      `}</style>

      <LeafletMap 
        center={mapCenter}
        selectedLocation={selectedLocation}
        onLocationSelect={handleLocationSelect}
      />

      {/* Demo location buttons overlay */}
      <div className="absolute top-4 left-4 luxury-bg p-4 border border-gray-300 luxury-shadow rounded max-w-xs">
        <div className="luxury-accent font-mono text-sm font-bold mb-3">🎯 QUICK LOCATIONS</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {demoLocations.slice(0, 4).map((location, index) => {
            const geoData = getGeographicData(location.lat, location.lng)
            const suitability = getCropSuitability(geoData, cropType)
            
            return (
              <button
                key={index}
                onClick={() => handleLocationSelect(location.lat, location.lng)}
                className={`p-2 border font-mono transition-all rounded luxury-shadow text-xs ${
                  selectedLocation?.lat === location.lat && selectedLocation?.lng === location.lng
                    ? 'premium-gradient text-white border-yellow-600'
                    : 'border-gray-300 text-gray-700 hover:border-yellow-600 hover:text-yellow-600 luxury-bg'
                }`}
              >
                <div className="font-bold">{location.name.split(',')[0]}</div>
                <div className="opacity-75">{suitability}% suitable</div>
              </button>
            )
          })}
        </div>
        
        <button
          onClick={() => {
            const lat = (Math.random() - 0.5) * 160
            const lng = (Math.random() - 0.5) * 360
            handleLocationSelect(lat, lng)
          }}
          className="w-full mt-3 premium-gradient text-white font-mono font-bold rounded luxury-shadow hover:bg-opacity-90 transition-all text-xs py-2"
        >
          🎲 RANDOM LOCATION
        </button>
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 luxury-bg p-3 border border-gray-300 luxury-shadow rounded">
        <div className="text-gray-600 font-mono text-xs space-y-1">
          <div className="font-bold luxury-accent">🗺️ OPENSTREETMAP</div>
          <div>Click anywhere on the map to place a farm</div>
          <div>Use quick locations or explore freely</div>
          <div>Soil & water data from coordinates</div>
        </div>
      </div>

      {/* Current crop type indicator */}
      {cropType && (
        <div className="absolute top-4 right-4 luxury-bg p-3 border border-gray-300 luxury-shadow rounded">
          <div className="text-gray-600 font-mono text-xs">
            <div className="font-bold luxury-accent">CROP TYPE</div>
            <div>{cropType}</div>
          </div>
        </div>
      )}
    </div>
  )
}