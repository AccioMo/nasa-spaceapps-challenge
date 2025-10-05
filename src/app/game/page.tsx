'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Droplets, Thermometer, Activity } from 'lucide-react'
import { Farm } from '@/components/InteractiveMap'
import Simple2DFarm, { Season } from '@/components/Simple2DFarm'
import FarmlandScene from '@/components/FarmlandScene'

export default function GamePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
  const [currentSeason, setCurrentSeason] = useState<Season>('spring')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      // Get selected farm from localStorage
      const farmData = localStorage.getItem('selectedFarm')
      if (farmData) {
        setSelectedFarm(JSON.parse(farmData))
      } else {
        router.push('/farm-selection')
      }
    }
  }, [status, router])

  // Get season-based stats
  const getSeasonStats = (season: Season) => {
    const baseStats = {
      spring: { health: 85, moisture: 90, temp: 18 },
      summer: { health: 95, moisture: 65, temp: 28 },
      autumn: { health: 75, moisture: 80, temp: 15 },
      winter: { health: 60, moisture: 95, temp: 2 }
    }
    return baseStats[season]
  }

  const stats = selectedFarm ? getSeasonStats(currentSeason) : { health: 0, moisture: 0, temp: 0 }

  // Show loading while checking authentication or waiting for farm data
  if (status === 'loading' || (status === 'authenticated' && !selectedFarm)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto"></div>
          <div className="luxury-accent font-mono">Loading Farm Data...</div>
        </div>
      </div>
    )
  }

  // Return null while redirecting
  if (status === 'unauthenticated') {
    return null
  }

  // Ensure we have a selected farm before rendering
  if (!selectedFarm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto"></div>
          <div className="luxury-accent font-mono">Loading Farm Data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 p-4 luxury-bg luxury-shadow">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/farm-selection')}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-mono">BACK</span>
            </button>
            <div>
              <h1 className="font-orbitron text-xl font-bold luxury-accent">
                {selectedFarm.name}
              </h1>
              <p className="text-xs text-gray-500 font-mono">{selectedFarm.country}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="luxury-accent font-mono text-lg font-bold">MISSION ACTIVE</div>
            <div className="text-xs text-gray-500">Season: {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}</div>
          </div>
        </div>
      </header>

      {/* Main Game Interface */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Top Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="luxury-bg border border-gray-300 p-4 rounded-lg luxury-shadow text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span className="luxury-accent font-mono font-bold">HEALTH</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.health}%</div>
          </div>
          <div className="luxury-bg border border-gray-300 p-4 rounded-lg luxury-shadow text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <span className="luxury-accent font-mono font-bold">MOISTURE</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.moisture}%</div>
          </div>
          <div className="luxury-bg border border-gray-300 p-4 rounded-lg luxury-shadow text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Thermometer className="w-5 h-5 text-orange-600" />
              <span className="luxury-accent font-mono font-bold">TEMP</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.temp}°C</div>
          </div>
          <div className="luxury-bg border border-gray-300 p-4 rounded-lg luxury-shadow text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-lg">🌾</span>
              <span className="luxury-accent font-mono font-bold">SEASON</span>
            </div>
            <div className="text-xl font-bold luxury-accent capitalize mb-2">{currentSeason}</div>
            <button
              onClick={() => {
                const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter']
                const currentIndex = seasons.indexOf(currentSeason)
                const nextIndex = (currentIndex + 1) % seasons.length
                const newSeason = seasons[nextIndex]
                setCurrentSeason(newSeason)
                
                // Trigger season change in farm component
                // The Simple2DFarm component will react to the season prop change
              }}
              className="premium-gradient text-white font-mono py-1 px-2 text-xs hover:bg-opacity-90 transition-colors rounded shadow-sm"
            >
              NEXT →
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Farm View */}
          <div className="lg:col-span-2">
            <div className="luxury-bg border border-gray-300 rounded-lg luxury-shadow overflow-hidden">
              <div className="p-4 border-b border-gray-300">
                <h3 className="font-orbitron luxury-accent font-bold">FARM MANAGEMENT</h3>
                <p className="text-sm text-gray-600 font-mono mt-1">Click on any cell to manage individual crop sections</p>
              </div>
              <div className="flex-1 min-h-[500px]">
                {selectedFarm && (
                  <Simple2DFarm
                    farm={selectedFarm}
                    season={currentSeason}
                    onSeasonChange={setCurrentSeason}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">

            {/* Resources */}
            <div className="luxury-bg border border-gray-300 p-4 rounded-lg luxury-shadow">
              <h4 className="font-orbitron luxury-accent mb-4 font-bold">RESOURCES</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600">💧</span>
                    <span className="text-gray-700 font-mono text-sm">Water</span>
                  </div>
                  <span className="text-blue-600 font-bold font-mono">1,250L</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-600">🌱</span>
                    <span className="text-gray-700 font-mono text-sm">Seeds</span>
                  </div>
                  <span className="text-yellow-600 font-bold font-mono">500kg</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">🧪</span>
                    <span className="text-gray-700 font-mono text-sm">Fertilizer</span>
                  </div>
                  <span className="text-green-600 font-bold font-mono">200kg</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="luxury-accent">💰</span>
                    <span className="text-gray-700 font-mono text-sm">Budget</span>
                  </div>
                  <span className="luxury-accent font-bold font-mono">$15,000</span>
                </div>
              </div>
            </div>

            {/* Farm Info */}
            <div className="luxury-bg border border-gray-300 p-4 rounded-lg luxury-shadow">
              <h4 className="font-orbitron luxury-accent mb-4 font-bold">FARM INFO</h4>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="text-gray-800">{selectedFarm.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Crop Type:</span>
                  <span className="text-gray-800">{selectedFarm.type}</span>
                </div>
                {selectedFarm.geographicData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Humidity:</span>
                      <span className="text-gray-800 capitalize">82%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Elevation:</span>
                      <span className="text-gray-800">{selectedFarm.geographicData.elevation}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Suitability:</span>
                      <span className={`font-bold ${
                        (selectedFarm.suitabilityScore || 0) >= 80 ? 'text-green-600' :
                        (selectedFarm.suitabilityScore || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {selectedFarm.suitabilityScore}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3D Farm Visualization */}
        <div className="mt-8 luxury-bg border border-gray-300 rounded-lg luxury-shadow overflow-hidden">
          <div className="p-4 border-b border-gray-300">
            <h3 className="font-orbitron luxury-accent text-xl font-bold">3D FARM VISUALIZATION</h3>
            <p className="text-sm text-gray-600 font-mono mt-1">Interactive 3D view of your farm with detailed crop fields, barn, and windmill</p>
          </div>
          <div className="relative">
            <FarmlandScene farm={selectedFarm} season={currentSeason} />
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded text-xs font-mono">
              <div className="luxury-accent font-bold mb-1">3D VIEW CONTROLS</div>
              <div className="text-gray-600 space-y-1">
                <div>• Mouse: Rotate view</div>
                <div>• Scroll: Zoom in/out</div>
                <div>• Auto-rotating windmill</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Objectives - Simplified */}
        <div className="mt-8 luxury-bg border border-gray-300 p-6 rounded-lg luxury-shadow">
          <h3 className="font-orbitron luxury-accent text-xl mb-4 font-bold">MISSION OBJECTIVES</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm font-mono">
            <div className="text-center">
              <div className="text-2xl mb-2">⏳</div>
              <div className="text-yellow-600 font-bold mb-3">SHORT TERM</div>
              <ul className="text-gray-700 space-y-2">
                <li>• Monitor soil conditions</li>
                <li>• Optimize irrigation</li>
                <li>• Track weather patterns</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-orange-600 font-bold mb-3">MEDIUM TERM</div>
              <ul className="text-gray-700 space-y-2">
                <li>• Maximize crop yield</li>
                <li>• Reduce water usage</li>
                <li>• Prevent crop diseases</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🌍</div>
              <div className="text-green-600 font-bold mb-3">LONG TERM</div>
              <ul className="text-gray-700 space-y-2">
                <li>• Achieve sustainability</li>
                <li>• Carbon neutral farming</li>
                <li>• Food security goals</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}