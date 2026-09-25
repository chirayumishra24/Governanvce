'use client';

import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cyl, Dome } from './primitives';
import { GEO, MAT } from './materials';

type V3 = [number, number, number];

/**
 * Stylised national-level building: plinth, colonnade, central dome and corner chhatris.
 * India-inspired, but deliberately not a copy of any real government building.
 */
export function NationalBuilding({ windowMat, domeMat }: { windowMat: THREE.Material; domeMat: THREE.Material }) {
  const columns = Array.from({ length: 8 }, (_, i) => -0.84 + i * 0.24);
  const chhatris: V3[] = [
    [-0.82, 1.09, -0.45],
    [0.82, 1.09, -0.45],
    [-0.82, 1.09, 0.3],
    [0.82, 1.09, 0.3],
  ];
  return (
    <group>
      <Box p={[0, 0.08, 0.05]} s={[2.6, 0.16, 1.75]} m={MAT.plinth} />
      <Box p={[0, 0.2, 0.05]} s={[2.3, 0.1, 1.5]} m={MAT.stoneDark} />
      <Box p={[0, 0.62, -0.05]} s={[2.0, 0.8, 1.05]} m={MAT.sandstone} />
      {/* Glowing windows along the side wings */}
      {[-0.72, -0.48, 0.48, 0.72].map((x) => (
        <Box key={x} p={[x, 0.66, 0.478]} s={[0.12, 0.3, 0.01]} m={windowMat} shadow={false} />
      ))}
      <Box p={[0, 0.6, 0.478]} s={[0.7, 0.42, 0.01]} m={windowMat} shadow={false} />
      <Box p={[0, 1.05, -0.05]} s={[2.1, 0.08, 1.15]} m={MAT.marble} />
      {/* Colonnade */}
      {columns.map((x) => (
        <Cyl key={x} p={[x, 0.62, 0.62]} radius={0.045} h={0.74} m={MAT.marble} />
      ))}
      <Box p={[0, 1.02, 0.6]} s={[1.95, 0.1, 0.26]} m={MAT.marble} />
      <Box p={[0, 1.11, 0.6]} s={[0.7, 0.08, 0.2]} m={MAT.sandstoneDark} />
      <Box p={[0, 0.3, 0.86]} s={[1.0, 0.08, 0.2]} m={MAT.stoneDark} />
      {/* Central dome */}
      <Cyl p={[0, 1.25, -0.05]} radius={0.44} h={0.32} m={MAT.marble} />
      <Cyl p={[0, 1.42, -0.05]} radius={0.47} h={0.04} m={MAT.sandstoneDark} />
      <Dome p={[0, 1.43, -0.05]} radius={0.43} m={domeMat} />
      <Cyl p={[0, 1.92, -0.05]} radius={0.025} h={0.14} m={MAT.sandstoneDark} />
      <mesh geometry={GEO.sphere} material={MAT.sandstoneDark} position={[0, 2.0, -0.05]} scale={0.045} />
      {/* Chhatris */}
      {chhatris.map((p, i) => (
        <group key={i} position={p}>
          <Cyl p={[0, 0.07, 0]} radius={0.1} h={0.14} m={MAT.marble} />
          <Dome p={[0, 0.14, 0]} radius={0.11} m={MAT.sandstone} />
        </group>
      ))}
    </group>
  );
}

/** A neutral tricolour on a pole, waving gently. */
export function FlagPole({ p, height = 1.1 }: { p: V3; height?: number }) {
  const flag = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (flag.current) flag.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.12;
  });
  return (
    <group position={p}>
      <Cyl p={[0, height / 2, 0]} radius={0.018} h={height} m={MAT.metal} />
      <group ref={flag} position={[0, height - 0.12, 0]}>
        <Box p={[0.19, 0.07, 0]} s={[0.36, 0.07, 0.012]} m={MAT.saffron} shadow={false} />
        <Box p={[0.19, 0, 0]} s={[0.36, 0.07, 0.012]} m={MAT.white} shadow={false} />
        <Box p={[0.19, -0.07, 0]} s={[0.36, 0.07, 0.012]} m={MAT.green} shadow={false} />
        <mesh position={[0.19, 0, 0.008]} material={MAT.navy}>
          <torusGeometry args={[0.022, 0.005, 6, 20]} />
        </mesh>
      </group>
    </group>
  );
}

