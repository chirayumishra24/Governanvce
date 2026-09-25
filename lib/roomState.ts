import type { GovernmentLevel, GovernmentOrgan, TeamId } from '@/types/controlRoom';

export interface Activation {
  team: TeamId | null;
  at: number;
  /** How many times this part has been activated during the game. */
  count: number;
}

export interface HintGlow {
  level?: GovernmentLevel;
  organ?: GovernmentOrgan;
  at: number;
}

/** What is currently lit up in the control room. Shared by the 3D scene, the 2D map and the organ panel. */
export interface RoomState {
  levels: Record<GovernmentLevel, Activation | null>;
  organs: Record<GovernmentOrgan, Activation | null>;
  core: Activation | null;
  hints: HintGlow[];
  /** Every part fully lit: the finale. */
  system: boolean;
}

export const EMPTY_ROOM: RoomState = {
  levels: { local: null, state: null, national: null },
  organs: { legislature: null, executive: null, judiciary: null },
  core: null,
  hints: [],
  system: false,
};

export const ACTIVE_MS = 5000;
export const HINT_MS = 3500;

/** 0..1 glow for a recent activation: quick rise, hold, then fade. */
export function activationStrength(a: Activation | null, now: number): number {
  if (!a) return 0;
  const t = (now - a.at) / 1000;
  if (t < 0) return 0;
  if (t < 0.35) return t / 0.35;
  if (t < 3.5) return 1;
  if (t < 5) return 1 - (t - 3.5) / 1.5;
  return 0;
}

/** A faint glow that stays after a part has been activated, growing with use. */
export function residualGlow(a: Activation | null): number {
  if (!a) return 0;
  return Math.min(0.35, 0.1 + a.count * 0.04);
}

export function hintStrength(hints: HintGlow[], now: number, match: (h: HintGlow) => boolean): number {
  let s = 0;
  for (const h of hints) {
    if (!match(h)) continue;
    const t = (now - h.at) / HINT_MS;
    if (t < 0 || t > 1) continue;
    s = Math.max(s, 0.5 + 0.5 * Math.sin(t * Math.PI * 6 - Math.PI / 2));
  }
  return s;
}

export function isRecent(a: Activation | null, now: number, ms = ACTIVE_MS) {
  return !!a && now - a.at < ms;
}
