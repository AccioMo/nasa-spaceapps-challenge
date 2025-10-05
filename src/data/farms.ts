import { Farm } from '@/components/InteractiveMap'

export const farmLocations: Farm[] = [
  {
    id: 'corn-iowa',
    name: 'Heartland Corn Farm',
    location: { lat: 42.0308, lng: -93.6319 },
    type: 'Corn Production',
    country: 'USA (Iowa)',
    description: 'Large-scale corn farm in the heart of the American Midwest. Known for high-yield corn production and sustainable farming practices.'
  },
  {
    id: 'wheat-kansas',
    name: 'Prairie Gold Wheat',
    location: { lat: 38.5266, lng: -96.7265 },
    type: 'Wheat Production',
    country: 'USA (Kansas)',
    description: 'Traditional wheat farm spanning thousands of acres in the Great Plains. Critical for global grain supply.'
  },
  {
    id: 'rice-vietnam',
    name: 'Mekong Delta Rice',
    location: { lat: 10.4583, lng: 106.3417 },
    type: 'Rice Production',
    country: 'Vietnam',
    description: 'Sustainable rice farm in the fertile Mekong Delta. Feeds millions while preserving traditional farming methods.'
  },
  {
    id: 'coffee-colombia',
    name: 'Andean Coffee Estate',
    location: { lat: 4.5709, lng: -75.6173 },
    type: 'Coffee Production',
    country: 'Colombia',
    description: 'High-altitude coffee farm in the Colombian Andes. Produces premium arabica beans with sustainable practices.'
  },
  {
    id: 'soy-brazil',
    name: 'Cerrado Soybean',
    location: { lat: -15.7801, lng: -47.9292 },
    type: 'Soybean Production',
    country: 'Brazil',
    description: 'Modern soybean operation in the Brazilian Cerrado. Major contributor to global protein supply.'
  },
  {
    id: 'tomato-spain',
    name: 'Mediterranean Tomato',
    location: { lat: 36.7213, lng: -4.4214 },
    type: 'Tomato Production',
    country: 'Spain',
    description: 'High-tech greenhouse tomato farm using precision agriculture and water conservation techniques.'
  },
  {
    id: 'potato-peru',
    name: 'Andes Potato Farm',
    location: { lat: -11.0853, lng: -77.0438 },
    type: 'Potato Production',
    country: 'Peru',
    description: 'Traditional potato farm in the Peruvian Andes, home to hundreds of native potato varieties.'
  },
  {
    id: 'dairy-newzealand',
    name: 'Canterbury Dairy',
    location: { lat: -43.5321, lng: 172.6362 },
    type: 'Dairy Production',
    country: 'New Zealand',
    description: 'Pasture-based dairy farm known for sustainable practices and high-quality milk production.'
  }
]