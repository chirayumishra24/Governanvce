'use client';

import React, { useState, useEffect } from 'react';
import { GameState, GamePhase, CameraMode, PriorityTier, SectorBudgets, ProjectOption, ReflectionAnswers, AssessmentScores, DecisionLogEntry } from '@/types/game';
import { INITIAL_INDICATORS, INITIAL_FUND, NPCS, LANDMARKS, COMMUNITY_NEEDS } from '@/data/villageData';
import { calculateAssessmentScores } from '@/data/assessmentRubric';
import { soundEngine } from '@/components/ui/AudioController';

// 3D Canvas
import { VillageCanvas } from '@/components/3d/VillageCanvas';

// HUD Components
import { TopNavBar } from '@/components/hud/TopNavBar';
import { BottomNav } from '@/components/hud/BottomNav';
import { MiniMapModal } from '@/components/hud/MiniMapModal';
import { VillagersListModal } from '@/components/hud/VillagersListModal';
import { NeedsLedgerDrawer } from '@/components/hud/NeedsLedgerDrawer';
import { NpcDialogueModal } from '@/components/dialogue/NpcDialogueModal';

// Stages & Game Loops
import { IntroScreen } from '@/components/stages/IntroScreen';
import { TutorialOverlay } from '@/components/stages/TutorialOverlay';
import { MissionBriefingModal } from '@/components/dialogue/MissionBriefingModal';
import { MISSION_BRIEFINGS } from '@/data/missionBriefingsData';
import { GramSabhaMeeting } from '@/components/stages/GramSabhaMeeting';
import { BudgetPlanner } from '@/components/stages/BudgetPlanner';
import { ProjectSelector } from '@/components/stages/ProjectSelector';
import { ConstructionCutscene } from '@/components/stages/ConstructionCutscene';
import { ConsequenceReview } from '@/components/stages/ConsequenceReview';
import { FollowUpEventModal } from '@/components/stages/FollowUpEventModal';
import { ReflectionForm } from '@/components/stages/ReflectionForm';
import { FinalReportCard } from '@/components/stages/FinalReportCard';
import { TeacherDashboard } from '@/components/stages/TeacherDashboard';
import { VirtualJoystick } from '@/components/ui/VirtualJoystick';

const STORAGE_KEY = 'governance_lab_state_v1';

const getInitialState = (): GameState => ({
  studentName: '',
  phase: 'intro',
  cameraMode: 'walk',
  cameraZoom: 9.5,
  year: 1,
  villageFund: INITIAL_FUND,
  indicators: { ...INITIAL_INDICATORS },
  discoveredNeeds: ['need_water'], // Initial discovered need from village briefing
  assignedPriorities: {
    need_water: 'high',
    need_sanitation: 'high',
    need_school: 'medium',
    need_road: 'medium',
    need_health: 'medium',
    need_community: 'low',
  },
  sectorBudgets: {
    water: 30000,
    education: 20000,
    sanitation: 20000,
    roads: 15000,
    health: 10000,
    community: 5000,
  },
  selectedProject: null,
  activeFollowUpChoice: null,
  reflectionAnswers: {
    changedDecision: '',
    mostImportantNeed: '',
    governanceInsight: '',
  },
  assessmentScores: null,
  decisionLogs: [],
  tutorialStep: 0,
  visitedBuildings: [],
  interactedNpcs: [],
  audioMuted: false,
  gameStartTime: Date.now(),
  isProjectCompleted: false,
});

