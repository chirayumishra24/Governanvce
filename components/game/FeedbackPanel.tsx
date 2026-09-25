'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Lightbulb, RotateCcw, Zap } from 'lucide-react';
import type { Question, TeamId } from '@/types/controlRoom';
import { activationLabel, TEAM_THEME } from '@/lib/governance';

interface Props {
  team: TeamId;
  question: Question;
  correct: boolean;
  selected?: string;
  points: number;
  bonus: number;
  isLast: boolean;
  onNext: () => void;
}

/** Result of a mission: celebrates correct decisions, and gently reteaches after incorrect ones. */
export function FeedbackPanel({ team, question, correct, selected, points, bonus, isLast, onNext }: Props) {
  const theme = TEAM_THEME[team];
  const isSort = question.type === 'sort-level' || question.type === 'sort-organ';
  // After an incorrect answer, pause briefly before revealing the correct concept.
  const [revealed, setRevealed] = useState(correct);
  useEffect(() => {
    if (correct) return;
    const id = window.setTimeout(() => setRevealed(true), 1200);
    return () => window.clearTimeout(id);
  }, [correct]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-1 flex-col gap-3"
      role="status"
      aria-live="polite"
    >
      {correct ? (
        <div className="rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.strong})` }}>
          <div className="flex items-center gap-2 text-[1.5rem] font-extrabold tracking-wide">
            <CheckCircle2 className="h-7 w-7" /> CORRECT DECISION
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-white/20 px-2 py-1 text-[0.95rem] font-extrabold tracking-wide">{activationLabel(question)}</span>
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, type: 'spring' }}
              className="rounded-lg bg-white px-2 py-1 text-[0.95rem] font-extrabold"
              style={{ color: theme.strong }}
            >
              +{points} POINTS
            </motion.span>
            {bonus > 0 && (
              <span className="flex items-center gap-1 rounded-lg bg-amber-300 px-2 py-1 text-[0.95rem] font-extrabold text-amber-900">
                <Zap className="h-4 w-4" /> +{bonus} CHAIN BONUS
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-[1.4rem] font-extrabold tracking-wide text-amber-800">
            <RotateCcw className="h-6 w-6" /> RETHINK THE MISSION
          </div>
          {isSort ? (
            <p className="mt-1 text-[1rem] font-semibold text-amber-900">
              Every card is now in place. {points > 0 ? `+${points} points for finishing the sort.` : ''}
            </p>
          ) : (
            selected && (
              <p className="mt-1 text-[1rem] font-semibold text-amber-900">
                Your decision: <span className="line-through decoration-2">{selected}</span>
              </p>
            )
          )}
        </div>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay-inset flex flex-col gap-2 p-4"
          >
            {!correct && (
              <>
                {!isSort && (
                  <div className="text-[1.1rem] font-extrabold text-slate-800">
                    Correct decision: <span style={{ color: theme.strong }}>{question.correctAnswer}</span>
                  </div>
                )}
                {question.concept && <div className="text-[1.05rem] font-bold text-slate-700">{question.concept}</div>}
              </>
            )}
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <div className="text-[0.85rem] font-extrabold tracking-[0.14em] text-slate-500">WHY?</div>
                <p className="text-[1.08rem] font-medium leading-snug text-slate-700">{question.explanation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto">
        <button
          type="button"
          onClick={onNext}
          disabled={!revealed}
          className="btn h-16 w-full text-[1.2rem] tracking-wide text-white"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.strong})`, boxShadow: `0 14px 30px -12px ${theme.glow}` }}
        >
          {isLast ? 'FINISH MISSIONS' : 'NEXT MISSION'} <ArrowRight className="h-6 w-6" />
        </button>
      </div>
    </motion.div>
  );
}
