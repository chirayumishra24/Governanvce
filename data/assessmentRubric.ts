import {
  GameState,
  AssessmentScores,
  PriorityTier,
  SectorBudgets,
  ReflectionAnswers,
} from '@/types/game';

export function calculateAssessmentScores(state: GameState): AssessmentScores {
  // 1. DECISION MAKING (Max 20 pts)
  // Evaluates: Project choice alignment with urgent community needs, discovering needs beforehand, and consultative approach.
  let decisionScore = 14;
  if (state.selectedProject) {
    if (state.selectedProject.id === 'proj_water' || state.selectedProject.id === 'proj_sanitation') {
      decisionScore += 4; // High urgency needs addressed
    } else if (state.selectedProject.id === 'proj_school' || state.selectedProject.id === 'proj_road') {
      decisionScore += 3;
    } else {
      decisionScore += 2;
    }
  }
  // Bonus for discovering multiple needs before deciding
  const discoveredCount = state.discoveredNeeds.length;
  if (discoveredCount >= 5) decisionScore += 2;
  else if (discoveredCount >= 3) decisionScore += 1;
  decisionScore = Math.min(20, Math.max(10, decisionScore));

  // 2. PRIORITISATION (Max 20 pts)
  // Evaluates: Assigning high priority to water and sanitation (or education/roads according to population affected).
  let prioritisationScore = 12;
  const priorities = state.assignedPriorities;
  if (priorities['need_water'] === 'high') prioritisationScore += 3;
  if (priorities['need_sanitation'] === 'high' || priorities['need_sanitation'] === 'medium') prioritisationScore += 2;
  if (priorities['need_school'] === 'medium' || priorities['need_school'] === 'high') prioritisationScore += 2;
  if (priorities['need_road'] === 'medium' || priorities['need_road'] === 'high') prioritisationScore += 1;
  // Penalty for leaving high urgent needs unranked or low
  if (priorities['need_water'] === 'low') prioritisationScore -= 2;
  prioritisationScore = Math.min(20, Math.max(8, prioritisationScore));

  // 3. RESOURCE MANAGEMENT (Max 20 pts)
  // Evaluates: Staying within ₹100,000 budget, not leaving excessive unallocated surplus, and balanced sector investments.
  let resourceScore = 12;
  const budgets = state.sectorBudgets;
  const totalAllocated = Object.values(budgets).reduce((a, b) => a + b, 0);

  if (totalAllocated <= 100000 && totalAllocated >= 90000) {
    resourceScore += 4; // Efficient high utilization
  } else if (totalAllocated <= 100000 && totalAllocated >= 75000) {
    resourceScore += 3;
  } else if (totalAllocated > 100000) {
    resourceScore -= 4; // Overspending penalty
  }

  // Count non-zero sectors (diversified coverage)
  const activeSectors = Object.values(budgets).filter((v) => v > 0).length;
  if (activeSectors >= 4) resourceScore += 3;
  else if (activeSectors >= 3) resourceScore += 2;

  if (budgets.water >= 15000) resourceScore += 1;
  resourceScore = Math.min(20, Math.max(8, resourceScore));

  // 4. CONSEQUENCE AWARENESS (Max 20 pts)
  // Evaluates: Handling of 3-month follow-up crisis and awareness of indicators.
  let consequenceScore = 12;
  if (state.activeFollowUpChoice === 'choice_community_shramdaan') {
    consequenceScore += 6; // Democratic community empowerment
  } else if (state.activeFollowUpChoice === 'choice_hire_external_contractor') {
    consequenceScore += 4;
  } else {
    consequenceScore += 1;
  }

  // Bonus for overall indicator health
  const avgIndicator =
    (state.indicators.communityWellbeing +
      state.indicators.health +
      state.indicators.education +
      state.indicators.cleanliness +
      state.indicators.development) /
    5;
  if (avgIndicator >= 65) consequenceScore += 2;
  else if (avgIndicator >= 55) consequenceScore += 1;
  consequenceScore = Math.min(20, Math.max(8, consequenceScore));

  // 5. REFLECTION (Max 10 pts)
  // Evaluates: Depth of responses in guided reflection
  let reflectionScore = 0;
  const ans = state.reflectionAnswers;
  if (ans.changedDecision && ans.changedDecision.trim().length > 10) reflectionScore += 3.5;
  if (ans.mostImportantNeed && ans.mostImportantNeed.trim().length > 10) reflectionScore += 3.5;
  if (ans.governanceInsight && ans.governanceInsight.trim().length > 10) reflectionScore += 3;
  reflectionScore = Math.min(10, Math.max(4, Math.round(reflectionScore)));

  const total = decisionScore + prioritisationScore + resourceScore + consequenceScore + reflectionScore;

  let performanceLevel: 'EXCELLENT' | 'GOOD' | 'DEVELOPING' | 'BEGINNING' = 'GOOD';
  if (total >= 78) performanceLevel = 'EXCELLENT';
  else if (total >= 62) performanceLevel = 'GOOD';
  else if (total >= 48) performanceLevel = 'DEVELOPING';
  else performanceLevel = 'BEGINNING';

  const strengths: string[] = [];
  const growthAreas: string[] = [];

  if (decisionScore >= 16) {
    strengths.push('Demonstrated strong empathy by directly consulting villagers and identifying vulnerable households.');
  } else {
    growthAreas.push('Spend more time exploring all village wards to identify hidden infrastructure challenges before making decisions.');
  }

  if (prioritisationScore >= 16) {
    strengths.push('Skillfully prioritized urgent health and water needs while balancing long-term educational growth.');
  } else {
    growthAreas.push('Review the number of citizens affected by each issue to prioritize urgent lifelines like safe drinking water.');
  }

  if (resourceScore >= 16) {
    strengths.push('Maintained outstanding financial discipline by utilizing the ₹100,000 fund across balanced community sectors.');
  } else {
    growthAreas.push('Practice budgeting across multiple essential sectors rather than concentrating all funds in a single category.');
  }

  if (consequenceScore >= 16) {
    strengths.push('Showed proactive civic leadership during the seasonal monsoon crisis by empowering community Shramdaan.');
  } else {
    growthAreas.push('Consider proactive community participation strategies when planning long-term infrastructure maintenance.');
  }

  return {
    decisionMaking: decisionScore,
    prioritisation: prioritisationScore,
    resourceManagement: resourceScore,
    consequenceAwareness: consequenceScore,
    reflection: reflectionScore,
    total,
    performanceLevel,
    starRatings: {
      communityImpact: Math.min(5, Math.max(3, Math.round(decisionScore / 4))),
      budgetManagement: Math.min(5, Math.max(3, Math.round(resourceScore / 4))),
      participation: Math.min(5, Math.max(3, Math.round(prioritisationScore / 4))),
      reasoning: Math.min(5, Math.max(3, Math.round((consequenceScore + reflectionScore) / 6))),
    },
    strengths,
    growthAreas,
  };
}

export const TEACHER_RUBRIC_DESCRIPTIONS = {
  EXCELLENT: {
    badge: '🌟 Master Bal Sarpanch',
    summary: 'Considers multiple community needs, manages resources responsibly, understands long-term consequences, and articulates transparent governance reasoning.',
    range: '78–90 Points',
  },
  GOOD: {
    badge: '🎖️ Skilled Democratic Leader',
    summary: 'Makes sound civic decisions, prioritizes key basic amenities, and balances most village funds effectively.',
    range: '62–77 Points',
  },
  DEVELOPING: {
    badge: '🌱 Emerging Decision Maker',
    summary: 'Identifies immediate village needs but requires support in balancing budgets and anticipating future maintenance challenges.',
    range: '48–61 Points',
  },
  BEGINNING: {
    badge: '📘 Civic Explorer',
    summary: 'Requires structured guidance to map citizen concerns, prioritize collective lifelines, and manage municipal allocations.',
    range: 'Below 48 Points',
  },
};
