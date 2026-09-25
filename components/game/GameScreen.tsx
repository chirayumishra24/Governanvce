'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import type { GameSettings, Question, TeamId } from '@/types/controlRoom';
import { TEAM_IDS } from '@/types/controlRoom';
import { createGame, currentQuestion, gameReducer, toGameRecord } from '@/lib/gameEngine';
import { activationTarget } from '@/lib/governance';
import { repository } from '@/lib/storage';
import { sfx } from '@/lib/sound';
import { useNow } from '@/lib/useNow';
import { GovernanceControlRoom, type RoomView } from '@/components/governance/GovernanceControlRoom';
import { GovernmentOrganPanel } from '@/components/governance/GovernmentOrganPanel';
import { BriefingOverlay } from './BriefingOverlay';
import { ConnectionBeam, type BeamRequest } from './ConnectionBeam';
import { FinaleOverlay } from './FinaleOverlay';
import { GameHeader, type HeaderTeamProgress } from './GameHeader';
import { LevelMapModal } from './LevelMapModal';
import { TeamPanel } from './TeamPanel';

const CHAIN_SHOW_MS = 3200;

function beamTargets(q: Question): string[] {
  if (q.type === 'sort-level') return ['level-local', 'level-state', 'level-national'];
  if (q.type === 'sort-organ') return ['organ-legislature', 'organ-executive', 'organ-judiciary'];
  const { level, organ } = activationTarget(q);
  const t: string[] = [];
  if (level) t.push(`level-${level}`);
  if (organ) t.push(`organ-${organ}`);
  if (!t.length) t.push('room-core');
  return t;
}

