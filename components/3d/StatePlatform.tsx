'use client';

import type { GovernmentLevel } from '@/types/controlRoom';
import { useSignalMaterial, type RoomRef } from './ActivationEffect';
import { HospitalBuilding, SafetyPost, SchoolBuilding, StateBuilding } from './GovernmentBuilding';
import { GovernmentTier, type TierLabelState } from './GovernmentTier';
import { MAT } from './materials';
import { Placed, polar, Trees } from './primitives';

export const STATE_TIER = { top: 2.7, bottom: 0, radius: 4.0 };

export function StatePlatform({
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
  const { top } = STATE_TIER;
  const windowMat = useSignalMaterial(
    roomRef,
    'state',
    { color: '#EAF4FF', emissive: '#FFE3A3', roughness: 0.4 },
    { base: 0.2, active: 1.6 }
  );
  const signMat = useSignalMaterial(
    roomRef,
    'state',
    { color: '#16A34A', emissive: '#22C55E', roughness: 0.4 },
    { base: 0.3, active: 1.2 }
  );
  const trees = [-28, 28, -62, 62, -100, 100, -130, 130, 160, -160].map((deg, i) => ({
    p: polar(3.62, deg, top),
    s: 0.75 + (i % 2) * 0.15,
  }));

  return (
    <GovernmentTier
      level="state"
      roomRef={roomRef}
      {...STATE_TIER}
      bottomRadius={4.1}
      wall="#EFE7DB"
      windowColor="#A9C4E4"
      windowCols={32}
      windowRows={3}
      surface={MAT.plaza}
      label={label}
      showCards={showCards}
      card={{ position: [-3.9, top + 0.35, 0.6], side: 'left' }}
      onSelect={onSelect}
    >
      {/* State road ring */}
      <mesh position={[0, top + 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]} material={MAT.road} receiveShadow>
        <ringGeometry args={[2.74, 2.92, 72]} />
      </mesh>
      <Placed radius={3.42} deg={0} y={top}>
        <StateBuilding windowMat={windowMat} />
      </Placed>
      <Placed radius={3.4} deg={-40} y={top}>
        <SchoolBuilding windowMat={windowMat} />
      </Placed>
      <Placed radius={3.4} deg={40} y={top}>
        <HospitalBuilding windowMat={windowMat} signMat={signMat} />
      </Placed>
      <Placed radius={3.4} deg={78} y={top}>
        <SafetyPost windowMat={windowMat} />
      </Placed>
      <Placed radius={3.4} deg={-80} y={top}>
        <SchoolBuilding windowMat={windowMat} />
      </Placed>
      <Trees items={trees} />
    </GovernmentTier>
  );
}
