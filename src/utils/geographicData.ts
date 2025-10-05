// Geographic data utility for calculating soil and water levels based on coordinates
// This uses simplified models based on real geographic patterns

export interface GeographicData {
  soilType: 'clay' | 'sandy' | 'loam' | 'rocky' | 'peat'
  waterLevel: number // 0-100%
  moistureLevel: number // 0-100%
  temperature: number // Celsius
  rainfall: number // mm/year
  soilPH: number // 1-14
  elevation: number // meters
}

export interface ClimateZone {
  name: string
  baseTemperature: number
  baseRainfall: number
  baseMoisture: number
  dominantSoilType: GeographicData['soilType']
}

// Simplified climate zones based on latitude
const getClimateZone = (lat: number): ClimateZone => {
  const absLat = Math.abs(lat)
  
  if (absLat >= 66.5) {
    // Arctic/Antarctic
    return {
      name: 'Polar',
      baseTemperature: -5,
      baseRainfall: 300,
      baseMoisture: 85,
      dominantSoilType: 'rocky'
    }
  } else if (absLat >= 60) {
    // Subarctic
    return {
      name: 'Subarctic',
      baseTemperature: 5,
      baseRainfall: 500,
      baseMoisture: 75,
      dominantSoilType: 'peat'
    }
  } else if (absLat >= 40) {
    // Continental
    return {
      name: 'Continental',
      baseTemperature: 15,
      baseRainfall: 800,
      baseMoisture: 65,
      dominantSoilType: 'loam'
    }
  } else if (absLat >= 30) {
    // Subtropical
    return {
      name: 'Subtropical',
      baseTemperature: 22,
      baseRainfall: 1200,
      baseMoisture: 70,
      dominantSoilType: 'clay'
    }
  } else if (absLat >= 23.5) {
    // Tropical
    return {
      name: 'Tropical',
      baseTemperature: 27,
      baseRainfall: 2000,
      baseMoisture: 80,
      dominantSoilType: 'clay'
    }
  } else {
    // Equatorial
    return {
      name: 'Equatorial',
      baseTemperature: 26,
      baseRainfall: 2500,
      baseMoisture: 85,
      dominantSoilType: 'loam'
    }
  }
}

// Calculate elevation effect (simplified)
const getElevationFromCoordinates = (lat: number, lng: number): number => {
  // This is a simplified model - in real implementation, you'd use a DEM API
  // Some known mountain ranges approximations
  const mountainousRegions = [
    { lat: 40, lng: -105, elevation: 2000 }, // Rocky Mountains
    { lat: 46, lng: 8, elevation: 1500 },    // Alps
    { lat: 28, lng: 84, elevation: 3000 },   // Himalayas
    { lat: -22, lng: -65, elevation: 2500 }, // Andes
  ]
  
  let baseElevation = 200 // Default sea level plus base
  
  // Check proximity to mountain ranges
  mountainousRegions.forEach(region => {
    const distance = Math.sqrt(
      Math.pow(lat - region.lat, 2) + Math.pow(lng - region.lng, 2)
    )
    if (distance < 10) { // Within ~1000km
      baseElevation += region.elevation * (1 - distance / 10)
    }
  })
  
  // Add some random variation
  baseElevation += (Math.random() - 0.5) * 400
  
  return Math.max(0, Math.round(baseElevation))
}

// Calculate coastal influence
const getCoastalInfluence = (lat: number, lng: number): number => {
  // Simplified coastal detection - in reality you'd use shoreline data
  const coastalProximity = Math.min(
    Math.abs(lng % 60), // Rough continental width approximation
    Math.abs((lng + 180) % 60)
  )
  
  return Math.max(0, (20 - coastalProximity) / 20) // 0-1 coastal influence
}

