'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { GovernmentLevel } from '@/types/controlRoom';

const FOCUS_Y: Record<GovernmentLevel, number> = { local: 1.2, state: 3.3, national: 5.6 };
const DEFAULT_Y = 2.9;
const ELEVATION = THREE.MathUtils.degToRad(21);
/** Half extents of the model that must stay in view. */
const HALF_W = 7.5;
const HALF_H = 5.9;

function fitDistance(cam: THREE.PerspectiveCamera, aspect: number) {
  const tanV = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  return Math.max(HALF_H / tanV, HALF_W / (tanV * aspect));
}

/**
 * Game mode: keeps the model framed for any panel size, sways gently and eases toward
 * whichever level was just activated. Explore mode: orbit controls with sensible limits.
 */
export function CameraController({ focus, interactive }: { focus: GovernmentLevel | null; interactive: boolean }) {
  const { camera, size } = useThree();
  const target = useRef(new THREE.Vector3(0, DEFAULT_Y, 0));
  const zoom = useRef(1);

  useEffect(() => {
    if (!interactive) return;
    const cam = camera as THREE.PerspectiveCamera;
    const d = fitDistance(cam, size.width / size.height);
    cam.position.set(0, DEFAULT_Y + Math.sin(ELEVATION) * d, Math.cos(ELEVATION) * d);
    cam.lookAt(0, DEFAULT_Y, 0);
  }, [interactive, camera, size.width, size.height]);

  useFrame((state, dt) => {
    if (interactive) return;
    const cam = camera as THREE.PerspectiveCamera;
    const k = 1 - Math.exp(-dt * 2.2);
    const wantY = focus ? FOCUS_Y[focus] : DEFAULT_Y;
    const wantZoom = focus ? 0.9 : 1;
    target.current.y += (wantY - target.current.y) * k;
    zoom.current += (wantZoom - zoom.current) * k;
    const d = fitDistance(cam, size.width / size.height) * zoom.current;
    const sway = Math.sin(state.clock.elapsedTime * 0.12) * 0.16;
    cam.position.set(
      Math.sin(sway) * Math.cos(ELEVATION) * d,
      target.current.y + Math.sin(ELEVATION) * d,
      Math.cos(sway) * Math.cos(ELEVATION) * d
    );
    cam.lookAt(target.current);
  });

  if (!interactive) return null;
  return (
    <OrbitControls
      makeDefault
      target={[0, DEFAULT_Y, 0]}
      enablePan={false}
      minDistance={9}
      maxDistance={30}
      minPolarAngle={THREE.MathUtils.degToRad(35)}
      maxPolarAngle={THREE.MathUtils.degToRad(82)}
      enableDamping
      dampingFactor={0.08}
    />
  );
}
