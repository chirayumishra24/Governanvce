'use client';

import * as THREE from 'three';
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import { activationStrength, type RoomState } from '@/lib/roomState';
import type { RoomRef } from './ActivationEffect';
import { GEO, MAT } from './materials';
import { polar } from './primitives';

/** Procedural "dashboard" texture for the control-room screens. */
function useScreenTexture(seed: number) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 160;
    const g = c.getContext('2d')!;
    const grad = g.createLinearGradient(0, 0, 0, 160);
    grad.addColorStop(0, '#1B3B6F');
    grad.addColorStop(1, '#0F2A52');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 160);
    let s = seed;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    g.fillStyle = 'rgba(125,211,252,0.85)';
    for (let i = 0; i < 9; i++) {
      const h = 20 + rnd() * 70;
      g.fillRect(18 + i * 13, 140 - h, 8, h);
    }
    g.strokeStyle = 'rgba(253,186,116,0.9)';
    g.lineWidth = 3;
    g.beginPath();
    for (let x = 0; x <= 100; x += 10) g.lineTo(140 + x, 110 - rnd() * 60);
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.75)';
    for (let i = 0; i < 4; i++) g.fillRect(140, 20 + i * 9, 40 + rnd() * 60, 4);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [seed]);
}

function anyRecent(room: RoomState, now: number) {
  let s = room.system ? 1 : activationStrength(room.core, now);
  for (const a of Object.values(room.levels)) s = Math.max(s, activationStrength(a, now));
  for (const a of Object.values(room.organs)) s = Math.max(s, activationStrength(a, now));
  return s;
}

/** Floor, operator desks and wall screens that frame the three tiers as a control room. */
export function CityEnvironment({ roomRef }: { roomRef: RoomRef }) {
  const texA = useScreenTexture(7);
  const texB = useScreenTexture(21);
  const screenMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: texA, emissiveMap: texA, emissive: '#ffffff', emissiveIntensity: 0.7 }),
    [texA]
  );
  const bigScreenMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: texB, emissiveMap: texB, emissive: '#ffffff', emissiveIntensity: 0.8 }),
    [texB]
  );
  useFrame(() => {
    const k = anyRecent(roomRef.current, Date.now());
    screenMat.emissiveIntensity = 0.7 + k * 0.6;
    bigScreenMat.emissiveIntensity = 0.8 + k * 0.5;
  });

  // Operator desks around the back half of the room, facing the centre.
  const desks = [110, 132, 156, 180, 204, 228, 250].map((deg) => ({ deg, face: THREE.MathUtils.degToRad(deg) + Math.PI }));

  return (
    <group>
      <mesh position={[0, -0.72, 0]} rotation={[-Math.PI / 2, 0, 0]} material={MAT.floor} receiveShadow>
        <circleGeometry args={[14, 64]} />
      </mesh>
      <mesh position={[0, -0.71, 0]} rotation={[-Math.PI / 2, 0, 0]} material={MAT.stoneDark}>
        <ringGeometry args={[6.9, 7.0, 96]} />
      </mesh>

      <Instances geometry={GEO.box} material={MAT.desk} limit={desks.length} castShadow receiveShadow>
        {desks.map((d) => (
          <Instance key={d.deg} position={polar(7.3, d.deg, -0.4)} rotation={[0, d.face, 0]} scale={[1.1, 0.6, 0.5]} />
        ))}
      </Instances>
      <Instances geometry={GEO.box} material={screenMat} limit={desks.length}>
        {desks.map((d) => (
          <Instance key={d.deg} position={polar(7.55, d.deg, 0.25)} rotation={[0, d.face, 0]} scale={[0.9, 0.5, 0.03]} />
        ))}
      </Instances>

      {/* Large wall screens on either side */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 8.4, 4.6, -7.2]} rotation={[0, -side * 0.55, 0]}>
          <mesh geometry={GEO.box} material={MAT.darkMetal} scale={[3.3, 2.2, 0.1]} />
          <mesh position={[0, 0, 0.06]} material={bigScreenMat}>
            <planeGeometry args={[3.1, 2.0]} />
          </mesh>
          <mesh geometry={GEO.box} material={MAT.metal} position={[0, -3.45, 0]} scale={[0.14, 4.7, 0.14]} />
        </group>
      ))}
    </group>
  );
}
