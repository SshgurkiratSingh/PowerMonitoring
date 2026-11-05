"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

function FloatingOrbs() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  const orbs = [
    { position: [5, 3, -5], color: "#06b6d4", size: 0.5 },
    { position: [-4, -2, -3], color: "#8b5cf6", size: 0.4 },
    { position: [3, -4, -6], color: "#f59e0b", size: 0.3 },
    { position: [-6, 2, -4], color: "#10b981", size: 0.45 },
  ];

  return (
    <group ref={group}>
      {orbs.map((orb, i) => (
        <Sphere
          key={i}
          args={[orb.size, 32, 32]}
          position={orb.position as [number, number, number]}
        >
          <meshStandardMaterial
            color={orb.color}
            emissive={orb.color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </Sphere>
      ))}
    </group>
  );
}

function Stars() {
  const ref = useRef<THREE.Points>(null);

  const particlesCount = 2000;
  const positions = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.02;
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#60a5fa"
        size={0.1}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function EnhancedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#8b5cf6"
        />
        <Stars />
        <FloatingOrbs />
      </Canvas>
    </div>
  );
}