export function GameScreen({ settings, queues }: { settings: GameSettings; queues: Record<TeamId, Question[]> }) {
  const router = useRouter();
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createGame(settings, queues));
  const [view, setView] = useState<RoomView>(settings.renderMode === '2d' ? 'map' : '3d');
  const [soundOn, setSoundOn] = useState(settings.soundEnabled);
  const [levelMapOpen, setLevelMapOpen] = useState(false);
  const [beams, setBeams] = useState<BeamRequest[]>([]);
  const now = useNow(250);
  const beamId = useRef(0);

  useEffect(() => sfx.setEnabled(soundOn), [soundOn]);

  // Timer
  useEffect(() => {
    if (state.status !== 'playing') return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => window.clearInterval(id);
  }, [state.status]);

  useEffect(() => {
    if (state.status === 'playing' && state.timeLeft > 0 && state.timeLeft <= 10) sfx.tick();
  }, [state.timeLeft, state.status]);

  // Sounds and connection beams when a team gets a result.
  const seenResults = useRef<Record<TeamId, number>>({ knowledge: 0, heritage: 0 });
  useEffect(() => {
    for (const id of TEAM_IDS) {
      const t = state.teams[id];
      if (!t.resultAt || t.resultAt === seenResults.current[id]) continue;
      seenResults.current[id] = t.resultAt;
      const q = currentQuestion(t);
      if (!q) continue;
      if (t.progress.isCorrect) {
        sfx.correct();
        window.setTimeout(() => sfx.activation(), 260);
        if (t.chainAt === t.resultAt) window.setTimeout(() => sfx.chain(), 700);
        setBeams((b) => [...b, { id: ++beamId.current, team: id, targets: beamTargets(q) }]);
      } else {
        sfx.incorrect();
      }
    }
  }, [state.teams]);

  // Finale: save the game for results and teacher analytics.
  const saved = useRef(false);
  useEffect(() => {
    if (state.status !== 'finale' || saved.current) return;
    saved.current = true;
    sfx.finale();
    void repository.saveGameRecord(toGameRecord(state));
  }, [state]);

  const removeBeam = useCallback((id: number) => setBeams((b) => b.filter((x) => x.id !== id)), []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    void repository.getSettings().then((s) => repository.saveSettings({ ...s, soundEnabled: next }));
  };

  const playing = state.status === 'playing';
  const headerTeams = useMemo(() => {
    const out = {} as Record<TeamId, HeaderTeamProgress>;
    for (const id of TEAM_IDS) {
      const t = state.teams[id];
      out[id] = {
        completed: t.progress.missionsCompleted,
        current: t.phase === 'done' ? null : t.index,
        results: state.log.filter((e) => e.teamId === id).map((e) => e.correct),
      };
    }
    return out;
  }, [state.teams, state.log]);
  const missionTotal = Math.max(state.teams.knowledge.queue.length, state.teams.heritage.queue.length);
  const missionNumber = Math.min(missionTotal, Math.max(...TEAM_IDS.map((id) => state.teams[id].index + 1)));

  const handlersFor = (team: TeamId) => ({
    onSelect: (option: string) => {
      sfx.select();
      dispatch({ type: 'select', team, option });
    },
    onSubmit: () => dispatch({ type: 'submit', team, now: Date.now() }),
    onHint: () => {
      sfx.click();
      dispatch({ type: 'hint', team, now: Date.now() });
    },
    onFifty: () => {
      sfx.click();
      dispatch({ type: 'fiftyFifty', team });
    },
    onSortPlace: (itemId: string, target: string) => {
      const q = currentQuestion(state.teams[team]);
      const item = q?.sortItems?.find((i) => i.id === itemId);
      dispatch({ type: 'sortPlace', team, itemId, target, now: Date.now() });
      return item?.answer === target;
    },
    onNext: () => {
      sfx.missionComplete();
      dispatch({ type: 'next', team, now: Date.now() });
    },
    onLevelMap: () => {
      sfx.click();
      setLevelMapOpen(true);
    },
  });

  const panel = (team: TeamId, className: string) => (
    <TeamPanel
      team={team}
      name={settings.teamNames[team]}
      runtime={state.teams[team]}
      missionTotal={state.teams[team].queue.length}
      playing={playing}
      chainActive={!!state.teams[team].chainAt && now - state.teams[team].chainAt < CHAIN_SHOW_MS}
      powerUpsEnabled={settings.powerUpsEnabled}
      className={className}
      {...handlersFor(team)}
    />
  );

  return (
    <main className="app-bg flex min-h-screen flex-col xl:h-screen xl:overflow-hidden">
      <GameHeader
        missionNumber={missionNumber}
        missionTotal={missionTotal}
        teams={headerTeams}
        timeLeft={state.timeLeft}
        paused={state.status === 'paused'}
        canPause={state.status === 'playing' || state.status === 'paused'}
        onTogglePause={() => dispatch({ type: 'togglePause', now: Date.now() })}
        view={view}
        onViewChange={setView}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 px-4 pb-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.42fr)_minmax(0,1fr)]">
        {panel('knowledge', 'order-1')}
        <div className="order-2 flex min-h-0 flex-col gap-3" data-anchor="room-core">
          <div className="h-[62vh] min-h-[22rem] xl:h-auto xl:min-h-0 xl:flex-1">
            <GovernanceControlRoom
              room={state.room}
              now={now}
              view={view}
              renderMode={settings.renderMode}
              banner={
                <div className="glass rounded-2xl px-5 py-1.5 text-center shadow-sm">
                  <div className="text-[1.05rem] font-extrabold tracking-[0.08em] text-slate-800">WHO HANDLES WHAT?</div>
                  <div className="text-[0.75rem] font-bold tracking-[0.2em] text-slate-500">ANALYSE • DECIDE • GOVERN</div>
                </div>
              }
            />
          </div>
          <GovernmentOrganPanel room={state.room} now={now} />
        </div>
        {panel('heritage', 'order-3')}
      </div>

      {beams.map((b) => (
        <ConnectionBeam key={b.id} beam={b} onDone={removeBeam} />
      ))}

      <LevelMapModal open={levelMapOpen} onClose={() => setLevelMapOpen(false)} />

      <AnimatePresence>
        {state.status === 'briefing' && (
          <BriefingOverlay
            teamNames={settings.teamNames}
            missionCount={state.teams.knowledge.queue.length}
            durationSeconds={settings.durationSeconds}
            onStart={() => {
              sfx.click();
              dispatch({ type: 'start', now: Date.now() });
            }}
          />
        )}
      </AnimatePresence>

      {state.status === 'finale' && (
        <FinaleOverlay
          endedBy={state.endedBy ?? 'completed'}
          onContinue={() => {
            dispatch({ type: 'finish' });
            router.push(`/results?id=${state.gameId}`);
          }}
        />
      )}
    </main>
  );
}
