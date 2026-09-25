import type { AnswerLogEntry, GameRecord, GovernmentLevel, GovernmentOrgan, QuestionCategory, TeamId } from '@/types/controlRoom';
import { CATEGORIES, LEVELS, ORGANS, TEAM_IDS } from '@/types/controlRoom';
import { LEVEL_INFO, ORGAN_INFO } from '@/lib/governance';

export interface TeamStats {
  teamId: TeamId;
  name: string;
  score: number;
  attempted: number;
  correct: number;
  accuracy: number;
  avgResponseSec: number;
  maxStreak: number;
}

export interface CategoryStat {
  category: QuestionCategory;
  attempted: number;
  correct: number;
  accuracy: number;
  byTeam: Record<TeamId, { attempted: number; correct: number }>;
}

export interface Confusion<R extends string, C extends string> {
  rows: R[];
  cols: C[];
  /** counts[row][col]: expected row, chosen col. */
  counts: Record<R, Record<C, number>>;
  total: number;
  correct: number;
}

export type LevelChoice = GovernmentLevel | 'none';
export type OrganChoice = GovernmentOrgan | 'none';

export interface GameAnalytics {
  totalAttempted: number;
  teams: Record<TeamId, TeamStats>;
  categories: CategoryStat[];
  levelConfusion: Confusion<GovernmentLevel, LevelChoice>;
  organConfusion: Confusion<GovernmentOrgan, OrganChoice>;
  mostMissed: { text: string; wrong: number; attempts: number }[];
  weakestCategory: CategoryStat | null;
  insight: string;
}

function levelFromLabel(label: string): LevelChoice | null {
  for (const l of LEVELS) if (LEVEL_INFO[l].label === label) return l;
  if (/not a government/i.test(label)) return 'none';
  return null;
}

function organFromLabel(label: string): OrganChoice | null {
  for (const o of ORGANS) if (ORGAN_INFO[o].label === label) return o;
  if (/none/i.test(label)) return 'none';
  return null;
}

function emptyMatrix<R extends string, C extends string>(rows: R[], cols: C[]): Confusion<R, C> {
  const counts = {} as Record<R, Record<C, number>>;
  for (const r of rows) {
    counts[r] = {} as Record<C, number>;
    for (const c of cols) counts[r][c] = 0;
  }
  return { rows, cols, counts, total: 0, correct: 0 };
}

function add<R extends string, C extends string>(m: Confusion<R, C>, row: R, col: C, times = 1) {
  m.counts[row][col] += times;
  m.total += times;
  if ((row as string) === (col as string)) m.correct += times;
}

function pct(correct: number, total: number) {
  return total ? Math.round((correct / total) * 100) : 0;
}

/** Largest off-diagonal cell, e.g. Legislature answered as Executive. */
function topConfusion<R extends string, C extends string>(m: Confusion<R, C>) {
  let best: { row: R; col: C; n: number } | null = null;
  for (const r of m.rows)
    for (const c of m.cols)
      if ((r as string) !== (c as string) && m.counts[r][c] > (best?.n ?? 0)) best = { row: r, col: c, n: m.counts[r][c] };
  return best;
}

function labelOf(key: string) {
  if (key === 'none') return 'not a government matter';
  if (key in LEVEL_INFO) return `${LEVEL_INFO[key as GovernmentLevel].short.toLowerCase()} government`;
  if (key in ORGAN_INFO) return ORGAN_INFO[key as GovernmentOrgan].label;
  return key;
}

