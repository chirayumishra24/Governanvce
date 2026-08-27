'use client';

import React, { useRef, useState, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const stickRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const radius = 40;

  const handleTouch = (clientX: number, clientY: number, rect: DOMRect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    const distance = Math.hypot(deltaX, deltaY);
    if (distance > radius) {
      deltaX = (deltaX / distance) * radius;
      deltaY = (deltaY / distance) * radius;
    }

    setPos({ x: deltaX, y: deltaY });
    onMove(deltaX / radius, deltaY / radius);
  };

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setActive(true);
    const rect = stickRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    handleTouch(clientX, clientY, rect);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!active) return;
    const rect = stickRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    handleTouch(clientX, clientY, rect);
  };

  const handleEnd = () => {
    setActive(false);
    setPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div
      ref={stickRef}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      className="md:hidden absolute bottom-24 left-6 z-30 w-24 h-24 rounded-full bg-slate-900/70 border-2 border-white/30 backdrop-blur-md flex items-center justify-center touch-none select-none"
    >
      <div
        className="w-10 h-10 rounded-full bg-amber-500 shadow-glow pointer-events-none transition-transform"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
        }}
      />
    </div>
  );
};
