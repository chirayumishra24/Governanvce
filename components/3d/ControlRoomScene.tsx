'use client';

import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import type { GovernmentLevel } from '@/types/controlRoom';
import { LEVELS } from '@/types/controlRoom';
import { HINT_MS, isRecent, type RoomState } from '@/lib/roomState';
import type { TierLabelState } from './GovernmentTier';
import { CameraController } from './CameraController';
import { CityEnvironment } from './CityEnvironment';
import { LocalCommunity } from './LocalCommunity';
import { NationalPlatform } from './NationalPlatform';
import { StatePlatform } from './StatePlatform';

export interface ControlRoomSceneProps {
  room: RoomState;
  /** Re-render clock from the parent so labels update as activations expire. */
  now: number;
  interactive?: boolean;
  showCards?: boolean;
  selectedLevel?: GovernmentLevel | null;
  onSelectLevel?: (level: GovernmentLevel) => void;
}

function labelState(room: RoomState, level: GovernmentLevel, now: number, selected: boolean): TierLabelState {
  const a = room.levels[level];
  const direct = isRecent(a, now);
  const core = isRecent(room.core, now);
  return {
    active: direct || core,
    team: direct ? a?.team : room.core?.team,
    hint: room.hints.some((h) => h.level === level && now - h.at < HINT_MS),
    system: room.system,
    selected,
  };
}

function focusLevel(room: RoomState, now: number): GovernmentLevel | null {
  let best: GovernmentLevel | null = null;
  let bestAt = 0;
  for (const l of LEVELS) {
    const a = room.levels[l];
    if (a && now - a.at < 3200 && a.at > bestAt) {
      best = l;
      bestAt = a.at;
    }
  }
  return best;
}

export default function ControlRoomScene({
  room,
  now,
  interactive = false,
  showCards = true,
  selectedLevel = null,
  onSelectLevel,
}: ControlRoomSceneProps) {
  const roomRef = useRef(room);
  roomRef.current = room;
  const [dpr, setDpr] = useState(1.5);
  const focus = interactive ? null : room.system ? null : focusLevel(room, now);
  const common = { roomRef, showCards, onSelect: onSelectLevel };

  return (
    <Canvas
      shadows
      dpr={[1, dpr]}
      camera={{ fov: 34, near: 0.5, far: 120, position: [0, 9, 17] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      onPointerMissed={() => (document.body.style.cursor = '')}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <hemisphereLight args={['#ffffff', '#C9D4E2', 1.15]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[7, 14, 9]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-8, 6, -4]} intensity={0.35} color="#DDE8FF" />

      <CameraController focus={focus} interactive={interactive} />
      <CityEnvironment roomRef={roomRef} />
      <LocalCommunity {...common} label={labelState(room, 'local', now, selectedLevel === 'local')} />
      <StatePlatform {...common} label={labelState(room, 'state', now, selectedLevel === 'state')} />
      <NationalPlatform {...common} label={labelState(room, 'national', now, selectedLevel === 'national')} />
    </Canvas>
  );
}
