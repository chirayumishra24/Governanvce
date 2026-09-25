'use client';

import { Lightbulb, Map, SplitSquareHorizontal } from 'lucide-react';

interface Props {
  hintsLeft: number;
  fiftyLeft: number;
  hintUsed: boolean;
  fiftyUsed: boolean;
  fiftyAvailable: boolean;
  disabled?: boolean;
  onHint: () => void;
  onFifty: () => void;
  onLevelMap: () => void;
}

/** Educational power-ups: highlight the relevant concept, remove two wrong answers, or open the level map. */
export function PowerUps(p: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <PowerButton
        icon={<Lightbulb className="h-5 w-5 text-amber-500" />}
        label="HINT"
        badge={p.hintUsed ? 'USED' : `${p.hintsLeft} LEFT`}
        disabled={p.disabled || p.hintUsed || p.hintsLeft <= 0}
        onClick={p.onHint}
        title="Highlights the part of government this mission is about"
      />
      <PowerButton
        icon={<SplitSquareHorizontal className="h-5 w-5 text-orange-500" />}
        label="50/50"
        badge={p.fiftyUsed ? 'USED' : `${p.fiftyLeft} LEFT`}
        disabled={p.disabled || p.fiftyUsed || p.fiftyLeft <= 0 || !p.fiftyAvailable}
        onClick={p.onFifty}
        title="Removes two incorrect answers"
      />
      <PowerButton
        icon={<Map className="h-5 w-5 text-teal-600" />}
        label="LEVEL MAP"
        onClick={p.onLevelMap}
        title="Shows Local, State and National government with short explanations"
      />
    </div>
  );
}

function PowerButton({
  icon,
  label,
  badge,
  disabled,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  disabled?: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex min-h-[3.25rem] items-center justify-center gap-1.5 rounded-2xl border border-amber-100 bg-[#FFFBEB] px-2 font-extrabold text-slate-700 transition hover:bg-[#FEF3C7] disabled:cursor-not-allowed disabled:opacity-45"
    >
      {icon}
      <span className="text-[0.88rem]">{label}</span>
      {badge && <span className="rounded-md bg-amber-200/70 px-1.5 py-0.5 text-[0.62rem] font-extrabold text-amber-800">{badge}</span>}
    </button>
  );
}
