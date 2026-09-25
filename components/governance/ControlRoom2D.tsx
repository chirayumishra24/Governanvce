'use client';

import { ChevronDown, Globe2, Home, Building2, type LucideIcon } from 'lucide-react';
import type { GovernmentLevel } from '@/types/controlRoom';
import { LEVEL_INFO, TEAM_THEME } from '@/lib/governance';
import { HINT_MS, isRecent, type RoomState } from '@/lib/roomState';

const ORDER: GovernmentLevel[] = ['national', 'state', 'local'];
const ICONS: Record<GovernmentLevel, LucideIcon> = { national: Globe2, state: Building2, local: Home };
const WIDTH: Record<GovernmentLevel, string> = { national: 'w-[62%]', state: 'w-[78%]', local: 'w-[94%]' };

/** Map view and low-performance fallback: the same three levels as flat, glowing tiers. */
export function ControlRoom2D({
  room,
  now,
  selectedLevel,
  onSelectLevel,
}: {
  room: RoomState;
  now: number;
  selectedLevel?: GovernmentLevel | null;
  onSelectLevel?: (level: GovernmentLevel) => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-4 py-14">
      {ORDER.map((level, i) => {
        const info = LEVEL_INFO[level];
        const Icon = ICONS[level];
        const a = room.levels[level];
        const direct = isRecent(a, now);
        const core = isRecent(room.core, now);
        const active = room.system || direct || core;
        const team = direct ? a?.team : core ? room.core?.team : null;
        const hint = room.hints.some((h) => h.level === level && now - h.at < HINT_MS);
        const accent = room.system ? '#E0A526' : team ? TEAM_THEME[team].accent : info.color;
        const Tag = onSelectLevel ? 'button' : 'div';
        return (
          <div key={level} className={`flex flex-col items-center ${WIDTH[level]}`}>
            {i > 0 && <ChevronDown className="my-0.5 h-6 w-6 text-slate-400" aria-hidden />}
            <Tag
              type={onSelectLevel ? 'button' : undefined}
              onClick={onSelectLevel ? () => onSelectLevel(level) : undefined}
              data-anchor={`level-${level}`}
              className={`relative flex w-full items-center gap-4 rounded-3xl border-2 bg-white/90 px-5 py-4 text-left transition-all ${
                hint ? 'animate-hint' : ''
              } ${onSelectLevel ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
              style={{
                borderColor: active || selectedLevel === level ? accent : 'rgba(148,163,184,.35)',
                boxShadow: active
                  ? `0 0 0 3px ${accent}55, 0 14px 40px -10px ${accent}`
                  : hint
                    ? '0 0 0 3px #FFC53D, 0 0 24px rgba(255,197,61,.6)'
                    : '0 10px 30px -14px rgba(30,64,120,.35)',
              }}
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: active ? accent : `${info.color}1F`, color: active ? '#fff' : info.color }}
              >
                <Icon className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-extrabold tracking-wide text-slate-800">{info.label.toUpperCase()}</div>
                <div className="text-sm font-medium text-slate-600">{info.summary}</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {info.examples.map((e) => (
                    <span key={e} className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: `${info.color}17`, color: info.color }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>
              {active && (
                <span className="absolute -top-3 right-4 rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: accent }}>
                  ACTIVE
                </span>
              )}
            </Tag>
          </div>
        );
      })}
    </div>
  );
}
