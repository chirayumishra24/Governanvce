'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { Difficulty, Question, QuestionCategory, QuestionType, SortItem } from '@/types/controlRoom';
import { CATEGORIES, LEVELS, ORGANS, QUESTION_TYPES } from '@/types/controlRoom';
import { LEVEL_INFO, LEVEL_OPTIONS, ORGAN_INFO, ORGAN_OPTIONS } from '@/lib/governance';
import { isPlayable } from '@/lib/questionEngine';
import { ILLUSTRATION_KEYS, IssueIllustration } from '@/components/governance/IssueIllustration';

const TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'Multiple choice',
  scenario: 'Scenario',
  'true-false': 'True / false',
  'sort-level': 'Sort: Local / State / National',
  'sort-organ': 'Sort: Legislature / Executive / Judiciary',
};
export { TYPE_LABELS };

export function blankQuestion(): Question {
  return {
    id: `q-${Date.now().toString(36)}`,
    scenario: '',
    question: 'Which level of government is most directly connected with this situation?',
    options: [...LEVEL_OPTIONS],
    correctAnswer: LEVEL_OPTIONS[2],
    explanation: '',
    concept: '',
    hint: '',
    type: 'mcq',
    category: 'Government Levels',
    difficulty: 'easy',
    governmentLevel: 'local',
    image: 'building',
  };
}

const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[1rem] font-medium text-slate-800 focus:border-sky-400';
const labelCls = 'mb-1 block text-[0.8rem] font-extrabold tracking-wider text-slate-500';

