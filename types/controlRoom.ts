// Data model for the Government Control Room game.

export type GovernmentLevel = 'local' | 'state' | 'national';

export type GovernmentOrgan = 'legislature' | 'executive' | 'judiciary';

export type QuestionType = 'mcq' | 'scenario' | 'sort-level' | 'sort-organ' | 'true-false';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionCategory =
  | 'Governance'
  | 'Democracy'
  | 'Government Levels'
  | 'Government Organs'
  | 'Scenario'
  | 'Classification';

export interface SortItem {
  id: string;
  text: string;
  /** A GovernmentLevel for sort-level questions, a GovernmentOrgan for sort-organ questions. */
  answer: GovernmentLevel | GovernmentOrgan;
  image?: string;
}

export interface Question {
  id: string;
  /** Situation shown as the mission (optional for pure concept questions). */
  scenario?: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  /** One-line concept shown after an incorrect answer, e.g. "The issue is primarily local in nature." */
  concept?: string;
  hint?: string;
  type: QuestionType;
  category: QuestionCategory;
  difficulty: Difficulty;
  governmentLevel?: GovernmentLevel;
  governmentOrgan?: GovernmentOrgan;
  /** Illustration key (see IssueIllustration) or an image URL. */
  image?: string;
  /** Cards for sort-level / sort-organ questions. */
  sortItems?: SortItem[];
  /** Combined-concept question reserved for the last mission. */
  finale?: boolean;
}

export type TeamId = 'knowledge' | 'heritage';

export interface TeamProgress {
  teamId: TeamId;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
  maxStreak: number;
  missionsCompleted: number;
  accuracy: number;
  selectedAnswer?: string;
  hasSubmitted: boolean;
  isCorrect?: boolean;
  hintsRemaining: number;
  fiftyFiftyRemaining: number;
}

export type DifficultyMode = 'progressive' | Difficulty;

export type RenderMode = 'auto' | '3d' | '2d';

export interface GameSettings {
  missionCount: number;
  durationSeconds: number;
  teamNames: Record<TeamId, string>;
  soundEnabled: boolean;
  powerUpsEnabled: boolean;
  hintsPerTeam: number;
  fiftyFiftyPerTeam: number;
  difficulty: DifficultyMode;
  randomise: boolean;
  renderMode: RenderMode;
}

/** One answered mission, used for analytics. */
export interface AnswerLogEntry {
  teamId: TeamId;
  questionId: string;
  questionText: string;
  type: QuestionType;
  category: QuestionCategory;
  difficulty: Difficulty;
  governmentLevel?: GovernmentLevel;
  governmentOrgan?: GovernmentOrgan;
  selectedAnswer: string;
  correctAnswer: string;
  correct: boolean;
  points: number;
  responseMs: number;
  usedHint: boolean;
  usedFiftyFifty: boolean;
  /** Wrong placements in sort missions: expected -> placed. */
  sortMistakes?: { expected: string; placed: string }[];
  /** Correct target of every card in a sort mission. */
  sortAnswers?: string[];
}

export interface GameRecord {
  id: string;
  playedAt: string;
  durationSeconds: number;
  elapsedSeconds: number;
  missionCount: number;
  teamNames: Record<TeamId, string>;
  teams: Record<TeamId, TeamProgress>;
  log: AnswerLogEntry[];
  endedBy: 'completed' | 'time';
}

export const LEVELS: GovernmentLevel[] = ['local', 'state', 'national'];
export const ORGANS: GovernmentOrgan[] = ['legislature', 'executive', 'judiciary'];
export const TEAM_IDS: TeamId[] = ['knowledge', 'heritage'];

export const CATEGORIES: QuestionCategory[] = [
  'Governance',
  'Democracy',
  'Government Levels',
  'Government Organs',
  'Scenario',
  'Classification',
];

export const QUESTION_TYPES: QuestionType[] = ['mcq', 'scenario', 'true-false', 'sort-level', 'sort-organ'];
