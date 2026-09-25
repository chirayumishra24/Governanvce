'use client';

import * as THREE from 'three';
import { Instance, Instances } from '@react-three/drei';
import type { GovernmentLevel } from '@/types/controlRoom';
import { useSignalMaterial, type RoomRef } from './ActivationEffect';
import { CommunityHall } from './GovernmentBuilding';
import { GovernmentTier, type TierLabelState } from './GovernmentTier';
import { GEO, MAT } from './materials';
import { Box, Cyl, Placed, polar, Trees } from './primitives';

export const LOCAL_TIER = { top: 0, bottom: -0.7, radius: 6.0 };

const WALLS = ['#F6D7B0', '#E9E3D5', '#CFE3F1', '#F3E1A7', '#E7C9C1', '#D8E8C8', '#F2C6A0'];
const ROOFS = ['#B9583E', '#C8664B', '#8F5B45', '#4F7CAC'];

const HOUSES = [
  ...[-52, -72, -92, -114, -137, -160, 180, 160, 137, 114, 92, 72, 52].map((deg) => ({ r: 4.6, deg })),
  ...[-32, -48, -66, -86, -106, -128, -152, 152, 128, 106, 86, 68].map((deg) => ({ r: 5.64, deg })),
].map((h, i) => ({ ...h, s: 0.9 + ((i * 37) % 5) * 0.06, wall: WALLS[i % WALLS.length], roof: ROOFS[(i * 3) % ROOFS.length] }));

const LAMPS = [-150, -125, -100, -75, -50, -25, 25, 50, 75, 100, 125, 150];

