'use client';

import Link from 'next/link';
import { Box, Home, Map, Maximize, Minimize, Pause, Play, Timer, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { TeamId } from '@/types/controlRoom';
import { TEAM_IDS } from '@/types/controlRoom';
import type { RoomView } from '@/components/governance/GovernanceControlRoom';
import { MissionProgress } from './MissionProgress';

export interface HeaderTeamProgress {
  completed: number;
  current: number | null;
  results: boolean[];
}

interface Props {
  missionNumber: number;
  missionTotal: number;
  teams: Record<TeamId, HeaderTeamProgress>;
  timeLeft: number;
  paused: boolean;
  canPause: boolean;
  onTogglePause: () => void;
  view: RoomView;
  onViewChange: (v: RoomView) => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function useFullscreen() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  const toggle = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };
  return { on, toggle };
}

export function GameHeader(p: Props) {
  const fs = useFullscreen();
  const low = p.timeLeft <= 30;
  return (
    <header className="flex flex-wrap items-center gap-3 px-4 pb-3 pt-3 xl:flex-nowrap">
      {/* Title */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1F6FEB] to-[#F26B1D] text-white shadow-lg">
          <LandmarkMark />
        </div>
        <div className="min-w-0">
          <h1 className="text-[1.3rem] font-extrabold leading-tight tracking-tight sm:text-[1.6rem] sm:leading-none">
            <span className="text-[#1557C0]">GOVERNMENT</span> <span className="text-[#E2601A]">CONTROL ROOM</span>
          </h1>
          <p className="mt-1 text-[0.9rem] font-semibold text-slate-500">Grassroots Democracy • Class 6</p>
        </div>
      </div>

      {/* Mission progress + timer */}
      <div className="clay-card order-3 flex w-full items-center justify-between gap-4 px-5 py-2 xl:order-none xl:w-auto xl:justify-start">
        <div>
          <div className="text-[0.95rem] font-extrabold tracking-wide text-slate-700">
            MISSION {String(p.missionNumber).padStart(2, '0')} / {p.missionTotal}
          </div>
          <div className="mt-1 flex flex-col gap-1">
            {TEAM_IDS.map((id) => (
              <MissionProgress
                key={id}
                team={id}
                label={id === 'knowledge' ? 'K' : 'H'}
                total={p.missionTotal}
                completed={p.teams[id].completed}
                current={p.teams[id].current}
                results={p.teams[id].results}
              />
            ))}
          </div>
        </div>
        <div className="h-12 w-px bg-slate-200" />
        <div className="flex items-center gap-3">
          <Timer className={`h-9 w-9 ${low ? 'text-rose-500' : 'text-[#1F6FEB]'}`} strokeWidth={2.2} />
          <div>
            <div
              className={`text-[2rem] font-extrabold tabular-nums leading-none ${low ? 'text-rose-600' : 'text-slate-800'}`}
              aria-live="off"
            >
              {formatTime(p.timeLeft)}
            </div>
            <div className="text-[0.72rem] font-bold tracking-wider text-slate-500">{p.paused ? 'PAUSED' : 'TIME REMAINING'}</div>
          </div>
          <button
            type="button"
            onClick={p.onTogglePause}
            disabled={!p.canPause}
            className="icon-btn disabled:opacity-40"
            aria-label={p.paused ? 'Resume timer' : 'Pause timer'}
          >
            {p.paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-1 items-center justify-end gap-2">
        <div className="clay-card flex p-1" role="group" aria-label="Control room view">
          <ViewButton active={p.view === '3d'} onClick={() => p.onViewChange('3d')} icon={<Box className="h-5 w-5" />} label="3D View" />
          <ViewButton active={p.view === 'map'} onClick={() => p.onViewChange('map')} icon={<Map className="h-5 w-5" />} label="Map View" />
        </div>
        <button type="button" className="icon-btn" onClick={p.onToggleSound} aria-label={p.soundOn ? 'Mute sound' : 'Turn sound on'}>
          {p.soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
        <button type="button" className="icon-btn" onClick={fs.toggle} aria-label={fs.on ? 'Exit full screen' : 'Full screen'}>
          {fs.on ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
        <Link href="/" className="icon-btn" aria-label="Back to home">
          <Home className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}

function ViewButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-[3rem] items-center gap-2 rounded-xl px-3 text-[0.85rem] font-bold transition ${
        active ? 'bg-[#1F6FEB] text-white shadow' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="hidden 2xl:inline">{label}</span>
      <span className="2xl:hidden">{label.split(' ')[0]}</span>
    </button>
  );
}

function LandmarkMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 21h18M5 21v-8M9.5 21v-8M14.5 21v-8M19 21v-8M3 13h18M12 3l9 6H3l9-6Z" />
    </svg>
  );
}
