'use client'

import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera, Box, Plane } from '@react-three/drei'
import * as THREE from 'three'
import { Farm } from '@/components/InteractiveMap'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

interface PlantData {
  type: string
  position: [number, number, number]
  growth: number // 0-1
  season: Season
}

interface SeasonConfig {
  backgroundColor: string
  fogColor: string
  fogNear: number
  fogFar: number
  ambientLight: string
  directionalLight: string
  groundColor: string
}

const seasonConfigs: Record<Season, SeasonConfig> = {
  spring: {
    backgroundColor: '#87CEEB', // Sky blue
    fogColor: '#E6F3FF',
    fogNear: 30,
    fogFar: 100,
    ambientLight: '#FFFFFF', // White
    directionalLight: '#FFFFE0', // Light yellow
    groundColor: '#228B22' // Forest green
  },
  summer: {
    backgroundColor: '#4169E1', // Royal blue
    fogColor: '#B0E0E6',
    fogNear: 40,
    fogFar: 120,
    ambientLight: '#FFFFFF', // White
    directionalLight: '#FFFFFF', // White
    groundColor: '#32CD32' // Lime green
  },
  autumn: {
    backgroundColor: '#D2691E', // Chocolate
    fogColor: '#DEB887',
    fogNear: 25,
    fogFar: 80,
    ambientLight: '#FFE4B5', // Moccasin
    directionalLight: '#FFA500', // Orange
    groundColor: '#8B4513' // Saddle brown
  },
  winter: {
    backgroundColor: '#708090', // Slate gray
    fogColor: '#F0F8FF',
    fogNear: 20,
    fogFar: 60,
    ambientLight: '#F0F8FF', // Alice blue
    directionalLight: '#E6E6FA', // Lavender
    groundColor: '#FFFAFA' // Snow
  }
}

// Plant component that renders different sprites based on type and growth
function Plant({ type, position, growth, season }: PlantData) {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle swaying animation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05 * growth
    }
  })

  const getPlantGeometry = () => {
    switch (type) {
      case 'Corn Production':
        return <cylinderGeometry args={[0.1, 0.15, getPlantHeight(), 8]} />
      case 'Wheat Production':
        return <cylinderGeometry args={[0.05, 0.1, getPlantHeight(), 6]} />
      case 'Rice Production':
        return <cylinderGeometry args={[0.03, 0.08, getPlantHeight(), 6]} />
      case 'Coffee Production':
        return <cylinderGeometry args={[0.2, 0.3, getPlantHeight(), 8]} />
      case 'Tomato Production':
        return <boxGeometry args={[0.3, getPlantHeight(), 0.3]} />
      case 'Potato Production':
        return <cylinderGeometry args={[0.15, 0.2, getPlantHeight(), 6]} />
      default:
        return <cylinderGeometry args={[0.1, 0.15, getPlantHeight(), 6]} />
    }
  }

  const getPlantColor = () => {
    const baseColors = {
      'Corn Production': '#FFD700', // Gold
      'Wheat Production': '#DEB887', // Burlywood
      'Rice Production': '#32CD32', // Lime green
      'Coffee Production': '#228B22', // Forest green
      'Soybean Production': '#9ACD32', // Yellow green
      'Tomato Production': season === 'summer' ? '#FF6347' : '#32CD32', // Red when ripe
      'Potato Production': '#6B8E23', // Olive drab
      'Dairy Production': '#32CD32' // Lime green (grass)
    }

    let color = baseColors[type as keyof typeof baseColors] || '#32CD32'
    
    // Modify color based on season - make them more visible
    const seasonModifiers = {
      spring: 1.3, // Much brighter
      summer: 1.1, // Brighter
      autumn: 0.9, // Slightly darker
      winter: 0.7  // Darker but still visible
    }
    
    const modifier = seasonModifiers[season]
    const rgb = new THREE.Color(color)
    rgb.multiplyScalar(modifier)
    
    // Add autumn brown tint but keep visibility
    if (season === 'autumn') {
      rgb.r = Math.min(1, rgb.r * 1.1)
      rgb.g = Math.min(1, rgb.g * 0.9)
      rgb.b = Math.min(1, rgb.b * 0.7)
    }
    
    return rgb
  }

  const getPlantHeight = () => {
    const baseHeights = {
      'Corn Production': 3.5,
      'Wheat Production': 1.8,
      'Rice Production': 1.2,
      'Coffee Production': 2.5,
      'Soybean Production': 1.5,
      'Tomato Production': 2.2,
      'Potato Production': 0.8,
      'Dairy Production': 0.3 // Grass
    }
    
    const seasonGrowthModifier = {
      spring: 0.7,
      summer: 1.0,
      autumn: 0.9,
      winter: 0.4
    }
    
    return (baseHeights[type as keyof typeof baseHeights] || 1.0) * growth * seasonGrowthModifier[season]
  }

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {getPlantGeometry()}
      <meshLambertMaterial color={getPlantColor()} />
      
      {/* Add leaves for some plants */}
      {(type === 'Corn Production' || type === 'Coffee Production') && (
        <mesh position={[0, getPlantHeight() * 0.8, 0]}>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshLambertMaterial color={new THREE.Color('#228B22').multiplyScalar(
            season === 'spring' ? 1.2 : season === 'summer' ? 1.0 : season === 'autumn' ? 0.7 : 0.4
          )} />
        </mesh>
      )}
    </mesh>
  )
}