/** State headquarters: long sandstone block, central tower and arcaded windows. */
export function StateBuilding({ windowMat }: { windowMat: THREE.Material }) {
  const arches = [-0.66, -0.44, -0.22, 0.22, 0.44, 0.66];
  return (
    <group>
      <Box p={[0, 0.05, 0]} s={[1.95, 0.1, 0.82]} m={MAT.plinth} />
      <Box p={[0, 0.38, 0]} s={[1.75, 0.56, 0.62]} m={MAT.terracotta} />
      <Box p={[0, 0.69, 0]} s={[1.82, 0.06, 0.68]} m={MAT.sandstone} />
      {arches.map((x) => (
        <Box key={x} p={[x, 0.36, 0.312]} s={[0.13, 0.28, 0.01]} m={windowMat} shadow={false} />
      ))}
      <Box p={[0, 0.62, 0.06]} s={[0.52, 0.5, 0.54]} m={MAT.sandstone} />
      <Box p={[0, 0.34, 0.34]} s={[0.26, 0.4, 0.02]} m={windowMat} shadow={false} />
      <Box p={[0, 0.9, 0.06]} s={[0.56, 0.06, 0.58]} m={MAT.sandstoneDark} />
      <Dome p={[0, 0.93, 0.06]} radius={0.22} m={MAT.roofRed} />
      {[-0.72, 0.72].map((x) => (
        <group key={x} position={[x, 0.72, 0]}>
          <Cyl p={[0, 0.05, 0]} radius={0.1} h={0.1} m={MAT.sandstone} />
          <Dome p={[0, 0.1, 0]} radius={0.11} m={MAT.roofRed} />
        </group>
      ))}
    </group>
  );
}

export function SchoolBuilding({ windowMat }: { windowMat: THREE.Material }) {
  return (
    <group>
      <Box p={[0, 0.19, 0]} s={[0.78, 0.38, 0.44]} m={MAT.schoolYellow} />
      <Box p={[0, 0.4, 0]} s={[0.84, 0.05, 0.5]} m={MAT.roofRed} />
      {[-0.26, -0.1, 0.1, 0.26].map((x) => (
        <Box key={x} p={[x, 0.22, 0.222]} s={[0.1, 0.12, 0.01]} m={windowMat} shadow={false} />
      ))}
      <Box p={[0, 0.5, 0]} s={[0.14, 0.16, 0.14]} m={MAT.schoolYellow} />
      <Cyl p={[0.34, 0.1, 0.4]} radius={0.01} h={0.2} m={MAT.metal} />
    </group>
  );
}

export function HospitalBuilding({ windowMat, signMat }: { windowMat: THREE.Material; signMat: THREE.Material }) {
  return (
    <group>
      <Box p={[0, 0.27, 0]} s={[0.72, 0.54, 0.46]} m={MAT.hospital} />
      <Box p={[0, 0.56, 0]} s={[0.76, 0.04, 0.5]} m={MAT.stoneDark} />
      {[-0.22, 0.22].map((x) =>
        [0.16, 0.36].map((y) => (
          <Box key={`${x}${y}`} p={[x, y, 0.232]} s={[0.14, 0.1, 0.01]} m={windowMat} shadow={false} />
        ))
      )}
      {/* Green plus sign */}
      <Box p={[0, 0.38, 0.236]} s={[0.14, 0.045, 0.01]} m={signMat} shadow={false} />
      <Box p={[0, 0.38, 0.236]} s={[0.045, 0.14, 0.01]} m={signMat} shadow={false} />
    </group>
  );
}

/** Law and order post: white building with a blue band. */
export function SafetyPost({ windowMat }: { windowMat: THREE.Material }) {
  return (
    <group>
      <Box p={[0, 0.17, 0]} s={[0.56, 0.34, 0.4]} m={MAT.hospital} />
      <Box p={[0, 0.25, 0]} s={[0.57, 0.06, 0.41]} m={MAT.blueRoof} />
      <Box p={[0, 0.36, 0]} s={[0.6, 0.04, 0.44]} m={MAT.darkMetal} />
      <Box p={[0, 0.1, 0.202]} s={[0.12, 0.18, 0.01]} m={windowMat} shadow={false} />
    </group>
  );
}

/** Local government office / community hall with a pillared veranda and sloped roof. */
export function CommunityHall({ windowMat }: { windowMat: THREE.Material }) {
  return (
    <group>
      <Box p={[0, 0.05, 0.05]} s={[1.15, 0.1, 0.75]} m={MAT.plinth} />
      <Box p={[0, 0.3, -0.05]} s={[1.0, 0.42, 0.5]} m={MAT.marble} />
      {[-0.3, -0.1, 0.1, 0.3].map((x) => (
        <Box key={x} p={[x, 0.3, 0.205]} s={[0.1, 0.16, 0.01]} m={windowMat} shadow={false} />
      ))}
      {[-0.44, -0.15, 0.15, 0.44].map((x) => (
        <Cyl key={x} p={[x, 0.27, 0.33]} radius={0.025} h={0.36} m={MAT.white} />
      ))}
      <Box p={[0, 0.47, 0.32]} s={[1.02, 0.04, 0.16]} m={MAT.roofRed} />
      <Box p={[0, 0.6, -0.17]} s={[1.08, 0.04, 0.42]} r={[0.42, 0, 0]} m={MAT.roofRed} />
      <Box p={[0, 0.6, 0.07]} s={[1.08, 0.04, 0.42]} r={[-0.42, 0, 0]} m={MAT.roofRed} />
    </group>
  );
}
