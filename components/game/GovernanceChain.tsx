'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Link2 } from 'lucide-react';
import type { TeamId } from '@/types/controlRoom';
import { CHAIN_BONUS, CHAIN_LENGTH, TEAM_THEME } from '@/lib/governance';

const STEPS = ['Question', 'Decision', 'Government', 'Action'];

/** Streak celebration: shows how a question becomes government action. */
export function GovernanceChain({ team, visible }: { team: TeamId; visible: boolean }) {
  const theme = TEAM_THEME[team];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="pointer-events-none absolute inset-x-3 top-3 z-30 rounded-2xl border-2 border-amber-300 bg-white/95 p-3 shadow-xl backdrop-blur"
          role="status"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[1.15rem] font-extrabold tracking-wide text-amber-700">
              <Link2 className="h-5 w-5" /> GOVERNANCE CHAIN
            </div>
            <span className="rounded-lg bg-amber-300 px-2 py-0.5 text-[0.9rem] font-extrabold text-amber-900">+{CHAIN_BONUS} BONUS</span>
          </div>
          <div className="text-[0.9rem] font-semibold text-slate-600">{CHAIN_LENGTH} correct decisions in a row!</div>
          <div className="mt-2 flex items-center justify-between gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-1">
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.18 }}
                  className="flex-1 rounded-lg px-1.5 py-1 text-center text-[0.78rem] font-extrabold text-white"
                  style={{ background: theme.accent }}
                >
                  {s}
                </motion.span>
                {i < STEPS.length - 1 && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.18 }}>
                    <ChevronRight className="h-4 w-4 text-amber-600" />
                  </motion.span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
