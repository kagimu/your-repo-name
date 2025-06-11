import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Html } from "@react-three/drei";

// Helper component for orbiting motion
const Orbit = ({ radius, speed, children, offset = 0 }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    ref.current.position.x = radius * Math.cos(elapsed * speed + offset);
    ref.current.position.z = radius * Math.sin(elapsed * speed + offset);
  });
  return <group ref={ref}>{children}</group>;
};

// Planet component with clickable interaction and info display
const Planet = ({ color, size, orbitRadius, orbitSpeed, name, info, hasMoon }) => {
  const [expanded, setExpanded] = useState(false);
  const meshRef = useRef();

  // Rotate the planet on its own axis
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Orbit radius={orbitRadius} speed={orbitSpeed}>
      <mesh
        ref={meshRef}
        onClick={() => setExpanded((e) => !e)}
        scale={expanded ? 1.5 : 1}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
        style={{ cursor: "pointer" }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} emissive={expanded ? "#ffaa33" : color} emissiveIntensity={expanded ? 0.6 : 0} />
        {expanded && (
          <Html
            distanceFactor={10}
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              padding: "12px 18px",
              borderRadius: "8px",
              maxWidth: "200px",
              pointerEvents: "auto",
              userSelect: "none",
            }}
            position={[0, size + 0.5, 0]}
            center
            onPointerDown={(e) => e.stopPropagation()} // Prevent closing when clicking inside the box
          >
            <h3 style={{ margin: 0, marginBottom: "6px", color: "#ffb347" }}>{name}</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#222" }}>{info}</p>
            <button
              onClick={() => setExpanded(false)}
              style={{
                marginTop: "8px",
                padding: "6px 10px",
                borderRadius: "4px",
                border: "none",
                background: "#ffb347",
                color: "#222",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </Html>
        )}
      </mesh>
      {hasMoon && (
        <Orbit radius={size + 0.8} speed={-orbitSpeed * 4} offset={Math.PI / 2}>
          <mesh>
            <sphereGeometry args={[size / 3, 32, 32]} />
            <meshStandardMaterial color="#ccc" />
          </mesh>
        </Orbit>
      )}
    </Orbit>
  );
};

// Floating comet with tail
const Comet = ({ initialPosition, speed }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * speed) % 20;
    ref.current.position.set(initialPosition[0] - t * 2, initialPosition[1] + Math.sin(t) * 1, initialPosition[2]);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="#ff7f50" emissive="#ff6f40" emissiveIntensity={1} />
      {/* Tail */}
      <mesh position={[-0.4, 0, 0]}>
        <coneGeometry args={[0.1, 0.5, 8]} />
        <meshStandardMaterial color="#ff7f50" transparent opacity={0.7} />
      </mesh>
    </mesh>
  );
};

const SolarSystemExperience: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "radial-gradient(ellipse at center, #0a2342 0%, #1a1a2e 100%)",
      }}
    >
      <Canvas shadows camera={{ position: [0, 8, 18], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#ffb347" castShadow />
        <Stars radius={100} depth={50} count={4000} factor={4} saturation={0.6} fade speed={1} />
        {/* Central star */}
        <mesh>
          <sphereGeometry args={[1.7, 64, 64]} />
          <meshStandardMaterial color="#ffb347" emissive="#ffb347" emissiveIntensity={1.5} />
        </mesh>

        {/* Planets */}
        <Planet
          color="#6ec6ff"
          size={0.6}
          orbitRadius={5}
          orbitSpeed={0.5}
          name="Education Planet"
          info="Our hub of knowledge, offering courses and resources."
          hasMoon
        />
        <Planet
          color="#fcbf49"
          size={0.5}
          orbitRadius={7}
          orbitSpeed={0.35}
          name="Community Planet"
          info="Connecting learners and educators worldwide."
          hasMoon
        />
        <Planet
          color="#d62828"
          size={0.7}
          orbitRadius={9}
          orbitSpeed={0.25}
          name="Innovation Planet"
          info="Pioneering new learning technologies and methods."
        />

        {/* Floating Comets */}
        <Comet initialPosition={[15, 6, -10]} speed={1} />
        <Comet initialPosition={[-14, 4, -8]} speed={0.8} />

        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default SolarSystemExperience;
