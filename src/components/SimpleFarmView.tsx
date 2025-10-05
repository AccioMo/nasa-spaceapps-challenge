'use client'

import React, { useState, useEffect } from 'react'
import { Farm } from '@/components/InteractiveMap'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

interface SimpleFarmViewProps {
  farm: Farm
  season: Season
  onSeasonChange: (season: Season) => void
}

const seasonColors = {
  spring: 'bg-green-500',
  summer: 'bg-yellow-400', 
  autumn: 'bg-orange-500',
  winter: 'bg-blue-300'
}

const seasonBg = {
  spring: 'from-green-200 to-green-600',
  summer: 'from-yellow-200 to-yellow-600',
  autumn: 'from-orange-200 to-orange-600', 
  winter: 'from-blue-200 to-blue-600'
}

export default function SimpleFarmView({ farm, season, onSeasonChange }: SimpleFarmViewProps) {
  const [plants, setPlants] = useState<Array<{x: number, y: number, size: number}>>([])
  
  useEffect(() => {
    // Generate random plants
    const newPlants = Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 90 + 5, // 5-95% positioning
      y: Math.random() * 90 + 5,
      size: Math.random() * 8 + 4 // 4-12px size
    }))
    setPlants(newPlants)
  }, [farm])

  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter']
  const currentSeasonIndex = seasons.indexOf(season)
  
  const nextSeason = () => {
    const nextIndex = (currentSeasonIndex + 1) % seasons.length
    onSeasonChange(seasons[nextIndex])
  }

  return (
    <div className="w-full h-full relative">
      {/* Farm field background */}
      <div className={`w-full h-full bg-gradient-to-br ${seasonBg[season]} relative overflow-hidden`}>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border border-gray-700 border-opacity-30"></div>
            ))}
          </div>
        </div>
        
        {/* Plants */}
        {plants.map((plant, i) => (
          <div
            key={i}
            className={`absolute ${seasonColors[season]} rounded-full opacity-80`}
            style={{
              left: `${plant.x}%`,
              top: `${plant.y}%`,
              width: `${plant.size}px`,
              height: `${plant.size}px`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
        
        {/* Isometric effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10"></div>
      </div>
      
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
          <div>PLANTS: {plants.length}</div>
          <div>STATUS: ACTIVE</div>
        </div>
      </div>

      {/* 3D Loading indicator */}
      <div className="absolute top-4 left-4 luxury-bg p-2 border border-gray-300 luxury-shadow rounded">
        <div className="text-yellow-600 font-mono text-xs">
          🚧 3D VIEW LOADING...
        </div>
      </div>
    </div>
  )
}