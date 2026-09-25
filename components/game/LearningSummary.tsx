'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, Building2, Compass, Globe2, Home, Landmark, RotateCcw, Users } from 'lucide-react';
import { LEVEL_INFO, ORGAN_INFO } from '@/lib/governance';
import { ORGAN_ICONS } from '@/components/governance/GovernmentOrganPanel';
import { ORGANS } from '@/types/controlRoom';

const LEVEL_ROWS = [
  { key: 'local', icon: Home },
  { key: 'state', icon: Building2 },
  { key: 'national', icon: Globe2 },
] as const;

/** WHAT DID WE DISCOVER? The three ideas the game was built to teach. */
export function LearningSummary({ onPlayAgain }: { onPlayAgain: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-[2.8rem] font-extrabold tracking-tight text-slate-900">WHAT DID WE DISCOVER?</h1>
        <p className="text-[1.2rem] font-medium text-slate-600">Real-life public issues make sense when we ask who handles what, and why.</p>
      </div>

      <div className="grid w-full gap-5 lg:grid-cols-3">
        <SummaryCard delay={0} icon={<Building2 className="h-7 w-7" />} color="#0E8F80" title="GOVERNMENT LEVELS">
          {LEVEL_ROWS.map(({ key, icon: Icon }) => (
            <Row key={key} icon={<Icon className="h-5 w-5" />} color={LEVEL_INFO[key].color} title={LEVEL_INFO[key].short} text={LEVEL_INFO[key].summary} />
          ))}
        </SummaryCard>
        <SummaryCard delay={0.1} icon={<Landmark className="h-7 w-7" />} color="#6B5BD6" title="ORGANS OF GOVERNMENT">
          {ORGANS.map((o) => {
            const Icon = ORGAN_ICONS[o];
            return <Row key={o} icon={<Icon className="h-5 w-5" />} color={ORGAN_INFO[o].color} title={ORGAN_INFO[o].label.toUpperCase()} text={ORGAN_INFO[o].role} />;
          })}
        </SummaryCard>
        <SummaryCard delay={0.2} icon={<Users className="h-7 w-7" />} color="#E2601A" title="DEMOCRATIC GOVERNANCE">
          <p className="text-[1.15rem] font-semibold leading-snug text-slate-700">
            Government works through institutions, responsibilities and decision-making processes.
          </p>
          <p className="text-[1.02rem] font-medium leading-snug text-slate-600">
            In a democracy, citizens take part too: by voting, sharing their views and raising public needs.
          </p>
        </SummaryCard>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="btn h-16 px-7 text-[1.15rem] text-white"
          style={{ background: 'linear-gradient(135deg,#1F6FEB,#1557C0)' }}
        >
          <RotateCcw className="h-6 w-6" /> PLAY AGAIN
        </button>
        <Link href="/explore" className="btn btn-ghost h-16 px-7 text-[1.15rem]">
          <Compass className="h-6 w-6" /> EXPLORE GOVERNANCE
        </Link>
        <Link href="/teacher?tab=analytics" className="btn btn-ghost h-16 px-7 text-[1.15rem]">
          <BarChart3 className="h-6 w-6" /> CLASS ANALYTICS
        </Link>
        <Link href="/" className="btn btn-ghost h-16 px-7 text-[1.15rem]">
          <Home className="h-6 w-6" /> HOME
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({
  delay,
  icon,
  color,
  title,
  children,
}: {
  delay: number;
  icon: React.ReactNode;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="clay-card flex flex-col gap-3 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: color }}>
          {icon}
        </span>
        <h2 className="text-[1.35rem] font-extrabold tracking-wide text-slate-800">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function Row({ icon, color, title, text }: { icon: React.ReactNode; color: string; title: string; text: string }) {
  return (
    <div className="clay-inset flex items-center gap-3 p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: color }}>
        {icon}
      </span>
      <div>
        <div className="font-extrabold text-slate-800">{title}</div>
        <div className="text-[0.98rem] font-medium text-slate-600">{text}</div>
      </div>
    </div>
  );
}
