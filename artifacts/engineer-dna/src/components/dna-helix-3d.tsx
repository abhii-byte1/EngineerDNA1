import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotionPreference, usePageVisibility } from '@/lib/animations';

function HelixMesh({ isAnimated }: { isAnimated: boolean }) {
  const groupRef = React.useRef<THREE.Group>(null);

  // Generate double helix geometry coordinates
  const { strand1, strand2, rungs } = React.useMemo(() => {
    const pointsCount = 28;
    const radius = 1.3;
    const height = 6.0;

    const s1: THREE.Vector3[] = [];
    const s2: THREE.Vector3[] = [];
    const r: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];

    for (let i = 0; i < pointsCount; i++) {
      const t = i / (pointsCount - 1);
      const angle = t * Math.PI * 3.5;
      const y = (t - 0.5) * height;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      const p1 = new THREE.Vector3(x1, y, z1);
      const p2 = new THREE.Vector3(x2, y, z2);

      s1.push(p1);
      s2.push(p2);

      if (i % 2 === 0) {
        r.push({ start: p1, end: p2 });
      }
    }

    return { strand1: s1, strand2: s2, rungs: r };
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current && isAnimated) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Strand 1 Spheres (Emerald) */}
      {strand1.map((p, idx) => (
        <mesh key={`s1-${idx}`} position={p}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Strand 2 Spheres (Cyan/Primary) */}
      {strand2.map((p, idx) => (
        <mesh key={`s2-${idx}`} position={p}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#0891b2"
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Rungs Connecting Strands */}
      {rungs.map((rung, idx) => {
        const mid = new THREE.Vector3().addVectors(rung.start, rung.end).multiplyScalar(0.5);
        const distance = rung.start.distanceTo(rung.end);
        const direction = new THREE.Vector3().subVectors(rung.end, rung.start).normalize();
        const orientation = new THREE.Matrix4();
        orientation.lookAt(rung.start, rung.end, new THREE.Vector3(0, 1, 0));

        return (
          <mesh key={`rung-${idx}`} position={mid} matrixAutoUpdate={true}>
            <cylinderGeometry args={[0.025, 0.025, distance, 6]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#1d4ed8"
              emissiveIntensity={0.3}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function DnaHelix3D() {
  const prefersReduced = useReducedMotionPreference();
  const isVisible = usePageVisibility();
  const shouldAnimate = !prefersReduced && isVisible;

  return (
    <div className="w-full h-full min-h-[320px] relative pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#10b981" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#06b6d4" />
        <HelixMesh isAnimated={shouldAnimate} />
      </Canvas>
    </div>
  );
}
