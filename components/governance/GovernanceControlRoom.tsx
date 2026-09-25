'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { GovernmentLevel, RenderMode } from '@/types/controlRoom';
import type { RoomState } from '@/lib/roomState';
import { ControlRoom2D } from './ControlRoom2D';

// The 3D scene (three.js, R3F, drei) is loaded lazily and only in the browser.
const ControlRoomScene = dynamic(() => import('@/components/3d/ControlRoomScene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm">
        <span className="h-3 w-3 animate-ping rounded-full bg-sky-500" />
        Preparing control room…
      </div>
    </div>
  ),
});

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export type RoomView = '3d' | 'map';

interface Props {
  room: RoomState;
  now: number;
  view: RoomView;
  renderMode?: RenderMode;
  interactive?: boolean;
  showCards?: boolean;
  selectedLevel?: GovernmentLevel | null;
  onSelectLevel?: (level: GovernmentLevel) => void;
  banner?: React.ReactNode;
}

/** The central model of NATIONAL / STATE / LOCAL. 3D when possible, flat map view otherwise. */
export function GovernanceControlRoom({
  room,
  now,
  view,
  renderMode = 'auto',
  interactive,
  showCards = true,
  selectedLevel,
  onSelectLevel,
  banner,
}: Props) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => setWebgl(supportsWebGL()), []);

  // Responsibility cards need side room; hide them on narrow stages (tablets, phones).
  const stageRef = useRef<HTMLElement>(null);
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWide(e.contentRect.width >= 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const use3D = view === '3d' && renderMode !== '2d' && webgl !== false;

  return (
    <section
      ref={stageRef}
      className="control-room-stage relative h-full w-full overflow-hidden rounded-[1.75rem]"
      aria-label="Governance control room: National, State and Local government"
    >
      <div className="control-room-backdrop" aria-hidden />
      {banner && <div className="pointer-events-none absolute inset-x-0 top-3 z-40 flex justify-center">{banner}</div>}
      {webgl === null ? null : use3D ? (
        <ControlRoomScene
          room={room}
          now={now}
          interactive={interactive}
          showCards={showCards && wide}
          selectedLevel={selectedLevel}
          onSelectLevel={onSelectLevel}
        />
      ) : (
        <ControlRoom2D room={room} now={now} selectedLevel={selectedLevel} onSelectLevel={onSelectLevel} />
      )}
      {view === '3d' && webgl === false && (
        <div className="absolute bottom-3 left-1/2 z-40 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-600 shadow">
          3D is not available on this device, so the map view is shown.
        </div>
      )}
    </section>
  );
}
