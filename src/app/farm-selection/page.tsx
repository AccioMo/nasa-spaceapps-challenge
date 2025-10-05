'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LogOut, User } from 'lucide-react'
import InteractiveMap, { Farm } from '@/components/InteractiveMap'
import { farmLocations } from '@/data/farms'
import { signOut } from 'next-auth/react'

export default function FarmSelectionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null)
  const [cropType, setCropType] = useState<string>('Corn Production')

  const cropTypes = [
    'Corn Production',
    'Wheat Production', 
    'Rice Production',
    'Coffee Production',
    'Soybean Production',
    'Tomato Production',
    'Potato Production',
    'Dairy Production'
  ]

  // Handle authentication redirect in useEffect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleStartGame = () => {
    if (selectedFarm) {
      // Store selected farm in localStorage for now
      localStorage.setItem('selectedFarm', JSON.stringify(selectedFarm))
      router.push('/game')
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto"></div>
          <div className="luxury-accent font-mono">Loading...</div>
        </div>
      </div>
    )
  }

  // Return null while redirecting
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 p-4 luxury-bg luxury-shadow">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-orbitron text-2xl font-bold luxury-accent">
              FARM QUEST
            </h1>
            <p className="text-xs text-gray-500 font-mono">NASA Space Apps Challenge</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User className="w-4 h-4" />
              <span className="font-mono">{session?.user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-mono">EXIT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 font-orbitron text-gray-900">
            SELECT YOUR FARM LOCATION
          </h2>
          <p className="text-gray-600 font-mono mb-4">
            Choose coordinates and crop type for your agricultural mission
          </p>
          
          {/* Crop Type Selector */}
          <div className="max-w-sm mx-auto">
            <label className="block text-sm font-mono luxury-accent mb-2">
              CROP TYPE:
            </label>
            <select 
              value={cropType} 
              onChange={(e) => setCropType(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-md font-mono text-sm luxury-bg luxury-shadow focus:border-yellow-600 focus:outline-none"
            >
              {cropTypes.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="h-96 lg:h-[500px]">
              <InteractiveMap 
                onFarmSelect={setSelectedFarm}
                selectedFarm={selectedFarm}
                cropType={cropType}
              />
            </div>
          </div>

          {/* Farm Details Section */}
          <div className="space-y-6">
            {selectedFarm ? (
              <div className="luxury-border border-2 p-6 luxury-bg luxury-shadow-lg rounded-lg">
                <h3 className="text-xl font-bold mb-2 font-orbitron luxury-accent">
                  {selectedFarm.name}
                </h3>
                <div className="space-y-3 text-sm font-mono">
                  <div>
                    <span className="luxury-accent font-bold">Location:</span>
                    <br />
                    <span className="text-gray-800">{selectedFarm.country}</span>
                  </div>
                  <div>
                    <span className="luxury-accent font-bold">Crop Type:</span>
                    <br />
                    <span className="text-gray-800">{selectedFarm.type}</span>
                  </div>
                  <div>
                    <span className="luxury-accent font-bold">Coordinates:</span>
                    <br />
                    <span className="text-gray-800">{selectedFarm.location.lat.toFixed(4)}, {selectedFarm.location.lng.toFixed(4)}</span>
                  </div>
                  
                  {/* Geographic Data */}
                  {selectedFarm.geographicData && (
                    <>
                      <div className="border-t border-gray-300 pt-3 mt-3">
                        <span className="luxury-accent font-bold">Environmental Data:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Temperature:</span>
                          <br />
                          <span className="text-gray-800 font-bold">{selectedFarm.geographicData.temperature}°C</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Rainfall:</span>
                          <br />
                          <span className="text-gray-800 font-bold">{selectedFarm.geographicData.rainfall}mm/year</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Soil Type:</span>
                          <br />
                          <span className="text-gray-800 font-bold capitalize">{selectedFarm.geographicData.soilType}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Soil pH:</span>
                          <br />
                          <span className="text-gray-800 font-bold">{selectedFarm.geographicData.soilPH}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Water Level:</span>
                          <br />
                          <span className="text-blue-600 font-bold">{selectedFarm.geographicData.waterLevel}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Moisture:</span>
                          <br />
                          <span className="text-blue-600 font-bold">{selectedFarm.geographicData.moistureLevel}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Elevation:</span>
                          <br />
                          <span className="text-gray-800 font-bold">{selectedFarm.geographicData.elevation}m</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Suitability:</span>
                          <br />
                          <span className={`font-bold ${
                            (selectedFarm.suitabilityScore || 0) >= 80 ? 'text-green-600' :
                            (selectedFarm.suitabilityScore || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {selectedFarm.suitabilityScore}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <span className="luxury-accent font-bold">Description:</span>
                    <br />
                    <span className="text-gray-700">{selectedFarm.description}</span>
                  </div>
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full mt-6 premium-gradient text-white font-mono font-bold py-3 px-6 
                           border-2 border-yellow-600 hover:bg-transparent hover:text-yellow-600 
                           transition-all duration-300 flex items-center justify-center space-x-2 rounded-md luxury-shadow"
                >
                  <span>START MISSION</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-gray-300 p-6 luxury-bg text-center rounded-lg luxury-shadow">
                <div className="text-gray-500 font-mono">
                  <div className="text-4xl mb-4">�</div>
                  <div>Select a farm location</div>
                  <div className="text-xs mt-2">Click on any location button to view real geographic data</div>
                </div>
              </div>
            )}

            {/* Mission Briefing */}
            <div className="border border-gray-300 p-4 luxury-bg rounded-lg luxury-shadow">
              <h4 className="font-bold mb-2 luxury-accent font-orbitron">
                MISSION BRIEFING
              </h4>
              <div className="text-xs font-mono text-gray-600 space-y-1">
                <p>• Monitor crop health using satellite data</p>
                <p>• Optimize water and resource usage</p>
                <p>• Predict yield and plan harvests</p>
                <p>• Adapt to climate challenges</p>
                <p>• Maximize sustainable production</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}