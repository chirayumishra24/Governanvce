export type GamePhase =
  | 'intro'
  | 'tutorial'
  | 'explore'
  | 'meeting'
  | 'budget'
  | 'project_decision'
  | 'implementing'
  | 'consequences'
  | 'follow_up'
  | 'reflection'
  | 'report'
  | 'teacher_mode';

export type CameraMode = 'walk' | 'first_person' | 'isometric' | 'top_down' | 'cinematic';

export type PriorityTier = 'high' | 'medium' | 'low';

export type SectorKey =
  | 'water'
  | 'education'
  | 'health'
  | 'roads'
  | 'sanitation'
  | 'community';

export interface SectorBudgets {
  water: number;
  education: number;
  health: number;
  roads: number;
  sanitation: number;
  community: number;
}

export interface IndicatorMetrics {
  communityWellbeing: number; // 0 - 100
  health: number;             // 0 - 100
  education: number;          // 0 - 100
  cleanliness: number;        // 0 - 100
  development: number;        // 0 - 100
}

export interface Landmark {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  position: [number, number, number];
  rotation?: number;
  iconName: string;
  status: 'Needs Attention' | 'Stable' | 'Critical Need' | 'Under Renovation' | 'Upgraded';
  associatedSector: SectorKey;
  details: string;
  color: string;
}

export interface DialogueNode {
  speaker: string;
  role: string;
  text: string;
  hindiSnippet?: string;
  options: {
    label: string;
    action: 'more_info' | 'who_affected' | 'view_location' | 'record_need' | 'close';
    responseText?: string;
  }[];
}

export interface VillagerNPC {
  id: string;
  name: string;
  role: string;
  avatar: string;
  appearance: {
    shirtColor: string;
    pantsColor: string;
    skinColor: string;
    turbanColor?: string;
    sariColor?: string;
    gender: 'male' | 'female';
  };
  position: [number, number, number];
  landmarkId: string;
  associatedSector: SectorKey;
  dialogue: DialogueNode;
  concernSpeech: string;
  happySpeech: string;
  reactionToPriority?: {
    water?: string;
    education?: string;
    health?: string;
    roads?: string;
    sanitation?: string;
  };
}

export interface CommunityNeed {
  id: string;
  title: string;
  sector: SectorKey;
  location: string;
  discovered: boolean;
  basePriority: PriorityTier;
  peopleAffected: number;
  description: string;
  consequencesIfIgnored: string;
  icon: string;
  assignedPriority?: PriorityTier;
}

export interface ProjectOption {
  id: string;
  title: string;
  sector: SectorKey;
  cost: number;
  durationMonths: number;
  beneficiariesCount: number;
  expectedImpact: 'High' | 'Medium' | 'Transformative';
  description: string;
  visualChangeDescription: string;
  indicatorImpacts: Partial<IndicatorMetrics>;
  pros: string[];
  tradeoffs: string[];
}

export interface FollowUpScenario {
  id: string;
  title: string;
  triggerEvent: string;
  scenarioDescription: string;
  choices: {
    id: string;
    title: string;
    cost: number;
    description: string;
    consequenceScoreModifier: number;
    indicatorImpacts: Partial<IndicatorMetrics>;
    outcomeText: string;
  }[];
}

export interface ReflectionAnswers {
  changedDecision: string;
  mostImportantNeed: string;
  governanceInsight: string;
}

export interface AssessmentScores {
  decisionMaking: number;      // Max 20
  prioritisation: number;      // Max 20
  resourceManagement: number;  // Max 20
  consequenceAwareness: number;// Max 20
  reflection: number;          // Max 10
  total: number;               // Max 90
  performanceLevel: 'EXCELLENT' | 'GOOD' | 'DEVELOPING' | 'BEGINNING';
  starRatings: {
    communityImpact: number;
    budgetManagement: number;
    participation: number;
    reasoning: number;
  };
  strengths: string[];
  growthAreas: string[];
}

export interface DecisionLogEntry {
  timestamp: string;
  timeDisplay: string;
  step: string;
  summary: string;
  detail: string;
  scoreImpact?: string;
}

export interface CivicBadge {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
}

export type Language = 'en' | 'hi';
export type TimeOfDay = 'day' | 'sunset' | 'night';

export interface GameState {
  studentName: string;
  phase: GamePhase;
  cameraMode: CameraMode;
  cameraZoom: number;
  language: Language;
  timeOfDay: TimeOfDay;
  isRaining: boolean;
  year: number;
  villageFund: number;
  indicators: IndicatorMetrics;
  discoveredNeeds: string[]; // need IDs
  assignedPriorities: Record<string, PriorityTier>; // needId -> priority
  sectorBudgets: SectorBudgets;
  selectedProject: ProjectOption | null;
  activeFollowUpChoice: string | null;
  reflectionAnswers: ReflectionAnswers;
  assessmentScores: AssessmentScores | null;
  decisionLogs: DecisionLogEntry[];
  tutorialStep: number;
  visitedBuildings: string[];
  interactedNpcs: string[];
  earnedBadges: string[];
  isSocialAuditDone: boolean;
  audioMuted: boolean;
  gameStartTime: number;
  gameEndTime?: number;
  isProjectCompleted: boolean;
}
