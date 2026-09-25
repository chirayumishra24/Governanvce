'use client';

import { motion } from 'framer-motion';
import type { TeamId } from '@/types/controlRoom';
import { TEAM_THEME } from '@/lib/governance';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function AnswerOptions({
  team,
  options,
  selected,
  removed,
  disabled,
  onSelect,
}: {
  team: TeamId;
  options: string[];
  selected?: string;
  removed: string[];
  disabled?: boolean;
  onSelect: (option: string) => void;
}) {
  const theme = TEAM_THEME[team];
  const long = options.some((o) => o.length > 48);
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Answer choices">
      {options.map((opt, i) => {
        const isSel = selected === opt;
        const gone = removed.includes(opt);
        return (
          <motion.button
            key={opt}
            type="button"
            role="radio"
            aria-checked={isSel}
            disabled={disabled || gone}
            onClick={() => onSelect(opt)}
            layout
            animate={{ opacity: gone ? 0.35 : 1 }}
            className={`group flex w-full items-center gap-3 rounded-2xl border-2 px-3 text-left transition-colors ${
              long ? 'min-h-[3.5rem] py-1.5' : 'min-h-[3.5rem]'
            } ${gone ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              background: isSel ? `linear-gradient(135deg, ${theme.accent}, ${theme.strong})` : '#F6F8FC',
              borderColor: isSel ? theme.strong : 'transparent',
              color: isSel ? '#fff' : '#1E293B',
              boxShadow: isSel ? `0 10px 24px -10px ${theme.glow}` : 'inset 0 -2px 0 rgba(15,23,42,.05)',
            }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[1.05rem] font-extrabold"
              style={{
                background: isSel ? 'rgba(255,255,255,.22)' : '#fff',
                color: isSel ? '#fff' : theme.strong,
              }}
            >
              {LETTERS[i]}
            </span>
            <span className={`font-semibold leading-snug ${long ? 'text-[0.98rem]' : 'text-[1.1rem]'} ${gone ? 'line-through' : ''}`}>
              {opt}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
