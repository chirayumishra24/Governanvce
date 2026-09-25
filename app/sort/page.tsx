import Link from 'next/link';
import { ArrowLeft, Play } from 'lucide-react';
import { GovernanceSort } from '@/components/governance/GovernanceSort';

export const metadata = { title: 'Governance Sort | Government Control Room' };

export default function SortPage() {
  return (
    <main className="app-bg min-h-screen">
      <div className="mx-auto flex max-w-[110rem] flex-col gap-5 px-4 py-5">
        <header className="flex flex-wrap items-center gap-3">
          <Link href="/" className="icon-btn" aria-label="Back to home">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-[2rem] font-extrabold leading-none tracking-tight text-slate-900">GOVERNANCE SORT</h1>
            <p className="mt-1 text-[1.1rem] font-semibold text-slate-500">Read each situation and place it where it belongs. Drag a card, or tap a card and then a box.</p>
          </div>
          <Link href="/game" className="btn px-5 text-white" style={{ background: 'linear-gradient(135deg,#1F6FEB,#1557C0)' }}>
            <Play className="h-5 w-5" /> Start missions
          </Link>
        </header>
        <GovernanceSort />
      </div>
    </main>
  );
}
