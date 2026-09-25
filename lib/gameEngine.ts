import type {
  AnswerLogEntry,
  GameRecord,
  GameSettings,
  Question,
  TeamId,
  TeamProgress,
} from '@/types/controlRoom';
import { LEVELS, ORGANS, TEAM_IDS } from '@/types/controlRoom';
import { activationTarget, CHAIN_BONUS, CHAIN_LENGTH, POINTS_CORRECT } from '@/lib/governance';
import { EMPTY_ROOM, type Activation, type RoomState } from '@/lib/roomState';
import { fiftyFiftyRemovals } from '@/lib/questionEngine';

export type TeamPhase = 'answering' | 'feedback' | 'done';

export interface TeamRuntime {
  progress: TeamProgress;
  queue: Question[];
  index: number;
  phase: TeamPhase;
  removedOptions: string[];
  usedHint: boolean;
  usedFiftyFifty: boolean;
  questionStartedAt: number;
  /** Sort missions: itemId -> placed target, and wrong tries. */
  sortPlaced: Record<string, string>;
  sortMistakes: { expected: string; placed: string }[];
  lastPoints: number;
  lastBonus: number;
  /** Timestamp of the last result, used to trigger effects once. */
  resultAt: number;
  chainAt: number;
}

export type GameStatus = 'briefing' | 'playing' | 'paused' | 'finale' | 'over';

export interface GameState {
  status: GameStatus;
  settings: GameSettings;
  teams: Record<TeamId, TeamRuntime>;
  log: AnswerLogEntry[];
  timeLeft: number;
  elapsed: number;
  room: RoomState;
  endedBy: 'completed' | 'time' | null;
  gameId: string;
  startedAt: string;
}

export type GameAction =
  | { type: 'start'; now: number }
  | { type: 'tick' }
  | { type: 'togglePause'; now: number }
  | { type: 'select'; team: TeamId; option: string }
  | { type: 'submit'; team: TeamId; now: number }
  | { type: 'hint'; team: TeamId; now: number }
  | { type: 'fiftyFifty'; team: TeamId }
  | { type: 'sortPlace'; team: TeamId; itemId: string; target: string; now: number }
  | { type: 'next'; team: TeamId; now: number }
  | { type: 'end'; reason: 'completed' | 'time' }
  | { type: 'finish' };

function newProgress(teamId: TeamId, settings: GameSettings): TeamProgress {
  return {
    teamId,
    score: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    maxStreak: 0,
    missionsCompleted: 0,
    accuracy: 0,
    hasSubmitted: false,
    hintsRemaining: settings.powerUpsEnabled ? settings.hintsPerTeam : 0,
    fiftyFiftyRemaining: settings.powerUpsEnabled ? settings.fiftyFiftyPerTeam : 0,
  };
}

function newTeam(teamId: TeamId, queue: Question[], settings: GameSettings): TeamRuntime {
  return {
    progress: newProgress(teamId, settings),
    queue,
    index: 0,
    phase: queue.length ? 'answering' : 'done',
    removedOptions: [],
    usedHint: false,
    usedFiftyFifty: false,
    questionStartedAt: 0,
    sortPlaced: {},
    sortMistakes: [],
    lastPoints: 0,
    lastBonus: 0,
    resultAt: 0,
    chainAt: 0,
  };
}

export function createGame(settings: GameSettings, queues: Record<TeamId, Question[]>): GameState {
  return {
    status: 'briefing',
    settings,
    teams: {
      knowledge: newTeam('knowledge', queues.knowledge, settings),
      heritage: newTeam('heritage', queues.heritage, settings),
    },
    log: [],
    timeLeft: settings.durationSeconds,
    elapsed: 0,
    room: EMPTY_ROOM,
    endedBy: null,
    gameId: `game-${Date.now().toString(36)}`,
    startedAt: new Date().toISOString(),
  };
}

export function currentQuestion(t: TeamRuntime): Question | undefined {
  return t.queue[t.index];
}

function activate(prev: Activation | null, team: TeamId, now: number): Activation {
  return { team, at: now, count: (prev?.count ?? 0) + 1 };
}

