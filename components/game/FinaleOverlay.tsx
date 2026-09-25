'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TimerOff } from 'lucide-react';

/** After the last mission (or when time runs out) the whole control room lights up. */
export function FinaleOverlay({ endedBy, onContinue }: { endedBy: 'completed' | 'time'; onContinue: () => void }) {
  const completed = endedBy === 'completed';
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[70] flex items-end justify-center p-6 md:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 via-transparent to-slate-900/25" />
      <motion.div
        role="dialog"
        aria-labelledby="finale-title"
        initial={{ y: 40, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 140, damping: 18 }}
        className="clay-card pointer-events-auto relative max-w-[46rem] p-8 text-center"
        style={{ boxShadow: '0 0 0 4px #FFD27A, 0 30px 80px -20px rgba(224,165,38,.6)' }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-white">
          {completed ? <Sparkles className="h-9 w-9" /> : <TimerOff className="h-9 w-9" />}
        </div>
        {!completed && <div className="mt-3 text-[1rem] font-extrabold tracking-[0.2em] text-slate-500">TIME COMPLETE</div>}
        <h2 id="finale-title" className="mt-3 text-[2.4rem] font-extrabold leading-tight tracking-wide text-slate-900">
          GOVERNANCE SYSTEM ACTIVATED
        </h2>
        <p className="mt-2 text-[1.25rem] font-medium text-slate-600">
          National + State + Local, and Legislature + Executive + Judiciary.
          <br />
          You analysed how different parts of government work together.
        </p>
        <button
          type="button"
          onClick={onContinue}
          autoFocus
          className="btn mt-6 h-16 px-8 text-[1.25rem] tracking-wide text-white"
          style={{ background: 'linear-gradient(135deg,#E0A526,#C98A0C)', boxShadow: '0 14px 30px -12px rgba(224,165,38,.7)' }}
        >
          VIEW RESULTS <ArrowRight className="h-6 w-6" />
        </button>
      </motion.div>
    </motion.div>
  );
}
