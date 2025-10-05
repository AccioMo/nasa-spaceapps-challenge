'use client'

import React, { useState, useEffect } from 'react'
import { Farm } from '@/components/InteractiveMap'
import { getGeographicData } from '@/utils/geographicData'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

interface CellData {
  id: number
  cropType: string
  temperature: number // Celsius
  nitrogen_level: number // 0-100
  organic_matter: number // percentage 0-100
  soil_ph: number // 1-14
  irrigation_frequency: number // times per week
  fertilizer_amount: number // kg per hectare
  health: number // 0-100
  elevation: number // meters (from geographic data)
}

interface SimulationResult {
  overallHealth: number
  expectedYield: number
  riskFactors: string[]
  recommendations: string[]
  confidence: number
}

interface Simple2DFarmProps {
  farm: Farm
  season: Season
  onSeasonChange: (season: Season) => void
}

const cropIcons = {
  'Corn Production': 'C',
  'Wheat Production': 'W',
  'Rice Production': 'R',
  'Coffee Production': 'F',
  'Soybean Production': 'S',
  'Tomato Production': 'T',
  'Potato Production': 'P',
  'Dairy Production': 'G'
}

const cropColors = {
  'Corn Production': '#f3f4f6',
  'Wheat Production': '#f9fafb', 
  'Rice Production': '#f0fdf4',
  'Coffee Production': '#fdf2f8',
  'Soybean Production': '#f0f9ff',
  'Tomato Production': '#fef2f2',
  'Potato Production': '#fffbeb',
  'Dairy Production': '#f0fdf4'
}

// Generate plant mesh patterns based on crop type
const generatePlantMesh = (cropType: string, cellId: number) => {
  const patterns = {
    'Corn Production': {
      color: '#4ade80',
      shape: 'M2,8 L6,2 L10,8 L6,14 Z',
      count: 16
    },
    'Wheat Production': {
      color: '#eab308',
      shape: 'M4,2 Q6,1 8,2 Q6,4 4,2 Z',
      count: 25
    },
    'Rice Production': {
      color: '#22c55e',
      shape: 'M3,2 L9,2 L9,8 L3,8 Z',
      count: 30
    },
    'Coffee Production': {
      color: '#8b5cf6',
      shape: 'M4,2 Q6,1 8,2 Q8,6 6,8 Q4,6 4,2 Z',
      count: 12
    },
    'Soybean Production': {
      color: '#10b981',
      shape: 'M2,4 Q6,2 10,4 Q6,8 2,4 Z',
      count: 20
    },
    'Tomato Production': {
      color: '#ef4444',
      shape: 'M4,2 Q6,1 8,2 Q8,6 6,8 Q4,6 4,2 Z',
      count: 9
    },
    'Potato Production': {
      color: '#a855f7',
      shape: 'M3,3 L9,3 L9,7 L3,7 Z',
      count: 15
    },
    'Dairy Production': {
      color: '#22c55e',
      shape: 'M2,2 L10,2 L8,8 L4,8 Z',
      count: 18
    }
  }
  
  const pattern = patterns[cropType as keyof typeof patterns] || patterns['Corn Production']
  
  return {
    ...pattern,
    positions: Array.from({ length: pattern.count }, (_, i) => ({
      x: (i % 5) * 20 + Math.random() * 10,
      y: Math.floor(i / 5) * 20 + Math.random() * 10,
      rotation: Math.random() * 360
    }))
  }
}

