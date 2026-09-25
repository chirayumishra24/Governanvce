'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Check, Lightbulb, Trash2, X } from 'lucide-react';
import type { GameRecord, TeamId } from '@/types/controlRoom';
import { TEAM_IDS } from '@/types/controlRoom';
import { analyseGame, type Confusion } from '@/lib/analytics';
import { LEVEL_INFO, ORGAN_INFO, TEAM_THEME } from '@/lib/governance';

const COL_LABEL: Record<string, string> = {
  local: 'Local',
  state: 'State',
  national: 'National',
  legislature: 'Legislature',
  executive: 'Executive',
  judiciary: 'Judiciary',
  none: 'None / not govt',
};

function rowLabel(k: string) {
  if (k in LEVEL_INFO) return LEVEL_INFO[k as keyof typeof LEVEL_INFO].label;
  return ORGAN_INFO[k as keyof typeof ORGAN_INFO].label;
}

/** Post-game analytics for the teacher: what the class understood and where it got confused. */
export function AnalyticsDashboard({ records, onClear }: { records: GameRecord[]; onClear: () => void }) {
  const [selectedId, setSelectedId] = useState(records[0]?.id);
  const record = records.find((r) => r.id === selectedId) ?? records[0];
  const a = useMemo(() => (record ? analyseGame(record) : null), [record]);

  if (!record || !a) {
    return (
      <div className="clay-card p-10 text-center">
        <h2 className="text-2xl font-extrabold text-slate-800">No games played yet</h2>
        <p className="mt-2 text-lg text-slate-600">Analytics appear here after a class finishes a game.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="clay-card flex flex-wrap items-center gap-3 p-3">
        <label className="flex flex-1 items-center gap-2 text-sm font-bold text-slate-500">
          GAME
          <select
            className="min-h-[3rem] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-[0.95rem] font-semibold text-slate-800"
            value={record.id}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {new Date(r.playedAt).toLocaleString()} · {r.teamNames.knowledge} {r.teams.knowledge.score} – {r.teams.heritage.score} {r.teamNames.heritage}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-ghost px-4" style={{ minHeight: '3rem' }} onClick={() => window.confirm('Delete all saved game results?') && onClear()}>
          <Trash2 className="h-5 w-5" /> Clear history
        </button>
      </div>

      {/* Class insight */}
      <section className="clay-card flex gap-4 p-6" aria-labelledby="insight-title">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Lightbulb className="h-7 w-7" />
        </span>
        <div>
          <h2 id="insight-title" className="text-[0.85rem] font-extrabold tracking-[0.18em] text-slate-500">
            CLASS INSIGHT
          </h2>
          <p className="mt-1 text-[1.45rem] font-bold leading-snug text-slate-900">{a.insight}</p>
        </div>
      </section>

      {/* Figures */}
      <div className="grid gap-3 md:grid-cols-[1fr_3fr]">
        <div className="clay-card flex flex-col justify-center p-6">
          <div className="text-[0.95rem] font-bold text-slate-500">Total questions attempted</div>
          <div className="text-[3.2rem] font-semibold leading-none text-slate-900">{a.totalAttempted}</div>
          <div className="mt-2 text-[0.9rem] font-semibold text-slate-500">
            {Math.floor(record.elapsedSeconds / 60)} min {record.elapsedSeconds % 60} s played · ended {record.endedBy === 'time' ? 'by timer' : 'after all missions'}
          </div>
        </div>
        <div className="clay-card overflow-x-auto p-4">
          <table className="w-full min-w-[32rem] text-left">
            <thead>
              <tr className="text-[0.8rem] font-extrabold tracking-wider text-slate-500">
                <th className="py-2 pr-3">TEAM</th>
                <th className="py-2 pr-3 text-right">FINAL SCORE</th>
                <th className="py-2 pr-3 text-right">ACCURACY</th>
                <th className="py-2 pr-3 text-right">AVG RESPONSE</th>
                <th className="py-2 text-right">MAX STREAK</th>
              </tr>
            </thead>
            <tbody>
              {TEAM_IDS.map((id) => {
                const t = a.teams[id];
                return (
                  <tr key={id} className="border-t border-slate-100 text-[1.05rem] font-semibold text-slate-800">
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ background: TEAM_THEME[id].accent }} />
                        {t.name}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums">{t.score}</td>
                    <td className="py-3 pr-3 text-right tabular-nums">
                      {t.accuracy}% <span className="text-sm text-slate-500">({t.correct}/{t.attempted})</span>
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums">{t.avgResponseSec}s</td>
                    <td className="py-3 text-right tabular-nums">{t.maxStreak}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TopicAccuracy categories={a.categories} names={record.teamNames} />
        <section className="clay-card flex flex-col gap-3 p-5" aria-labelledby="missed-title">
          <h3 id="missed-title" className="text-[1.1rem] font-extrabold text-slate-800">
            Most frequently missed concept
          </h3>
          {a.weakestCategory ? (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
              <div className="text-[1.05rem] font-semibold text-slate-800">
                {a.weakestCategory.category}: {a.weakestCategory.accuracy}% correct ({a.weakestCategory.correct} of {a.weakestCategory.attempted})
              </div>
            </div>
          ) : (
            <p className="text-slate-600">Not enough answers yet.</p>
          )}
          <div className="text-[0.8rem] font-extrabold tracking-wider text-slate-500">QUESTIONS ANSWERED INCORRECTLY</div>
          {a.mostMissed.length ? (
            <ol className="flex flex-col gap-2">
              {a.mostMissed.map((m) => (
                <li key={m.text} className="clay-inset px-3 py-2 text-[0.98rem] font-medium text-slate-700">
                  <span className="font-bold text-slate-900">
                    {m.wrong} of {m.attempts} wrong:
                  </span>{' '}
                  {m.text}
                </li>
              ))}
            </ol>
          ) : (
            <p className="font-semibold text-emerald-700">No questions were answered incorrectly.</p>
          )}
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ConfusionTable title="Government-level confusion" subtitle="Rows: correct level · Columns: what teams chose" m={a.levelConfusion} />
        <ConfusionTable title="Organ-of-government confusion" subtitle="Rows: correct organ · Columns: what teams chose" m={a.organConfusion} />
      </div>

      <details className="clay-card p-5">
        <summary className="cursor-pointer text-[1.05rem] font-extrabold text-slate-800">Answer log ({record.log.length})</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-[0.92rem]">
            <thead className="text-[0.75rem] font-extrabold tracking-wider text-slate-500">
              <tr>
                <th className="py-2 pr-3">TEAM</th>
                <th className="py-2 pr-3">QUESTION</th>
                <th className="py-2 pr-3">CHOSEN</th>
                <th className="py-2 pr-3">CORRECT ANSWER</th>
                <th className="py-2 pr-3 text-right">TIME</th>
                <th className="py-2 text-right">POINTS</th>
              </tr>
            </thead>
            <tbody>
              {record.log.map((e, i) => (
                <tr key={i} className="border-t border-slate-100 align-top font-medium text-slate-700">
                  <td className="py-2 pr-3">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: TEAM_THEME[e.teamId].accent }} /> {record.teamNames[e.teamId]}
                  </td>
                  <td className="max-w-[26rem] py-2 pr-3">{e.questionText}</td>
                  <td className={`py-2 pr-3 ${e.correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                    <span className="inline-flex items-start gap-1">
                      {e.correct ? <Check className="mt-0.5 h-4 w-4 shrink-0" aria-label="Correct" /> : <X className="mt-0.5 h-4 w-4 shrink-0" aria-label="Incorrect" />}
                      {e.selectedAnswer}
                    </span>
                  </td>
                  <td className="py-2 pr-3">{e.correctAnswer === 'all-placed' ? 'All cards sorted' : e.correctAnswer}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{(e.responseMs / 1000).toFixed(1)}s</td>
                  <td className="py-2 text-right tabular-nums">{e.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/** Grouped horizontal bars: accuracy per category for each team. */
function TopicAccuracy({
  categories,
  names,
}: {
  categories: ReturnType<typeof analyseGame>['categories'];
  names: Record<TeamId, string>;
}) {
  return (
    <section className="clay-card flex flex-col gap-3 p-5" aria-labelledby="topic-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="topic-title" className="text-[1.1rem] font-extrabold text-slate-800">
          Accuracy by topic
        </h3>
        <div className="flex gap-4 text-[0.85rem] font-semibold text-slate-600" aria-label="Legend">
          {TEAM_IDS.map((id) => (
            <span key={id} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ background: TEAM_THEME[id].accent }} />
              {names[id]}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {categories.map((c) => (
          <div key={c.category} className="grid grid-cols-[9.5rem_1fr] items-center gap-3">
            <div className="text-[0.92rem] font-bold leading-tight text-slate-700">{c.category}</div>
            <div className="flex flex-col gap-[2px]">
              {TEAM_IDS.map((id) => {
                const t = c.byTeam[id];
                const pct = t.attempted ? Math.round((t.correct / t.attempted) * 100) : null;
                return (
                  <div
                    key={id}
                    className="group relative flex h-[1.1rem] items-center gap-2"
                    title={`${names[id]} · ${c.category}: ${pct === null ? 'no questions' : `${pct}% (${t.correct} of ${t.attempted})`}`}
                  >
                    <div className="relative h-full flex-1 bg-slate-50">
                      {pct !== null && (
                        <div
                          className="h-full rounded-r transition-[width] group-hover:brightness-110"
                          style={{ width: `${Math.max(pct, 1.5)}%`, background: TEAM_THEME[id].accent }}
                        />
                      )}
                    </div>
                    <span className="w-10 text-right text-[0.8rem] font-semibold tabular-nums text-slate-600">{pct === null ? '–' : `${pct}%`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Confusion matrix as a table with a single-hue sequential scale; the diagonal (correct) is outlined. */
function ConfusionTable<R extends string, C extends string>({ title, subtitle, m }: { title: string; subtitle: string; m: Confusion<R, C> }) {
  const max = Math.max(1, ...m.rows.flatMap((r) => m.cols.map((c) => m.counts[r][c])));
  return (
    <section className="clay-card flex flex-col gap-2 p-5" aria-label={title}>
      <h3 className="text-[1.1rem] font-extrabold text-slate-800">{title}</h3>
      <p className="text-[0.88rem] font-semibold text-slate-500">
        {subtitle} · {m.total ? `${Math.round((m.correct / m.total) * 100)}% correct across ${m.total} decisions` : 'no decisions of this kind yet'}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] table-fixed border-separate border-spacing-[2px] text-center">
          <thead>
            <tr className="text-[0.78rem] font-extrabold text-slate-500">
              <th />
              {m.cols.map((c) => (
                <th key={c} className="px-1 py-1">
                  {COL_LABEL[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.rows.map((r) => (
              <tr key={r}>
                <th className="pr-2 text-left text-[0.85rem] font-bold text-slate-700">{rowLabel(r)}</th>
                {m.cols.map((c) => {
                  const n = m.counts[r][c];
                  const k = n / max;
                  const diag = (r as string) === (c as string);
                  return (
                    <td
                      key={c}
                      title={`${rowLabel(r)} answered as ${COL_LABEL[c]}: ${n}`}
                      className="h-11 rounded-md text-[1rem] font-bold tabular-nums"
                      style={{
                        background: n ? `rgba(30, 64, 175, ${0.08 + k * 0.72})` : '#F8FAFC',
                        color: k > 0.5 ? '#fff' : '#1E293B',
                        outline: diag ? '2px solid #0E8F80' : undefined,
                        outlineOffset: -2,
                      }}
                    >
                      {n || ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[0.8rem] font-semibold text-slate-500">Green outline = correct decision. Darker cells = more answers.</p>
    </section>
  );
}
