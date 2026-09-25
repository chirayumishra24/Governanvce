import type { GovernmentLevel, GovernmentOrgan, Question, TeamId } from '@/types/controlRoom';

export const LEVEL_OPTIONS = [
  'National Government',
  'State Government',
  'Local Government',
  'Not a government responsibility',
];

export const ORGAN_OPTIONS = ['Legislature', 'Executive', 'Judiciary', 'None of these'];

export const LEVEL_INFO: Record<
  GovernmentLevel,
  { label: string; short: string; summary: string; examples: string[]; color: string; explore: string }
> = {
  national: {
    label: 'National Government',
    short: 'NATIONAL',
    summary: 'Handles matters that concern the whole country.',
    examples: ['Defence', 'Foreign affairs', 'National policies', 'Country-wide matters'],
    color: '#B7860B',
    explore:
      'The National Government looks after matters that affect every part of India at once, such as protecting the borders, dealing with other countries, and policies that apply across the whole country.',
  },
  state: {
    label: 'State Government',
    short: 'STATE',
    summary: 'Handles matters across an entire state.',
    examples: ['Education programmes', 'Health services', 'State roads', 'Law and order'],
    color: '#0E8F80',
    explore:
      'Each State Government looks after matters across its own state, such as programmes for schools and hospitals in the state, roads that connect its towns, and keeping law and order.',
  },
  local: {
    label: 'Local Government',
    short: 'LOCAL',
    summary: 'Handles matters closest to people’s everyday lives.',
    examples: ['Local roads', 'Clean water', 'Parks and public spaces', 'Waste collection'],
    color: '#2E9A48',
    explore:
      'Local Government works closest to people. It looks after the everyday needs of a village, town or neighbourhood, such as street repair, drinking water, waste collection and parks.',
  },
};

export const ORGAN_INFO: Record<
  GovernmentOrgan,
  { label: string; role: string; verb: string; explore: string; examples: string[]; color: string }
> = {
  legislature: {
    label: 'Legislature',
    color: '#6B5BD6',
    role: 'Makes and discusses laws',
    verb: 'Makes laws',
    explore:
      'The Legislature is the organ where elected representatives discuss issues, debate proposals and make laws for the people.',
    examples: ['Discussing a proposed law', 'Voting on a new law', 'Changing an old law'],
  },
  executive: {
    label: 'Executive',
    color: '#0284C7',
    role: 'Implements laws and decisions',
    verb: 'Implements decisions',
    explore:
      'The Executive puts laws and decisions into action. It runs programmes, provides services and manages the day-to-day work of government.',
    examples: ['Running a school meal programme', 'Carrying out an approved policy', 'Managing public services'],
  },
  judiciary: {
    label: 'Judiciary',
    color: '#B4346C',
    role: 'Interprets laws and resolves disputes',
    verb: 'Interprets laws and resolves disputes',
    explore:
      'The Judiciary is made up of the courts. It explains what laws mean and settles disputes fairly according to the law.',
    examples: ['Settling a disagreement', 'Explaining how a law applies', 'Deciding a legal case'],
  },
};

export const TEAM_THEME: Record<
  TeamId,
  { accent: string; soft: string; strong: string; tagline: string; defaultName: string; glow: string }
> = {
  knowledge: {
    accent: '#1F6FEB',
    soft: '#E8F1FE',
    strong: '#1557C0',
    glow: 'rgba(31,111,235,0.45)',
    tagline: 'Explore • Analyse • Decide',
    defaultName: 'Team Knowledge',
  },
  heritage: {
    accent: '#F26B1D',
    soft: '#FEF0E6',
    strong: '#C9510D',
    glow: 'rgba(242,107,29,0.45)',
    tagline: 'Observe • Think • Solve',
    defaultName: 'Team Heritage',
  },
};

/** What part of the control room lights up when a question is answered correctly. */
export function activationTarget(q: Question): { level?: GovernmentLevel; organ?: GovernmentOrgan } {
  if (q.type === 'sort-level' || q.type === 'sort-organ') return {};
  return { level: q.governmentLevel, organ: q.governmentOrgan };
}

export function activationLabel(q: Question): string {
  if (q.type === 'sort-level') return 'ALL GOVERNMENT LEVELS ACTIVATED';
  if (q.type === 'sort-organ') return 'ALL ORGANS OF GOVERNMENT ACTIVATED';
  if (q.governmentOrgan) return `${ORGAN_INFO[q.governmentOrgan].label.toUpperCase()} ACTIVATED`;
  if (q.governmentLevel) return `${LEVEL_INFO[q.governmentLevel].label.toUpperCase()} ACTIVATED`;
  return 'GOVERNANCE CORE ACTIVATED';
}

export function sortTargetLabel(key: string): string {
  if (key in LEVEL_INFO) return LEVEL_INFO[key as GovernmentLevel].short;
  if (key in ORGAN_INFO) return ORGAN_INFO[key as GovernmentOrgan].label.toUpperCase();
  return key.toUpperCase();
}

export const POINTS_CORRECT = 100;
export const CHAIN_BONUS = 150;
export const CHAIN_LENGTH = 3;
