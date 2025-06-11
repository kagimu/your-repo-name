// src/pages/AboutUs.tsx

import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Html, OrbitControls, Sparkles } from '@react-three/drei';
import { motion as motion2d, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import * as THREE from 'three';
import { Link } from 'react-router-dom';

// --- Planet Content (No changes) ---
const planetsData = [
  { id: 1, label: 'Our Vision', color: '#6ec6ff', size: 0.7, orbitRadius: 6, speed: 0.2, hasMoon: true, content: { title: 'Our Vision', description: 'To be Uganda’s leading digital marketplace revolutionizing school procurement by making quality educational products and services accessible, affordable, and efficient for every learning institution.' } },
  { id: 2, label: 'Our Mission', color: '#fcbf49', size: 0.8, orbitRadius: 9, speed: 0.15, hasMoon: true, content: { title: 'Our Mission', description: 'To equip schools and education providers with a streamlined, transparent, cost-effective, and tech-driven procurement platform that connects them to verified suppliers, enhances operational efficiency, and supports educational excellence.' } },
  { id: 3, label: 'Core Values', color: '#f07167', size: 0.7, orbitRadius: 12, speed: 0.1, hasMoon: true, content: { title: 'Our Core Values', description: 'Integrity, Transparency, Efficiency, Customer-Centricity, and Collaboration form the bedrock of our operations and interactions.' } },
  { id: 4, label: 'Community', color: '#83c5be', size: 0.6, orbitRadius: 14.5, speed: 0.08, hasMoon: false, content: { title: 'Our Community', description: 'We are building an ecosystem of educators, suppliers, and innovators dedicated to advancing education. Join us in shaping the future of learning.' } },
];

// --- NEW: Distant Galaxies ---
// A performant, particle-based galaxy component
const Galaxy = ({ type = 'spiral', count, size, position, rotation }) => {
  const ref = useRef();

  // Generate particle positions only once
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    const radius = size;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      if (type === 'spiral') {
        const r = Math.sqrt(Math.random()) * radius; // Distribute points more towards the center
        const angle = (Math.random() - 0.5) * Math.PI * 4; // Spread along arms
        const arm = Math.round(Math.random() * 3); // 4 arms
        const armAngle = (arm / 4) * Math.PI * 2;
        const finalAngle = angle + armAngle + (r / radius) * 2.5;

        p[i3] = Math.cos(finalAngle) * r;
        p[i3 + 1] = (Math.random() - 0.5) * 0.1 * r; // Give it some thickness
        p[i3 + 2] = Math.sin(finalAngle) * r;
      } else { // Dwarf galaxy (spherical)
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = Math.cbrt(Math.random()) * radius;
        p[i3] = r * Math.sin(phi) * Math.cos(theta);
        p[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        p[i3 + 2] = r * Math.cos(phi);
      }
    }
    return p;
  }, [count, size, type]);

  // Subtle rotation animation
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0001;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#6a7fa8" sizeAttenuation transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
};


// --- Controls Manager (No changes) ---
function ControlsManager({ selectedItem }) {
  const controlsRef = useRef();
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = selectedItem === null;
      if (selectedItem === null) controlsRef.current.reset();
    }
  }, [selectedItem]);
  return <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} minDistance={8} maxDistance={30} autoRotate={selectedItem === null} autoRotateSpeed={0.2}/>;
}

// --- Moon Component (No changes) ---
function Moon({ planetSize }) {
    const moonRef = useRef<THREE.Mesh>();
    const orbitRadius = planetSize + 0.4;
    useFrame(({ clock }) => {
      if (moonRef.current) {
        moonRef.current.position.x = Math.cos(clock.getElapsedTime() * 1.5) * orbitRadius;
        moonRef.current.position.z = Math.sin(clock.getElapsedTime() * 1.5) * orbitRadius;
      }
    });
    return (
      <mesh ref={moonRef}>
        <sphereGeometry args={[planetSize / 4, 16, 16]} />
        <meshStandardMaterial color="#ccc" roughness={0.8} />
      </mesh>
    );
}
  
