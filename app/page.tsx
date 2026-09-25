'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, GraduationCap, LayoutGrid, Play, Trees } from 'lucide-react';
import type { GovernmentLevel } from '@/types/controlRoom';
import { EMPTY_ROOM, type RoomState } from '@/lib/roomState';
import { useNow } from '@/lib/useNow';
import { ControlRoom2D } from '@/components/governance/ControlRoom2D';

const LOOP = ['QUESTION', 'ANALYSE', 'DECIDE', 'ACTIVATE', 'LEARN'];

/** Cycles activations through the levels so the landing preview shows what a correct decision does. */
function useDemoRoom(): RoomState {
  const [room, setRoom] = useState<RoomState>(EMPTY_ROOM);
  useEffect(() => {
    let i = 0;
    const order: GovernmentLevel[] = ['local', 'state', 'national'];
    const id = window.setInterval(() => {
      const level = order[i % order.length];
      const team = i % 2 === 0 ? 'knowledge' : 'heritage';
      setRoom((r) => ({ ...r, levels: { ...r.levels, [level]: { team, at: Date.now(), count: 1 } } }));
      i++;
    }, 2200);
    return () => window.clearInterval(id);
  }, []);
  return room;
}

export default function HomePage() {
  const room = useDemoRoom();
  const now = useNow(300);

  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[110rem] items-center gap-8 px-5 py-8 lg:grid-cols-[1.1fr_1fr] lg:px-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          <span className="w-fit rounded-full bg-white px-4 py-2 text-[0.95rem] font-bold text-slate-600 shadow-sm">
            Class 6 Social Science • Grassroots Democracy – Part 1: Governance
          </span>
          <div>
            <h1 className="text-[2.5rem] font-extrabold leading-[1.02] tracking-tight sm:text-[3.4rem] md:text-[4.2rem]">
              <span className="text-[#1557C0]">GOVERNMENT</span>
              <br />
              <span className="text-[#E2601A]">CONTROL ROOM</span>
            </h1>
            <p className="mt-3 text-[2rem] font-extrabold text-slate-800">Who Handles What?</p>
            <p className="text-[1.15rem] font-bold tracking-[0.2em] text-slate-500">ANALYSE. DECIDE. GOVERN.</p>
          </div>
          <p className="max-w-[40rem] text-[1.2rem] font-medium leading-relaxed text-slate-600">
            Two teams become Governance Operators. Each real-life situation needs a decision: which level of government, or
            which organ of government, handles it? Every correct decision lights up the control room.
          </p>

          <ol className="flex flex-wrap items-center gap-2" aria-label="How each mission works">
            {LOOP.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-xl bg-white px-3 py-2 text-[0.95rem] font-extrabold tracking-wide text-slate-700 shadow-sm">{step}</span>
                {i < LOOP.length - 1 && <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden />}
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/game"
              className="btn h-16 px-8 text-[1.3rem] tracking-wide text-white"
              style={{ background: 'linear-gradient(135deg,#1F6FEB,#1557C0)', boxShadow: '0 16px 32px -14px rgba(31,111,235,.7)' }}
            >
              <Play className="h-6 w-6" /> START MISSIONS
            </Link>
            <Link href="/explore" className="btn btn-ghost h-16 px-6 text-[1.15rem]">
              <Compass className="h-6 w-6 text-[#0E8F80]" /> EXPLORE GOVERNANCE
            </Link>
            <Link href="/sort" className="btn btn-ghost h-16 px-6 text-[1.15rem]">
              <LayoutGrid className="h-6 w-6 text-[#E2601A]" /> GOVERNANCE SORT
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[1rem] font-semibold">
            <Link href="/teacher" className="flex min-h-[3rem] items-center gap-2 text-slate-600 hover:text-slate-900">
              <GraduationCap className="h-5 w-5" /> Teacher dashboard
            </Link>
            <Link href="/lab" className="flex min-h-[3rem] items-center gap-2 text-slate-600 hover:text-slate-900">
              <Trees className="h-5 w-5" /> Village Governance Lab (3D)
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="control-room-stage relative min-h-[34rem] overflow-hidden rounded-[2rem]"
          aria-hidden
        >
          <div className="control-room-backdrop" />
          <div className="relative h-full">
            <ControlRoom2D room={room} now={now} />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
