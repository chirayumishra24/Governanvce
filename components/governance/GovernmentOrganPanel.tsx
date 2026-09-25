'use client';

import { motion } from 'framer-motion';
import { Briefcase, Landmark, Scale, type LucideIcon } from 'lucide-react';
import type { GovernmentOrgan } from '@/types/controlRoom';
import { ORGANS } from '@/types/controlRoom';
import { ORGAN_INFO, TEAM_THEME } from '@/lib/governance';
import { HINT_MS, isRecent, type RoomState } from '@/lib/roomState';

export const ORGAN_ICONS: Record<GovernmentOrgan, LucideIcon> = {
  legislature: Landmark,
  executive: Briefcase,
  judiciary: Scale,
};

interface Props {
  room: RoomState;
  now: number;
  selected?: GovernmentOrgan | null;
  onSelect?: (organ: GovernmentOrgan) => void;
  compact?: boolean;
}

/** Legislature → Executive → Judiciary modules that light up when a mission concerns them. */
export function GovernmentOrganPanel({ room, now, selected, onSelect, compact }: Props) {
  return (
    <section className="clay-card flex shrink-0 flex-col gap-2 px-4 py-3" aria-label="Organs of government">
      <div className="flex items-center justify-between">
        <h2 className="text-[0.95rem] font-extrabold tracking-[0.12em] text-slate-700">ORGANS OF GOVERNMENT</h2>
        <span className="hidden text-sm font-semibold text-slate-500 xl:inline">Make → Implement → Interpret</span>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {ORGANS.map((organ, i) => (
          <OrganRow key={organ} index={i}>
            <OrganModule
              organ={organ}
              room={room}
              now={now}
              selected={selected === organ}
              onSelect={onSelect}
              compact={compact}
            />
          </OrganRow>
        ))}
      </div>
    </section>
  );
}

function OrganRow({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <>
      {index > 0 && (
        <div className="hidden items-center sm:flex" aria-hidden>
          <div className="organ-link" />
        </div>
      )}
      {children}
    </>
  );
}

export function OrganModule({
  organ,
  room,
  now,
  selected,
  onSelect,
  compact,
}: {
  organ: GovernmentOrgan;
  room: RoomState;
  now: number;
  selected?: boolean;
  onSelect?: (organ: GovernmentOrgan) => void;
  compact?: boolean;
}) {
  const info = ORGAN_INFO[organ];
  const Icon = ORGAN_ICONS[organ];
  const a = room.organs[organ];
  const direct = isRecent(a, now);
  const core = isRecent(room.core, now);
  const active = room.system || direct || core;
  const team = direct ? a?.team : core ? room.core?.team : null;
  const hint = room.hints.some((h) => h.organ === organ && now - h.at < HINT_MS);
  const accent = room.system ? '#E0A526' : team ? TEAM_THEME[team].accent : info.color;
  const ring = active
    ? `0 0 0 3px ${accent}, 0 10px 30px -6px ${room.system ? 'rgba(224,165,38,.55)' : team ? TEAM_THEME[team].glow : 'transparent'}`
    : hint
      ? '0 0 0 3px #FFC53D, 0 0 26px rgba(255,197,61,.6)'
      : selected
        ? `0 0 0 3px ${info.color}`
        : undefined;

  const Tag = onSelect ? 'button' : 'div';
  return (
    <Tag
      type={onSelect ? 'button' : undefined}
      onClick={onSelect ? () => onSelect(organ) : undefined}
      data-anchor={`organ-${organ}`}
      className={`organ-module relative flex min-h-[4.25rem] items-center gap-3 overflow-hidden rounded-2xl px-3 py-2 text-left transition-shadow ${
        onSelect ? 'cursor-pointer hover:bg-slate-50' : ''
      } ${hint ? 'animate-hint' : ''}`}
      style={{ boxShadow: ring, background: active ? `linear-gradient(135deg, #fff, ${info.color}14)` : undefined }}
    >
      {active && <div className="organ-sheen" style={{ background: `linear-gradient(90deg, transparent, ${accent}22, transparent)` }} />}
      <div
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors"
        style={{ background: active ? accent : `${info.color}1A`, color: active ? '#fff' : info.color }}
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[1.05rem] font-extrabold tracking-wide text-slate-800">{info.label.toUpperCase()}</span>
        </div>
        {!compact && <div className="truncate text-[0.9rem] font-medium text-slate-600">{info.role}</div>}
        <div className="mt-0.5 flex items-center gap-1.5 text-[0.8rem] font-bold">
          <>
            {direct && !room.system ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-full px-2 py-0.5 text-white"
                style={{ background: accent }}
              >
                MISSION COMPLETE
              </motion.span>
            ) : (
              <motion.span key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full border-2"
                  style={{ borderColor: active ? accent : '#94A3B8', background: active ? accent : 'transparent' }}
                />
                <span style={{ color: active ? accent : '#64748B' }}>{active ? 'Active' : 'Inactive'}</span>
              </motion.span>
            )}
          </>
        </div>
      </div>
    </Tag>
  );
}
