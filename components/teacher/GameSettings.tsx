'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, Save } from 'lucide-react';
import type { DifficultyMode, GameSettings, RenderMode } from '@/types/controlRoom';
import { DEFAULT_SETTINGS } from '@/lib/storage';

const field = 'min-h-[3rem] w-full rounded-xl border border-slate-200 bg-white px-3 text-[1rem] font-semibold text-slate-800';
const labelCls = 'mb-1 block text-[0.8rem] font-extrabold tracking-wider text-slate-500';

export function GameSettingsPanel({ settings, onSave }: { settings: GameSettings; onSave: (s: GameSettings) => void }) {
  const [s, setS] = useState(settings);
  const [saved, setSaved] = useState(false);
  useEffect(() => setS(settings), [settings]);
  const set = <K extends keyof GameSettings>(k: K, v: GameSettings[K]) => {
    setSaved(false);
    setS((p) => ({ ...p, [k]: v }));
  };

  return (
    <div className="clay-card flex flex-col gap-6 p-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <label>
          <span className={labelCls}>NUMBER OF MISSIONS PER TEAM</span>
          <input type="number" min={3} max={20} className={field} value={s.missionCount} onChange={(e) => set('missionCount', Math.min(20, Math.max(3, Number(e.target.value) || 15)))} />
        </label>
        <label>
          <span className={labelCls}>GAME DURATION (MINUTES)</span>
          <input
            type="number"
            min={1}
            max={30}
            step={0.5}
            className={field}
            value={s.durationSeconds / 60}
            onChange={(e) => set('durationSeconds', Math.round(Math.min(30, Math.max(1, Number(e.target.value) || 5)) * 60))}
          />
        </label>
        <label>
          <span className={labelCls}>DIFFICULTY</span>
          <select className={field} value={s.difficulty} onChange={(e) => set('difficulty', e.target.value as DifficultyMode)}>
            <option value="progressive">Progressive (easy to hard)</option>
            <option value="easy">Easy only</option>
            <option value="medium">Medium only</option>
            <option value="hard">Hard only</option>
          </select>
        </label>
        <label>
          <span className={labelCls}>BLUE TEAM NAME</span>
          <input className={field} value={s.teamNames.knowledge} onChange={(e) => set('teamNames', { ...s.teamNames, knowledge: e.target.value })} />
        </label>
        <label>
          <span className={labelCls}>ORANGE TEAM NAME</span>
          <input className={field} value={s.teamNames.heritage} onChange={(e) => set('teamNames', { ...s.teamNames, heritage: e.target.value })} />
        </label>
        <label>
          <span className={labelCls}>3D CONTROL ROOM</span>
          <select className={field} value={s.renderMode} onChange={(e) => set('renderMode', e.target.value as RenderMode)}>
            <option value="auto">Automatic (3D when supported)</option>
            <option value="3d">Always start in 3D</option>
            <option value="2d">2D map only (low-performance computers)</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Toggle label="Sound effects" checked={s.soundEnabled} onChange={(v) => set('soundEnabled', v)} />
        <Toggle label="Randomise questions" checked={s.randomise} onChange={(v) => set('randomise', v)} />
        <Toggle label="Power-ups" checked={s.powerUpsEnabled} onChange={(v) => set('powerUpsEnabled', v)} />
      </div>

      {s.powerUpsEnabled && (
        <div className="grid gap-5 md:grid-cols-2">
          <label>
            <span className={labelCls}>HINTS PER TEAM</span>
            <input type="number" min={0} max={10} className={field} value={s.hintsPerTeam} onChange={(e) => set('hintsPerTeam', Math.max(0, Number(e.target.value) || 0))} />
          </label>
          <label>
            <span className={labelCls}>50/50 PER TEAM</span>
            <input type="number" min={0} max={10} className={field} value={s.fiftyFiftyPerTeam} onChange={(e) => set('fiftyFiftyPerTeam', Math.max(0, Number(e.target.value) || 0))} />
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 font-bold text-emerald-700">
            <CheckCircle2 className="h-5 w-5" /> Saved. The next game will use these settings.
          </span>
        )}
        <button type="button" className="btn btn-ghost px-5" onClick={() => setS({ ...DEFAULT_SETTINGS })}>
          <RotateCcw className="h-5 w-5" /> Defaults
        </button>
        <button
          type="button"
          className="btn px-6 text-white"
          style={{ background: '#1F6FEB' }}
          onClick={() => {
            onSave(s);
            setSaved(true);
          }}
        >
          <Save className="h-5 w-5" /> Save settings
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="clay-inset flex min-h-[3.5rem] items-center justify-between px-4 text-left text-[1rem] font-bold text-slate-700"
    >
      {label}
      <span className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  );
}
