'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { TeamId } from '@/types/controlRoom';
import { TEAM_THEME } from '@/lib/governance';

export interface BeamRequest {
  id: number;
  team: TeamId;
  /** data-anchor values of the parts that were activated. */
  targets: string[];
}

interface Path {
  d: string;
  points: { x: number; y: number }[];
}

function centre(anchor: string) {
  const el = document.querySelector(`[data-anchor="${anchor}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function curve(a: { x: number; y: number }, b: { x: number; y: number }): Path {
  const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 120 };
  const points = Array.from({ length: 16 }, (_, i) => {
    const t = i / 15;
    const u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
  });
  return { d: `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`, points };
}

/** Glowing connection from a team's mission card to the part of government it activated. */
export function ConnectionBeam({ beam, onDone }: { beam: BeamRequest; onDone: (id: number) => void }) {
  const [paths, setPaths] = useState<Path[]>([]);
  const color = TEAM_THEME[beam.team].accent;

  useEffect(() => {
    const from = centre(`source-${beam.team}`);
    const list: Path[] = [];
    if (from) {
      for (const t of beam.targets) {
        const to = centre(t);
        if (to) list.push(curve(from, to));
      }
    }
    setPaths(list);
    const id = window.setTimeout(() => onDone(beam.id), 1600);
    return () => window.clearTimeout(id);
  }, [beam, onDone]);

  if (!paths.length) return null;
  return (
    <svg className="pointer-events-none fixed inset-0 z-[60] h-full w-full" aria-hidden>
      <defs>
        <filter id={`glow-${beam.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {paths.map((p, i) => (
        <g key={i} filter={`url(#glow-${beam.id})`}>
          <motion.path
            d={p.d}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.95 }}
            animate={{ pathLength: 1, opacity: [0.95, 0.95, 0] }}
            transition={{ duration: 1.4, ease: 'easeInOut', times: [0, 0.6, 1] }}
          />
          <motion.circle
            r={9}
            fill="#fff"
            stroke={color}
            strokeWidth={4}
            initial={{ cx: p.points[0].x, cy: p.points[0].y, opacity: 1 }}
            animate={{ cx: p.points.map((q) => q.x), cy: p.points.map((q) => q.y), opacity: [1, 1, 0] }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
          />
        </g>
      ))}
    </svg>
  );
}
