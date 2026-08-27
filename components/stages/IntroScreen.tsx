'use client';

import React, { useState } from 'react';
import { Play, Sparkles, Compass, Users, Award, ShieldCheck } from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface IntroScreenProps {
  onStart: (name: string) => void;
  onOpenTeacherMode: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, onOpenTeacherMode }) => {
  const [name, setName] = useState('');

  const handleStart = () => {
    soundEngine.playSuccessFanfare();
    soundEngine.startVillageAmbient();
    onStart(name.trim() || 'Young Leader');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto p-6 md:p-10 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-center">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
            🏛️ Class VI Social Science • Theme D
          </span>
          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
            Chapter 10: Grassroots Democracy
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-orange-400 tracking-tight mb-2">
          YOUR VILLAGE, YOUR DECISION
        </h1>
        <p className="text-base md:text-xl font-bold text-sky-300 mb-6">
          Governance Lab — Grassroots Democracy Simulation
        </p>

        {/* Educational Narrative */}
        <div className="max-w-xl mx-auto mb-8 p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-slate-200 text-sm md:text-base leading-relaxed text-left space-y-3">
          <p className="font-semibold text-amber-300 text-center">
            “Welcome to Your Village. This community has different needs. Your decisions will affect what happens next.”
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-700/80 flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Explore Village & Talk to Citizens</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-700/80 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Hold Gram Sabha & Debate Priorities</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-700/80 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Allocate ₹100k & Observe Impact</span>
            </div>
          </div>
        </div>

        {/* Student Name Input */}
        <div className="max-w-md mx-auto mb-6">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Enter Decision-Maker Name:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aarav Sharma / Ananya Verma"
            className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 focus:border-amber-400 rounded-2xl text-center text-white placeholder-slate-500 font-semibold focus:outline-none transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStart();
            }}
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:brightness-110 text-slate-950 font-black text-lg rounded-2xl shadow-glow transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START GOVERNANCE LAB</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenTeacherMode();
            }}
            className="w-full sm:w-auto px-5 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Teacher Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
