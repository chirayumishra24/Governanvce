'use client';

import * as THREE from 'three';
import type { ReactNode } from 'react';
import { Html } from '@react-three/drei';
import type { GovernmentLevel, TeamId } from '@/types/controlRoom';
import { LEVEL_INFO, TEAM_THEME } from '@/lib/governance';
import { GlowRing, LightBeam, useSignalMaterial, type RoomRef } from './ActivationEffect';
import { useWindowTextures } from './primitives';
import { MAT } from './materials';

export interface TierLabelState {
  active: boolean;
  team?: TeamId | null;
  hint: boolean;
  system: boolean;
  selected: boolean;
}

interface Props {
  level: GovernmentLevel;
  roomRef: RoomRef;
  /** Height of the walkable top surface. */
  top: number;
  bottom: number;
  radius: number;
  bottomRadius?: number;
  wall: string;
  windowColor: string;
  windowCols: number;
  windowRows: number;
  surface: THREE.Material;
  label: TierLabelState;
  showCards: boolean;
  /** Where the responsibilities card is pinned, and which way it extends from that point. */
  card: { position: [number, number, number]; side: 'left' | 'right' };
  onSelect?: (level: GovernmentLevel) => void;
  children?: ReactNode;
}

/** One level of government: a drum-shaped floor of the control room with a glowing rim and its own label. */
export function GovernmentTier({
  level,
  roomRef,
  top,
  bottom,
  radius,
  bottomRadius,
  wall,
  windowColor,
  windowCols,
  windowRows,
  surface,
  label,
  showCards,
  card,
  onSelect,
  children,
}: Props) {
  const height = top - bottom;
  const tex = useWindowTextures({ cols: 8, rows: windowRows, wall, window: windowColor, repeat: windowCols / 8 });
  const facade = useSignalMaterial(
    roomRef,
    level,
    { map: tex.map, emissiveMap: tex.emissive, emissive: '#FFE6A8', roughness: 0.8 },
    { base: 0.05, active: 1.1, tint: true }
  );
  const r0 = bottomRadius ?? radius;
  const clickable = !!onSelect;

  return (
    <group
      onClick={
        clickable
          ? (e) => {
              e.stopPropagation();
              onSelect?.(level);
            }
          : undefined
      }
      onPointerOver={clickable ? () => (document.body.style.cursor = 'pointer') : undefined}
      onPointerOut={clickable ? () => (document.body.style.cursor = '') : undefined}
    >
      {/* Facade drum */}
      <mesh position={[0, bottom + height / 2 - 0.12, 0]} material={facade} receiveShadow castShadow>
        <cylinderGeometry args={[radius - 0.08, r0 - 0.08, height - 0.24, 64, 1, true]} />
      </mesh>
      {/* Floor slab */}
      <mesh position={[0, top - 0.12, 0]} material={MAT.stone} receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius - 0.04, 0.24, 64]} />
      </mesh>
      <mesh position={[0, top + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={surface} receiveShadow>
        <circleGeometry args={[radius - 0.12, 64]} />
      </mesh>
      <GlowRing roomRef={roomRef} level={level} radius={radius - 0.02} y={top} />
      <LightBeam roomRef={roomRef} level={level} radius={radius} y={top} height={1.6} />

      {children}

      {/* Level plaque on the front edge */}
      <Html position={[0, top + 0.02, radius + 0.04]} center zIndexRange={[30, 10]}>
        <TierPlaque level={level} state={label} onSelect={onSelect} />
      </Html>

      {showCards && (
        <Html
          position={card.position}
          zIndexRange={[25, 5]}
          style={{ transform: card.side === 'right' ? 'translate(10px, -50%)' : 'translate(calc(-100% - 10px), -50%)' }}
        >
          <ResponsibilityCard level={level} state={label} />
        </Html>
      )}
    </group>
  );
}

function glowStyle(state: TierLabelState, color: string) {
  if (state.system) return { boxShadow: '0 0 0 3px #FFD27A, 0 0 28px rgba(255,190,70,0.75)' };
  if (state.active && state.team)
    return { boxShadow: `0 0 0 3px ${TEAM_THEME[state.team].accent}, 0 0 26px ${TEAM_THEME[state.team].glow}` };
  if (state.hint) return { boxShadow: '0 0 0 3px #FFC53D, 0 0 24px rgba(255,197,61,0.7)' };
  if (state.selected) return { boxShadow: `0 0 0 3px ${color}` };
  return {};
}

function TierPlaque({
  level,
  state,
  onSelect,
}: {
  level: GovernmentLevel;
  state: TierLabelState;
  onSelect?: (l: GovernmentLevel) => void;
}) {
  const info = LEVEL_INFO[level];
  return (
    <button
      type="button"
      data-anchor={`level-${level}`}
      onClick={onSelect ? () => onSelect(level) : undefined}
      tabIndex={onSelect ? 0 : -1}
      className={`tier-plaque ${onSelect ? 'cursor-pointer' : 'cursor-default'} ${state.hint ? 'animate-hint' : ''}`}
      style={glowStyle(state, info.color)}
    >
      <span className="tier-plaque-dot" style={{ background: info.color }} />
      <span className="whitespace-nowrap">
        {info.short} <span className="font-semibold opacity-80">GOVERNMENT</span>
      </span>
      {(state.active || state.system) && (
        <span
          className="tier-plaque-chip"
          style={{ background: state.system ? '#E0A526' : state.team ? TEAM_THEME[state.team].accent : info.color }}
        >
          ACTIVE
        </span>
      )}
    </button>
  );
}

function ResponsibilityCard({ level, state }: { level: GovernmentLevel; state: TierLabelState }) {
  const info = LEVEL_INFO[level];
  const lit = state.active || state.system;
  return (
    <div className={`resp-card ${lit ? 'resp-card-lit' : ''}`} style={lit ? { borderColor: info.color } : undefined}>
      <ul>
        {info.examples.map((e) => (
          <li key={e}>
            <span style={{ background: info.color }} />
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}
