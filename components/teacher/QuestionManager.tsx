'use client';

import { useMemo, useRef, useState } from 'react';
import { Download, Pencil, Plus, RotateCcw, Search, Trash2, Upload } from 'lucide-react';
import type { Difficulty, Question, QuestionCategory, QuestionType } from '@/types/controlRoom';
import { CATEGORIES, QUESTION_TYPES } from '@/types/controlRoom';
import { STAGE_LABELS, stageOf, type Stage } from '@/lib/questionEngine';
import { IssueIllustration } from '@/components/governance/IssueIllustration';
import { blankQuestion, QuestionEditor, TYPE_LABELS } from './QuestionEditor';

const DIFF_STYLE: Record<Difficulty, string> = {
  easy: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-sky-50 text-sky-700',
  hard: 'bg-violet-50 text-violet-700',
};

const control = 'min-h-[3rem] rounded-xl border border-slate-200 bg-white px-3 text-[0.95rem] font-semibold text-slate-700';

export function QuestionManager({
  questions,
  onChange,
  onReset,
}: {
  questions: Question[];
  onChange: (q: Question[]) => void;
  onReset: () => void;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<QuestionCategory | ''>('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [type, setType] = useState<QuestionType | ''>('');
  const [editing, setEditing] = useState<Question | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      questions.filter(
        (q) =>
          (!category || q.category === category) &&
          (!difficulty || q.difficulty === difficulty) &&
          (!type || q.type === type) &&
          (!search || `${q.scenario ?? ''} ${q.question}`.toLowerCase().includes(search.toLowerCase()))
      ),
    [questions, category, difficulty, type, search]
  );

  const stageCounts = useMemo(() => {
    const c: Record<Stage, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const q of questions) if (!q.finale) c[stageOf(q)] += 1;
    return c;
  }, [questions]);
  const finales = questions.filter((q) => q.finale).length;

  const save = (q: Question) => {
    const exists = questions.some((x) => x.id === q.id);
    onChange(exists ? questions.map((x) => (x.id === q.id ? q : x)) : [...questions, q]);
    setEditing(null);
  };

  const remove = (q: Question) => {
    if (window.confirm(`Delete this question?\n\n${q.scenario ?? q.question}`)) onChange(questions.filter((x) => x.id !== q.id));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'government-control-room-questions.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data) || !data.every((q) => q && typeof q.id === 'string' && typeof q.question === 'string')) throw new Error();
      onChange(data as Question[]);
    } catch {
      window.alert('That file is not a valid question bank export.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Coverage per mission stage */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {([1, 2, 3, 4, 5] as Stage[]).map((s) => (
          <div key={s} className="clay-card px-4 py-3">
            <div className="text-[1.6rem] font-extrabold text-slate-800">{stageCounts[s]}</div>
            <div className="text-[0.85rem] font-bold leading-tight text-slate-500">
              Stage {s}: {STAGE_LABELS[s]}
            </div>
            {stageCounts[s] < 6 && <div className="mt-1 text-xs font-bold text-amber-700">Add more for two full queues</div>}
          </div>
        ))}
        <div className="clay-card px-4 py-3">
          <div className="text-[1.6rem] font-extrabold text-slate-800">{finales}</div>
          <div className="text-[0.85rem] font-bold leading-tight text-slate-500">Final missions</div>
        </div>
      </div>

      <div className="clay-card flex flex-wrap items-center gap-2 p-3">
        <label className="relative min-w-[14rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className={`${control} w-full pl-9`} placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search questions" />
        </label>
        <select className={control} value={category} onChange={(e) => setCategory(e.target.value as QuestionCategory | '')} aria-label="Filter by category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className={control} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | '')} aria-label="Filter by difficulty">
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select className={control} value={type} onChange={(e) => setType(e.target.value as QuestionType | '')} aria-label="Filter by type">
          <option value="">All types</option>
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <button type="button" className="btn px-4 text-white" style={{ background: '#1F6FEB', minHeight: '3rem' }} onClick={() => setEditing(blankQuestion())}>
          <Plus className="h-5 w-5" /> New question
        </button>
        <button type="button" className="icon-btn" title="Export question bank" aria-label="Export question bank" onClick={exportJson}>
          <Download className="h-5 w-5" />
        </button>
        <button type="button" className="icon-btn" title="Import question bank" aria-label="Import question bank" onClick={() => fileRef.current?.click()}>
          <Upload className="h-5 w-5" />
        </button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && void importJson(e.target.files[0])} />
        <button
          type="button"
          className="icon-btn"
          title="Restore the default question bank"
          aria-label="Restore the default question bank"
          onClick={() => window.confirm('Replace all questions with the default bank?') && onReset()}
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      <div className="text-sm font-semibold text-slate-500">
        Showing {filtered.length} of {questions.length} questions
      </div>

      <ul className="flex flex-col gap-2">
        {filtered.map((q) => (
          <li key={q.id} className="clay-card flex items-center gap-3 p-3">
            <IssueIllustration image={q.image} className="hidden h-14 w-16 shrink-0 rounded-xl sm:flex" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[1.02rem] font-bold text-slate-800">{q.scenario || q.question}</div>
              {q.scenario && <div className="truncate text-[0.9rem] font-medium text-slate-500">{q.question}</div>}
              <div className="mt-1 flex flex-wrap gap-1.5 text-[0.75rem] font-bold">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">{q.category}</span>
                <span className={`rounded-md px-2 py-0.5 ${DIFF_STYLE[q.difficulty]}`}>{q.difficulty}</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">{TYPE_LABELS[q.type]}</span>
                {q.finale && <span className="rounded-md bg-amber-100 px-2 py-0.5 text-amber-800">final mission</span>}
                {q.type !== 'sort-level' && q.type !== 'sort-organ' && (
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700">Answer: {q.correctAnswer}</span>
                )}
              </div>
            </div>
            <button type="button" className="icon-btn" onClick={() => setEditing(q)} aria-label="Edit question">
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" className="icon-btn text-rose-600" onClick={() => remove(q)} aria-label="Delete question">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {editing && <QuestionEditor initial={editing} onSave={save} onCancel={() => setEditing(null)} />}
    </div>
  );
}
