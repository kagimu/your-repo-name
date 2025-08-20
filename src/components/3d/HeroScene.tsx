
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

const HeroScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationRef = useRef<number>();

  const icons = useMemo(() => [
    // Education-themed 3D objects
    { type: 'box', color: 0x00bcd4, position: [-3, 1, 0] },
    { type: 'sphere', color: 0xff9800, position: [2, -1, 1] },
    { type: 'torus', color: 0x4caf50, position: [0, 2, -1] },
    { type: 'cylinder', color: 0x9c27b0, position: [-1, -2, 0] },
    { type: 'cone', color: 0xf44336, position: [3, 0, -2] },
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
    camera.position.z = 5;

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

    // Create floating education icons
    const meshes: THREE.Mesh[] = [];
    
    icons.forEach((icon, index) => {
      let geometry;
      
      switch (icon.type) {
        case 'box':
          geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(0.5, 32, 32);
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32);
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(0.4, 0.8, 32);
          break;
        default:
          geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      }

      const material = new THREE.MeshPhongMaterial({ 
        color: icon.color,
        shininess: 100,
        transparent: true,
        opacity: 0.9
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...icon.position);
      mesh.userData = { 
        originalPosition: [...icon.position],
        phase: index * 0.5,
        rotationSpeed: 0.01 + Math.random() * 0.01
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
        
        // Floating animation
        mesh.position.y = userData.originalPosition[1] + Math.sin(time + userData.phase) * 0.3;
        mesh.position.x = userData.originalPosition[0] + Math.cos(time * 0.7 + userData.phase) * 0.1;
        
        // Rotation
        mesh.rotation.x += userData.rotationSpeed;
        mesh.rotation.y += userData.rotationSpeed * 1.5;
        
        // Mouse interaction - subtle attraction
        const mouseInfluence = 0.1;
        mesh.position.x += mouse.x * mouseInfluence * 0.1;
        mesh.position.y += mouse.y * mouseInfluence * 0.1;
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
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
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
  }, [icons]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full min-h-[600px]"
      style={{ background: 'transparent' }}
    />
  );
};

export default HeroScene;
