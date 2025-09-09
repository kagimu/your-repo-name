import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

const HeroScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationRef = useRef<number>();

  const objects = useMemo(() => [
    // Basic geometric shapes
    { type: 'box', color: 0x00bcd4, position: [-3, 1, 0] },
    { type: 'sphere', color: 0xff9800, position: [2, -1, 1] },
    { type: 'cylinder', color: 0x9c27b0, position: [-1, -2, 0] },
    { type: 'cone', color: 0xf44336, position: [3, 0, -2] },
    // Adding torus knots
    { type: 'torusKnot', color: 0xff6b6b, position: [-4, 0, 0], scale: 0.7 },
    { type: 'torusKnot', color: 0x4ecdc4, position: [0, 0, -2], scale: 0.8 },
    { type: 'torusKnot', color: 0x45b7d1, position: [4, 0, 0], scale: 0.6 }
  ], []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 8; // Increased camera distance to see all objects

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create objects
    const meshes: THREE.Mesh[] = [];
    
    objects.forEach((obj, index) => {
      let geometry;
      
      switch (obj.type) {
        case 'box':
          geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(0.5, 32, 32);
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32);
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(0.4, 0.8, 32);
          break;
        case 'torusKnot':
          geometry = new THREE.TorusKnotGeometry(0.5, 0.2, 128, 16);
          break;
        default:
          geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      }

      const material = new THREE.MeshPhongMaterial({ 
        color: obj.color,
        shininess: 150,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...obj.position);
      if (obj.scale) mesh.scale.setScalar(obj.scale);
      
      mesh.userData = { 
        originalPosition: [...obj.position],
        phase: index * 0.5,
        rotationSpeed: 0.01 + Math.random() * 0.01,
        type: obj.type
      };
      
      scene.add(mesh);
      meshes.push(mesh);
    });

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Animate meshes
      meshes.forEach((mesh) => {
        const userData = mesh.userData;
        
        // Enhanced floating animation
        mesh.position.y = userData.originalPosition[1] + Math.sin(time + userData.phase) * 0.5;
        mesh.position.x = userData.originalPosition[0] + Math.cos(time * 0.7 + userData.phase) * 0.3;
        mesh.position.z = userData.originalPosition[2] + Math.sin(time * 0.5 + userData.phase) * 0.2;
        
        // Enhanced rotation for all objects
        if (userData.type === 'torusKnot') {
          mesh.rotation.x += userData.rotationSpeed * 2;
          mesh.rotation.y += userData.rotationSpeed * 2.5;
          mesh.rotation.z += userData.rotationSpeed * 0.5;
        } else {
          mesh.rotation.x += userData.rotationSpeed * 1.5;
          mesh.rotation.y += userData.rotationSpeed * 2;
          mesh.rotation.z += userData.rotationSpeed * 0.3;
        }
        
        // Enhanced mouse interaction
        const mouseInfluence = userData.type === 'torusKnot' ? 0.2 : 0.15;
        mesh.position.x += mouse.x * mouseInfluence * 0.15;
        mesh.position.y += mouse.y * mouseInfluence * 0.15;
        
        // Add slight z-axis movement based on mouse position
        mesh.position.z += (mouse.x * mouse.y) * mouseInfluence * 0.1;
      });

      // Camera slight movement based on mouse
      camera.position.x = mouse.x * 0.2;
      camera.position.y = mouse.y * 0.1;
      camera.lookAt(scene.position);

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
    const mountElement = mountRef.current;
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (mountElement && renderer.domElement) {
        mountElement.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js objects
      meshes.forEach(mesh => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(material => material.dispose());
        } else {
          mesh.material.dispose();
        }
      });
      
      renderer.dispose();
    };
  }, [objects]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full min-h-[600px]"
      style={{ background: 'transparent' }}
    />
  );
  return (
    <div 
      ref={mountRef} 
      className="w-full h-full min-h-[600px]"
      style={{ background: 'transparent' }}
    />
  );
};

export default HeroScene;