export const getGeographicData = (lat: number, lng: number): GeographicData => {
  const climateZone = getClimateZone(lat)
  const elevation = getElevationFromCoordinates(lat, lng)
  const coastalInfluence = getCoastalInfluence(lat, lng)
  
  // Temperature calculation
  const elevationTempAdjustment = elevation * -0.006 // -6°C per 1000m
  const coastalTempModeration = coastalInfluence * 3 // Coastal areas are more moderate
  const seasonalVariation = (Math.random() - 0.5) * 10
  
  const temperature = Math.round(
    climateZone.baseTemperature + 
    elevationTempAdjustment + 
    coastalTempModeration + 
    seasonalVariation
  )
  
  // Rainfall calculation
  const elevationRainfallEffect = elevation > 1000 ? elevation * 0.5 : 0
  const coastalRainfallEffect = coastalInfluence * 300
  const continentalityEffect = (1 - coastalInfluence) * -200
  
  const rainfall = Math.max(100, Math.round(
    climateZone.baseRainfall + 
    elevationRainfallEffect + 
    coastalRainfallEffect + 
    continentalityEffect +
    (Math.random() - 0.5) * 400
  ))
  
  // Moisture calculation
  const elevationMoistureEffect = elevation > 500 ? -elevation * 0.01 : 0
  const rainfallMoistureEffect = (rainfall - 800) * 0.02
  
  const moistureLevel = Math.max(20, Math.min(100, Math.round(
    climateZone.baseMoisture + 
    elevationMoistureEffect + 
    rainfallMoistureEffect + 
    coastalInfluence * 15 +
    (Math.random() - 0.5) * 20
  )))
  
  // Water level (availability)
  const riverProximity = Math.sin(lat * 0.1) * Math.cos(lng * 0.1) // Simplified river distribution
  const groundwaterEffect = elevation < 100 ? 20 : -elevation * 0.02
  
  const waterLevel = Math.max(10, Math.min(100, Math.round(
    60 + // Base water availability
    (rainfall - 800) * 0.03 + // Rainfall effect
    riverProximity * 20 + // River proximity
    groundwaterEffect + // Groundwater
    coastalInfluence * 10 + // Coastal groundwater
    (Math.random() - 0.5) * 25
  )))
  
  // Soil type determination
  let soilType = climateZone.dominantSoilType
  
  // Modify based on specific conditions
  if (elevation > 2000) soilType = 'rocky'
  else if (coastalInfluence > 0.7) soilType = 'sandy'
  else if (rainfall > 2000 && temperature > 20) soilType = 'clay'
  else if (temperature < 5) soilType = 'peat'
  
  // Random variation for soil type
  if (Math.random() < 0.2) {
    const soilTypes: GeographicData['soilType'][] = ['clay', 'sandy', 'loam', 'rocky', 'peat']
    soilType = soilTypes[Math.floor(Math.random() * soilTypes.length)]
  }
  
  // Soil pH calculation
  const basePH = soilType === 'peat' ? 4.5 : 
                soilType === 'sandy' ? 6.5 :
                soilType === 'clay' ? 7.2 :
                soilType === 'rocky' ? 7.8 : 6.8
  
  const soilPH = Math.max(3, Math.min(9, Math.round(
    (basePH + (Math.random() - 0.5) * 2) * 10
  ) / 10))
  
  return {
    soilType,
    waterLevel,
    moistureLevel,
    temperature,
    rainfall,
    soilPH,
    elevation
  }
}

// Get crop suitability based on geographic data
export const getCropSuitability = (geoData: GeographicData, cropType: string): number => {
  const cropRequirements: Record<string, {
    tempRange: [number, number]
    rainfallRange: [number, number]
    preferredSoil: GeographicData['soilType'][]
    phRange: [number, number]
  }> = {
    'Corn Production': {
      tempRange: [15, 30],
      rainfallRange: [600, 1200],
      preferredSoil: ['loam', 'clay'],
      phRange: [6.0, 7.0]
    },
    'Wheat Production': {
      tempRange: [10, 25],
      rainfallRange: [400, 800],
      preferredSoil: ['loam', 'clay'],
      phRange: [6.5, 7.5]
    },
    'Rice Production': {
      tempRange: [20, 35],
      rainfallRange: [1000, 2500],
      preferredSoil: ['clay', 'loam'],
      phRange: [5.5, 7.0]
    },
    'Coffee Production': {
      tempRange: [18, 24],
      rainfallRange: [1200, 2000],
      preferredSoil: ['loam', 'clay'],
      phRange: [6.0, 7.0]
    },
    'Soybean Production': {
      tempRange: [20, 30],
      rainfallRange: [500, 1000],
      preferredSoil: ['loam', 'clay'],
      phRange: [6.0, 7.5]
    },
    'Tomato Production': {
      tempRange: [18, 27],
      rainfallRange: [400, 800],
      preferredSoil: ['loam', 'sandy'],
      phRange: [6.0, 7.0]
    },
    'Potato Production': {
      tempRange: [15, 20],
      rainfallRange: [400, 700],
      preferredSoil: ['loam', 'sandy'],
      phRange: [5.5, 6.5]
    },
    'Dairy Production': {
      tempRange: [5, 25],
      rainfallRange: [600, 1500],
      preferredSoil: ['loam', 'clay'],
      phRange: [6.0, 7.5]
    }
  }
  
  const requirements = cropRequirements[cropType] || cropRequirements['Corn Production']
  
  // Calculate suitability scores (0-100)
  const tempScore = geoData.temperature >= requirements.tempRange[0] && 
                   geoData.temperature <= requirements.tempRange[1] ? 100 :
                   Math.max(0, 100 - Math.abs(geoData.temperature - 
                   (requirements.tempRange[0] + requirements.tempRange[1]) / 2) * 5)
  
  const rainfallScore = geoData.rainfall >= requirements.rainfallRange[0] && 
                       geoData.rainfall <= requirements.rainfallRange[1] ? 100 :
                       Math.max(0, 100 - Math.abs(geoData.rainfall - 
                       (requirements.rainfallRange[0] + requirements.rainfallRange[1]) / 2) * 0.1)
  
  const soilScore = requirements.preferredSoil.includes(geoData.soilType) ? 100 : 60
  
  const phScore = geoData.soilPH >= requirements.phRange[0] && 
                 geoData.soilPH <= requirements.phRange[1] ? 100 :
                 Math.max(0, 100 - Math.abs(geoData.soilPH - 
                 (requirements.phRange[0] + requirements.phRange[1]) / 2) * 20)
  
  return Math.round((tempScore + rainfallScore + soilScore + phScore) / 4)
}