'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Building2, Globe2, Home, X } from 'lucide-react';
import { LEVEL_INFO, ORGAN_INFO } from '@/lib/governance';
import { LEVELS, ORGANS } from '@/types/controlRoom';
import { ORGAN_ICONS } from '@/components/governance/GovernmentOrganPanel';

const LEVEL_ICONS = { local: Home, state: Building2, national: Globe2 };

/** Power-up: a simple LOCAL → STATE → NATIONAL reference, plus the three organs. */
export function LevelMapModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-map-title"
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            className="clay-card w-full max-w-[64rem] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 id="level-map-title" className="text-[1.6rem] font-extrabold tracking-wide text-slate-800">
                LEVEL MAP
              </h2>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close level map">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-[1.05rem] font-medium text-slate-600">Ask: how far does this issue reach?</p>

            <div className="mt-4 flex flex-col items-stretch gap-3 md:flex-row md:items-center">
              {LEVELS.map((l, i) => {
                const info = LEVEL_INFO[l];
                const Icon = LEVEL_ICONS[l];
                return (
                  <div key={l} className="flex flex-1 items-center gap-3">
                    <div className="flex-1 rounded-2xl border-2 p-4" style={{ borderColor: `${info.color}55`, background: `${info.color}0d` }}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: info.color }}>
                          <Icon className="h-6 w-6" />
                        </span>
                        <span className="text-[1.3rem] font-extrabold" style={{ color: info.color }}>
                          {info.short}
                        </span>
                      </div>
                      <p className="mt-2 text-[1.02rem] font-semibold text-slate-700">{info.summary}</p>
                      <p className="mt-1 text-[0.92rem] font-medium text-slate-500">e.g. {info.examples.slice(0, 3).join(', ').toLowerCase()}</p>
                    </div>
                    {i < LEVELS.length - 1 && <ArrowRight className="hidden h-7 w-7 shrink-0 text-slate-400 md:block" />}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {ORGANS.map((o) => {
                const info = ORGAN_INFO[o];
                const Icon = ORGAN_ICONS[o];
                return (
                  <div key={o} className="clay-inset flex items-center gap-3 p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: info.color }}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-extrabold text-slate-800">{info.label.toUpperCase()}</div>
                      <div className="text-[0.92rem] font-semibold text-slate-600">{info.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