// Ground grid component
function Ground({ season }: { season: Season }) {
  const config = seasonConfigs[season]
  const groundRef = useRef<THREE.Mesh>(null!)
  
  return (
    <group>
      {/* Main ground plane */}
      <Plane 
        ref={groundRef}
        args={[24, 24]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <meshLambertMaterial color="#8B4513" /> {/* Brown soil color */}
      </Plane>
      
      {/* Farm field rows - create realistic farming rows */}
      {Array.from({ length: 12 }, (_, i) => (
        <group key={`row-${i}`}>
          <Box args={[22, 0.1, 0.3]} position={[0, 0.05, (i - 5.5) * 2]}>
            <meshLambertMaterial color="#654321" /> {/* Darker brown soil */}
          </Box>
        </group>
      ))}
      
      {/* Field boundaries */}
      <Box args={[24, 0.2, 0.1]} position={[0, 0.1, -12]}>
        <meshLambertMaterial color="#654321" />
      </Box>
      <Box args={[24, 0.2, 0.1]} position={[0, 0.1, 12]}>
        <meshLambertMaterial color="#654321" />
      </Box>
      <Box args={[0.1, 0.2, 24]} position={[-12, 0.1, 0]}>
        <meshLambertMaterial color="#654321" />
      </Box>
      <Box args={[0.1, 0.2, 24]} position={[12, 0.1, 0]}>
        <meshLambertMaterial color="#654321" />
      </Box>
      
      {/* Farm buildings/structures */}
      <FarmBuildings season={season} />
    </group>
  )
}

// Farm buildings component
function FarmBuildings({ season }: { season: Season }) {
  return (
    <group>
      {/* Barn */}
      <group position={[-15, 0, -15]}>
        <Box args={[4, 3, 6]} position={[0, 1.5, 0]}>
          <meshLambertMaterial color="#8B0000" /> {/* Dark red */}
        </Box>
        {/* Barn roof */}
        <Box args={[4.5, 0.5, 6.5]} position={[0, 3.25, 0]}>
          <meshLambertMaterial color="#654321" /> {/* Brown */}
        </Box>
      </group>
      
      {/* Silo */}
      <group position={[-18, 0, -12]}>
        <mesh>
          <cylinderGeometry args={[1, 1, 6, 12]} />
          <meshLambertMaterial color="#C0C0C0" /> {/* Silver */}
        </mesh>
        {/* Silo top */}
        <mesh position={[0, 3.5, 0]}>
          <coneGeometry args={[1.2, 1, 12]} />
          <meshLambertMaterial color="#808080" /> {/* Gray */}
        </mesh>
      </group>
      
      {/* Water tank */}
      <group position={[15, 0, -15]}>
        <mesh>
          <cylinderGeometry args={[2, 2, 4, 16]} />
          <meshLambertMaterial color="#4682B4" /> {/* Steel blue */}
        </mesh>
        {/* Tank legs */}
        {Array.from({ length: 4 }, (_, i) => (
          <Box 
            key={i}
            args={[0.2, 4, 0.2]} 
            position={[
              Math.cos(i * Math.PI / 2) * 1.5, 
              2, 
              Math.sin(i * Math.PI / 2) * 1.5
            ]}
          >
            <meshLambertMaterial color="#696969" /> {/* Dim gray */}
          </Box>
        ))}
      </group>
      
      {/* Greenhouse (for tomato farms) */}
      <group position={[8, 0, 8]}>
        <Box args={[6, 3, 10]} position={[0, 1.5, 0]}>
          <meshLambertMaterial color="#F0F8FF" transparent opacity={0.3} /> {/* Glass */}
        </Box>
        {/* Greenhouse frame */}
        <Box args={[6.2, 0.1, 10.2]} position={[0, 3, 0]}>
          <meshLambertMaterial color="#228B22" /> {/* Forest green */}
        </Box>
      </group>
      
      {/* Irrigation sprinklers */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={`sprinkler-${i}`} position={[(i - 2.5) * 4, 0, 0]}>
          <Box args={[0.1, 2, 0.1]} position={[0, 1, 0]}>
            <meshLambertMaterial color="#696969" />
          </Box>
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.15, 8, 6]} />
            <meshLambertMaterial color="#4682B4" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Scene setup component
function Scene({ season, plants }: { season: Season; plants: PlantData[] }) {
  const { scene } = useThree()
  const config = seasonConfigs[season]
  
  useEffect(() => {
    // Clear any existing fog and background
    scene.background = new THREE.Color(config.backgroundColor)
    scene.fog = null // Disable fog initially to see the farm clearly
    
    // Only add subtle fog for atmosphere
    if (season === 'winter') {
      scene.fog = new THREE.Fog(config.fogColor, config.fogNear, config.fogFar)
    }
  }, [scene, config])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} color={config.ambientLight} />
      <directionalLight
        position={[20, 25, 15]}
        intensity={1.0}
        color={config.directionalLight}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      
      {/* Additional fill light */}
      <directionalLight
        position={[-15, 20, -15]}
        intensity={0.3}
        color="#FFFFFF"
      />
      
      {/* Ground */}
      <Ground season={season} />
      
      {/* Plants */}
      {plants.map((plant, index) => (
        <Plant key={index} {...plant} />
      ))}
    </>
  )
}