function activateRoom(room: RoomState, q: Question, team: TeamId, now: number): RoomState {
  const next: RoomState = { ...room, levels: { ...room.levels }, organs: { ...room.organs } };
  if (q.type === 'sort-level') {
    for (const l of LEVELS) next.levels[l] = activate(room.levels[l], team, now);
    return next;
  }
  if (q.type === 'sort-organ') {
    for (const o of ORGANS) next.organs[o] = activate(room.organs[o], team, now);
    return next;
  }
  const { level, organ } = activationTarget(q);
  if (level) next.levels[level] = activate(room.levels[level], team, now);
  if (organ) next.organs[organ] = activate(room.organs[organ], team, now);
  if (!level && !organ) next.core = activate(room.core, team, now);
  return next;
}

function withTeam(state: GameState, team: TeamId, patch: Partial<TeamRuntime>): GameState {
  return { ...state, teams: { ...state.teams, [team]: { ...state.teams[team], ...patch } } };
}

/** Scores a finished mission and records it for analytics. */
function resolveMission(
  state: GameState,
  team: TeamId,
  now: number,
  outcome: { correct: boolean; points: number; selected: string; sortMistakes?: { expected: string; placed: string }[] }
): GameState {
  const t = state.teams[team];
  const q = currentQuestion(t);
  if (!q) return state;
  const p = t.progress;
  const streak = outcome.correct ? p.streak + 1 : 0;
  const chain = outcome.correct && streak > 0 && streak % CHAIN_LENGTH === 0;
  const bonus = chain ? CHAIN_BONUS : 0;
  const answered = p.questionsAnswered + 1;
  const correctAnswers = p.correctAnswers + (outcome.correct ? 1 : 0);
  const progress: TeamProgress = {
    ...p,
    score: p.score + outcome.points + bonus,
    questionsAnswered: answered,
    correctAnswers,
    streak,
    maxStreak: Math.max(p.maxStreak, streak),
    missionsCompleted: p.missionsCompleted + 1,
    accuracy: Math.round((correctAnswers / answered) * 100),
    hasSubmitted: true,
    isCorrect: outcome.correct,
    selectedAnswer: outcome.selected,
  };
  const entry: AnswerLogEntry = {
    teamId: team,
    questionId: q.id,
    questionText: q.scenario ? `${q.scenario} ${q.question}` : q.question,
    type: q.type,
    category: q.category,
    difficulty: q.difficulty,
    governmentLevel: q.governmentLevel,
    governmentOrgan: q.governmentOrgan,
    selectedAnswer: outcome.selected,
    correctAnswer: q.correctAnswer,
    correct: outcome.correct,
    points: outcome.points + bonus,
    responseMs: Math.max(0, now - t.questionStartedAt),
    usedHint: t.usedHint,
    usedFiftyFifty: t.usedFiftyFifty,
    sortMistakes: outcome.sortMistakes,
    sortAnswers: q.sortItems?.map((i) => i.answer),
  };
  const next = withTeam(state, team, {
    progress,
    phase: 'feedback',
    lastPoints: outcome.points,
    lastBonus: bonus,
    resultAt: now,
    chainAt: chain ? now : t.chainAt,
  });
  return {
    ...next,
    log: [...state.log, entry],
    room: outcome.correct ? activateRoom(state.room, q, team, now) : state.room,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'start': {
      if (state.status !== 'briefing') return state;
      let s: GameState = { ...state, status: 'playing' };
      for (const id of TEAM_IDS) s = withTeam(s, id, { questionStartedAt: action.now });
      return s;
    }
    case 'togglePause': {
      if (state.status === 'playing') return { ...state, status: 'paused' };
      if (state.status === 'paused') return { ...state, status: 'playing' };
      return state;
    }
    case 'tick': {
      if (state.status !== 'playing') return state;
      const timeLeft = Math.max(0, state.timeLeft - 1);
      const s = { ...state, timeLeft, elapsed: state.elapsed + 1 };
      return timeLeft === 0 ? gameReducer(s, { type: 'end', reason: 'time' }) : s;
    }
    case 'select': {
      const t = state.teams[action.team];
      if (state.status !== 'playing' || t.phase !== 'answering') return state;
      if (t.removedOptions.includes(action.option)) return state;
      return withTeam(state, action.team, { progress: { ...t.progress, selectedAnswer: action.option } });
    }
    case 'submit': {
      const t = state.teams[action.team];
      const q = currentQuestion(t);
      const selected = t.progress.selectedAnswer;
      if (state.status !== 'playing' || t.phase !== 'answering' || !q || !selected) return state;
      const correct = selected === q.correctAnswer;
      return resolveMission(state, action.team, action.now, {
        correct,
        points: correct ? POINTS_CORRECT : 0,
        selected,
      });
    }
    case 'hint': {
      const t = state.teams[action.team];
      const q = currentQuestion(t);
      if (state.status !== 'playing' || t.phase !== 'answering' || !q || t.usedHint || t.progress.hintsRemaining <= 0)
        return state;
      const { level, organ } = activationTarget(q);
      const s = withTeam(state, action.team, {
        usedHint: true,
        progress: { ...t.progress, hintsRemaining: t.progress.hintsRemaining - 1 },
      });
      const hints = [...state.room.hints.filter((h) => action.now - h.at < 8000)];
      if (level || organ) hints.push({ level, organ, at: action.now });
      return { ...s, room: { ...s.room, hints } };
    }
    case 'fiftyFifty': {
      const t = state.teams[action.team];
      const q = currentQuestion(t);
      if (state.status !== 'playing' || t.phase !== 'answering' || !q || t.usedFiftyFifty) return state;
      if (t.progress.fiftyFiftyRemaining <= 0 || !q.options || q.options.length <= 2) return state;
      const removed = fiftyFiftyRemovals(q);
      const selected = t.progress.selectedAnswer && removed.includes(t.progress.selectedAnswer) ? undefined : t.progress.selectedAnswer;
      return withTeam(state, action.team, {
        usedFiftyFifty: true,
        removedOptions: removed,
        progress: { ...t.progress, fiftyFiftyRemaining: t.progress.fiftyFiftyRemaining - 1, selectedAnswer: selected },
      });
    }
    case 'sortPlace': {
      const t = state.teams[action.team];
      const q = currentQuestion(t);
      if (state.status !== 'playing' || t.phase !== 'answering' || !q?.sortItems) return state;
      const item = q.sortItems.find((i) => i.id === action.itemId);
      if (!item || t.sortPlaced[item.id]) return state;
      if (item.answer !== action.target) {
        return withTeam(state, action.team, {
          sortMistakes: [...t.sortMistakes, { expected: item.answer, placed: action.target }],
        });
      }
      const sortPlaced = { ...t.sortPlaced, [item.id]: action.target };
      const s = withTeam(state, action.team, { sortPlaced });
      if (Object.keys(sortPlaced).length < q.sortItems.length) return s;
      const mistakes = t.sortMistakes.length;
      return resolveMission(s, action.team, action.now, {
        correct: mistakes === 0,
        points: Math.max(25, POINTS_CORRECT - mistakes * 25),
        selected: mistakes === 0 ? 'all-placed' : `${mistakes} wrong tries`,
        sortMistakes: t.sortMistakes,
      });
    }
    case 'next': {
      const t = state.teams[action.team];
      if (t.phase !== 'feedback') return state;
      const index = t.index + 1;
      const done = index >= t.queue.length;
      let s = withTeam(state, action.team, {
        index,
        phase: done ? 'done' : 'answering',
        removedOptions: [],
        usedHint: false,
        usedFiftyFifty: false,
        sortPlaced: {},
        sortMistakes: [],
        questionStartedAt: action.now,
        progress: { ...t.progress, selectedAnswer: undefined, hasSubmitted: false, isCorrect: undefined },
      });
      if (TEAM_IDS.every((id) => s.teams[id].phase === 'done')) s = gameReducer(s, { type: 'end', reason: 'completed' });
      return s;
    }
    case 'end': {
      if (state.status === 'finale' || state.status === 'over') return state;
      return { ...state, status: 'finale', endedBy: action.reason, room: { ...state.room, system: true } };
    }
    case 'finish':
      return { ...state, status: 'over' };
    default:
      return state;
  }
}

export function toGameRecord(state: GameState): GameRecord {
  return {
    id: state.gameId,
    playedAt: state.startedAt,
    durationSeconds: state.settings.durationSeconds,
    elapsedSeconds: state.elapsed,
    missionCount: state.settings.missionCount,
    teamNames: state.settings.teamNames,
    teams: { knowledge: state.teams.knowledge.progress, heritage: state.teams.heritage.progress },
    log: state.log,
    endedBy: state.endedBy ?? 'completed',
  };
}