export function LocalCommunity({
  roomRef,
  label,
  showCards,
  onSelect,
}: {
  roomRef: RoomRef;
  label: TierLabelState;
  showCards: boolean;
  onSelect?: (l: GovernmentLevel) => void;
}) {
  const { top } = LOCAL_TIER;
  // Neighbourhood lights: house windows and streetlamps glow when local government is activated.
  const windowMat = useSignalMaterial(
    roomRef,
    'local',
    { color: '#FFF3D1', emissive: '#FFC766', roughness: 0.5 },
    { base: 0.1, active: 2.0 }
  );
  const lampMat = useSignalMaterial(
    roomRef,
    'local',
    { color: '#FFF7E0', emissive: '#FFD27A', roughness: 0.3 },
    { base: 0.2, active: 3.0 }
  );

  const trees = [
    ...[-10, 10, -40, 40, -80, 80, -120, 120, -145, 145, 170, -170].map((deg, i) => ({
      p: polar(5.88, deg + 4, top),
      s: 0.75 + (i % 3) * 0.12,
    })),
    ...[-62, 62, -100, 100, -150, 150].map((deg) => ({ p: polar(4.3, deg, top), s: 0.8 })),
    { p: polar(4.45, -22, top), s: 0.85 },
    { p: polar(4.85, -36, top), s: 0.7 },
  ];

  return (
    <GovernmentTier
      level="local"
      roomRef={roomRef}
      {...LOCAL_TIER}
      bottomRadius={6.15}
      wall="#EDE7DD"
      windowColor="#B9CFE8"
      windowCols={48}
      windowRows={1}
      surface={MAT.grass}
      label={label}
      showCards={showCards}
      card={{ position: [3.7, top - 0.1, 4.9], side: 'right' }}
      onSelect={onSelect}
    >
      {/* Local road */}
      <mesh position={[0, top + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={MAT.road} receiveShadow>
        <ringGeometry args={[5.02, 5.3, 96]} />
      </mesh>
      <mesh position={[0, top + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} material={MAT.plaza} receiveShadow>
        <ringGeometry args={[4.08, 4.2, 96]} />
      </mesh>

      {/* Houses (instanced) */}
      <Instances geometry={GEO.box} material={MAT.white} limit={HOUSES.length} castShadow receiveShadow>
        {HOUSES.map((h, i) => (
          <Instance
            key={i}
            position={polar(h.r, h.deg, top + 0.16 * h.s)}
            rotation={[0, THREE.MathUtils.degToRad(h.deg), 0]}
            scale={[0.4 * h.s, 0.32 * h.s, 0.36 * h.s]}
            color={h.wall}
          />
        ))}
      </Instances>
      <Instances geometry={GEO.cone4} material={MAT.white} limit={HOUSES.length} castShadow>
        {HOUSES.map((h, i) => (
          <Instance
            key={i}
            position={polar(h.r, h.deg, top + 0.32 * h.s + 0.09 * h.s)}
            rotation={[0, THREE.MathUtils.degToRad(h.deg) + Math.PI / 4, 0]}
            scale={[0.4 * h.s, 0.18 * h.s, 0.4 * h.s]}
            color={h.roof}
          />
        ))}
      </Instances>
      <Instances geometry={GEO.box} material={windowMat} limit={HOUSES.length}>
        {HOUSES.map((h, i) => (
          <Instance
            key={i}
            position={polar(h.r + 0.182 * h.s, h.deg, top + 0.17 * h.s)}
            rotation={[0, THREE.MathUtils.degToRad(h.deg), 0]}
            scale={[0.14 * h.s, 0.11 * h.s, 0.01]}
          />
        ))}
      </Instances>

      {/* Streetlights */}
      <Instances geometry={GEO.cylLow} material={MAT.darkMetal} limit={LAMPS.length}>
        {LAMPS.map((deg) => (
          <Instance key={deg} position={polar(5.4, deg, top + 0.24)} scale={[0.014, 0.48, 0.014]} />
        ))}
      </Instances>
      <Instances geometry={GEO.sphere} material={lampMat} limit={LAMPS.length}>
        {LAMPS.map((deg) => (
          <Instance key={deg} position={polar(5.4, deg, top + 0.5)} scale={0.045} />
        ))}
      </Instances>

      {/* Local government office */}
      <Placed radius={4.62} deg={0} y={top}>
        <CommunityHall windowMat={windowMat} />
      </Placed>

      {/* Park with fountain and benches */}
      <Placed radius={4.62} deg={-26} y={top}>
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} material={MAT.grassDark} receiveShadow>
          <circleGeometry args={[0.46, 32]} />
        </mesh>
        <Cyl p={[0, 0.05, 0]} radius={0.16} h={0.08} m={MAT.stoneDark} />
        <mesh position={[0, 0.095, 0]} rotation={[-Math.PI / 2, 0, 0]} material={MAT.water}>
          <circleGeometry args={[0.13, 24]} />
        </mesh>
        <Cyl p={[0, 0.16, 0]} radius={0.025} h={0.14} m={MAT.stoneDark} />
        <Box p={[-0.3, 0.05, 0.22]} s={[0.2, 0.04, 0.07]} m={MAT.trunk} />
        <Box p={[0.3, 0.05, 0.22]} s={[0.2, 0.04, 0.07]} m={MAT.trunk} />
      </Placed>

      {/* Water tank */}
      <Placed radius={4.62} deg={26} y={top}>
        {[
          [-0.14, -0.14],
          [0.14, -0.14],
          [-0.14, 0.14],
          [0.14, 0.14],
        ].map(([x, z]) => (
          <Cyl key={`${x}${z}`} p={[x, 0.3, z]} radius={0.022} h={0.6} m={MAT.metal} low />
        ))}
        <Cyl p={[0, 0.74, 0]} radius={0.24} h={0.3} m={MAT.white} />
        <Cyl p={[0, 0.74, 0]} radius={0.245} h={0.07} m={MAT.blueRoof} />
        <mesh geometry={GEO.hemi} material={MAT.white} position={[0, 0.89, 0]} scale={[0.24, 0.08, 0.24]} />
      </Placed>

      {/* Waste collection point */}
      <Placed radius={5.64} deg={44} y={top}>
        <Cyl p={[-0.2, 0.08, 0]} radius={0.065} h={0.16} m={MAT.green} low />
        <Cyl p={[-0.04, 0.08, 0]} radius={0.065} h={0.16} m={MAT.blueRoof} low />
        <Box p={[0.26, 0.13, 0]} s={[0.3, 0.2, 0.2]} m={MAT.green} />
        <Box p={[0.08, 0.1, 0]} s={[0.1, 0.16, 0.19]} m={MAT.white} />
      </Placed>

      <Trees items={trees} />
    </GovernmentTier>
  );
}
