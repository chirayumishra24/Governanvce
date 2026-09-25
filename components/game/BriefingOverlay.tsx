'use client';

import { motion } from 'framer-motion';
import { Building2, Landmark, Link2, Play, Users } from 'lucide-react';
import type { TeamId } from '@/types/controlRoom';
import { TEAM_IDS } from '@/types/controlRoom';
import { TEAM_THEME } from '@/lib/governance';
import { formatTime } from './GameHeader';

const IDEAS = [
  {
    icon: Users,
    title: 'Governance',
    text: 'How a society is managed and how decisions are made for everyone’s public needs.',
    color: '#E2601A',
  },
  {
    icon: Building2,
    title: 'Three levels',
    text: 'Local government is closest to people, State government works across a state, National government serves the whole country.',
    color: '#0E8F80',
  },
  {
    icon: Landmark,
    title: 'Three organs',
    text: 'The Legislature makes laws, the Executive implements them, and the Judiciary interprets them and resolves disputes.',
    color: '#6B5BD6',
  },
];

/** Shown before the timer starts: a short mission briefing for the class. */
export function BriefingOverlay({
  teamNames,
  missionCount,
  durationSeconds,
  onStart,
}: {
  teamNames: Record<TeamId, string>;
  missionCount: number;
  durationSeconds: number;
  onStart: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-900/30 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="briefing-title"
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        className="clay-card w-full max-w-[72rem] p-6 md:p-8"
      >
        <div className="text-[0.95rem] font-extrabold tracking-[0.2em] text-slate-500">MISSION BRIEFING</div>
        <h2 id="briefing-title" className="mt-1 text-[2.3rem] font-extrabold leading-tight text-slate-900">
          You are Governance Operators.
        </h2>
        <p className="mt-1 max-w-[52rem] text-[1.2rem] font-medium text-slate-600">
          Real-life situations will arrive in the control room. For each one, decide <strong>who handles it</strong>: which
          level of government, or which organ of government.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {IDEAS.map((idea) => (
            <div key={idea.title} className="clay-inset p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: idea.color }}>
                  <idea.icon className="h-5 w-5" />
                </span>
                <span className="text-[1.2rem] font-extrabold text-slate-800">{idea.title}</span>
              </div>
              <p className="mt-2 text-[1.02rem] font-medium leading-snug text-slate-600">{idea.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-col gap-1 text-[1rem] font-semibold text-slate-600">
            <li>
              Each team gets its own {missionCount} missions. The class has {formatTime(durationSeconds)} on the clock. Select an answer, then press Submit.
            </li>
            <li>Correct decisions light up the control room and earn 100 points.</li>
            <li className="flex items-center gap-1.5">
              <Link2 className="h-4 w-4 text-amber-500" /> Three correct in a row starts a Governance Chain (+150).
            </li>
          </ul>
          <div className="flex items-center gap-3">
            {TEAM_IDS.map((id) => (
              <span
                key={id}
                className="whitespace-nowrap rounded-xl px-3 py-2 text-[0.95rem] font-extrabold text-white"
                style={{ background: TEAM_THEME[id].accent }}
              >
                {teamNames[id]}
              </span>
            ))}
            <button
              type="button"
              onClick={onStart}
              autoFocus
              className="btn h-16 whitespace-nowrap px-8 text-[1.3rem] tracking-wide text-white"
              style={{ background: 'linear-gradient(135deg,#1F6FEB,#1557C0)', boxShadow: '0 14px 30px -12px rgba(31,111,235,.6)' }}
            >
              <Play className="h-6 w-6" /> START MISSIONS
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
