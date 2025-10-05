import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FarmlandProps {
  farm?: {
    name: string;
    type: string;
    location: { lat: number; lng: number };
  };
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}

// Crop type configuration system
interface CropConfig {
  name: string;
  fieldColor: number;
  plantHeight: number;
  plantDensity: number;
  colors: {
    spring: number[];
    summer: number[];
    autumn: number[];
    winter: number[];
  };
  meshType: 'grain' | 'vegetable' | 'fruit' | 'legume' | 'grass' | 'tree' | 'special';
  fieldType: 'soil' | 'flooded' | 'greenhouse' | 'terraced' | 'pasture';
  specialFeatures?: string[];
}

const CROP_CONFIGS: { [key: string]: CropConfig } = {
  'Corn Production': {
    name: 'corn',
    fieldColor: 0x5A3A1A,
    plantHeight: 1.8,
    plantDensity: 12,
    colors: {
      spring: [0x90EE90, 0x98FB98],
      summer: [0x32CD32, 0x228B22],
      autumn: [0xC19A6B, 0xDAA520],
      winter: [0x8B7355, 0xA0522D]
    },
    meshType: 'grain',
    fieldType: 'soil',
    specialFeatures: ['stalks', 'leaves', 'cobs']
  },
  'Wheat Production': {
    name: 'wheat',
    fieldColor: 0x6B4423,
    plantHeight: 1.0,
    plantDensity: 15,
    colors: {
      spring: [0x9ACD32, 0x7CFC00],
      summer: [0x228B22, 0x32CD32],
      autumn: [0xDAA520, 0xD2691E],
      winter: [0xCD853F, 0xB8860B]
    },
    meshType: 'grain',
    fieldType: 'soil',
    specialFeatures: ['stalks', 'heads']
  },
  'Rice Production': {
    name: 'rice',
    fieldColor: 0x4A6741,
    plantHeight: 0.8,
    plantDensity: 20,
    colors: {
      spring: [0x90EE90, 0x7CFC00],
      summer: [0x32CD32, 0x228B22],
      autumn: [0xDAA520, 0xFFD700],
      winter: [0xD2691E, 0xCD853F]
    },
    meshType: 'grain',
    fieldType: 'flooded',
    specialFeatures: ['clusters', 'water']
  },
  'Coffee Production': {
    name: 'coffee',
    fieldColor: 0x3E2723,
    plantHeight: 2.5,
    plantDensity: 6,
    colors: {
      spring: [0x228B22, 0x2E8B57],
      summer: [0x006400, 0x228B22],
      autumn: [0x8B4513, 0xA0522D],
      winter: [0x654321, 0x8B4513]
    },
    meshType: 'tree',
    fieldType: 'terraced',
    specialFeatures: ['bushes', 'berries', 'flowers']
  },
  'Soybean Production': {
    name: 'soybean',
    fieldColor: 0x4A3728,
    plantHeight: 0.9,
    plantDensity: 14,
    colors: {
      spring: [0x90EE90, 0x98FB98],
      summer: [0x32CD32, 0x228B22],
      autumn: [0xDAA520, 0xB8860B],
      winter: [0x8B7355, 0xA0522D]
    },
    meshType: 'legume',
    fieldType: 'soil',
    specialFeatures: ['pods', 'leaves']
  },
  'Tomato Production': {
    name: 'tomato',
    fieldColor: 0x5D3A1A,
    plantHeight: 1.2,
    plantDensity: 8,
    colors: {
      spring: [0x90EE90, 0x7CFC00],
      summer: [0x32CD32, 0x228B22],
      autumn: [0x228B22, 0x32CD32],
      winter: [0x654321, 0x8B4513]
    },
    meshType: 'vegetable',
    fieldType: 'greenhouse',
    specialFeatures: ['vines', 'fruits', 'supports']
  },
  'Potato Production': {
    name: 'potato',
    fieldColor: 0x3E2723,
    plantHeight: 0.6,
    plantDensity: 10,
    colors: {
      spring: [0x90EE90, 0x7CFC00],
      summer: [0x32CD32, 0x228B22],
      autumn: [0x228B22, 0x2E8B57],
      winter: [0x8B7355, 0xA0522D]
    },
    meshType: 'vegetable',
    fieldType: 'soil',
    specialFeatures: ['mounds', 'flowers']
  },
  'Dairy Production': {
    name: 'grass',
    fieldColor: 0x3E5E3E,
    plantHeight: 0.3,
    plantDensity: 25,
    colors: {
      spring: [0x7CFC00, 0x90EE90],
      summer: [0x32CD32, 0x228B22],
      autumn: [0xDAA520, 0xB8860B],
      winter: [0x8FBC8F, 0x9ACD32]
    },
    meshType: 'grass',
    fieldType: 'pasture',
    specialFeatures: ['varied_heights', 'paths']
  }
};