// --- Planet Component (No changes) ---
function Planet({ data, selectedItem, setSelectedItem, isKeyboardFocus }) {
  const groupRef = useRef<THREE.Group>();
  const materialRef = useRef<THREE.MeshStandardMaterial>();
  const [isHovered, setIsHovered] = useState(false);
  const isAnyItemSelected = selectedItem !== null;
  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !materialRef.current) return;
    const group = groupRef.current;
    const material = materialRef.current;
    const t = clock.getElapsedTime() * data.speed;
    const orbitPosition = new THREE.Vector3(Math.cos(t) * data.orbitRadius, 0, Math.sin(t) * data.orbitRadius);
    let targetPosition = orbitPosition;
    let targetScale = (isHovered && !isAnyItemSelected) || (isKeyboardFocus && !isAnyItemSelected) ? 1.2 : 1;
    let targetEmissive = (isHovered && !isAnyItemSelected) || (isKeyboardFocus && !isAnyItemSelected) ? 0.6 : 0;
    if (isAnyItemSelected) {
      targetPosition = new THREE.Vector3(orbitPosition.x * 2, orbitPosition.y, orbitPosition.z * 2);
      targetScale = 0.3;
      targetEmissive = 0;
    }
    group.position.lerp(targetPosition, delta * 3);
    group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetEmissive, delta * 5);
  });
  return (
    <group ref={groupRef}>
      <mesh onClick={() => !isAnyItemSelected && setSelectedItem(data.id)} onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setIsHovered(false); document.body.style.cursor = 'auto'; }} castShadow>
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial ref={materialRef} color={data.color} emissive={data.color} />
        {data.hasMoon && <Moon planetSize={data.size} />}
      </mesh>
      <Html position={[0, data.size + 0.4, 0]} center style={{ pointerEvents: 'none', transition: 'opacity 0.2s', opacity: isAnyItemSelected ? 0 : 1 }}>
        <div className="text-white text-sm bg-black/30 px-2 py-1 rounded-full shadow-lg">
          {data.label}
        </div>
      </Html>
    </group>
  );
}

// --- Star Component (No changes) ---
function Star({ selectedItem, setSelectedItem, isKeyboardFocus }) {
  const meshRef = useRef<THREE.Mesh>();
  const materialRef = useRef<THREE.MeshStandardMaterial>();
  const isAnyItemSelected = selectedItem !== null;
  useFrame(({ clock }, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    meshRef.current.rotation.y += 0.001;
    const pulse = 1 + 0.04 * Math.sin(clock.getElapsedTime() * 2);
    const targetScale = (isKeyboardFocus && !isAnyItemSelected) ? 1.2 : pulse;
    const targetEmissive = (isKeyboardFocus && !isAnyItemSelected) ? 2.5 : 1.5;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, targetEmissive, delta * 5);
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0]} onClick={() => !isAnyItemSelected && setSelectedItem('star')} castShadow>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial ref={materialRef} color="#FFD700" emissive="#FFB347" toneMapped={false} />
    </mesh>
  );
}


// --- Footer Component (No changes) ---
function Footer() {
    return (
      <motion2d.footer initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 1.5 }} className="absolute bottom-0 left-0 w-full p-4 flex justify-center items-center space-x-6 z-20">
        <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a>
        <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
        <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zm0 1.62c-2.403 0-2.748.01-3.725.058-.94.044-1.522.2-2.02.39a3.272 3.272 0 00-1.16 1.16c-.19.498-.347 1.08-.39 2.02-.048.977-.058 1.322-.058 3.725s.01 2.748.058 3.725c.044.94.2 1.522.39 2.02a3.272 3.272 0 001.16 1.16c.498.19.08.347 2.02.39.977.048 1.322.058 3.725.058s2.748-.01 3.725-.058c.94-.044 1.522-.2 2.02-.39a3.272 3.272 0 001.16-1.16c.19-.498.347-1.08.39-2.02.048-.977.058-1.322.058-3.725s-.01-2.748-.058-3.725c-.044-.94-.2-1.522-.39-2.02a3.272 3.272 0 00-1.16-1.16c-.498-.19-1.08-.347-2.02-.39-.977-.048-1.322-.058-3.725-.058z" clipRule="evenodd" /><path d="M12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 1.62a3.515 3.515 0 110 7.03 3.515 3.515 0 010-7.03zM16.53 6.58a1.32 1.32 0 11-2.64 0 1.32 1.32 0 012.64 0z" /></svg></a>
      </motion2d.footer>
    );
}

