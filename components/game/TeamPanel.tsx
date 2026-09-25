'use client';

import { motion } from 'framer-motion';
import { Castle, CheckCircle2, Compass, Flame, Trophy } from 'lucide-react';
import type { TeamId } from '@/types/controlRoom';
import type { TeamRuntime } from '@/lib/gameEngine';
import { TEAM_THEME } from '@/lib/governance';
import { GovernanceChain } from './GovernanceChain';
import { MissionCard, type MissionHandlers } from './MissionCard';

interface Props extends MissionHandlers {
  team: TeamId;
  name: string;
  runtime: TeamRuntime;
  missionTotal: number;
  playing: boolean;
  chainActive: boolean;
  powerUpsEnabled: boolean;
  className?: string;
}

export function TeamPanel({ team, name, runtime, missionTotal, playing, chainActive, powerUpsEnabled, className = '', ...handlers }: Props) {
  const theme = TEAM_THEME[team];
  const p = runtime.progress;
  const Emblem = team === 'knowledge' ? Compass : Castle;
  const pct = missionTotal ? (p.missionsCompleted / missionTotal) * 100 : 0;

  return (
    <section
      className={`relative flex min-h-0 flex-col gap-3 ${className}`}
      aria-label={`${name} panel`}
    >
      {/* Team header */}
      <div
        className="relative overflow-hidden rounded-[1.5rem] p-4 text-white"
        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.strong})`, boxShadow: `0 18px 40px -20px ${theme.glow}` }}
      >
        <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" aria-hidden />
        <div className="relative flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <Emblem className="h-8 w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[1.55rem] font-extrabold uppercase leading-tight tracking-wide">{name}</h2>
            <p className="text-[0.95rem] font-semibold text-white/85">{theme.tagline}</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2" style={{ color: theme.strong }}>
            <Trophy className="h-6 w-6" />
            <div className="text-right leading-none">
              <motion.div key={p.score} initial={{ scale: 1.35 }} animate={{ scale: 1 }} className="text-[1.5rem] font-extrabold tabular-nums">
                {p.score}
              </motion.div>
              <div className="text-[0.65rem] font-extrabold tracking-wider">POINTS</div>
            </div>
          </div>
        </div>
        <div className="relative mt-3 rounded-2xl bg-white/95 px-3 py-2 text-slate-700">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[1.05rem] font-extrabold" style={{ color: theme.strong }}>
              {p.missionsCompleted} / {missionTotal}
              <span className="ml-1.5 text-[0.75rem] tracking-wider text-slate-500">MISSIONS COMPLETE</span>
            </span>
            <span className="flex items-center gap-3 text-[0.82rem] font-bold text-slate-500">
              <span>
                ACCURACY <span className="text-slate-800">{p.questionsAnswered ? `${p.accuracy}%` : '–'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-amber-500" /> <span className="text-slate-800">{p.streak}</span>
              </span>
            </span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full"
              style={{ background: theme.accent }}
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="clay-card scroll-soft relative flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        <GovernanceChain team={team} visible={chainActive} />
        {runtime.phase === 'done' ? (
          <TeamDone team={team} runtime={runtime} missionTotal={missionTotal} />
        ) : (
          <MissionCard team={team} runtime={runtime} playing={playing} powerUpsEnabled={powerUpsEnabled} {...handlers} />
        )}
      </div>
    </section>
  );
}

function TeamDone({ team, runtime, missionTotal }: { team: TeamId; runtime: TeamRuntime; missionTotal: number }) {
  const theme = TEAM_THEME[team];
  const p = runtime.progress;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <CheckCircle2 className="h-16 w-16" style={{ color: theme.accent }} />
      <div>
        <div className="text-[1.5rem] font-extrabold text-slate-800">All missions complete</div>
        <p className="mt-1 text-[1.05rem] font-medium text-slate-600">Waiting for the other team to finish their missions.</p>
      </div>
      <div className="grid w-full grid-cols-3 gap-2">
        {[
          ['Correct', `${p.correctAnswers}/${missionTotal}`],
          ['Accuracy', `${p.accuracy}%`],
          ['Best streak', String(p.maxStreak)],
        ].map(([k, v]) => (
          <div key={k} className="clay-inset px-2 py-3">
            <div className="text-[1.4rem] font-extrabold" style={{ color: theme.strong }}>
              {v}
            </div>
            <div className="text-[0.8rem] font-bold text-slate-500">{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