export default function GovernanceLabPage() {
  const [gameState, setGameState] = useState<GameState>(getInitialState);
  const [isClient, setIsClient] = useState(false);

  // Modals visibility state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isVillagersOpen, setIsVillagersOpen] = useState(false);
  const [isNeedsOpen, setIsNeedsOpen] = useState(false);
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isConsequencesOpen, setIsConsequencesOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isTeacherModeOpen, setIsTeacherModeOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [activeBriefingKey, setActiveBriefingKey] = useState<string>('mission_1_explore');

  // Active interaction focus
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [teleportTarget, setTeleportTarget] = useState<[number, number] | null>(null);

  // Load from local storage
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setGameState(parsed);
      }
    } catch (e) {
      console.warn('Could not load saved state', e);
    }
  }, []);

  // Auto-save to local storage
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn('Could not save state', e);
    }
  }, [gameState, isClient]);

  const addDecisionLog = (step: string, summary: string, detail: string) => {
    const now = new Date();
    const timeDisplay = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const entry: DecisionLogEntry = {
      timestamp: now.toISOString(),
      timeDisplay,
      step,
      summary,
      detail,
    };
    setGameState((prev) => ({
      ...prev,
      decisionLogs: [entry, ...prev.decisionLogs],
    }));
  };

  const handleStartGame = (name: string) => {
    setGameState((prev) => ({
      ...prev,
      studentName: name,
      phase: 'explore',
    }));
    setActiveBriefingKey('mission_1_explore');
    setIsBriefingOpen(true);
    addDecisionLog('Initiation', 'Assumed Bal Sarpanch Office', `Student ${name} commenced village administration.`);
  };

  const handleToggleCamera = () => {
    setGameState((prev) => ({
      ...prev,
      cameraMode: prev.cameraMode === 'walk' ? 'isometric' : 'walk',
    }));
  };

  const handleToggleAudio = () => {
    const nextMuted = !gameState.audioMuted;
    soundEngine.setMuted(nextMuted);
    setGameState((prev) => ({
      ...prev,
      audioMuted: nextMuted,
    }));
  };

  const handleSelectNPC = (npcId: string) => {
    setActiveNpcId(npcId);
    setIsDialogueOpen(true);
    setGameState((prev) => {
      const updatedNpcs = prev.interactedNpcs.includes(npcId)
        ? prev.interactedNpcs
        : [...prev.interactedNpcs, npcId];
      return { ...prev, interactedNpcs: updatedNpcs };
    });
  };

  const handleSelectLandmark = (landmarkId: string) => {
    setIsMapOpen(true);
    setGameState((prev) => {
      const updated = prev.visitedBuildings.includes(landmarkId)
        ? prev.visitedBuildings
        : [...prev.visitedBuildings, landmarkId];
      return { ...prev, visitedBuildings: updated };
    });
  };

  const handleRecordNeed = (sector: string) => {
    const matchingNeed = COMMUNITY_NEEDS.find((n) => n.sector === sector);
    if (matchingNeed) {
      setGameState((prev) => {
        if (!prev.discoveredNeeds.includes(matchingNeed.id)) {
          addDecisionLog('Discovery', `Identified ${matchingNeed.title}`, `Logged community issue affecting ${matchingNeed.peopleAffected} citizens.`);
          return {
            ...prev,
            discoveredNeeds: [...prev.discoveredNeeds, matchingNeed.id],
          };
        }
        return prev;
      });
    }
  };

  const handleUpdatePriority = (needId: string, tier: PriorityTier) => {
    setGameState((prev) => {
      const updatedPriorities = {
        ...prev.assignedPriorities,
        [needId]: tier,
      };
      return {
        ...prev,
        assignedPriorities: updatedPriorities,
      };
    });
  };

  const handleConfirmPrioritiesAndProceedToBudget = () => {
    setIsMeetingOpen(false);
    setActiveBriefingKey('mission_3_budget');
    setIsBriefingOpen(true);
    addDecisionLog('Gram Sabha', 'Priorities Ratified', 'Community issues organized into democratic priority tiers.');
  };

  const handleUpdateBudgets = (newBudgets: SectorBudgets) => {
    setGameState((prev) => ({
      ...prev,
      sectorBudgets: newBudgets,
    }));
  };

  const handleProceedToProjectSelection = () => {
    setIsBudgetOpen(false);
    setActiveBriefingKey('mission_4_project');
    setIsBriefingOpen(true);
    const totalAllocated = Object.values(gameState.sectorBudgets).reduce((a, b) => a + b, 0);
    addDecisionLog('Budget Allocation', 'Panchayat Fund Allocated', `Distributed ₹${totalAllocated.toLocaleString('en-IN')} across 6 public sectors.`);
  };

  const handleSelectProject = (project: ProjectOption) => {
    setIsProjectsOpen(false);
    setGameState((prev) => ({
      ...prev,
      selectedProject: project,
      phase: 'implementing',
    }));
    addDecisionLog('Decision', `Sanctioned: ${project.title}`, `Approved infrastructure cost of ₹${project.cost.toLocaleString('en-IN')} for ${project.beneficiariesCount} beneficiaries.`);
  };

  const handleFinishConstruction = () => {
    if (!gameState.selectedProject) return;

    // Apply indicators impact
    const impacts = gameState.selectedProject.indicatorImpacts;
    const updatedIndicators = {
      communityWellbeing: Math.min(100, gameState.indicators.communityWellbeing + (impacts.communityWellbeing || 0)),
      health: Math.min(100, gameState.indicators.health + (impacts.health || 0)),
      education: Math.min(100, gameState.indicators.education + (impacts.education || 0)),
      cleanliness: Math.min(100, gameState.indicators.cleanliness + (impacts.cleanliness || 0)),
      development: Math.min(100, gameState.indicators.development + (impacts.development || 0)),
    };

    setGameState((prev) => ({
      ...prev,
      phase: 'consequences',
      indicators: updatedIndicators,
      isProjectCompleted: true,
      villageFund: Math.max(0, prev.villageFund - (prev.selectedProject?.cost || 0)),
    }));

    setIsConsequencesOpen(true);
    addDecisionLog('Implementation', 'Inaugurated Village Project', 'Project physically completed and operational in the 3D village.');
  };

  const handleProceedToFollowUp = () => {
    setIsConsequencesOpen(false);
    setActiveBriefingKey('mission_5_followup');
    setIsBriefingOpen(true);
  };

  const handleSelectFollowUpChoice = (choiceId: string) => {
    setGameState((prev) => ({
      ...prev,
      activeFollowUpChoice: choiceId,
    }));
  };

  const handleProceedToReflection = () => {
    setIsFollowUpOpen(false);
    setIsReflectionOpen(true);
    addDecisionLog('Resilience', 'Handled Seasonal Monsoon Challenge', 'Responded to seasonal asset maintenance test.');
  };

  const handleSaveReflection = (answers: ReflectionAnswers) => {
    setGameState((prev) => ({
      ...prev,
      reflectionAnswers: answers,
    }));
  };

  const handleGenerateReport = () => {
    setIsReflectionOpen(false);
    const scores = calculateAssessmentScores(gameState);
    setGameState((prev) => ({
      ...prev,
      assessmentScores: scores,
      phase: 'report',
      gameEndTime: Date.now(),
    }));
    setIsReportOpen(true);
    addDecisionLog('Assessment', 'Final Evaluation Generated', `Scored ${scores.total}/90 across 4 dimensions.`);
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(getInitialState());
    setIsReportOpen(false);
    setIsTeacherModeOpen(false);
  };

  const activeNpc = NPCS.find((n) => n.id === activeNpcId) || NPCS[0];
  const activeNeedForNpc = COMMUNITY_NEEDS.find((n) => n.sector === activeNpc.associatedSector);
  const isNeedDiscovered = activeNeedForNpc ? gameState.discoveredNeeds.includes(activeNeedForNpc.id) : false;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D Interactive Canvas */}
      <VillageCanvas
        cameraMode={gameState.cameraMode}
        onChangeCameraMode={(mode) => setGameState((prev) => ({ ...prev, cameraMode: mode }))}
        onSelectNPC={handleSelectNPC}
        onSelectLandmark={handleSelectLandmark}
        selectedProject={gameState.selectedProject}
        isProjectCompleted={gameState.isProjectCompleted}
        discoveredNeeds={gameState.discoveredNeeds}
        teleportTarget={teleportTarget}
        onClearTeleport={() => setTeleportTarget(null)}
      />

      {/* Mobile Touch Joystick */}
      <VirtualJoystick
        onMove={(x, y) => {
          // Touch movement
        }}
      />

      {/* Top HUD */}
      {gameState.phase !== 'intro' && (
        <TopNavBar
          studentName={gameState.studentName}
          villageFund={gameState.villageFund}
          indicators={gameState.indicators}
          cameraMode={gameState.cameraMode}
          onToggleCamera={handleToggleCamera}
          audioMuted={gameState.audioMuted}
          onToggleAudio={handleToggleAudio}
          onOpenTeacherMode={() => setIsTeacherModeOpen(true)}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onOpenBriefing={() => setIsBriefingOpen(true)}
        />
      )}

      {/* MISSION BRIEFING MODAL (Didi Ananya & Kaka Rajesh) */}
      <MissionBriefingModal
        briefing={MISSION_BRIEFINGS[activeBriefingKey] || MISSION_BRIEFINGS['mission_1_explore']}
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        onStartMission={() => {
          setIsBriefingOpen(false);
          if (activeBriefingKey === 'mission_1_explore') {
            setIsTutorialOpen(true);
          } else if (activeBriefingKey === 'mission_2_meeting') {
            setIsMeetingOpen(true);
          } else if (activeBriefingKey === 'mission_3_budget') {
            setIsBudgetOpen(true);
          } else if (activeBriefingKey === 'mission_4_project') {
            setIsProjectsOpen(true);
          } else if (activeBriefingKey === 'mission_5_followup') {
            setIsFollowUpOpen(true);
          }
        }}
      />

      {/* Bottom HUD Nav */}
      {gameState.phase !== 'intro' && (
        <BottomNav
          currentPhase={gameState.phase}
          discoveredNeedsCount={gameState.discoveredNeeds.length}
          totalNeedsCount={COMMUNITY_NEEDS.length}
          onOpenMap={() => setIsMapOpen(true)}
          onOpenVillagers={() => setIsVillagersOpen(true)}
          onOpenNeeds={() => setIsNeedsOpen(true)}
          onOpenMeeting={() => {
            setActiveBriefingKey('mission_2_meeting');
            setIsBriefingOpen(true);
          }}
          onOpenProjects={() => {
            setActiveBriefingKey('mission_4_project');
            setIsBriefingOpen(true);
          }}
          onOpenBudget={() => {
            setActiveBriefingKey('mission_3_budget');
            setIsBriefingOpen(true);
          }}
          onOpenReport={() => {
            if (!gameState.assessmentScores) {
              const sc = calculateAssessmentScores(gameState);
              setGameState((prev) => ({ ...prev, assessmentScores: sc }));
            }
            setIsReportOpen(true);
          }}
        />
      )}

      {/* SCREEN 1: INTRO SCREEN */}
      {gameState.phase === 'intro' && (
        <IntroScreen
          onStart={handleStartGame}
          onOpenTeacherMode={() => setIsTeacherModeOpen(true)}
        />
      )}

      {/* SCREEN 2: TUTORIAL OVERLAY */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* NPC DIALOGUE MODAL */}
      <NpcDialogueModal
        npc={activeNpc}
        isOpen={isDialogueOpen}
        onClose={() => setIsDialogueOpen(false)}
        onRecordNeed={handleRecordNeed}
        isNeedDiscovered={isNeedDiscovered}
        onOpenMap={() => setIsMapOpen(true)}
      />

      {/* VILLAGE MINI-MAP MODAL */}
      <MiniMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onTeleport={(pos) => setTeleportTarget(pos)}
        isProjectCompleted={gameState.isProjectCompleted}
      />

      {/* VILLAGERS DIRECTORY MODAL */}
      <VillagersListModal
        isOpen={isVillagersOpen}
        onClose={() => setIsVillagersOpen(false)}
        onSelectVillager={(id) => handleSelectNPC(id)}
        onTeleport={(pos) => setTeleportTarget(pos)}
        discoveredNeeds={gameState.discoveredNeeds}
        isProjectCompleted={gameState.isProjectCompleted}
      />

      {/* COMMUNITY NEEDS LEDGER */}
      <NeedsLedgerDrawer
        isOpen={isNeedsOpen}
        onClose={() => setIsNeedsOpen(false)}
        discoveredNeeds={gameState.discoveredNeeds}
        assignedPriorities={gameState.assignedPriorities}
        onOpenMeeting={() => setIsMeetingOpen(true)}
      />

      {/* GRAM SABHA MEETING */}
      <GramSabhaMeeting
        isOpen={isMeetingOpen}
        onClose={() => setIsMeetingOpen(false)}
        discoveredNeeds={gameState.discoveredNeeds}
        assignedPriorities={gameState.assignedPriorities}
        onUpdatePriority={handleUpdatePriority}
        onProceedToBudget={handleConfirmPrioritiesAndProceedToBudget}
      />

      {/* BUDGET ALLOCATION */}
      <BudgetPlanner
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        budgets={gameState.sectorBudgets}
        onUpdateBudgets={handleUpdateBudgets}
        assignedPriorities={gameState.assignedPriorities}
        onProceedToProjects={handleProceedToProjectSelection}
      />

      {/* PROJECT SELECTION */}
      <ProjectSelector
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        onSelectProject={handleSelectProject}
      />

      {/* CONSTRUCTION CUTSCENE */}
      {gameState.phase === 'implementing' && gameState.selectedProject && (
        <ConstructionCutscene
          project={gameState.selectedProject}
          onFinish={handleFinishConstruction}
        />
      )}

      {/* CONSEQUENCE REVIEW */}
      {gameState.selectedProject && (
        <ConsequenceReview
          isOpen={isConsequencesOpen}
          onClose={() => setIsConsequencesOpen(false)}
          project={gameState.selectedProject}
          indicators={gameState.indicators}
          onProceedToFollowUp={handleProceedToFollowUp}
        />
      )}

      {/* FOLLOW-UP EVENT */}
      <FollowUpEventModal
        isOpen={isFollowUpOpen}
        onClose={() => setIsFollowUpOpen(false)}
        onSelectChoice={handleSelectFollowUpChoice}
        onProceedToReflection={handleProceedToReflection}
        activeChoiceId={gameState.activeFollowUpChoice}
      />

      {/* GUIDED REFLECTION FORM */}
      <ReflectionForm
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        answers={gameState.reflectionAnswers}
        onSaveAnswers={handleSaveReflection}
        onGenerateReport={handleGenerateReport}
      />

      {/* FINAL REPORT CARD */}
      <FinalReportCard
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        gameState={gameState}
        scores={gameState.assessmentScores || calculateAssessmentScores(gameState)}
        onRestart={handleRestart}
        onOpenTeacherMode={() => setIsTeacherModeOpen(true)}
      />

      {/* TEACHER ASSESSMENT DASHBOARD */}
      <TeacherDashboard
        isOpen={isTeacherModeOpen}
        onClose={() => setIsTeacherModeOpen(false)}
        gameState={gameState}
        scores={gameState.assessmentScores || calculateAssessmentScores(gameState)}
      />
    </main>
  );
}
