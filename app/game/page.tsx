'use client';

import { useEffect, useState } from 'react';
import type { GameSettings, Question, TeamId } from '@/types/controlRoom';
import { buildQueues } from '@/lib/questionEngine';
import { repository } from '@/lib/storage';
import { GameScreen } from '@/components/game/GameScreen';

export default function GamePage() {
  const [boot, setBoot] = useState<{ settings: GameSettings; queues: Record<TeamId, Question[]> } | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([repository.getSettings(), repository.getQuestions()]).then(([settings, bank]) => {
      if (alive) setBoot({ settings, queues: buildQueues(bank, settings) });
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!boot) {
    return (
      <main className="app-bg flex min-h-screen items-center justify-center">
        <div className="clay-card px-6 py-4 text-lg font-bold text-slate-600">Loading missions…</div>
      </main>
    );
  }
  return <GameScreen settings={boot.settings} queues={boot.queues} />;
}
