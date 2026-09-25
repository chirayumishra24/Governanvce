'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Box, Building2, Globe2, Home, Map, MousePointerClick, Play } from 'lucide-react';
import type { GovernmentLevel, GovernmentOrgan } from '@/types/controlRoom';
import { LEVELS } from '@/types/controlRoom';
import { LEVEL_INFO, ORGAN_INFO } from '@/lib/governance';
import { EMPTY_ROOM, type RoomState } from '@/lib/roomState';
import { useNow } from '@/lib/useNow';
import { GovernanceControlRoom, type RoomView } from '@/components/governance/GovernanceControlRoom';
import { GovernmentOrganPanel, ORGAN_ICONS } from '@/components/governance/GovernmentOrganPanel';
import { sfx } from '@/lib/sound';

type Selection = { kind: 'level'; key: GovernmentLevel } | { kind: 'organ'; key: GovernmentOrgan } | null;

const LEVEL_ICONS = { local: Home, state: Building2, national: Globe2 };

/** Free exploration: click any level or organ to read about it. Does not affect scores. */
export default function ExplorePage() {
  const now = useNow(250);
  const [view, setView] = useState<RoomView>('3d');
  const [room, setRoom] = useState<RoomState>(EMPTY_ROOM);
  const [sel, setSel] = useState<Selection>(null);

  const selectLevel = (level: GovernmentLevel) => {
    sfx.activation();
    setSel({ kind: 'level', key: level });
    setRoom((r) => ({ ...r, levels: { ...r.levels, [level]: { team: null, at: Date.now(), count: (r.levels[level]?.count ?? 0) + 1 } } }));
  };
  const selectOrgan = (organ: GovernmentOrgan) => {
    sfx.activation();
    setSel({ kind: 'organ', key: organ });
    setRoom((r) => ({ ...r, organs: { ...r.organs, [organ]: { team: null, at: Date.now(), count: (r.organs[organ]?.count ?? 0) + 1 } } }));
  };

  return (
    <main className="app-bg flex min-h-screen flex-col xl:h-screen xl:overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="icon-btn" aria-label="Back to home">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-[1.6rem] font-extrabold leading-none tracking-tight text-slate-900">EXPLORE GOVERNANCE</h1>
          <p className="mt-1 text-[0.95rem] font-semibold text-slate-500">Tap any level or organ of government to learn what it does. No scores here.</p>
        </div>
        <div className="clay-card flex p-1" role="group" aria-label="View">
          {(['3d', 'map'] as RoomView[]).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`flex min-h-[3rem] items-center gap-2 rounded-xl px-4 text-sm font-bold ${view === v ? 'bg-[#1F6FEB] text-white' : 'text-slate-600'}`}
            >
              {v === '3d' ? <Box className="h-5 w-5" /> : <Map className="h-5 w-5" />}
              {v === '3d' ? '3D View' : 'Map View'}
            </button>
          ))}
        </div>
        <Link href="/game" className="btn h-12 px-5 text-white" style={{ background: 'linear-gradient(135deg,#1F6FEB,#1557C0)', minHeight: '3rem' }}>
          <Play className="h-5 w-5" /> Start missions
        </Link>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 px-4 pb-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="h-[62vh] min-h-[22rem] xl:h-auto xl:min-h-0 xl:flex-1">
            <GovernanceControlRoom
              room={room}
              now={now}
              view={view}
              interactive
              selectedLevel={sel?.kind === 'level' ? sel.key : null}
              onSelectLevel={selectLevel}
              banner={
                <div className="glass flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold text-slate-600 shadow-sm">
                  <MousePointerClick className="h-4 w-4" /> Drag to rotate · tap a level
                </div>
              }
            />
          </div>
          <GovernmentOrganPanel room={room} now={now} selected={sel?.kind === 'organ' ? sel.key : null} onSelect={selectOrgan} />
        </div>

        <aside className="clay-card scroll-soft flex min-h-0 flex-col gap-4 overflow-y-auto p-6">
          <motion.div
              key={sel ? `${sel.kind}-${sel.key}` : 'intro'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              {!sel && <Intro onPick={selectLevel} />}
              {sel?.kind === 'level' && <LevelInfo level={sel.key} />}
              {sel?.kind === 'organ' && <OrganInfo organ={sel.key} />}
            </motion.div>
        </aside>
      </div>
    </main>
  );
}