/** Create / edit form for one question, including sort-card editing. */
export function QuestionEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: Question;
  onSave: (q: Question) => void;
  onCancel: () => void;
}) {
  const [q, setQ] = useState<Question>(initial);
  const set = <K extends keyof Question>(k: K, v: Question[K]) => setQ((prev) => ({ ...prev, [k]: v }));
  const isSort = q.type === 'sort-level' || q.type === 'sort-organ';
  const options = q.options ?? [];

  const changeType = (type: QuestionType) => {
    setQ((prev) => {
      const next: Question = { ...prev, type };
      if (type === 'true-false') {
        next.options = ['True', 'False'];
        next.correctAnswer = 'True';
      } else if (type === 'sort-level' || type === 'sort-organ') {
        next.correctAnswer = 'all-placed';
        next.category = 'Classification';
        next.question = `Drag each situation to the ${type === 'sort-level' ? 'level' : 'organ'} of government that handles it.`;
        next.sortItems = prev.sortItems?.length
          ? prev.sortItems
          : (type === 'sort-level' ? LEVELS : ORGANS).map((a, i) => ({ id: `${prev.id}-${i}`, text: '', answer: a, image: 'building' }));
      } else if (!prev.options || prev.options.length < 2 || prev.type === 'true-false') {
        next.options = [...LEVEL_OPTIONS];
        next.correctAnswer = LEVEL_OPTIONS[0];
      }
      return next;
    });
  };

  const setOption = (i: number, value: string) => {
    const next = [...options];
    const wasCorrect = next[i] === q.correctAnswer;
    next[i] = value;
    setQ((prev) => ({ ...prev, options: next, correctAnswer: wasCorrect ? value : prev.correctAnswer }));
  };

  const setSortItem = (i: number, patch: Partial<SortItem>) => {
    const items = [...(q.sortItems ?? [])];
    items[i] = { ...items[i], ...patch };
    set('sortItems', items);
  };

  const cleaned: Question = {
    ...q,
    scenario: q.scenario?.trim() || undefined,
    concept: q.concept?.trim() || undefined,
    hint: q.hint?.trim() || undefined,
    options: isSort ? undefined : options.map((o) => o.trim()).filter(Boolean),
    sortItems: isSort ? (q.sortItems ?? []).filter((s) => s.text.trim()) : undefined,
    governmentLevel: isSort ? undefined : q.governmentLevel || undefined,
    governmentOrgan: isSort ? undefined : q.governmentOrgan || undefined,
  };
  const problems: string[] = [];
  if (!cleaned.question.trim()) problems.push('Add the question text.');
  if (!cleaned.explanation.trim()) problems.push('Add a short explanation for the “Why?” card.');
  if (!isPlayable(cleaned)) problems.push(isSort ? 'Add at least one sort card.' : 'Choose a correct answer that matches one of the options.');

  const sortKeys = q.type === 'sort-organ' ? ORGANS : LEVELS;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="editor-title" className="clay-card my-6 w-full max-w-[60rem] p-6">
        <div className="flex items-center justify-between">
          <h2 id="editor-title" className="text-[1.5rem] font-extrabold text-slate-800">
            {initial.explanation ? 'Edit question' : 'New question'}
          </h2>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label="Close editor">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label>
            <span className={labelCls}>QUESTION TYPE</span>
            <select className={field} value={q.type} onChange={(e) => changeType(e.target.value as QuestionType)}>
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelCls}>CATEGORY</span>
            <select className={field} value={q.category} onChange={(e) => set('category', e.target.value as QuestionCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={labelCls}>DIFFICULTY</span>
            <select className={field} value={q.difficulty} onChange={(e) => set('difficulty', e.target.value as Difficulty)}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <option key={d} value={d}>
                  {d[0].toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!isSort && (
          <label className="mt-4 block">
            <span className={labelCls}>SITUATION (OPTIONAL)</span>
            <textarea className={field} rows={2} value={q.scenario ?? ''} onChange={(e) => set('scenario', e.target.value)} placeholder="A road in a neighbourhood has many potholes." />
          </label>
        )}
        <label className="mt-4 block">
          <span className={labelCls}>QUESTION</span>
          <input className={field} value={q.question} onChange={(e) => set('question', e.target.value)} />
        </label>

        {!isSort && (
          <div className="mt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={labelCls}>OPTIONS · SELECT THE CORRECT ONE</span>
              {q.type !== 'true-false' && (
                <div className="flex gap-2">
                  <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600" onClick={() => setQ((p) => ({ ...p, options: [...LEVEL_OPTIONS], correctAnswer: LEVEL_OPTIONS[0] }))}>
                    Use level options
                  </button>
                  <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600" onClick={() => setQ((p) => ({ ...p, options: [...ORGAN_OPTIONS], correctAnswer: ORGAN_OPTIONS[0] }))}>
                    Use organ options
                  </button>
                </div>
              )}
            </div>
            <div className="mt-1 flex flex-col gap-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    className="h-6 w-6 accent-emerald-600"
                    checked={q.correctAnswer === opt && opt !== ''}
                    onChange={() => set('correctAnswer', opt)}
                    aria-label={`Mark option ${i + 1} correct`}
                  />
                  <input className={field} value={opt} disabled={q.type === 'true-false'} onChange={(e) => setOption(i, e.target.value)} />
                  {q.type !== 'true-false' && options.length > 2 && (
                    <button type="button" className="icon-btn" onClick={() => set('options', options.filter((_, j) => j !== i))} aria-label="Remove option">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {q.type !== 'true-false' && options.length < 4 && (
                <button type="button" className="flex w-fit items-center gap-1 rounded-lg px-2 py-2 text-sm font-bold text-sky-700" onClick={() => set('options', [...options, ''])}>
                  <Plus className="h-4 w-4" /> Add option
                </button>
              )}
            </div>
          </div>
        )}

        {isSort && (
          <div className="mt-4">
            <span className={labelCls}>SORT CARDS</span>
            <div className="flex flex-col gap-2">
              {(q.sortItems ?? []).map((item, i) => (
                <div key={item.id} className="flex flex-wrap items-center gap-2">
                  <input className={`${field} min-w-[14rem] flex-1`} value={item.text} placeholder="Situation" onChange={(e) => setSortItem(i, { text: e.target.value })} />
                  <select className={`${field} w-44`} value={item.answer} onChange={(e) => setSortItem(i, { answer: e.target.value as SortItem['answer'] })}>
                    {sortKeys.map((k) => (
                      <option key={k} value={k}>
                        {k in LEVEL_INFO ? LEVEL_INFO[k as keyof typeof LEVEL_INFO].short : ORGAN_INFO[k as keyof typeof ORGAN_INFO].label}
                      </option>
                    ))}
                  </select>
                  <select className={`${field} w-40`} value={item.image ?? 'building'} onChange={(e) => setSortItem(i, { image: e.target.value })}>
                    {ILLUSTRATION_KEYS.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                  <button type="button" className="icon-btn" onClick={() => set('sortItems', (q.sortItems ?? []).filter((_, j) => j !== i))} aria-label="Remove card">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(q.sortItems?.length ?? 0) < 6 && (
                <button
                  type="button"
                  className="flex w-fit items-center gap-1 rounded-lg px-2 py-2 text-sm font-bold text-sky-700"
                  onClick={() => set('sortItems', [...(q.sortItems ?? []), { id: `${q.id}-${Date.now().toString(36)}`, text: '', answer: sortKeys[0], image: 'building' }])}
                >
                  <Plus className="h-4 w-4" /> Add card
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className={labelCls}>EXPLANATION (“WHY?” CARD)</span>
            <textarea className={field} rows={2} value={q.explanation} onChange={(e) => set('explanation', e.target.value)} />
          </label>
          {!isSort && (
            <>
              <label className="block">
                <span className={labelCls}>CONCEPT AFTER A WRONG ANSWER</span>
                <input className={field} value={q.concept ?? ''} onChange={(e) => set('concept', e.target.value)} placeholder="The issue is primarily local in nature." />
              </label>
              <label className="block">
                <span className={labelCls}>HINT</span>
                <input className={field} value={q.hint ?? ''} onChange={(e) => set('hint', e.target.value)} />
              </label>
              <label className="block">
                <span className={labelCls}>LIGHTS UP LEVEL</span>
                <select className={field} value={q.governmentLevel ?? ''} onChange={(e) => set('governmentLevel', (e.target.value || undefined) as Question['governmentLevel'])}>
                  <option value="">None</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {LEVEL_INFO[l].label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelCls}>LIGHTS UP ORGAN</span>
                <select className={field} value={q.governmentOrgan ?? ''} onChange={(e) => set('governmentOrgan', (e.target.value || undefined) as Question['governmentOrgan'])}>
                  <option value="">None</option>
                  {ORGANS.map((o) => (
                    <option key={o} value={o}>
                      {ORGAN_INFO[o].label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelCls}>IMAGE (ICON OR URL)</span>
                <div className="flex items-center gap-2">
                  <IssueIllustration image={q.image} className="h-11 w-14 shrink-0 rounded-lg" />
                  <input className={field} list="illustrations" value={q.image ?? ''} onChange={(e) => set('image', e.target.value)} />
                  <datalist id="illustrations">
                    {ILLUSTRATION_KEYS.map((k) => (
                      <option key={k} value={k} />
                    ))}
                  </datalist>
                </div>
              </label>
              <label className="flex items-center gap-3 self-end pb-2">
                <input type="checkbox" className="h-6 w-6 accent-sky-600" checked={!!q.finale} onChange={(e) => set('finale', e.target.checked || undefined)} />
                <span className="font-semibold text-slate-700">Use as a final (combined-concept) mission</span>
              </label>
            </>
          )}
        </div>

        {problems.length > 0 && (
          <ul className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" className="btn btn-ghost px-6" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn px-6 text-white" style={{ background: '#1F6FEB' }} disabled={problems.length > 0} onClick={() => onSave(cleaned)}>
            Save question
          </button>
        </div>
      </div>
    </div>
  );
}
