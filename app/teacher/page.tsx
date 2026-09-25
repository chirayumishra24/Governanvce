'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BarChart3, ListChecks, Play, Settings } from 'lucide-react';
import type { GameRecord, GameSettings, Question } from '@/types/controlRoom';
import { repository } from '@/lib/storage';
import { QuestionManager } from '@/components/teacher/QuestionManager';
import { GameSettingsPanel } from '@/components/teacher/GameSettings';
import { AnalyticsDashboard } from '@/components/teacher/AnalyticsDashboard';

type Tab = 'questions' | 'settings' | 'analytics';
const TABS: { id: Tab; label: string; icon: typeof ListChecks }[] = [
  { id: 'questions', label: 'Questions', icon: ListChecks },
  { id: 'settings', label: 'Game settings', icon: Settings },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

function TeacherDashboard() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'questions') as Tab;
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [records, setRecords] = useState<GameRecord[]>([]);

  useEffect(() => {
    void repository.getQuestions().then(setQuestions);
    void repository.getSettings().then(setSettings);
    void repository.getGameRecords().then(setRecords);
  }, []);

  const updateQuestions = (q: Question[]) => {
    setQuestions(q);
    void repository.saveQuestions(q);
  };

  return (
    <div className="mx-auto flex max-w-[110rem] flex-col gap-5 px-4 py-5">
      <header className="flex flex-wrap items-center gap-3">
        <Link href="/" className="icon-btn" aria-label="Back to home">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-[2rem] font-extrabold leading-none tracking-tight text-slate-900">Teacher dashboard</h1>
          <p className="mt-1 text-[1rem] font-semibold text-slate-500">Government Control Room · question bank, settings and class analytics</p>
        </div>
        <Link href="/game" className="btn px-5 text-white" style={{ background: 'linear-gradient(135deg,#1F6FEB,#1557C0)' }}>
          <Play className="h-5 w-5" /> Start a game
        </Link>
      </header>

      <nav className="clay-card flex w-fit flex-wrap p-1" role="tablist" aria-label="Dashboard sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => router.replace(`/teacher?tab=${t.id}`)}
            className={`flex min-h-[3.25rem] items-center gap-2 rounded-xl px-5 text-[1rem] font-bold ${tab === t.id ? 'bg-[#1F6FEB] text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <t.icon className="h-5 w-5" /> {t.label}
          </button>
        ))}
      </nav>

      {tab === 'questions' && questions && (
        <QuestionManager questions={questions} onChange={updateQuestions} onReset={() => void repository.resetQuestions().then(setQuestions)} />
      )}
      {tab === 'settings' && settings && (
        <GameSettingsPanel
          settings={settings}
          onSave={(s) => {
            setSettings(s);
            void repository.saveSettings(s);
          }}
        />
      )}
      {tab === 'analytics' && (
        <AnalyticsDashboard
          records={records}
          onClear={() => {
            setRecords([]);
            void repository.clearGameRecords();
          }}
        />
      )}
    </div>
  );
}

export default function TeacherPage() {
  return (
    <main className="app-bg min-h-screen">
      <Suspense fallback={null}>
        <TeacherDashboard />
      </Suspense>
    </main>
  );
}