export default function Simple2DFarm({ farm, season, onSeasonChange }: Simple2DFarmProps) {
  const [cells, setCells] = useState<CellData[]>([])
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  useEffect(() => {
    // Get geographic data for the farm location
    const baseGeoData = farm.geographicData || getGeographicData(farm.location.lat, farm.location.lng)
    
    // Initialize 9 cells with geographic data variations
    const newCells: CellData[] = Array.from({ length: 9 }, (_, i) => {
      // Create micro-variations for each cell
      const cellOffsetLat = (Math.random() - 0.5) * 0.001 // Small offset for variation
      const cellOffsetLng = (Math.random() - 0.5) * 0.001
      const cellGeoData = getGeographicData(
        farm.location.lat + cellOffsetLat,
        farm.location.lng + cellOffsetLng
      )
      
      // Calculate initial health based on environmental factors
      const tempOptimality = Math.max(0, 100 - Math.abs(cellGeoData.temperature - 22) * 2)
      const moistureOptimality = cellGeoData.moistureLevel
      const waterOptimality = cellGeoData.waterLevel
      const initialHealth = Math.round((tempOptimality + moistureOptimality + waterOptimality) / 3)
      
      return {
        id: i,
        cropType: farm.type,
        temperature: cellGeoData.temperature + (Math.random() - 0.5) * 5, // ±2.5°C variation
        nitrogen_level: 40 + Math.random() * 40, // 40-80%
        organic_matter: 20 + Math.random() * 60, // 20-80% organic matter
        soil_ph: cellGeoData.soilPH + (Math.random() - 0.5) * 1, // ±0.5 pH variation
        irrigation_frequency: 2 + Math.random() * 5, // 2-7 times per week
        fertilizer_amount: 100 + Math.random() * 200, // 100-300 kg per hectare
        health: Math.max(50, Math.min(95, initialHealth + Math.random() * 20)),
        elevation: cellGeoData.elevation
      }
    })
    setCells(newCells)
  }, [farm.type, farm.location.lat, farm.location.lng, farm.geographicData])

  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter']
  const currentSeasonIndex = seasons.indexOf(season)
  
  const handleParameterChange = (cellId: number, parameter: keyof CellData, value: number) => {
    setCells(prevCells =>
      prevCells.map(cell => 
        cell.id === cellId 
          ? { ...cell, [parameter]: value }
          : cell
      )
    )
  }

  // Hardcoded AI Random Forest Model Simulation
  const runAISimulation = async () => {
    setIsSimulating(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Calculate average parameters across all cells
    const avgTemp = cells.reduce((sum, cell) => sum + cell.temperature, 0) / cells.length
    const avgNitrogen = cells.reduce((sum, cell) => sum + cell.nitrogen_level, 0) / cells.length
    const avgOrganicMatter = cells.reduce((sum, cell) => sum + cell.organic_matter, 0) / cells.length
    const avgSoilPH = cells.reduce((sum, cell) => sum + cell.soil_ph, 0) / cells.length
    const avgIrrigation = cells.reduce((sum, cell) => sum + cell.irrigation_frequency, 0) / cells.length
    const avgFertilizer = cells.reduce((sum, cell) => sum + cell.fertilizer_amount, 0) / cells.length
    const avgHealth = cells.reduce((sum, cell) => sum + cell.health, 0) / cells.length
    
    // Hardcoded AI logic based on crop type and parameters
    const cropOptimalRanges = {
      'Corn Production': { tempMin: 18, tempMax: 27, phMin: 6.0, phMax: 6.8, nitrogenMin: 60 },
      'Wheat Production': { tempMin: 15, tempMax: 25, phMin: 6.0, phMax: 7.0, nitrogenMin: 50 },
      'Rice Production': { tempMin: 20, tempMax: 35, phMin: 5.5, phMax: 6.5, nitrogenMin: 40 },
      'Coffee Production': { tempMin: 18, tempMax: 24, phMin: 6.0, phMax: 7.0, nitrogenMin: 45 },
      'Soybean Production': { tempMin: 20, tempMax: 30, phMin: 6.0, phMax: 7.0, nitrogenMin: 30 },
      'Tomato Production': { tempMin: 18, tempMax: 24, phMin: 6.0, phMax: 6.8, nitrogenMin: 70 },
      'Potato Production': { tempMin: 15, tempMax: 20, phMin: 5.8, phMax: 6.2, nitrogenMin: 55 },
      'Dairy Production': { tempMin: 15, tempMax: 25, phMin: 6.5, phMax: 7.0, nitrogenMin: 80 }
    }
    
    const optimal = cropOptimalRanges[farm.type as keyof typeof cropOptimalRanges] || cropOptimalRanges['Corn Production']
    
    // Calculate risk factors and recommendations
    const riskFactors: string[] = []
    const recommendations: string[] = []
    
    if (avgTemp < optimal.tempMin) {
      riskFactors.push('Temperature below optimal range')
      recommendations.push('Consider greenhouse cultivation or wait for warmer season')
    } else if (avgTemp > optimal.tempMax) {
      riskFactors.push('Temperature above optimal range')
      recommendations.push('Increase irrigation and consider shade cloth protection')
    }
    
    if (avgSoilPH < optimal.phMin) {
      riskFactors.push('soil_ph too acidic')
      recommendations.push('Apply lime to increase soil pH')
    } else if (avgSoilPH > optimal.phMax) {
      riskFactors.push('soil_ph too alkaline')
      recommendations.push('Apply sulfur to decrease soil pH')
    }
    
    if (avgNitrogen < optimal.nitrogenMin) {
      riskFactors.push('Nitrogen deficiency')
      recommendations.push('Increase nitrogen-rich fertilizer application')
    }
    
    if (avgOrganicMatter < 30) {
      riskFactors.push('Low organic matter content')
      recommendations.push('Add compost or organic fertilizers to improve soil structure')
    } else if (avgOrganicMatter > 80) {
      riskFactors.push('Excessive organic matter')
      recommendations.push('Balance organic matter levels for optimal nutrient availability')
    }
    
    if (avgIrrigation < 2) {
      recommendations.push('Consider increasing irrigation frequency for better yields')
    }
    
    // Calculate overall health prediction (70-95% range)
    let healthScore = avgHealth
    if (avgTemp >= optimal.tempMin && avgTemp <= optimal.tempMax) healthScore += 5
    if (avgSoilPH >= optimal.phMin && avgSoilPH <= optimal.phMax) healthScore += 5
    if (avgNitrogen >= optimal.nitrogenMin) healthScore += 5
    if (avgOrganicMatter >= 30 && avgOrganicMatter <= 70) healthScore += 3
    
    healthScore = Math.min(95, Math.max(70, healthScore))
    
    // Calculate expected yield (tons per hectare)
    const baseYield = {
      'Corn Production': 8.5,
      'Wheat Production': 3.2,
      'Rice Production': 6.8,
      'Coffee Production': 1.8,
      'Soybean Production': 2.9,
      'Tomato Production': 45.2,
      'Potato Production': 22.1,
      'Dairy Production': 8.4
    }
    
    const expectedYield = (baseYield[farm.type as keyof typeof baseYield] || 5.0) * (healthScore / 100) * (1 + Math.random() * 0.2 - 0.1)
    
    // Add season-specific adjustments
    const seasonMultiplier = {
      'spring': 1.1,
      'summer': 1.0,
      'autumn': 0.9,
      'winter': 0.7
    }
    
    const finalYield = expectedYield * seasonMultiplier[season]
    
    // Add default recommendations if none found
    if (recommendations.length === 0) {
      recommendations.push('Current conditions are optimal - maintain current practices')
      recommendations.push('Monitor weather conditions regularly')
    }
    
    const result: SimulationResult = {
      overallHealth: Math.round(healthScore),
      expectedYield: Math.round(finalYield * 10) / 10,
      riskFactors: riskFactors.length > 0 ? riskFactors : ['No significant risks detected'],
      recommendations,
      confidence: Math.round(85 + Math.random() * 10) // 85-95% confidence
    }
    
    setSimulationResult(result)
    setIsSimulating(false)
  }

  return (
    <div className="w-full h-full relative bg-white flex">
      {/* Left Panel for Cell Details */}
      <div className="w-80 bg-gray-50 border-r border-gray-300 p-4">
        {selectedCell !== null ? (
          <div className="space-y-4">
            <div className="border-b border-gray-300 pb-3">
              <h4 className="luxury-accent font-bold text-lg mb-1">CELL {selectedCell + 1}</h4>
              <p className="text-sm text-gray-600 font-mono">{farm.type}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded border">
                <div className="text-xs text-gray-600 mb-1">TEMPERATURE (°C)</div>
                <input
                  type="number"
                  value={Math.round((cells[selectedCell]?.temperature || 0) * 10) / 10}
                  onChange={(e) => handleParameterChange(selectedCell, 'temperature', parseFloat(e.target.value) || 0)}
                  className="w-full font-mono text-sm font-bold text-blue-600 bg-transparent border-none outline-none"
                  step="0.1"
                  min="-10"
                  max="50"
                />
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-xs text-gray-600 mb-1">NITROGEN LEVEL (%)</div>
                <input
                  type="number"
                  value={Math.round(cells[selectedCell]?.nitrogen_level || 0)}
                  onChange={(e) => handleParameterChange(selectedCell, 'nitrogen_level', parseInt(e.target.value) || 0)}
                  className="w-full font-mono text-sm font-bold text-green-600 bg-transparent border-none outline-none"
                  min="0"
                  max="100"
                />
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-xs text-gray-600 mb-1">ORGANIC MATTER (%)</div>
                <input
                  type="number"
                  value={Math.round(cells[selectedCell]?.organic_matter || 0)}
                  onChange={(e) => handleParameterChange(selectedCell, 'organic_matter', parseInt(e.target.value) || 0)}
                  className="w-full font-mono text-sm font-bold text-green-600 bg-transparent border-none outline-none"
                  min="0"
                  max="100"
                />
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-xs text-gray-600 mb-1">SOIL PH</div>
                <input
                  type="number"
                  value={Math.round((cells[selectedCell]?.soil_ph || 7) * 10) / 10}
                  onChange={(e) => handleParameterChange(selectedCell, 'soil_ph', parseFloat(e.target.value) || 7)}
                  className="w-full font-mono text-sm font-bold text-purple-600 bg-transparent border-none outline-none"
                  step="0.1"
                  min="1"
                  max="14"
                />
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-xs text-gray-600 mb-1">IRRIGATION FREQ (/week)</div>
                <input
                  type="number"
                  value={Math.round((cells[selectedCell]?.irrigation_frequency || 1) * 10) / 10}
                  onChange={(e) => handleParameterChange(selectedCell, 'irrigation_frequency', parseFloat(e.target.value) || 1)}
                  className="w-full font-mono text-sm font-bold text-blue-600 bg-transparent border-none outline-none"
                  step="0.1"
                  min="0"
                  max="14"
                />
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-xs text-gray-600 mb-1">FERTILIZER (kg/ha)</div>
                <input
                  type="number"
                  value={Math.round(cells[selectedCell]?.fertilizer_amount || 0)}
                  onChange={(e) => handleParameterChange(selectedCell, 'fertilizer_amount', parseInt(e.target.value) || 0)}
                  className="w-full font-mono text-sm font-bold text-green-600 bg-transparent border-none outline-none"
                  min="0"
                  max="1000"
                />
              </div>
            </div>

            <div className="bg-white p-3 rounded border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-600">HEALTH STATUS</div>
                <div className={`w-3 h-3 rounded-full ${
                  (cells[selectedCell]?.health || 0) > 80 ? 'bg-green-500' :
                  (cells[selectedCell]?.health || 0) > 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
              </div>
              <div className="text-2xl font-mono font-bold mb-1">
                <span className={`${
                  (cells[selectedCell]?.health || 0) > 80 ? 'text-green-600' :
                  (cells[selectedCell]?.health || 0) > 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{Math.round(cells[selectedCell]?.health || 0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    (cells[selectedCell]?.health || 0) > 80 ? 'bg-green-500' :
                    (cells[selectedCell]?.health || 0) > 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${cells[selectedCell]?.health || 0}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 font-mono h-full flex items-center justify-center">
            <div>
              <div className="text-4xl mb-4">🎯</div>
              <div className="text-lg mb-2">SELECT A CELL</div>
              <div className="text-sm">Click on any farm cell to view details and manage resources</div>
            </div>
          </div>
        )}
      </div>

      {/* Right side - Farm Grid */}
      <div className="flex-1 p-6 relative">
        <div className="grid grid-cols-3 grid-rows-3 gap-3 h-full max-h-96 max-w-96 mx-auto">
          {cells.map((cell) => (
            <div
              key={cell.id}
              className={`relative border-2 cursor-pointer transition-all hover:scale-105 w-full h-full min-h-20 min-w-20 rounded-lg ${
                selectedCell === cell.id 
                  ? 'border-yellow-600 shadow-lg ring-2 ring-yellow-200' 
                  : 'border-gray-300 hover:border-yellow-500 shadow-md'
              }`}
              style={{ backgroundColor: cropColors[farm.type as keyof typeof cropColors] }}
              onClick={() => setSelectedCell(selectedCell === cell.id ? null : cell.id)}
            >
              {/* Plant mesh background */}
              <div className="absolute inset-0">
                {farm.type === 'Corn Production' ? (
                  <div 
                    className="w-full h-full opacity-40"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cdefs%3E%3Cpattern id=\'corn\' patternUnits=\'userSpaceOnUse\' width=\'15\' height=\'25\'%3E%3Crect width=\'15\' height=\'25\' fill=\'%23f9fafb\'/%3E%3Cg%3E%3C!-- Corn cob --%3E%3Crect x=\'5\' y=\'3\' width=\'5\' height=\'18\' rx=\'2.5\' fill=\'%23fef3c7\' stroke=\'%23f59e0b\' stroke-width=\'0.3\'/%3E%3C!-- Corn kernels --%3E%3Ccircle cx=\'6\' cy=\'5\' r=\'0.8\' fill=\'%23fbbf24\'/%3E%3Ccircle cx=\'8\' cy=\'5\' r=\'0.8\' fill=\'%23f59e0b\'/%3E%3Ccircle cx=\'7\' cy=\'7\' r=\'0.8\' fill=\'%23fbbf24\'/%3E%3Ccircle cx=\'6\' cy=\'9\' r=\'0.8\' fill=\'%23f59e0b\'/%3E%3Ccircle cx=\'8\' cy=\'9\' r=\'0.8\' fill=\'%23fbbf24\'/%3E%3Ccircle cx=\'7\' cy=\'11\' r=\'0.8\' fill=\'%23f59e0b\'/%3E%3Ccircle cx=\'6\' cy=\'13\' r=\'0.8\' fill=\'%23fbbf24\'/%3E%3Ccircle cx=\'8\' cy=\'13\' r=\'0.8\' fill=\'%23f59e0b\'/%3E%3Ccircle cx=\'7\' cy=\'15\' r=\'0.8\' fill=\'%23fbbf24\'/%3E%3Ccircle cx=\'6\' cy=\'17\' r=\'0.8\' fill=\'%23f59e0b\'/%3E%3Ccircle cx=\'8\' cy=\'17\' r=\'0.8\' fill=\'%23fbbf24\'/%3E%3Ccircle cx=\'7\' cy=\'19\' r=\'0.8\' fill=\'%23f59e0b\'/%3E%3C!-- Corn husks --%3E%3Cpath d=\'M3 2 Q5 1 7 2 Q7 4 5 3 Q3 4 3 2\' fill=\'%2322c55e\' opacity=\'0.7\'/%3E%3Cpath d=\'M11 2 Q9 1 7 2 Q7 4 9 3 Q11 4 11 2\' fill=\'%2322c55e\' opacity=\'0.7\'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23corn)\'/%3E%3C/svg%3E")',
                      backgroundSize: 'cover',
                      backgroundRepeat: 'repeat'
                    }}
                  />
                ) : (
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {(() => {
                      const mesh = generatePlantMesh(farm.type, cell.id)
                      return mesh.positions.map((pos, i) => (
                        <g key={i} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})`}>
                          <path
                            d={mesh.shape}
                            fill={mesh.color}
                            opacity={0.6}
                            transform="scale(0.8)"
                          />
                        </g>
                      ))
                    })()} 
                  </svg>
                )}
              </div>
              
              {/* Main crop icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 rounded-full p-2 shadow-md">
                  <div className="text-xl font-bold text-gray-700">
                    {cropIcons[farm.type as keyof typeof cropIcons] || 'G'}
                  </div>
                </div>
              </div>
              
              {/* Cell number */}
              <div className="absolute top-2 left-2">
                <div className="bg-white bg-opacity-90 text-gray-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {cell.id + 1}
                </div>
              </div>
              
              {/* Health indicator */}
              <div className="absolute top-2 right-2">
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                  cell.health > 80 ? 'bg-green-500' :
                  cell.health > 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
              </div>
              
              {/* Parameter indicators */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-white bg-opacity-90 rounded p-1 shadow-sm">
                  <div className="text-xs font-mono text-gray-600 text-center">
                    T: {Math.round(cell.temperature)}°C | pH: {Math.round(cell.soil_ph * 10) / 10}
                  </div>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-yellow-100 opacity-0 hover:opacity-20 transition-opacity rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Luxurious Corner Simulate Button - Outside all containers */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={runAISimulation}
          disabled={isSimulating || cells.length === 0}
          className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold shadow-2xl transition-all duration-300 ${
            isSimulating 
              ? 'bg-white/90 text-gray-400 cursor-not-allowed border-2 border-gray-300' 
              : 'bg-white/95 text-amber-700 hover:bg-white border-2 border-amber-400 hover:border-amber-500 hover:shadow-amber-500/25'
          } backdrop-blur-sm`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-yellow-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {isSimulating ? (
            <>
              <div className="relative z-10 animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
              <span className="relative z-10 text-lg tracking-wide">ANALYZING...</span>
            </>
          ) : (
            <>
              <svg className="relative z-10 w-6 h-6 drop-shadow-lg text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="relative z-10 text-lg tracking-wider font-semibold">SIMULATE</span>
            </>
          )}
        </button>
      </div>

      {/* Luxurious Simulation Results Modal - Positioned relative to page */}
      {simulationResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Luxury gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-transparent to-yellow-50/30 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 animate-pulse"></div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Simulation Results</h3>
                </div>
                <button
                  onClick={() => setSimulationResult(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Current Success Rate */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-2xl border border-blue-200/50">
                  <div className="text-xs font-semibold text-blue-600 mb-2 tracking-wide uppercase">Current Success Rate</div>
                  <div className="text-3xl font-bold text-blue-700 mb-1">
                    {Math.round(simulationResult.overallHealth * 0.85)}%
                  </div>
                  <div className="text-xs text-blue-600 opacity-75">With current settings</div>
                </div>

                {/* Optimized Success Rate */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-200/50">
                  <div className="text-xs font-semibold text-emerald-600 mb-2 tracking-wide uppercase">Optimized Rate</div>
                  <div className="text-3xl font-bold text-emerald-700 mb-1">
                    {Math.min(98, Math.round(simulationResult.overallHealth * 0.85) + 12)}%
                  </div>
                  <div className="text-xs text-emerald-600 opacity-75">With model recommendations</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Expected Yield */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-2xl border border-amber-200/50">
                  <div className="text-xs font-semibold text-amber-600 mb-2 tracking-wide uppercase">Expected Yield</div>
                  <div className="text-2xl font-bold text-amber-700 mb-1">
                    {simulationResult.expectedYield}
                  </div>
                  <div className="text-xs text-amber-600 opacity-75">tons per hectare</div>
                </div>

                {/* Profit Estimate */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-5 rounded-2xl border border-purple-200/50">
                  <div className="text-xs font-semibold text-purple-600 mb-2 tracking-wide uppercase">Profit Estimate</div>
                  <div className="text-2xl font-bold text-purple-700 mb-1">
                    ${(simulationResult.expectedYield * 850).toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-600 opacity-75">per hectare</div>
                </div>
              </div>

              {/* Overall Health Bar */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-5 rounded-2xl border border-gray-200/50 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 tracking-wide">FARM HEALTH STATUS</span>
                  <span className={`text-xl font-bold ${
                    simulationResult.overallHealth > 85 ? 'text-emerald-600' :
                    simulationResult.overallHealth > 70 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {simulationResult.overallHealth}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      simulationResult.overallHealth > 85 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                      simulationResult.overallHealth > 70 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                    } shadow-sm`}
                    style={{ width: `${simulationResult.overallHealth}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-4">
                {/* Risk Factors */}
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-5 rounded-2xl border border-red-200/50">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-semibold text-red-700 tracking-wide uppercase">Risk Assessment</span>
                  </div>
                  <ul className="space-y-2">
                    {simulationResult.riskFactors.map((risk, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                        <span className="leading-relaxed">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-200/50">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-sm font-semibold text-emerald-700 tracking-wide uppercase">Optimization Strategy</span>
                  </div>
                  <ul className="space-y-2">
                    {simulationResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-emerald-700 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Confidence Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200/50 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"></div>
                  <span className="text-xs font-medium text-gray-600 tracking-wider uppercase">
                    Model Confidence: {simulationResult.confidence}%
                  </span>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}