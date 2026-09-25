'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { GameRecord } from '@/types/controlRoom';
import { repository } from '@/lib/storage';
import { WinnerScreen } from '@/components/game/WinnerScreen';
import { LearningSummary } from '@/components/game/LearningSummary';

function Results() {
  const params = useSearchParams();
  const router = useRouter();
  const [record, setRecord] = useState<GameRecord | null | undefined>(undefined);
  const [step, setStep] = useState<'winner' | 'summary'>('winner');

  useEffect(() => {
    const id = params.get('id');
    void repository.getGameRecords().then((records) => setRecord((id && records.find((r) => r.id === id)) || records[0] || null));
  }, [params]);

  if (record === undefined) return null;
  if (record === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800">No finished game yet</h1>
        <p className="text-lg text-slate-600">Play a round of missions and the results will appear here.</p>
        <Link href="/game" className="btn h-14 px-6 text-white" style={{ background: '#1F6FEB' }}>
          Start missions
        </Link>
      </div>
    );
  }
  return step === 'winner' ? (
    <WinnerScreen record={record} onContinue={() => setStep('summary')} />
  ) : (
    <LearningSummary onPlayAgain={() => router.push('/game')} />
  );
}

export default function ResultsPage() {
  return (
    <main className="app-bg min-h-screen">
      <Suspense fallback={null}>
        <Results />
      </Suspense>
    </main>
  );
}
