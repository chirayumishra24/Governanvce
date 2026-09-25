'use client';

import { motion } from 'framer-motion';
import { Flag, Send, Target } from 'lucide-react';
import type { TeamId } from '@/types/controlRoom';
import type { TeamRuntime } from '@/lib/gameEngine';
import { currentQuestion } from '@/lib/gameEngine';
import { TEAM_THEME } from '@/lib/governance';
import { STAGE_LABELS, stageOf } from '@/lib/questionEngine';
import { IssueIllustration } from '@/components/governance/IssueIllustration';
import { SortBoard } from '@/components/governance/SortBoard';
import { targetsFor } from '@/components/governance/sortTargets';
import { AnswerOptions } from './AnswerOptions';
import { FeedbackPanel } from './FeedbackPanel';
import { PowerUps } from './PowerUps';

export interface MissionHandlers {
  onSelect: (option: string) => void;
  onSubmit: () => void;
  onHint: () => void;
  onFifty: () => void;
  onSortPlace: (itemId: string, target: string) => boolean;
  onNext: () => void;
  onLevelMap: () => void;
}

interface Props extends MissionHandlers {
  team: TeamId;
  runtime: TeamRuntime;
  playing: boolean;
  powerUpsEnabled: boolean;
}

/** The current mission: situation, question, answers and power-ups, then the result. */
export function MissionCard({ team, runtime, playing, powerUpsEnabled, ...h }: Props) {
  const theme = TEAM_THEME[team];
  const q = currentQuestion(runtime);
  if (!q) return null;
  const isSort = q.type === 'sort-level' || q.type === 'sort-organ';
  const isLast = runtime.index === runtime.queue.length - 1;
  const answering = runtime.phase === 'answering';
  const hintText = runtime.usedHint ? q.hint : undefined;

  return (
    <div className="flex flex-1 flex-col gap-3" data-anchor={`source-${team}`}>
      {/* Mission label */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ background: theme.soft }}>
          {q.finale ? <Flag className="h-5 w-5" style={{ color: theme.accent }} /> : <Target className="h-5 w-5" style={{ color: theme.accent }} />}
          <span className="text-[1rem] font-extrabold tracking-wide" style={{ color: theme.strong }}>
            {q.finale ? 'FINAL MISSION' : `CURRENT MISSION ${String(runtime.index + 1).padStart(2, '0')}`}
          </span>
        </div>
        <span className="truncate rounded-lg bg-slate-100 px-2 py-1 text-[0.78rem] font-bold text-slate-500">
          {isSort ? (q.type === 'sort-level' ? 'Governance sort' : 'Organ sort') : STAGE_LABELS[stageOf(q)]}
        </span>
      </div>

      {/* Keyed entry animation only: an exit phase would stall while the screen re-renders its timers. */}
      <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28 }}
          className="flex flex-1 flex-col gap-3"
        >
          {/* Situation + question */}
          {!isSort && (
            <div className="flex gap-3">
              <IssueIllustration image={q.image} className="h-[5.5rem] w-[7rem] shrink-0 rounded-2xl" />
              <div className="min-w-0">
                {q.scenario ? (
                  <p className="text-[1.3rem] font-semibold leading-snug text-slate-800">{q.scenario}</p>
                ) : (
                  <p className="text-[1.3rem] font-bold leading-snug text-slate-800">{q.question}</p>
                )}
              </div>
            </div>
          )}
          {(q.scenario || isSort) && (
            <div>
              {!isSort && <div className="text-[0.78rem] font-extrabold tracking-[0.14em] text-slate-400">QUESTION</div>}
              <p className={`font-extrabold leading-snug text-slate-900 ${isSort ? 'text-[1.25rem]' : 'text-[1.18rem]'}`}>{q.question}</p>
            </div>
          )}

          {answering ? (
            <>
              {hintText && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[0.98rem] font-semibold text-amber-900"
                >
                  <span className="font-extrabold">Hint: </span>
                  {hintText}
                </motion.div>
              )}
              {isSort ? (
                <SortBoard
                  boardId={`mission-${team}-${q.id}`}
                  items={q.sortItems ?? []}
                  targets={targetsFor(q.type)}
                  placed={runtime.sortPlaced}
                  onPlace={h.onSortPlace}
                  accent={theme.accent}
                  disabled={!playing}
                />
              ) : (
                <AnswerOptions
                  team={team}
                  options={q.options ?? []}
                  selected={runtime.progress.selectedAnswer}
                  removed={runtime.removedOptions}
                  disabled={!playing}
                  onSelect={h.onSelect}
                />
              )}
              <div className="mt-auto flex flex-col gap-2">
                {powerUpsEnabled && (
                  <PowerUps
                    hintsLeft={runtime.progress.hintsRemaining}
                    fiftyLeft={runtime.progress.fiftyFiftyRemaining}
                    hintUsed={runtime.usedHint}
                    fiftyUsed={runtime.usedFiftyFifty}
                    fiftyAvailable={!isSort && (q.options?.length ?? 0) > 2}
                    disabled={!playing}
                    onHint={h.onHint}
                    onFifty={h.onFifty}
                    onLevelMap={h.onLevelMap}
                  />
                )}
                {!isSort && (
                  <button
                    type="button"
                    onClick={h.onSubmit}
                    disabled={!playing || !runtime.progress.selectedAnswer}
                    className="btn h-16 w-full text-[1.25rem] tracking-wide text-white"
                    style={{
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.strong})`,
                      boxShadow: `0 14px 30px -12px ${theme.glow}`,
                    }}
                  >
                    <Send className="h-6 w-6" /> SUBMIT ANSWER
                  </button>
                )}
              </div>
            </>
          ) : (
            <FeedbackPanel
              team={team}
              question={q}
              correct={!!runtime.progress.isCorrect}
              selected={runtime.progress.selectedAnswer}
              points={runtime.lastPoints}
              bonus={runtime.lastBonus}
              isLast={isLast}
              onNext={h.onNext}
            />
          )}
        </motion.div>
    </div>
  );
}
