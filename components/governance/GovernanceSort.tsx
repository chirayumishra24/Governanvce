'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import type { SortItem } from '@/types/controlRoom';
import { SortBoard } from './SortBoard';
import { LEVEL_TARGETS, ORGAN_TARGETS } from './sortTargets';

type Mode = 'level' | 'organ';

const LEVEL_CARDS: SortItem[] = [
  { id: 'p1', text: 'Maintaining a neighbourhood park', answer: 'local', image: 'park' },
  { id: 'p2', text: 'State-wide education programme', answer: 'state', image: 'school' },
  { id: 'p3', text: 'National defence policy', answer: 'national', image: 'defence' },
  { id: 'p4', text: 'Local waste collection', answer: 'local', image: 'waste' },
  { id: 'p5', text: 'State-level public health programme', answer: 'state', image: 'hospital' },
  { id: 'p6', text: 'Country-wide renewable energy policy', answer: 'national', image: 'energy' },
  { id: 'p7', text: 'Local street repair', answer: 'local', image: 'road' },
  { id: 'p8', text: 'State road project connecting cities', answer: 'state', image: 'road' },
];

const ORGAN_CARDS: SortItem[] = [
  { id: 'q1', text: 'Making a new law', answer: 'legislature', image: 'law' },
  { id: 'q2', text: 'Carrying out a government programme', answer: 'executive', image: 'briefcase' },
  { id: 'q3', text: 'Resolving a legal dispute', answer: 'judiciary', image: 'court' },
  { id: 'q4', text: 'Discussing proposed laws', answer: 'legislature', image: 'parliament' },
  { id: 'q5', text: 'Implementing an approved policy', answer: 'executive', image: 'briefcase' },
  { id: 'q6', text: 'Interpreting how a law applies', answer: 'judiciary', image: 'court' },
];

const SUMMARY: Record<Mode, string> = {
  level:
    'Local government looks after needs close to people, state government handles matters across a state, and national government handles matters for the whole country.',
  organ: 'The Legislature makes laws, the Executive implements them, and the Judiciary interprets laws and resolves disputes.',
};

function shuffle<T>(a: T[]) {
  return [...a].sort(() => Math.random() - 0.5);
}

/** GOVERNANCE SORT: a dedicated drag-and-drop practice activity with Level and Organ modes. */
export function GovernanceSort() {
  const [mode, setMode] = useState<Mode>('level');
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState(0);
  // Shuffle after mount so the server-rendered order matches the first client render.
  const [items, setItems] = useState<SortItem[]>(LEVEL_CARDS);
  useEffect(() => setItems(shuffle(mode === 'level' ? LEVEL_CARDS : ORGAN_CARDS)), [mode, round]);
  const done = Object.keys(placed).length === items.length;

  const reset = (m: Mode = mode) => {
    setMode(m);
    setPlaced({});
    setWrong(0);
    setRound((r) => r + 1);
  };

  const onPlace = (itemId: string, target: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item?.answer === target) {
      setPlaced((p) => ({ ...p, [itemId]: target }));
      return true;
    }
    setWrong((w) => w + 1);
    return false;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="clay-card flex p-1" role="tablist" aria-label="Sort mode">
          {(
            [
              ['level', 'Level sort: Local / State / National'],
              ['organ', 'Organ sort: Legislature / Executive / Judiciary'],
            ] as [Mode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => reset(m)}
              className={`min-h-[3.5rem] rounded-xl px-4 text-[1rem] font-bold ${mode === m ? 'bg-[#1F6FEB] text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="clay-card flex items-center gap-2 px-4 py-3 text-[1rem] font-bold text-slate-700">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> {Object.keys(placed).length} / {items.length} placed
          </span>
          <span className="clay-card flex items-center gap-2 px-4 py-3 text-[1rem] font-bold text-slate-700">
            <XCircle className="h-5 w-5 text-amber-500" /> {wrong} to rethink
          </span>
          <button type="button" onClick={() => reset()} className="btn btn-ghost px-5">
            <RotateCcw className="h-5 w-5" /> Reset
          </button>
        </div>
      </div>

      <div className="clay-card p-5">
        <SortBoard
          key={`${mode}-${round}`}
          boardId={`practice-${mode}-${round}`}
          items={items}
          targets={mode === 'level' ? LEVEL_TARGETS : ORGAN_TARGETS}
          placed={placed}
          onPlace={onPlace}
          accent="#1F6FEB"
          size="large"
        />
      </div>

      {done && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="clay-card flex flex-wrap items-center gap-4 p-5" role="status">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <div className="text-[1.3rem] font-extrabold text-slate-800">
              {wrong === 0 ? 'Perfect sort!' : `All sorted, with ${wrong} ${wrong === 1 ? 'card' : 'cards'} to rethink along the way.`}
            </div>
            <p className="text-[1.05rem] font-medium text-slate-600">{SUMMARY[mode]}</p>
          </div>
          <button type="button" onClick={() => reset(mode === 'level' ? 'organ' : 'level')} className="btn h-14 px-6 text-white" style={{ background: '#1F6FEB' }}>
            Try the {mode === 'level' ? 'organ' : 'level'} sort
          </button>
        </motion.div>
      )}
    </div>
  );
}