interface FarmCanvasProps {
  farm: Farm
  season: Season
}

export default function FarmCanvas({ farm, season }: FarmCanvasProps) {
  const [plants, setPlants] = React.useState<PlantData[]>([])

  // Generate plants based on farm type
  useEffect(() => {
    const generatePlants = () => {
      const newPlants: PlantData[] = []
      
      // Create organized rows for crops
      const rows = 10
      const plantsPerRow = 20
      const rowSpacing = 2
      const plantSpacing = 1
      
      for (let row = 0; row < rows; row++) {
        for (let plant = 0; plant < plantsPerRow; plant++) {
          // Skip some plants randomly for realistic variation
          if (Math.random() > 0.85) continue
          
          newPlants.push({
            type: farm.type,
            position: [
              (plant - plantsPerRow / 2) * plantSpacing + (Math.random() - 0.5) * 0.3, // X with small random offset
              0,
              (row - rows / 2) * rowSpacing + (Math.random() - 0.5) * 0.2  // Z with small random offset
            ],
            growth: 0.5 + Math.random() * 0.5, // Random growth between 50-100%
            season
          })
        }
      }
      
      // Add some scattered plants around the edges for natural look
      for (let i = 0; i < 20; i++) {
        newPlants.push({
          type: farm.type,
          position: [
            (Math.random() - 0.5) * 30, // Wider spread
            0,
            (Math.random() - 0.5) * 30
          ],
          growth: 0.2 + Math.random() * 0.4, // Smaller growth for edge plants
          season
        })
      }
      
      setPlants(newPlants)
    }

    generatePlants()
  }, [farm.type, season])

  return (
    <Canvas
      className="w-full h-full"
      shadows
    >
      <OrthographicCamera
        makeDefault
        position={[15, 20, 15]}
        zoom={25}
        near={0.1}
        far={1000}
      />
      <Scene season={season} plants={plants} />
    </Canvas>
  )
}