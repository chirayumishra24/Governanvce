'use client';

import React, { useState } from 'react';
import { PROJECT_OPTIONS } from '@/data/projectsData';
import { ProjectOption } from '@/types/game';
import {
  X,
  Hammer,
  Users,
  Coins,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface ProjectSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: ProjectOption) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  isOpen,
  onClose,
  onSelectProject,
}) => {
  const [selectedId, setSelectedId] = useState<string>(PROJECT_OPTIONS[0].id);

  if (!isOpen) return null;

  const currentProject = PROJECT_OPTIONS.find((p) => p.id === selectedId) || PROJECT_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border-2 border-indigo-500/70 rounded-3xl shadow-2xl p-5 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 text-white font-black shadow-glow">
              <Hammer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-indigo-300">
                GOVERNANCE PROJECT SELECTION
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                Choose the primary village infrastructure initiative to implement this year
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
          {/* Left List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {PROJECT_OPTIONS.map((proj) => {
              const isSelected = proj.id === selectedId;
              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedId(proj.id);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-950/80 to-slate-800 border-indigo-400 shadow-glow'
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                      {proj.sector}
                    </span>
                    <span className="text-xs font-black text-amber-400">
                      ₹{proj.cost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">{proj.title}</h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-sky-400" />
                      {proj.beneficiariesCount} Citizens
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {proj.durationMonths} {proj.durationMonths === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detailed Preview (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-xs font-bold uppercase">
                  {currentProject.expectedImpact} Impact Project
                </span>
                <div className="text-lg font-black text-amber-400">
                  Cost: ₹{currentProject.cost.toLocaleString('en-IN')}
                </div>
              </div>

              <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                {currentProject.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                {currentProject.description}
              </p>

              {/* Indicator Projected Multipliers */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 mb-4">
                <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Projected Indicator Improvements:</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(currentProject.indicatorImpacts).map(([key, val]) => (
                    <span
                      key={key}
                      className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-lg font-semibold"
                    >
                      +{val}% {key.replace('communityWellbeing', 'Wellbeing')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pros and Tradeoffs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                  <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Democratic Benefits:</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    {currentProject.pros.map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl">
                  <div className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Trade-offs & Duties:</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    {currentProject.tradeoffs.map((t, i) => (
                      <li key={i}>• {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Implementation Button */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  soundEngine.playConstructionThud();
                  onSelectProject(currentProject);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:brightness-110 text-slate-950 font-black text-sm md:text-base rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Implement This Project & Upgrade Village</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