// --- Main Page Component ---
const AboutUsPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState(-1);
  const selectedPlanetData = typeof selectedItem === 'number' ? planetsData.find(p => p.id === selectedItem) : null;

  useEffect(() => {
    // Ignore these informational warnings. They are not errors and don't affect the app.
    // The router is working as intended for our use case.
    const handleKeyDown = (e: KeyboardEvent) => {
        if (selectedItem !== null) {
            if (e.key === 'Escape') setSelectedItem(null); return;
        }
        if (e.key === 'ArrowRight') setKeyboardFocusIndex(prev => (prev + 1) % planetsData.length);
        else if (e.key === 'ArrowLeft') setKeyboardFocusIndex(prev => (prev - 1 + planetsData.length) % planetsData.length);
        else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') setKeyboardFocusIndex(-1);
        else if (e.key === 'Enter') {
            if (keyboardFocusIndex === -1) setSelectedItem('star');
            else setSelectedItem(planetsData[keyboardFocusIndex].id);
        } else if (e.key === 'Escape') setKeyboardFocusIndex(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardFocusIndex, selectedItem]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#0A0F29] to-[#FF8C42] relative text-white font-sans overflow-hidden">
      <Canvas shadows camera={{ position: [0, 0, 18], fov: 75 }} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 0, 0]} intensity={1.5} color="#FFD700" />
          <Stars radius={300} depth={50} count={5000} factor={5} saturation={0.6} fade speed={1} />
          <Sparkles count={40} scale={20} size={4} speed={0.3} noise={[1, 1, 1]} color="#FFD700" />
          
          {/* Distant Galaxies */}
          <Galaxy type="spiral" count={20000} size={25} position={[-50, 10, -80]} rotation={[0.3, 0.8, 0.1]} />
          <Galaxy type="dwarf" count={5000} size={5} position={[40, -15, -70]} rotation={[0, 1.2, 0]} />
          <Galaxy type="dwarf" count={3000} size={3} position={[20, 20, -60]} rotation={[0, 0, 0.5]} />
          
          <Star selectedItem={selectedItem} setSelectedItem={setSelectedItem} isKeyboardFocus={keyboardFocusIndex === -1} />

          {planetsData.map((planet, index) => (
            <Planet key={planet.id} data={planet} selectedItem={selectedItem} setSelectedItem={setSelectedItem} isKeyboardFocus={keyboardFocusIndex === index} />
          ))}
          
          <ControlsManager selectedItem={selectedItem} />
        </Suspense>
      </Canvas>

      {/* Central Info Card UI */}
      <AnimatePresence>
        {selectedPlanetData && (
          <motion2d.div key="planet-card" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', damping: 15, stiffness: 100 }} className="absolute inset-0 z-20 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
            <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full text-center relative shadow-2xl">
              <h2 className="text-3xl font-bold text-amber-300 mb-4">{selectedPlanetData.content.title}</h2>
              <p className="text-gray-300 text-lg leading-relaxed">{selectedPlanetData.content.description}</p>
              <button onClick={() => setSelectedItem(null)} className="mt-8 px-6 py-2 bg-amber-400 text-black rounded-full font-bold hover:bg-amber-300 transition-colors transform hover:scale-105">Return to Universe</button>
            </div>
          </motion2d.div>
        )}
        {selectedItem === 'star' && (
             <motion2d.div key="star-card" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', damping: 15, stiffness: 100 }} className="absolute inset-0 z-20 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
             <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full text-center relative shadow-2xl">
                <TypeAnimation sequence={['Edumall', 3000, 'Revolutionizing Procurement', 3000, 'Connecting Schools', 3000]} wrapper="h1" speed={20} className="text-6xl md:text-7xl font-bold text-center text-white [text-shadow:_0_4px_20px_#FFB347]" repeat={Infinity} />
                <p className="text-gray-300 text-lg leading-relaxed mt-6">Welcome to the center of our universe. We are dedicated to simplifying and improving the educational ecosystem.</p>
               <button onClick={() => setSelectedItem(null)} className="mt-8 px-6 py-2 bg-amber-400 text-black rounded-full font-bold hover:bg-amber-300 transition-colors transform hover:scale-105">Return to Universe</button>
             </div>
           </motion2d.div>
        )}
      </AnimatePresence>

      <Footer />
      
      <motion2d.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 1, type: 'spring', damping: 12 }} className="absolute bottom-6 left-6 z-30">
        <Link to="/" className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg hover:bg-white/40 transition-colors" aria-label="Back to Home">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </Link>
      </motion2d.div>
    </div>
  );
};

export default AboutUsPage;