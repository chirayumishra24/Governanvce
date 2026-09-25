import { Briefcase, Building2, Globe2, Home, Landmark, Scale } from 'lucide-react';
import type { QuestionType } from '@/types/controlRoom';
import { LEVEL_INFO, ORGAN_INFO } from '@/lib/governance';
import type { SortTarget } from './SortBoard';

export const LEVEL_TARGETS: SortTarget[] = [
  { key: 'local', label: 'LOCAL', sub: 'Closest to people', color: LEVEL_INFO.local.color, icon: Home },
  { key: 'state', label: 'STATE', sub: 'Across a state', color: LEVEL_INFO.state.color, icon: Building2 },
  { key: 'national', label: 'NATIONAL', sub: 'The whole country', color: LEVEL_INFO.national.color, icon: Globe2 },
];

export const ORGAN_TARGETS: SortTarget[] = [
  { key: 'legislature', label: 'LEGISLATURE', sub: ORGAN_INFO.legislature.verb, color: ORGAN_INFO.legislature.color, icon: Landmark },
  { key: 'executive', label: 'EXECUTIVE', sub: ORGAN_INFO.executive.verb, color: ORGAN_INFO.executive.color, icon: Briefcase },
  { key: 'judiciary', label: 'JUDICIARY', sub: 'Interprets laws, resolves disputes', color: ORGAN_INFO.judiciary.color, icon: Scale },
];

export function targetsFor(type: QuestionType): SortTarget[] {
  return type === 'sort-organ' ? ORGAN_TARGETS : LEVEL_TARGETS;
}
