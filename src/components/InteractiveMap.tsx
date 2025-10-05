'use client'

import { useState } from 'react'
import OpenStreetMapComponent, { Farm } from './OpenStreetMapSimple'

interface InteractiveMapProps {
  onFarmSelect: (farm: Farm) => void
  selectedFarm: Farm | null
  cropType?: string
}

export default function InteractiveMap({ onFarmSelect, selectedFarm, cropType = 'Corn Production' }: InteractiveMapProps) {
  return (
    <div className="w-full h-full">
      <OpenStreetMapComponent 
        onFarmSelect={onFarmSelect}
        selectedFarm={selectedFarm}
        cropType={cropType}
      />
    </div>
  )
}

// Re-export the Farm interface for other components to use
export type { Farm } from './OpenStreetMapSimple'