export default function Farmland({ farm, season = 'autumn' }: FarmlandProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with dynamic background based on season and crop type
    const scene = new THREE.Scene();
    
    // Dynamic background colors based on season
    const backgroundColors = {
      spring: 0xE8F5E8,
      summer: 0xE8F0E8,
      autumn: 0xE8B87E,
      winter: 0xE8E8F0
    };
    
    const backgroundColor = backgroundColors[season];
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.Fog(backgroundColor, 30, 80);

    // Camera - Closer isometric view rotated 180 degrees
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      500
    );
    camera.position.set(-25, 20, -25);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(40, 50, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);

    // Ground with seasonal colors
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const groundColors = {
      spring: 0x9ACD32,
      summer: 0x8B7355,
      autumn: 0x8B7355,
      winter: 0xF0F8FF
    };
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: groundColors[season],
      flatShading: true 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    
    // Add some height variation to ground
    const vertices = groundGeometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const z = vertices.getZ(i);
      vertices.setZ(i, z + Math.random() * 0.2);
    }
    groundGeometry.computeVertexNormals();
    scene.add(ground);

    // Add scattered grass blades with seasonal colors
    const createGrassPatch = (x: number, z: number, count: number) => {
      const grassColorsBySession = {
        spring: [0x7CFC00, 0x90EE90, 0x98FB98],
        summer: [0x32CD32, 0x228B22, 0x2E8B57],
        autumn: [0xB8860B, 0xDAA520, 0xCD853F],
        winter: [0xB0C4DE, 0xF0F8FF, 0xE6E6FA]
      };
      const grassColors = grassColorsBySession[season];
      
      for (let i = 0; i < count; i++) {
        const bladeGeometry = new THREE.PlaneGeometry(0.1, 0.4);
        const grassMaterial = new THREE.MeshLambertMaterial({ 
          color: grassColors[Math.floor(Math.random() * grassColors.length)],
          side: THREE.DoubleSide 
        });
        const blade = new THREE.Mesh(bladeGeometry, grassMaterial);
        blade.position.set(
          x + (Math.random() - 0.5) * 2,
          0.2,
          z + (Math.random() - 0.5) * 2
        );
        blade.rotation.y = Math.random() * Math.PI;
        blade.rotation.x = 0.1;
        scene.add(blade);
      }
    };

    // Add grass patches around fields
    for (let i = -30; i < 30; i += 3) {
      for (let j = -30; j < 30; j += 3) {
        if (Math.abs(i) > 18 || Math.abs(j) > 18) {
          createGrassPatch(i, j, 15);
        }
      }
    }

    // Enhanced crop field creation system
    const createField = (x: number, z: number, cropType: string, config: CropConfig) => {
      const fieldSize = 10;
      
      // Field base with special features based on crop type
      const fieldGeometry = new THREE.BoxGeometry(fieldSize, 0.3, fieldSize);
      const fieldMaterial = new THREE.MeshLambertMaterial({ color: config.fieldColor });
      const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
      field.position.set(x, 0.15, z);
      field.receiveShadow = true;
      field.castShadow = true;
      scene.add(field);

      // Special field features based on type
      if (config.fieldType === 'flooded') {
        // Add water layer for rice fields
        const waterGeometry = new THREE.PlaneGeometry(fieldSize * 0.9, fieldSize * 0.9);
        const waterMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x4682B4, 
          transparent: true, 
          opacity: 0.6 
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.set(x, 0.32, z);
        scene.add(water);
      } else if (config.fieldType === 'greenhouse') {
        // Add greenhouse structure for protected crops
        const frameGeometry = new THREE.BoxGeometry(fieldSize + 1, 3, fieldSize + 1);
        const frameMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xC0C0C0, 
          transparent: true, 
          opacity: 0.3,
          wireframe: true 
        });
        const greenhouse = new THREE.Mesh(frameGeometry, frameMaterial);
        greenhouse.position.set(x, 1.8, z);
        scene.add(greenhouse);
      } else if (config.fieldType === 'terraced') {
        // Add terracing for coffee/mountain crops
        for (let i = 0; i < 3; i++) {
          const terraceGeometry = new THREE.BoxGeometry(fieldSize, 0.2, 3);
          const terraceMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
          const terrace = new THREE.Mesh(terraceGeometry, terraceMaterial);
          terrace.position.set(x, 0.4 + i * 0.3, z - fieldSize/3 + i * fieldSize/3);
          scene.add(terrace);
        }
      }

      // Add furrows/rows (except for special field types)
      if (config.fieldType !== 'greenhouse' && config.fieldType !== 'pasture') {
        const furrowCount = Math.floor(fieldSize / 1.2);
        for (let i = 0; i < furrowCount; i++) {
          const furrowGeometry = new THREE.BoxGeometry(fieldSize, 0.05, 0.15);
          const furrowMaterial = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
          const furrow = new THREE.Mesh(furrowGeometry, furrowMaterial);
          furrow.position.set(x, 0.35, z - fieldSize/2 + i * (fieldSize/furrowCount));
          scene.add(furrow);
        }
      }

      // Generate crops based on configuration
      const rows = config.plantDensity;
      const cols = config.plantDensity;
      const cropSpacing = fieldSize / (rows + 1);
      const seasonalColors = config.colors[season];
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const offsetX = -fieldSize/2 + (i + 1) * cropSpacing;
          const offsetZ = -fieldSize/2 + (j + 1) * cropSpacing;
          const randomOffset = (Math.random() - 0.5) * 0.1;
          
          createSpecificCrop(
            x + offsetX + randomOffset, 
            z + offsetZ + randomOffset, 
            config, 
            seasonalColors
          );
        }
      }
    };

    // Specific crop creation based on mesh type and features
    const createSpecificCrop = (x: number, z: number, config: CropConfig, colors: number[]) => {
      const baseY = config.fieldType === 'flooded' ? 0.4 : 0.3;
      const heightVariation = 1 + (Math.random() - 0.5) * 0.3;
      const finalHeight = config.plantHeight * heightVariation;
      
      switch (config.meshType) {
        case 'grain':
          createGrainCrop(x, z, baseY, finalHeight, colors, config);
          break;
        case 'vegetable':
          createVegetableCrop(x, z, baseY, finalHeight, colors, config);
          break;
        case 'fruit':
          createVegetableCrop(x, z, baseY, finalHeight, colors, config); // Reuse vegetable logic for now
          break;
        case 'legume':
          createLegumeCrop(x, z, baseY, finalHeight, colors, config);
          break;
        case 'grass':
          createGrassCrop(x, z, baseY, finalHeight, colors, config);
          break;
        case 'tree':
          createTreeCrop(x, z, baseY, finalHeight, colors, config);
          break;
      }
    };

    // Grain crops (wheat, corn, rice)
    const createGrainCrop = (x: number, z: number, baseY: number, height: number, colors: number[], config: CropConfig) => {
      if (config.name === 'corn') {
        // Corn stalk
        const stalkGeometry = new THREE.CylinderGeometry(0.06, 0.08, height, 6);
        const stalkMaterial = new THREE.MeshLambertMaterial({ color: colors[0] });
        const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
        stalk.position.set(x, baseY + height/2, z);
        stalk.castShadow = true;
        scene.add(stalk);
        
        // Corn leaves
        for (let k = 0; k < 4; k++) {
          const leafGeometry = new THREE.PlaneGeometry(0.25, 0.5);
          const leafMaterial = new THREE.MeshLambertMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)],
            side: THREE.DoubleSide 
          });
          const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
          leaf.position.set(x, baseY + height * 0.3 + k * height * 0.15, z);
          leaf.rotation.y = (k * Math.PI * 2) / 4;
          leaf.rotation.x = 0.2;
          scene.add(leaf);
        }
        
        // Corn cob (seasonal)
        if (season === 'summer' || season === 'autumn') {
          const cobGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
          const cobMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
          const cob = new THREE.Mesh(cobGeometry, cobMaterial);
          cob.position.set(x, baseY + height * 0.8, z);
          cob.castShadow = true;
          scene.add(cob);
        }
      } else if (config.name === 'wheat') {
        // Wheat stalk
        const stalkGeometry = new THREE.CylinderGeometry(0.025, 0.04, height, 4);
        const stalkMaterial = new THREE.MeshLambertMaterial({ color: colors[0] });
        const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
        stalk.position.set(x, baseY + height/2, z);
        stalk.castShadow = true;
        scene.add(stalk);
        
        // Wheat head
        const headGeometry = new THREE.SphereGeometry(0.06, 4, 4);
        const headMaterial = new THREE.MeshLambertMaterial({ color: colors[1] });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(x, baseY + height * 0.9, z);
        head.scale.set(1, 2, 1);
        head.castShadow = true;
        scene.add(head);
      } else if (config.name === 'rice') {
        // Rice clusters
        for (let k = 0; k < 6; k++) {
          const stalkGeometry = new THREE.CylinderGeometry(0.02, 0.03, height * 0.8, 3);
          const stalkMaterial = new THREE.MeshLambertMaterial({ color: colors[0] });
          const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
          const angle = (k * Math.PI * 2) / 6;
          const radius = 0.08;
          stalk.position.set(
            x + Math.cos(angle) * radius, 
            baseY + height * 0.4, 
            z + Math.sin(angle) * radius
          );
          stalk.castShadow = true;
          scene.add(stalk);
          
          // Rice grains (seasonal)
          if (season === 'summer' || season === 'autumn') {
            const grainGeometry = new THREE.SphereGeometry(0.03, 3, 3);
            const grainMaterial = new THREE.MeshLambertMaterial({ color: colors[1] });
            const grain = new THREE.Mesh(grainGeometry, grainMaterial);
            grain.position.set(
              x + Math.cos(angle) * radius, 
              baseY + height * 0.7, 
              z + Math.sin(angle) * radius
            );
            scene.add(grain);
          }
        }
      }
    };

    // Vegetable crops (tomato, potato)
    const createVegetableCrop = (x: number, z: number, baseY: number, height: number, colors: number[], config: CropConfig) => {
      if (config.name === 'tomato') {
        // Tomato vine/support
        const supportGeometry = new THREE.CylinderGeometry(0.02, 0.02, height * 1.5, 4);
        const supportMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(x, baseY + height * 0.75, z);
        scene.add(support);
        
        // Tomato plant
        const stalkGeometry = new THREE.CylinderGeometry(0.03, 0.04, height, 6);
        const stalkMaterial = new THREE.MeshLambertMaterial({ color: colors[0] });
        const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
        stalk.position.set(x, baseY + height/2, z);
        stalk.castShadow = true;
        scene.add(stalk);
        
        // Leaves
        const leafGeometry = new THREE.SphereGeometry(0.12, 5, 5);
        const leafMaterial = new THREE.MeshLambertMaterial({ color: colors[0] });
        const leaves = new THREE.Mesh(leafGeometry, leafMaterial);
        leaves.position.set(x, baseY + height * 0.7, z);
        leaves.scale.set(1.2, 0.6, 1.2);
        scene.add(leaves);
        
        // Tomatoes (seasonal)
        if (season === 'summer' || season === 'autumn') {
          for (let k = 0; k < 3; k++) {
            const tomatoGeometry = new THREE.SphereGeometry(0.06, 6, 6);
            const tomatoMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4500 });
            const tomato = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
            tomato.position.set(
              x + (Math.random() - 0.5) * 0.2, 
              baseY + height * 0.6 + k * 0.1, 
              z + (Math.random() - 0.5) * 0.2
            );
            tomato.castShadow = true;
            scene.add(tomato);
          }
        }
      } else if (config.name === 'potato') {
        // Potato plant with mounded earth
        const moundGeometry = new THREE.SphereGeometry(0.15, 6, 4);
        const moundMaterial = new THREE.MeshLambertMaterial({ color: config.fieldColor });
        const mound = new THREE.Mesh(moundGeometry, moundMaterial);
        mound.position.set(x, baseY + 0.05, z);
        mound.scale.set(1, 0.4, 1);
        scene.add(mound);
        
        // Potato leaves
        for (let k = 0; k < 4; k++) {
          const leafGeometry = new THREE.PlaneGeometry(0.12, 0.08);
          const leafMaterial = new THREE.MeshLambertMaterial({ 
            color: colors[0],
            side: THREE.DoubleSide 
          });
          const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
          const angle = (k * Math.PI * 2) / 4;
          leaf.position.set(
            x + Math.cos(angle) * 0.1, 
            baseY + height * 0.5, 
            z + Math.sin(angle) * 0.1
          );
          leaf.rotation.y = angle;
          scene.add(leaf);
        }
        
        // Potato flowers (spring/summer)
        if (season === 'spring' || season === 'summer') {
          const flowerGeometry = new THREE.SphereGeometry(0.02, 4, 4);
          const flowerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
          const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
          flower.position.set(x, baseY + height, z);
          scene.add(flower);
        }
      }
    };

    // Legume crops (soybean)
    const createLegumeCrop = (x: number, z: number, baseY: number, height: number, colors: number[], config: CropConfig) => {
      // Soybean stem
      const stalkGeometry = new THREE.CylinderGeometry(0.025, 0.035, height, 4);
      const stalkMaterial = new THREE.MeshLambertMaterial({ color: colors[0] });
      const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
      stalk.position.set(x, baseY + height/2, z);
      stalk.castShadow = true;
      scene.add(stalk);
      
      // Trifoliate leaves
      for (let k = 0; k < 3; k++) {
        const leafGeometry = new THREE.PlaneGeometry(0.08, 0.06);
        const leafMaterial = new THREE.MeshLambertMaterial({ 
          color: colors[0],
          side: THREE.DoubleSide 
        });
        for (let l = 0; l < 3; l++) {
          const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
          const angle = (l * Math.PI * 2) / 3;
          leaf.position.set(
            x + Math.cos(angle) * 0.05, 
            baseY + height * 0.3 + k * height * 0.25, 
            z + Math.sin(angle) * 0.05
          );
          leaf.rotation.y = angle;
          scene.add(leaf);
        }
      }
      
      // Soybean pods (autumn)
      if (season === 'autumn') {
        for (let k = 0; k < 4; k++) {
          const podGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.04, 4);
          const podMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
          const pod = new THREE.Mesh(podGeometry, podMaterial);
          pod.position.set(
            x + (Math.random() - 0.5) * 0.1, 
            baseY + height * 0.6 + k * 0.05, 
            z + (Math.random() - 0.5) * 0.1
          );
          scene.add(pod);
        }
      }
    };

    // Grass crops (dairy/pasture)
    const createGrassCrop = (x: number, z: number, baseY: number, height: number, colors: number[], config: CropConfig) => {
      // Multiple grass blades with varied heights
      for (let k = 0; k < 3; k++) {
        const bladeHeight = height * (0.5 + Math.random() * 0.5);
        const bladeGeometry = new THREE.PlaneGeometry(0.02, bladeHeight);
        const bladeMaterial = new THREE.MeshLambertMaterial({ 
          color: colors[Math.floor(Math.random() * colors.length)],
          side: THREE.DoubleSide 
        });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.set(
          x + (Math.random() - 0.5) * 0.1, 
          baseY + bladeHeight/2, 
          z + (Math.random() - 0.5) * 0.1
        );
        blade.rotation.y = Math.random() * Math.PI;
        blade.rotation.x = 0.1;
        scene.add(blade);
      }
    };

    // Tree crops (coffee)
    const createTreeCrop = (x: number, z: number, baseY: number, height: number, colors: number[], config: CropConfig) => {
      // Coffee bush trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.05, 0.08, height * 0.6, 6);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, baseY + height * 0.3, z);
      trunk.castShadow = true;
      scene.add(trunk);
      
      // Coffee bush foliage
      const foliageGeometry = new THREE.SphereGeometry(height * 0.4, 6, 6);
      const foliageMaterial = new THREE.MeshLambertMaterial({ color: colors[0] });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.set(x, baseY + height * 0.7, z);
      foliage.castShadow = true;
      scene.add(foliage);
      
      // Coffee berries (seasonal)
      if (season === 'summer' || season === 'autumn') {
        for (let k = 0; k < 6; k++) {
          const berryGeometry = new THREE.SphereGeometry(0.015, 4, 4);
          const berryMaterial = new THREE.MeshLambertMaterial({ color: 0xDC143C });
          const berry = new THREE.Mesh(berryGeometry, berryMaterial);
          const angle = (k * Math.PI * 2) / 6;
          const radius = height * 0.25;
          berry.position.set(
            x + Math.cos(angle) * radius, 
            baseY + height * 0.7, 
            z + Math.sin(angle) * radius
          );
          scene.add(berry);
        }
      }
      
      // Coffee flowers (spring)
      if (season === 'spring') {
        for (let k = 0; k < 8; k++) {
          const flowerGeometry = new THREE.SphereGeometry(0.01, 4, 4);
          const flowerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFF0 });
          const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
          const angle = (k * Math.PI * 2) / 8;
          const radius = height * 0.3;
          flower.position.set(
            x + Math.cos(angle) * radius, 
            baseY + height * 0.6 + Math.random() * 0.2, 
            z + Math.sin(angle) * radius
          );
          scene.add(flower);
        }
      }
    };

    // Create 9 farmlands with variety based on crop configurations
    const fieldSpacing = 12;
    
    // Get crop type from farm prop or use default mix
    const farmCropType = farm?.type || 'Corn Production';
    const currentConfig = CROP_CONFIGS[farmCropType] || CROP_CONFIGS['Corn Production'];
    
    // Create fields based on farm type or use variety for demo
    if (farm) {
      // Single crop type for specific farm
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const x = (col - 1) * fieldSpacing;
          const z = (row - 1) * fieldSpacing;
          createField(x, z, farmCropType, currentConfig);
        }
      }
    } else {
      // Demo mode with variety of crops
      const cropTypes = Object.keys(CROP_CONFIGS);
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const x = (col - 1) * fieldSpacing;
          const z = (row - 1) * fieldSpacing;
          const cropIndex = (row * 3 + col) % cropTypes.length;
          const cropType = cropTypes[cropIndex];
          const config = CROP_CONFIGS[cropType];
          createField(x, z, cropType, config);
        }
      }
    }

    // Create detailed barn
    const createBarn = () => {
      // Main structure
      const barnBody = new THREE.BoxGeometry(10, 7, 8);
      const barnMaterial = new THREE.MeshLambertMaterial({ color: 0xA52A2A });
      const barn = new THREE.Mesh(barnBody, barnMaterial);
      barn.position.set(-20, 3.5, 20);
      barn.castShadow = true;
      barn.receiveShadow = true;
      scene.add(barn);

      // Wood planks detail
      for (let i = 0; i < 10; i++) {
        const plankGeometry = new THREE.BoxGeometry(10.1, 0.3, 0.1);
        const plankMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const plank = new THREE.Mesh(plankGeometry, plankMaterial);
        plank.position.set(-20, i * 0.7, 24.1);
        scene.add(plank);
      }

      // Roof
      const roofGeometry = new THREE.ConeGeometry(7.5, 4.5, 4);
      const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(-20, 9.5, 20);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);

      // Door
      const doorGeometry = new THREE.BoxGeometry(2.5, 4, 0.3);
      const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(-20, 2, 24.2);
      scene.add(door);

      // Windows
      const windowGeometry = new THREE.BoxGeometry(1.2, 1.2, 0.2);
      const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB });
      
      const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
      window1.position.set(-23, 4.5, 24.1);
      scene.add(window1);
      
      const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
      window2.position.set(-17, 4.5, 24.1);
      scene.add(window2);

      // Hay bales outside barn
      for (let i = 0; i < 3; i++) {
        const hayGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
        const hayMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
        const hay = new THREE.Mesh(hayGeometry, hayMaterial);
        hay.rotation.z = Math.PI / 2;
        hay.position.set(-26, 0.5, 18 + i * 1.5);
        hay.castShadow = true;
        scene.add(hay);
      }
    };

    createBarn();

    // Create windmill
    const createWindmill = () => {
      // Tower
      const towerGeometry = new THREE.CylinderGeometry(0.8, 1.2, 9, 8);
      const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
      const tower = new THREE.Mesh(towerGeometry, towerMaterial);
      tower.position.set(20, 4.5, 20);
      tower.castShadow = true;
      scene.add(tower);

      // Roof
      const roofGeometry = new THREE.ConeGeometry(1.3, 2, 8);
      const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(20, 10, 20);
      roof.castShadow = true;
      scene.add(roof);

      // Door
      const doorGeometry = new THREE.BoxGeometry(1, 2, 0.2);
      const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(20, 1, 21.3);
      scene.add(door);

      // Blades center
      const centerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
      const centerMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const center = new THREE.Mesh(centerGeometry, centerMaterial);
      center.position.set(20, 7, 21.7);
      center.rotation.x = Math.PI / 2;
      scene.add(center);

      // Windmill blades
      const bladeGeometry = new THREE.BoxGeometry(0.2, 3.5, 0.8);
      const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5F5 });
      
      const blades = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.y = 1.75;
        blade.castShadow = true;
        const bladeWrapper = new THREE.Group();
        bladeWrapper.add(blade);
        bladeWrapper.rotation.z = (i * Math.PI) / 2;
        blades.add(bladeWrapper);
      }
      blades.position.set(20, 7, 21.7);
      blades.rotation.x = Math.PI / 2;
      scene.add(blades);

      return blades;
    };

    const windmillBlades = createWindmill();

    // Create detailed trees with bushes
    const createTree = (x: number, z: number) => {
      // Trunk with texture
      const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.6, 3.5, 8);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x6B4423 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 1.75, z);
      trunk.castShadow = true;
      scene.add(trunk);

      // Multiple foliage layers - autumn colors
      const foliageColors = [0xDAA520, 0xFF8C00, 0xD2691E, 0xCD853F];
      
      const foliage1 = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 8, 8), 
        new THREE.MeshLambertMaterial({ color: foliageColors[0] })
      );
      foliage1.position.set(x, 4.5, z);
      foliage1.castShadow = true;
      scene.add(foliage1);
      
      const foliage2 = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 8, 8), 
        new THREE.MeshLambertMaterial({ color: foliageColors[1] })
      );
      foliage2.position.set(x + 1, 4.2, z + 0.8);
      foliage2.castShadow = true;
      scene.add(foliage2);
      
      const foliage3 = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 8, 8), 
        new THREE.MeshLambertMaterial({ color: foliageColors[2] })
      );
      foliage3.position.set(x - 0.8, 4, z - 1);
      foliage3.castShadow = true;
      scene.add(foliage3);

      // Add bush at base - autumn colors
      const bushGeometry = new THREE.SphereGeometry(0.8, 8, 8);
      const bushMaterial = new THREE.MeshLambertMaterial({ color: 0xB8860B });
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
      bush.position.set(x + 1.5, 0.4, z + 1.5);
      bush.scale.set(1, 0.6, 1);
      bush.castShadow = true;
      scene.add(bush);
    };

    // More trees
    createTree(-25, -25);
    createTree(-25, 25);
    createTree(25, -25);
    createTree(-28, 0);
    createTree(28, 0);
    createTree(0, -28);
    createTree(0, 28);

    // Create decorative fence with posts
    const createFence = () => {
      const fenceMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
      const postGeometry = new THREE.BoxGeometry(0.3, 2, 0.3);
      const railGeometry = new THREE.BoxGeometry(2.5, 0.15, 0.15);
      
      for (let i = -30; i <= 30; i += 3) {
        // Posts
        [[i, -30], [i, 30], [-30, i], [30, i]].forEach(([px, pz]) => {
          const post = new THREE.Mesh(postGeometry, fenceMaterial);
          post.position.set(px, 1, pz);
          post.castShadow = true;
          scene.add(post);
          
          // Rails
          const rail1 = new THREE.Mesh(railGeometry, fenceMaterial);
          rail1.position.set(px, 0.7, pz);
          if (Math.abs(px) === 30) rail1.rotation.y = Math.PI / 2;
          scene.add(rail1);
          
          const rail2 = new THREE.Mesh(railGeometry, fenceMaterial);
          rail2.position.set(px, 1.3, pz);
          if (Math.abs(px) === 30) rail2.rotation.y = Math.PI / 2;
          scene.add(rail2);
        });
      }
    };

    createFence();

    // Add dirt paths
    const createPath = (x1: number, z1: number, x2: number, z2: number, width: number) => {
      const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
      const pathGeometry = new THREE.PlaneGeometry(width, length);
      const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
      const path = new THREE.Mesh(pathGeometry, pathMaterial);
      path.position.set((x1 + x2) / 2, 0.05, (z1 + z2) / 2);
      path.rotation.x = -Math.PI / 2;
      path.rotation.z = Math.atan2(z2 - z1, x2 - x1) - Math.PI / 2;
      path.receiveShadow = true;
      scene.add(path);
    };

    createPath(0, -35, 0, 35, 3);
    createPath(-35, 0, 35, 0, 3);

    // Add flowers scattered around with seasonal variety
    const flowerColorsBySeason = {
      spring: [0xFF69B4, 0xFFB6C1, 0xFFA0C9, 0xFFDAB9, 0xF0E68C],
      summer: [0xFF4500, 0xFF6347, 0xFFD700, 0xFFA500, 0xFF1493],
      autumn: [0xFF8C00, 0xFFD700, 0xDAA520, 0xCD853F, 0x8B4513],
      winter: [0xF0F8FF, 0xE6E6FA, 0xB0C4DE, 0xD3D3D3, 0xC0C0C0]
    };
    const flowerColors = flowerColorsBySeason[season];
    
    const flowerCount = season === 'winter' ? 20 : 80; // Fewer flowers in winter
    
    for (let i = 0; i < flowerCount; i++) {
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;
      
      // Skip if on field
      if (Math.abs(x) < 18 && Math.abs(z) < 18) continue;
      
      const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6);
      const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      stem.position.set(x, 0.15, z);
      scene.add(stem);
      
      const petalGeometry = new THREE.SphereGeometry(0.08, 6, 6);
      const petalMaterial = new THREE.MeshLambertMaterial({ 
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)] 
      });
      const flower = new THREE.Mesh(petalGeometry, petalMaterial);
      flower.position.set(x, 0.35, z);
      flower.scale.set(1, 0.5, 1);
      scene.add(flower);
    }

    // Add rocks
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 70;
      const z = (Math.random() - 0.5) * 70;
      
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
      
      const rockGeometry = new THREE.SphereGeometry(0.2 + Math.random() * 0.3, 6, 5);
      const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(x, 0.15, z);
      rock.scale.set(1, 0.6, 1);
      rock.castShadow = true;
      scene.add(rock);
    }

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      windmillBlades.rotation.z += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [farm, season]);

  return <div ref={mountRef} className="w-full h-screen" />;
}