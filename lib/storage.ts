import type { GameRecord, GameSettings, Question } from '@/types/controlRoom';
import { DEFAULT_QUESTIONS } from '@/data/questionBank';
import { TEAM_THEME } from '@/lib/governance';

export const DEFAULT_SETTINGS: GameSettings = {
  missionCount: 15,
  durationSeconds: 300,
  teamNames: { knowledge: TEAM_THEME.knowledge.defaultName, heritage: TEAM_THEME.heritage.defaultName },
  soundEnabled: true,
  powerUpsEnabled: true,
  hintsPerTeam: 2,
  fiftyFiftyPerTeam: 2,
  difficulty: 'progressive',
  randomise: true,
  renderMode: 'auto',
};

/**
 * Storage boundary for the app. Every method is async so that a Firebase (or any remote) implementation
 * can replace LocalStorageRepository without touching the UI.
 */
export interface GameRepository {
  getQuestions(): Promise<Question[]>;
  saveQuestions(questions: Question[]): Promise<void>;
  resetQuestions(): Promise<Question[]>;
  getSettings(): Promise<GameSettings>;
  saveSettings(settings: GameSettings): Promise<void>;
  getGameRecords(): Promise<GameRecord[]>;
  saveGameRecord(record: GameRecord): Promise<void>;
  clearGameRecords(): Promise<void>;
}

const KEYS = {
  questions: 'gcr.questions.v1',
  settings: 'gcr.settings.v1',
  games: 'gcr.games.v1',
};
const MAX_RECORDS = 20;

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the game still runs, it just won't persist.
  }
}

class LocalStorageRepository implements GameRepository {
  async getQuestions() {
    const stored = read<Question[]>(KEYS.questions);
    return stored && stored.length > 0 ? stored : DEFAULT_QUESTIONS;
  }
  async saveQuestions(questions: Question[]) {
    write(KEYS.questions, questions);
  }
  async resetQuestions() {
    try {
      window.localStorage.removeItem(KEYS.questions);
    } catch {}
    return DEFAULT_QUESTIONS;
  }
  async getSettings() {
    const stored = read<Partial<GameSettings>>(KEYS.settings);
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      teamNames: { ...DEFAULT_SETTINGS.teamNames, ...stored?.teamNames },
    };
  }
  async saveSettings(settings: GameSettings) {
    write(KEYS.settings, settings);
  }
  async getGameRecords() {
    return read<GameRecord[]>(KEYS.games) ?? [];
  }
  async saveGameRecord(record: GameRecord) {
    const records = (read<GameRecord[]>(KEYS.games) ?? []).filter((r) => r.id !== record.id);
    write(KEYS.games, [record, ...records].slice(0, MAX_RECORDS));
  }
  async clearGameRecords() {
    try {
      window.localStorage.removeItem(KEYS.games);
    } catch {}
  }
}

export const repository: GameRepository = new LocalStorageRepository();
