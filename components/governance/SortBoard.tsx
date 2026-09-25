'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { CheckCircle2, type LucideIcon } from 'lucide-react';
import type { SortItem } from '@/types/controlRoom';
import { sfx } from '@/lib/sound';
import { IssueIllustration } from './IssueIllustration';

export interface SortTarget {
  key: string;
  label: string;
  sub?: string;
  color: string;
  icon: LucideIcon;
}

interface Props {
  boardId: string;
  items: SortItem[];
  targets: SortTarget[];
  placed: Record<string, string>;
  /** Returns true when the placement is correct (the card then snaps in). */
  onPlace: (itemId: string, target: string) => boolean;
  accent: string;
  size?: 'compact' | 'large';
  disabled?: boolean;
}

interface Drag {
  itemId: string;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  moved: boolean;
}

/**
 * Touch-first drag-and-drop. Works with pointer events so several students can drag on a smartboard at
 * the same time; tapping a card and then a target also works for anyone who finds dragging hard.
 */
export function SortBoard({ boardId, items, targets, placed, onPlace, accent, size = 'compact', disabled }: Props) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [shake, setShake] = useState<{ id: string; n: number } | null>(null);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const shakeTimer = useRef<number>();
  useEffect(() => setMounted(true), []);
  useEffect(() => () => window.clearTimeout(shakeTimer.current), []);

  const tray = items.filter((i) => !placed[i.id]);
  const large = size === 'large';

  const targetAt = (x: number, y: number) => {
    for (const el of document.elementsFromPoint(x, y)) {
      const t = (el as HTMLElement).closest?.(`[data-drop-board="${boardId}"]`) as HTMLElement | null;
      if (t?.dataset.dropTarget) return t.dataset.dropTarget;
    }
    return null;
  };

  const attempt = (itemId: string, target: string) => {
    const ok = onPlace(itemId, target);
    if (ok) {
      sfx.place();
      setSelected(null);
    } else {
      sfx.bounce();
      setShake((s) => ({ id: itemId, n: (s?.n ?? 0) + 1 }));
      window.clearTimeout(shakeTimer.current);
      shakeTimer.current = window.setTimeout(() => setShake(null), 500);
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>, item: SortItem) => {
    if (disabled || drag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({
      itemId: item.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      moved: false,
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const moved = drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 8;
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved });
    if (moved) setHoverTarget(targetAt(e.clientX, e.clientY));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const d = drag;
    setDrag(null);
    setHoverTarget(null);
    if (!d.moved) {
      // Tap: select the card, then tap a target.
      setSelected((s) => (s === d.itemId ? null : d.itemId));
      sfx.select();
      return;
    }
    const target = targetAt(e.clientX, e.clientY);
    if (target) attempt(d.itemId, target);
    else {
      // Dropped outside every target: the card simply returns to the tray.
      sfx.bounce();
    }
  };

  const dragItem = drag?.moved ? items.find((i) => i.id === drag.itemId) : null;

  return (
    <LayoutGroup id={boardId}>
      <div className="flex flex-col gap-3">
        {/* Card tray */}
        <div className={`clay-inset flex min-h-[5.5rem] flex-wrap justify-center gap-2 p-2 ${large ? 'min-h-[9rem] gap-3 p-3' : ''}`}>
          {tray.length === 0 && (
            <div className="flex items-center gap-2 self-center text-sm font-bold text-emerald-600">
              <CheckCircle2 className="h-5 w-5" /> All cards placed
            </div>
          )}
          {tray.map((item) => {
            const isDragging = drag?.itemId === item.id && drag.moved;
            const isSelected = selected === item.id;
            return (
              <motion.div
                key={`${item.id}-${shake?.id === item.id ? shake.n : 0}`}
                layoutId={`${boardId}-${item.id}`}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${item.text}. ${isSelected ? 'Selected, now choose a target.' : 'Drag to a target, or tap to select.'}`}
                onPointerDown={(e) => onPointerDown(e, item)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => {
                  setDrag(null);
                  setHoverTarget(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected((s) => (s === item.id ? null : item.id));
                  }
                }}
                className={`flex touch-none select-none flex-col items-center gap-1.5 rounded-2xl bg-white p-2 text-center shadow-md transition-[box-shadow,opacity] ${
                  large ? 'w-[10.5rem]' : 'w-[calc(33.333%-0.5rem)] min-w-[7.5rem]'
                } ${shake?.id === item.id ? 'animate-shake' : ''} ${disabled ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
                style={{
                  opacity: isDragging ? 0.3 : 1,
                  boxShadow: isSelected ? `0 0 0 3px ${accent}, 0 10px 24px -10px ${accent}` : undefined,
                }}
              >
                <IssueIllustration image={item.image} className={`w-full rounded-xl ${large ? 'h-16' : 'h-11'}`} />
                <span className={`font-bold leading-tight text-slate-700 ${large ? 'text-[0.95rem]' : 'text-[0.82rem]'}`}>{item.text}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Targets */}
        <div className="grid grid-cols-3 gap-2">
          {targets.map((t) => {
            const inside = items.filter((i) => placed[i.id] === t.key);
            const hovered = hoverTarget === t.key;
            const Icon = t.icon;
            return (
              <button
                type="button"
                key={t.key}
                data-drop-board={boardId}
                data-drop-target={t.key}
                disabled={disabled}
                onClick={() => selected && attempt(selected, t.key)}
                className={`flex flex-col items-stretch gap-1.5 rounded-2xl border-2 border-dashed p-2 text-left transition-all ${
                  large ? 'min-h-[13rem]' : 'min-h-[6.5rem]'
                } ${selected ? 'cursor-pointer' : 'cursor-default'}`}
                style={{
                  borderColor: hovered || selected ? t.color : `${t.color}66`,
                  background: hovered ? `${t.color}1f` : `${t.color}0d`,
                  transform: hovered ? 'scale(1.03)' : undefined,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: t.color }}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className={`font-extrabold leading-tight tracking-wide ${large ? 'text-[1.1rem]' : 'text-[0.85rem]'}`} style={{ color: t.color }}>
                      {t.label}
                    </div>
                    {t.sub && <div className={`font-semibold leading-tight text-slate-500 ${large ? 'text-[0.85rem]' : 'text-[0.68rem]'}`}>{t.sub}</div>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {inside.map((item) => (
                    <motion.div
                      key={item.id}
                      layoutId={`${boardId}-${item.id}`}
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className={`flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 font-semibold leading-tight text-slate-700 shadow-sm ${
                        large ? 'text-[0.85rem]' : 'text-[0.7rem]'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: t.color }} />
                      {item.text}
                    </motion.div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {mounted &&
        dragItem &&
        drag &&
        createPortal(
          <div
            className="pointer-events-none fixed left-0 top-0 z-[100] flex flex-col items-center gap-1.5 rounded-2xl bg-white p-2 text-center shadow-2xl"
            style={{
              width: drag.width,
              transform: `translate(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px) rotate(-3deg) scale(1.05)`,
              boxShadow: `0 0 0 3px ${accent}, 0 24px 40px -12px rgba(15,23,42,.45)`,
            }}
          >
            <IssueIllustration image={dragItem.image} className={`w-full rounded-xl ${large ? 'h-16' : 'h-11'}`} />
            <span className={`font-bold leading-tight text-slate-700 ${large ? 'text-[0.95rem]' : 'text-[0.82rem]'}`}>{dragItem.text}</span>
          </div>,
          document.body
        )}
    </LayoutGroup>
  );
}
