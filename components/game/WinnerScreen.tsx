'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, Award, Castle, Compass } from 'lucide-react';
import type { GameRecord, TeamId } from '@/types/controlRoom';
import { TEAM_IDS } from '@/types/controlRoom';
import { TEAM_THEME } from '@/lib/governance';

/** GOVERNANCE MISSION COMPLETE: both teams’ statistics, with the higher score as champions. */
export function WinnerScreen({ record, onContinue }: { record: GameRecord; onContinue: () => void }) {
  const k = record.teams.knowledge.score;
  const h = record.teams.heritage.score;
  const winner: TeamId | 'tie' = k === h ? 'tie' : k > h ? 'knowledge' : 'heritage';

  useEffect(() => {
    // Subtle, short confetti in the team colours.
    const colors = winner === 'tie' ? ['#1F6FEB', '#F26B1D', '#FFD27A'] : [TEAM_THEME[winner].accent, '#FFD27A', '#ffffff'];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const fire = (x: number) => confetti({ particleCount: 45, spread: 60, startVelocity: 38, origin: { x, y: 0.75 }, colors, scalar: 0.9, ticks: 160 });
    fire(0.2);
    fire(0.8);
  }, [winner]);

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-[1rem] font-extrabold tracking-[0.25em] text-slate-500">GOVERNMENT CONTROL ROOM</div>
        <h1 className="mt-1 text-[2.8rem] font-extrabold leading-tight tracking-tight text-slate-900">GOVERNANCE MISSION COMPLETE</h1>
        {record.endedBy === 'time' && <p className="text-[1.1rem] font-semibold text-slate-500">The session ended when the timer reached zero.</p>}
      </motion.div>

      <div className="grid w-full gap-6 md:grid-cols-2">
        {TEAM_IDS.map((id, i) => {
          const t = record.teams[id];
          const theme = TEAM_THEME[id];
          const champion = winner === id || winner === 'tie';
          const Emblem = id === 'knowledge' ? Compass : Castle;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.12 }}
              className="clay-card relative overflow-hidden"
              style={champion ? { boxShadow: `0 0 0 4px ${theme.accent}, 0 30px 60px -24px ${theme.glow}` } : undefined}
            >
              <div className="flex items-center gap-4 p-6 text-white" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.strong})` }}>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                  <Emblem className="h-9 w-9" />
                </div>
                <div className="flex-1">
                  <div className="text-[1.8rem] font-extrabold uppercase leading-tight">{record.teamNames[id]}</div>
                  <div className="text-[1rem] font-semibold text-white/85">{theme.tagline}</div>
                </div>
                <div className="text-right">
                  <div className="text-[2.8rem] font-extrabold leading-none tabular-nums">{t.score}</div>
                  <div className="text-[0.8rem] font-extrabold tracking-widest">POINTS</div>
                </div>
              </div>
              {champion && (
                <div className="flex items-center justify-center gap-2 bg-amber-50 py-2 text-[1.2rem] font-extrabold tracking-wide text-amber-800">
                  <Award className="h-6 w-6 text-amber-500" />
                  {winner === 'tie' ? 'JOINT GOVERNANCE CHAMPIONS' : 'GOVERNANCE CHAMPIONS'}
                </div>
              )}
              <dl className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
                {[
                  ['Missions completed', `${t.missionsCompleted} / ${record.missionCount}`],
                  ['Correct answers', String(t.correctAnswers)],
                  ['Accuracy', `${t.accuracy}%`],
                  ['Best streak', String(t.maxStreak)],
                ].map(([label, value]) => (
                  <div key={label} className="clay-inset px-3 py-3 text-center">
                    <dd className="text-[1.7rem] font-extrabold text-slate-800">{value}</dd>
                    <dt className="text-[0.85rem] font-bold text-slate-500">{label}</dt>
                  </div>
                ))}
              </dl>
            </motion.div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="btn h-16 px-8 text-[1.25rem] tracking-wide text-white"
        style={{ background: 'linear-gradient(135deg,#0E8F80,#0B6F63)', boxShadow: '0 14px 30px -12px rgba(14,143,128,.6)' }}
      >
        WHAT DID WE DISCOVER? <ArrowRight className="h-6 w-6" />
      </button>
    </div>
  );
}
