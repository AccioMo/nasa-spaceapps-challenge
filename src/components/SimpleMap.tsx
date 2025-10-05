'use client'

import { useEffect, useRef } from 'react'

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
}

interface GoogleMapProps {
  farms: Farm[]
  onFarmSelect: (farm: Farm) => void
  selectedFarm: Farm | null
}

export default function GoogleMap({ farms, onFarmSelect, selectedFarm }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // For now, we'll create a placeholder map
    // In production, you'll need to add your Google Maps API key
    console.log('Google Maps would be initialized here with API key')
  }, [])

  return (
    <div className="w-full h-full luxury-border border-2 luxury-shadow-lg luxury-bg relative rounded-lg">
      <div 
        ref={mapRef} 
        className="w-full h-full flex items-center justify-center rounded-lg"
        style={{ minHeight: '400px' }}
      >
        {/* Placeholder map content */}
        <div className="text-center space-y-4">
          <div className="luxury-accent font-mono text-lg">🗺️ WORLD MAP</div>
          <div className="text-gray-500 text-sm">Google Maps integration requires API key</div>
          
          {/* Farm selection grid */}
          <div className="grid grid-cols-2 gap-4 mt-8 max-w-md">
            {farms.map((farm, index) => (
              <button
                key={farm.id}
                onClick={() => onFarmSelect(farm)}
                className={`p-4 border-2 font-mono text-sm transition-all rounded-md luxury-shadow ${
                  selectedFarm?.id === farm.id
                    ? 'premium-gradient text-white border-yellow-600'
                    : 'border-gray-300 text-gray-700 hover:border-yellow-600 hover:text-yellow-600 luxury-bg'
                }`}
              >
                <div className="font-bold">{farm.name}</div>
                <div className="text-xs opacity-75">{farm.country}</div>
                <div className="text-xs opacity-50">{farm.type}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}