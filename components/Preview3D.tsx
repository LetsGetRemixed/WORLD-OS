"use client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useStudioStore } from '@/state/useStudioStore';

export function Preview3D({ focusNodeId }: { focusNodeId?: string }) {
  const store = useStudioStore();
  const nodes = store.nodes;
  const selected = focusNodeId ?? store.selectedNodeId;

  const positions = useMemo(() => layoutNodesSpiral(nodes.map((n) => n.id)), [nodes]);

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      {/* @ts-expect-error three-fiber primitive color is not in typings */}
      <primitive object={new THREE.Color(0x05070a)} attach="background" />
      {/* @ts-expect-error r3f intrinsic typing fallback */}
      <ambientLight intensity={0.6} />
      {/* @ts-expect-error r3f intrinsic typing fallback */}
      <pointLight position={[5, 5, 5]} intensity={1} />
      {nodes.map((n, i) => (
        <Star
          key={n.id}
          position={positions[i]}
          title={n.title}
          active={n.id === selected}
          onClick={() => store.selectNode(n.id)}
        />
      ))}
      <OrbitControls enableDamping makeDefault />
    </Canvas>
  );
}

function Star({ position, title, active, onClick }: { position: [number, number, number]; title: string; active?: boolean; onClick: () => void }) {
  const mesh = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.15, 24, 24);
    const c = new THREE.Color(active ? '#f72585' : '#4cc9f0');
    const material = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.3 });
    const m = new THREE.Mesh(geometry, material);
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  const labelPos: [number, number, number] = [position[0], position[1] + 0.35, position[2]];
  return (
    <>
      {/* @ts-expect-error r3f intrinsic typing fallback */}
      <primitive object={mesh} position={position as any} onClick={onClick as any} />
      <Html distanceFactor={10} position={labelPos} center>
        <div className="text-xs px-2 py-1 rounded bg-black/70 border border-white/10">{title}</div>
      </Html>
    </>
  );
}

function layoutNodesSpiral(ids: string[]): [number, number, number][] {
  const positions: [number, number, number][] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const radius = 4;
  ids.forEach((id, i) => {
    const t = i + 1;
    const angle = t * goldenAngle;
    const r = radius * Math.sqrt(t / ids.length);
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    const z = (i % 5) * 0.15; // slight depth layering
    positions.push([x, y, z]);
  });
  return positions;
}

export default Preview3D;


