'use client';

import type { GovernmentLevel } from '@/types/controlRoom';
import { useSignalMaterial, type RoomRef } from './ActivationEffect';
import { FlagPole, NationalBuilding } from './GovernmentBuilding';
import { GovernmentTier, type TierLabelState } from './GovernmentTier';
import { MAT } from './materials';
import { polar, Trees } from './primitives';

export const NATIONAL_TIER = { top: 5.2, bottom: 2.7, radius: 2.55 };

export function NationalPlatform({
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
  const { top } = NATIONAL_TIER;
  const windowMat = useSignalMaterial(
    roomRef,
    'national',
    { color: '#FFF4D6', emissive: '#FFD58A', roughness: 0.4 },
    { base: 0.25, active: 1.6 }
  );
  const domeMat = useSignalMaterial(
    roomRef,
    'national',
    { color: '#F7F1E6', emissive: '#FFCB6B', roughness: 0.55 },
    { base: 0, active: 0.55 }
  );
  const trees = [-150, -120, 120, 150, 180, -60, 60].map((deg, i) => ({
    p: polar(2.0, deg, top),
    s: 0.8 + (i % 3) * 0.1,
  }));

  return (
    <GovernmentTier
      level="national"
      roomRef={roomRef}
      {...NATIONAL_TIER}
      bottomRadius={2.7}
      wall="#F4EFE7"
      windowColor="#AFC8E6"
      windowCols={20}
      windowRows={3}
      surface={MAT.plaza}
      label={label}
      showCards={showCards}
      card={{ position: [2.45, top + 0.75, 0], side: 'right' }}
      onSelect={onSelect}
    >
      <mesh position={[0, top + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={MAT.grass} receiveShadow>
        <ringGeometry args={[1.75, 2.3, 48]} />
      </mesh>
      <group position={[0, top, -0.15]}>
        <NationalBuilding windowMat={windowMat} domeMat={domeMat} />
      </group>
      <FlagPole p={polar(1.95, -35, top)} height={1.2} />
      <Trees items={trees} />
    </GovernmentTier>
  );
}
