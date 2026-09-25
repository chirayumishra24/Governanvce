'use client';

import * as THREE from 'three';
import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { GovernmentLevel } from '@/types/controlRoom';
import { LEVEL_INFO, TEAM_THEME } from '@/lib/governance';
import { activationStrength, hintStrength, residualGlow, type RoomState } from '@/lib/roomState';

export type RoomRef = MutableRefObject<RoomState>;

export interface LevelSignal {
  /** 0..1 fresh activation (or 1 during the finale). */
  active: number;
  /** Faint glow left behind by earlier activations. */
  residual: number;
  /** 0..1 pulsing hint glow. */
  hint: number;
  color: THREE.Color;
}

const HINT_COLOR = new THREE.Color('#FFC53D');
const SYSTEM_COLOR = new THREE.Color('#FFD27A');
const WHITE = new THREE.Color('#ffffff');

export function readLevelSignal(room: RoomState, level: GovernmentLevel, now: number, out: LevelSignal) {
  const a = room.levels[level];
  const core = activationStrength(room.core, now) * 0.6;
  out.active = room.system ? 1 : Math.max(activationStrength(a, now), core);
  out.residual = residualGlow(a);
  out.hint = hintStrength(room.hints, now, (h) => h.level === level);
  if (room.system) out.color.copy(SYSTEM_COLOR);
  else if (out.active > 0 && a && now - a.at < 6000 && a.team) out.color.set(TEAM_THEME[a.team].accent);
  else if (out.active > 0 && room.core?.team) out.color.set(TEAM_THEME[room.core.team].accent);
  else if (out.hint > 0) out.color.copy(HINT_COLOR);
  else out.color.set(LEVEL_INFO[level].color);
}

/** Per-frame signal for one government level, read without re-rendering React. */
export function useLevelSignal(roomRef: RoomRef, level: GovernmentLevel) {
  const signal = useRef<LevelSignal>({ active: 0, residual: 0, hint: 0, color: new THREE.Color() });
  useFrame(() => readLevelSignal(roomRef.current, level, Date.now(), signal.current), -1);
  return signal;
}

/** Glowing rim around the top edge of a tier. */
export function GlowRing({
  roomRef,
  level,
  radius,
  y,
}: {
  roomRef: RoomRef;
  level: GovernmentLevel;
  radius: number;
  y: number;
}) {
  const signal = useLevelSignal(roomRef, level);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, emissive: new THREE.Color('#ffffff') }),
    []
  );
  useFrame(() => {
    const s = signal.current;
    mat.emissive.copy(s.color);
    mat.color.copy(s.color).lerp(WHITE, 0.35);
    mat.emissiveIntensity = 0.35 + s.residual * 1.5 + s.active * 2.4 + s.hint * 1.8;
  });
  return (
    <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat}>
      <torusGeometry args={[radius, 0.07, 10, 96]} />
    </mesh>
  );
}

/** A soft column of light rising from a tier when it is activated, plus an expanding pulse ring. */
export function LightBeam({
  roomRef,
  level,
  radius,
  y,
  height,
}: {
  roomRef: RoomRef;
  level: GovernmentLevel;
  radius: number;
  y: number;
  height: number;
}) {
  const signal = useLevelSignal(roomRef, level);
  const beam = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const beamMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );
  useFrame((state) => {
    const s = signal.current;
    const strength = Math.max(s.active, s.hint * 0.5);
    beamMat.color.copy(s.color);
    ringMat.color.copy(s.color);
    beamMat.opacity = strength * 0.16;
    if (beam.current) beam.current.visible = strength > 0.01;
    if (ring.current) {
      const phase = (state.clock.elapsedTime * 0.8) % 1;
      ring.current.visible = strength > 0.01;
      ring.current.scale.setScalar(radius * (0.6 + phase * 0.55));
      ringMat.opacity = strength * (1 - phase) * 0.55;
    }
  });
  return (
    <group position={[0, y, 0]}>
      <mesh ref={beam} position={[0, height / 2, 0]} material={beamMat} visible={false}>
        <cylinderGeometry args={[radius * 0.92, radius * 1.02, height, 48, 1, true]} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} material={ringMat} visible={false}>
        <ringGeometry args={[0.96, 1, 64]} />
      </mesh>
    </group>
  );
}

/** Material whose emissive intensity follows a level's activation (windows, lamps, screens). */
export function useSignalMaterial(
  roomRef: RoomRef,
  level: GovernmentLevel,
  params: THREE.MeshStandardMaterialParameters,
  opts: { base: number; active: number; tint?: boolean }
) {
  const signal = useLevelSignal(roomRef, level);
  const mat = useMemo(() => new THREE.MeshStandardMaterial(params), []); // eslint-disable-line react-hooks/exhaustive-deps
  const baseEmissive = useMemo(() => (params.emissive ? new THREE.Color(params.emissive) : new THREE.Color('#ffffff')), []); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(() => {
    const s = signal.current;
    const k = Math.max(s.active, s.residual * 0.8, s.hint * 0.6);
    mat.emissiveIntensity = opts.base + k * opts.active;
    if (opts.tint) mat.emissive.copy(baseEmissive).lerp(s.color, Math.min(1, s.active));
  });
  return mat;
}