export function analyseGame(record: GameRecord): GameAnalytics {
  const log = record.log;
  const teams = {} as Record<TeamId, TeamStats>;
  for (const id of TEAM_IDS) {
    const entries = log.filter((e) => e.teamId === id);
    const correct = entries.filter((e) => e.correct).length;
    teams[id] = {
      teamId: id,
      name: record.teamNames[id],
      score: record.teams[id].score,
      attempted: entries.length,
      correct,
      accuracy: pct(correct, entries.length),
      avgResponseSec: entries.length ? Math.round(entries.reduce((s, e) => s + e.responseMs, 0) / entries.length / 100) / 10 : 0,
      maxStreak: record.teams[id].maxStreak,
    };
  }

  const categories: CategoryStat[] = CATEGORIES.map((category) => {
    const entries = log.filter((e) => e.category === category);
    const byTeam = {} as CategoryStat['byTeam'];
    for (const id of TEAM_IDS) {
      const te = entries.filter((e) => e.teamId === id);
      byTeam[id] = { attempted: te.length, correct: te.filter((e) => e.correct).length };
    }
    const correct = entries.filter((e) => e.correct).length;
    return { category, attempted: entries.length, correct, accuracy: pct(correct, entries.length), byTeam };
  }).filter((c) => c.attempted > 0);

  const levelConfusion = emptyMatrix<GovernmentLevel, LevelChoice>(LEVELS, [...LEVELS, 'none']);
  const organConfusion = emptyMatrix<GovernmentOrgan, OrganChoice>(ORGANS, [...ORGANS, 'none']);
  for (const e of log) addToConfusions(e, levelConfusion, organConfusion);

  const missed = new Map<string, { text: string; wrong: number; attempts: number }>();
  for (const e of log) {
    const m = missed.get(e.questionId) ?? { text: e.questionText, wrong: 0, attempts: 0 };
    m.attempts += 1;
    if (!e.correct) m.wrong += 1;
    missed.set(e.questionId, m);
  }
  const mostMissed = Array.from(missed.values()).filter((m) => m.wrong > 0).sort((a, b) => b.wrong - a.wrong).slice(0, 3);

  const weakestCategory =
    [...categories].filter((c) => c.attempted >= 2).sort((a, b) => a.accuracy - b.accuracy)[0] ?? null;

  return {
    totalAttempted: log.length,
    teams,
    categories,
    levelConfusion,
    organConfusion,
    mostMissed,
    weakestCategory,
    insight: buildInsight(levelConfusion, organConfusion, weakestCategory),
  };
}

function addToConfusions(
  e: AnswerLogEntry,
  levels: Confusion<GovernmentLevel, LevelChoice>,
  organs: Confusion<GovernmentOrgan, OrganChoice>
) {
  if (e.type === 'sort-level' || e.type === 'sort-organ') {
    // A sort mission contributes one correct cell per card, plus a cell for every wrong try.
    for (const m of e.sortMistakes ?? []) {
      if (e.type === 'sort-level') add(levels, m.expected as GovernmentLevel, m.placed as LevelChoice);
      else add(organs, m.expected as GovernmentOrgan, m.placed as OrganChoice);
    }
    for (const k of e.sortAnswers ?? []) {
      if (e.type === 'sort-level') add(levels, k as GovernmentLevel, k as LevelChoice);
      else add(organs, k as GovernmentOrgan, k as OrganChoice);
    }
    return;
  }
  if (e.governmentOrgan) {
    const chosen = organFromLabel(e.selectedAnswer);
    const expected = organFromLabel(e.correctAnswer);
    if (chosen && expected && expected !== 'none') add(organs, expected, chosen);
    return;
  }
  if (e.governmentLevel) {
    const chosen = levelFromLabel(e.selectedAnswer);
    if (chosen) add(levels, e.governmentLevel, chosen);
  }
}

function buildInsight(
  levels: Confusion<GovernmentLevel, LevelChoice>,
  organs: Confusion<GovernmentOrgan, OrganChoice>,
  weakest: CategoryStat | null
): string {
  if (levels.total + organs.total === 0) {
    return weakest
      ? `Students found “${weakest.category}” questions the hardest (${weakest.accuracy}% correct).`
      : 'Play a full game to generate class insights.';
  }
  const lAcc = pct(levels.correct, levels.total);
  const oAcc = pct(organs.correct, organs.total);
  const lTop = topConfusion(levels);
  const oTop = topConfusion(organs);
  const strong = (a: number) => a >= 75;

  if (levels.total && organs.total) {
    if (strong(lAcc) && !strong(oAcc) && oTop)
      return `Most students understood government levels (${lAcc}% correct) but need more practice distinguishing the ${ORGAN_INFO[oTop.row].label} and the ${labelOf(oTop.col)}.`;
    if (strong(oAcc) && !strong(lAcc) && lTop)
      return `Students identified the organs of government well (${oAcc}% correct) but sometimes confused ${labelOf(lTop.row)} with ${labelOf(lTop.col)}. Revisit “how far does the issue reach?”.`;
    if (strong(lAcc) && strong(oAcc))
      return `Strong understanding across the board: ${lAcc}% on government levels and ${oAcc}% on organs of government.`;
  }
  const parts: string[] = [];
  if (levels.total) parts.push(`government levels ${lAcc}%`);
  if (organs.total) parts.push(`organs of government ${oAcc}%`);
  const conf = (oTop && (!lTop || oTop.n >= lTop.n) ? oTop : lTop) as { row: string; col: string; n: number } | null;
  return `Accuracy: ${parts.join(', ')}.${conf ? ` The most common mix-up was ${labelOf(conf.row)} answered as ${labelOf(conf.col)}.` : ''}`;
}
