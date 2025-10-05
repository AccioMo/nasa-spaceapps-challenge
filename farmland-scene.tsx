import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Farmland() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 80, 150);

    // Camera - Isometric view
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(45, 45, 45);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
    sunLight.position.set(60, 70, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.left = -80;
    sunLight.shadow.camera.right = 80;
    sunLight.shadow.camera.top = 80;
    sunLight.shadow.camera.bottom = -80;
    scene.add(sunLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(150, 150);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x2d8b3d });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create detailed crop fields
    const createField = (x, z, cropType) => {
      const fieldSize = 12;
      const spacing = 15;
      
      // Field base
      const fieldGeometry = new THREE.BoxGeometry(fieldSize, 0.4, fieldSize);
      const fieldColors = {
        wheat: 0x6B4423,
        corn: 0x5A3A1A,
        carrots: 0x4A2F1A
      };
      const fieldMaterial = new THREE.MeshLambertMaterial({ color: fieldColors[cropType] });
      const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
      field.position.set(x, 0.2, z);
      field.receiveShadow = true;
      field.castShadow = true;
      scene.add(field);

      // Add many crops
      const rows = 10;
      const cols = 10;
      const cropSpacing = fieldSize / (rows + 1);
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const offsetX = -fieldSize/2 + (i + 1) * cropSpacing;
          const offsetZ = -fieldSize/2 + (j + 1) * cropSpacing;
          
          if (cropType === 'wheat') {
            // Wheat stalks
            const stalkGeometry = new THREE.CylinderGeometry(0.05, 0.08, 1.2, 6);
            const stalkMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
            const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
            stalk.position.set(x + offsetX, 1, z + offsetZ);
            stalk.castShadow = true;
            scene.add(stalk);
            
            // Wheat head
            const headGeometry = new THREE.SphereGeometry(0.15, 6, 6);
            const headMaterial = new THREE.MeshLambertMaterial({ color: 0xF4A460 });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(x + offsetX, 1.7, z + offsetZ);
            head.castShadow = true;
            scene.add(head);
          } else if (cropType === 'corn') {
            // Corn stalk
            const stalkGeometry = new THREE.CylinderGeometry(0.08, 0.1, 1.8, 6);
            const stalkMaterial = new THREE.MeshLambertMaterial({ color: 0x3CB371 });
            const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
            stalk.position.set(x + offsetX, 1.3, z + offsetZ);
            stalk.castShadow = true;
            scene.add(stalk);
            
            // Corn cob
            const cobGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8);
            const cobMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
            const cob = new THREE.Mesh(cobGeometry, cobMaterial);
            cob.position.set(x + offsetX, 2, z + offsetZ);
            cob.castShadow = true;
            scene.add(cob);
          } else if (cropType === 'carrots') {
            // Carrot leaves
            const leavesGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);
            const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.set(x + offsetX, 0.6, z + offsetZ);
            leaves.castShadow = true;
            scene.add(leaves);
            
            // Small carrot top visible
            const topGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.2, 6);
            const topMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6347 });
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.set(x + offsetX, 0.5, z + offsetZ);
            top.castShadow = true;
            scene.add(top);
          }
        }
      }
    };

    // Create 9 farmlands in a 3x3 grid
    const fieldSpacing = 15;
    const cropTypes = ['wheat', 'corn', 'carrots'];
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = (col - 1) * fieldSpacing;
        const z = (row - 1) * fieldSpacing;
        const cropType = cropTypes[(row * 3 + col) % 3];
        createField(x, z, cropType);
      }
    }

    // Create detailed barn
    const createBarn = () => {
      // Main structure
      const barnBody = new THREE.BoxGeometry(12, 8, 10);
      const barnMaterial = new THREE.MeshLambertMaterial({ color: 0xA52A2A });
      const barn = new THREE.Mesh(barnBody, barnMaterial);
      barn.position.set(-30, 4, 30);
      barn.castShadow = true;
      barn.receiveShadow = true;
      scene.add(barn);

      // Roof
      const roofGeometry = new THREE.ConeGeometry(9, 5, 4);
      const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(-30, 10.5, 30);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);

      // Door
      const doorGeometry = new THREE.BoxGeometry(2.5, 4, 0.3);
      const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(-30, 2, 35.2);
      scene.add(door);

      // Windows
      const windowGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.2);
      const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x4FC3F7 });
      
      const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
      window1.position.set(-33, 5, 35.1);
      scene.add(window1);
      
      const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
      window2.position.set(-27, 5, 35.1);
      scene.add(window2);
    };

    createBarn();

    // Create windmill
    const createWindmill = () => {
      // Tower
      const towerGeometry = new THREE.CylinderGeometry(1, 1.5, 10, 8);
      const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
      const tower = new THREE.Mesh(towerGeometry, towerMaterial);
      tower.position.set(30, 5, 30);
      tower.castShadow = true;
      scene.add(tower);

      // Roof
      const roofGeometry = new THREE.ConeGeometry(1.5, 2, 8);
      const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(30, 11, 30);
      roof.castShadow = true;
      scene.add(roof);

      // Blades center
      const centerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 8);
      const centerMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
      const center = new THREE.Mesh(centerGeometry, centerMaterial);
      center.position.set(30, 8, 31.5);
      center.rotation.x = Math.PI / 2;
      scene.add(center);

      // Blades
      const bladeGeometry = new THREE.BoxGeometry(0.3, 4, 1);
      const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5F5 });
      
      const blades = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.y = 2;
        blade.castShadow = true;
        const bladeWrapper = new THREE.Group();
        bladeWrapper.add(blade);
        bladeWrapper.rotation.z = (i * Math.PI) / 2;
        blades.add(bladeWrapper);
      }
      blades.position.set(30, 8, 31.5);
      blades.rotation.x = Math.PI / 2;
      scene.add(blades);

      // Animate blades
      const animateBlades = () => {
        blades.rotation.z += 0.01;
      };
      
      return animateBlades;
    };

    const animateBlades = createWindmill();

    // Create detailed fence
    const createFence = () => {
      const fenceMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
      const postGeometry = new THREE.BoxGeometry(0.4, 2.5, 0.4);
      const railGeometry = new THREE.BoxGeometry(0.2, 0.2, 3);
      
      const positions = [];
      for (let i = -45; i <= 45; i += 3.5) {
        positions.push({ x: i, z: -45 });
        positions.push({ x: i, z: 45 });
        positions.push({ x: -45, z: i });
        positions.push({ x: 45, z: i });
      }
      
      positions.forEach(pos => {
        const post = new THREE.Mesh(postGeometry, fenceMaterial);
        post.position.set(pos.x, 1.25, pos.z);
        post.castShadow = true;
        scene.add(post);
      });
    };

    createFence();

    // Create more detailed trees
    const createTree = (x, z) => {
      // Trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 2, z);
      trunk.castShadow = true;
      scene.add(trunk);

      // Multiple foliage layers
      const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
      
      const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), foliageMaterial);
      foliage1.position.set(x, 5.5, z);
      foliage1.castShadow = true;
      scene.add(foliage1);
      
      const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), foliageMaterial);
      foliage2.position.set(x + 1, 5, z + 1);
      foliage2.castShadow = true;
      scene.add(foliage2);
      
      const foliage3 = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), foliageMaterial);
      foliage3.position.set(x - 1, 5, z - 1);
      foliage3.castShadow = true;
      scene.add(foliage3);
    };

    createTree(-35, -35);
    createTree(-35, 35);
    createTree(35, -35);
    createTree(-40, 0);
    createTree(40, 0);

    // Add dirt path
    const pathMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
    const pathGeometry = new THREE.PlaneGeometry(4, 80);
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.05;
    path.receiveShadow = true;
    scene.add(path);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      animateBlades();
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
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
}