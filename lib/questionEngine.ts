import type { GameSettings, Question, TeamId } from '@/types/controlRoom';

/** Progression stages: 1 governance basics, 2 levels, 3 organs, 4 mixed scenarios, 5 application. */
export type Stage = 1 | 2 | 3 | 4 | 5;

export const STAGE_LABELS: Record<Stage, string> = {
  1: 'What is governance?',
  2: 'Levels of government',
  3: 'Organs of government',
  4: 'Mixed scenarios',
  5: 'Higher-order application',
};

export function stageOf(q: Question): Stage {
  if (q.difficulty === 'hard' || q.finale) return 5;
  switch (q.category) {
    case 'Governance':
    case 'Democracy':
      return 1;
    case 'Government Levels':
      return 2;
    case 'Government Organs':
      return 3;
    default:
      return 4;
  }
}

export function isPlayable(q: Question): boolean {
  if (q.type === 'sort-level' || q.type === 'sort-organ') return !!q.sortItems && q.sortItems.length > 0;
  return !!q.options && q.options.length >= 2 && q.options.includes(q.correctAnswer);
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Spread `slots` missions across the five stages, earlier stages first. */
function stagePlan(slots: number): Stage[] {
  const base = Math.floor(slots / 5);
  const extra = slots % 5;
  const plan: Stage[] = [];
  ([1, 2, 3, 4, 5] as Stage[]).forEach((stage, i) => {
    const count = base + (i < extra ? 1 : 0);
    for (let k = 0; k < count; k++) plan.push(stage);
  });
  return plan;
}

/**
 * Builds two separate mission queues of matching difficulty.
 * Each slot takes a pair of different questions from the same stage, preferring the same question type,
 * so both teams face equivalent missions without seeing the same one.
 */
export function buildQueues(bank: Question[], settings: GameSettings): Record<TeamId, Question[]> {
  const order = settings.randomise ? shuffle : <T,>(a: T[]) => [...a];
  const playable = bank.filter(isPlayable);
  const count = Math.max(1, settings.missionCount);

  let pool = playable.filter((q) => !q.finale);
  if (settings.difficulty !== 'progressive') {
    const filtered = pool.filter((q) => q.difficulty === settings.difficulty);
    if (filtered.length >= count * 2) pool = filtered;
    else pool = [...filtered, ...pool.filter((q) => q.difficulty !== settings.difficulty)];
  }
  let remaining = order(pool);
  const finales = order(playable.filter((q) => q.finale));

  const queues: Record<TeamId, Question[]> = { knowledge: [], heritage: [] };
  const useFinale = finales.length > 0 && count >= 3;
  const plan = stagePlan(useFinale ? count - 1 : count);

  const typesUsed = new Map<string, number>();
  for (const stage of plan) {
    if (remaining.length === 0) remaining = order(pool);
    const inStage = remaining.filter((q) => stageOf(q) === stage);
    const candidates =
      inStage.length >= 2
        ? inStage
        : [...remaining].sort((a, b) => Math.abs(stageOf(a) - stage) - Math.abs(stageOf(b) - stage));
    // Balance question types: prefer a type this stage has used least (keeps sort missions in the mix).
    const used = (q: Question) => typesUsed.get(`${stage}:${q.type}`) ?? 0;
    const pairable = candidates.filter((q) => candidates.some((o) => o !== q && o.type === q.type));
    const a = [...(pairable.length ? pairable : candidates)].sort((x, y) => used(x) - used(y))[0];
    typesUsed.set(`${stage}:${a.type}`, used(a) + 1);
    const others = candidates.filter((q) => q.id !== a.id);
    const b = others.find((q) => q.type === a.type) ?? others[0] ?? a;
    queues.knowledge.push(a);
    queues.heritage.push(b);
    remaining = remaining.filter((q) => q.id !== a.id && q.id !== b.id);
  }

  if (useFinale) {
    queues.knowledge.push(finales[0]);
    queues.heritage.push(finales[1] ?? finales[0]);
  }
  return queues;
}

/** Returns the two wrong options to hide for the 50/50 power-up. */
export function fiftyFiftyRemovals(q: Question): string[] {
  if (!q.options || q.options.length <= 2) return [];
  const wrong = shuffle(q.options.filter((o) => o !== q.correctAnswer));
  return wrong.slice(0, Math.min(2, q.options.length - 2));
}