function Intro({ onPick }: { onPick: (l: GovernmentLevel) => void }) {
  return (
    <>
      <div className="text-[0.9rem] font-extrabold tracking-[0.18em] text-slate-500">WHAT IS GOVERNANCE?</div>
      <p className="text-[1.3rem] font-semibold leading-snug text-slate-800">
        Governance is how a society is managed: making rules, taking decisions and providing services for everyone.
      </p>
      <p className="text-[1.08rem] font-medium leading-snug text-slate-600">
        In India, government works at three levels (local, state and national) and through three organs (the Legislature, the
        Executive and the Judiciary). Choose one to explore.
      </p>
      <div className="grid gap-2">
        {LEVELS.map((l) => {
          const Icon = LEVEL_ICONS[l];
          return (
            <button key={l} type="button" onClick={() => onPick(l)} className="btn btn-ghost h-14 justify-start px-4 text-[1.05rem]">
              <Icon className="h-5 w-5" style={{ color: LEVEL_INFO[l].color }} /> {LEVEL_INFO[l].label}
            </button>
          );
        })}
      </div>
    </>
  );
}

function LevelInfo({ level }: { level: GovernmentLevel }) {
  const info = LEVEL_INFO[level];
  const Icon = LEVEL_ICONS[level];
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ background: info.color }}>
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <div className="text-[0.85rem] font-extrabold tracking-[0.18em] text-slate-500">LEVEL OF GOVERNMENT</div>
          <h2 className="text-[1.7rem] font-extrabold leading-tight text-slate-900">{info.label}</h2>
        </div>
      </div>
      <p className="text-[1.25rem] font-semibold leading-snug text-slate-800">{info.summary}</p>
      <p className="text-[1.08rem] font-medium leading-snug text-slate-600">{info.explore}</p>
      <div>
        <div className="mb-2 text-[0.85rem] font-extrabold tracking-[0.18em] text-slate-500">LOOKS AFTER</div>
        <div className="flex flex-wrap gap-2">
          {info.examples.map((e) => (
            <span key={e} className="rounded-xl px-3 py-1.5 text-[1rem] font-bold" style={{ background: `${info.color}18`, color: '#1E293B' }}>
              {e}
            </span>
          ))}
        </div>
      </div>
      <div className="clay-inset p-4 text-[1.02rem] font-semibold text-slate-700">Think: how far does an issue reach? One neighbourhood, one state, or the whole country?</div>
    </>
  );
}

function OrganInfo({ organ }: { organ: GovernmentOrgan }) {
  const info = ORGAN_INFO[organ];
  const Icon = ORGAN_ICONS[organ];
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ background: info.color }}>
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <div className="text-[0.85rem] font-extrabold tracking-[0.18em] text-slate-500">ORGAN OF GOVERNMENT</div>
          <h2 className="text-[1.7rem] font-extrabold leading-tight text-slate-900">{info.label}</h2>
        </div>
      </div>
      <p className="text-[1.25rem] font-semibold leading-snug text-slate-800">{info.role}</p>
      <p className="text-[1.08rem] font-medium leading-snug text-slate-600">{info.explore}</p>
      <div>
        <div className="mb-2 text-[0.85rem] font-extrabold tracking-[0.18em] text-slate-500">EXAMPLES</div>
        <ul className="flex flex-col gap-2">
          {info.examples.map((e) => (
            <li key={e} className="clay-inset flex items-center gap-2 px-3 py-2 text-[1.02rem] font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full" style={{ background: info.color }} />
              {e}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
