'use client'

import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Farm } from '@/components/InteractiveMap'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

interface IsometricFarmProps {
  farm: Farm
  season: Season
  onSeasonChange: (season: Season) => void
}

// Dynamically import the Three.js components to avoid SSR issues
const FarmCanvas = dynamic(() => import('./FarmCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center luxury-bg">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto"></div>
        <div className="luxury-accent font-mono">Loading 3D Farm View...</div>
      </div>
    </div>
  )
})

export default function IsometricFarm({ farm, season, onSeasonChange }: IsometricFarmProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter']
  const currentSeasonIndex = seasons.indexOf(season)
  
  const nextSeason = () => {
    const nextIndex = (currentSeasonIndex + 1) % seasons.length
    onSeasonChange(seasons[nextIndex])
  }

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center luxury-bg">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto"></div>
          <div className="luxury-accent font-mono">Initializing 3D Environment...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center luxury-bg">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto"></div>
            <div className="luxury-accent font-mono">Loading Farm Simulation...</div>
          </div>
        </div>
      }>
        <FarmCanvas farm={farm} season={season} />
      </Suspense>
      
      {/* Season control overlay */}
      <div className="absolute top-4 right-4 luxury-bg p-3 border border-gray-300 luxury-shadow rounded">
        <div className="luxury-accent font-mono text-sm mb-2">
          SEASON: {season.toUpperCase()}
        </div>
        <button
          onClick={nextSeason}
          className="premium-gradient text-white font-mono py-1 px-3 text-xs hover:bg-opacity-90 transition-colors rounded luxury-shadow"
        >
          NEXT SEASON →
        </button>
      </div>
      
      {/* Farm info overlay */}
      <div className="absolute bottom-4 left-4 luxury-bg p-3 border border-gray-300 luxury-shadow rounded">
        <div className="luxury-accent font-mono text-xs space-y-1">
          <div>FARM: {farm.name}</div>
          <div>TYPE: {farm.type}</div>
          <div>SEASON: {season}</div>
          <div>STATUS: ACTIVE</div>
        </div>
      </div>
    </div>
  )
}