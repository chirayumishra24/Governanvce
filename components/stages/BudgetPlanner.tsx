'use client';

import React from 'react';
import { SectorBudgets, PriorityTier } from '@/types/game';
import {
  X,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  GraduationCap,
  HeartPulse,
  Truck,
  Sparkles,
  Building,
  Plus,
  Minus,
  RefreshCcw,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface BudgetPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: SectorBudgets;
  onUpdateBudgets: (newBudgets: SectorBudgets) => void;
  assignedPriorities: Record<string, PriorityTier>;
  onProceedToProjects: () => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  isOpen,
  onClose,
  budgets,
  onUpdateBudgets,
  assignedPriorities,
  onProceedToProjects,
}) => {
  if (!isOpen) return null;

  const totalFund = 100000;
  const totalAllocated = Object.values(budgets).reduce((a, b) => a + b, 0);
  const remaining = totalFund - totalAllocated;
  const isOverspent = remaining < 0;

  const sectorConfigs = [
    {
      key: 'water' as keyof SectorBudgets,
      label: 'Water Supply & Solar Pumps',
      icon: <Droplets className="w-4 h-4 text-sky-400" />,
      color: 'bg-sky-500',
      tag: 'Need: High',
      minRecommended: 25000,
    },
    {
      key: 'sanitation' as keyof SectorBudgets,
      label: 'Sanitation & Covered Drains',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      color: 'bg-emerald-500',
      tag: 'Need: High',
      minRecommended: 15000,
    },
    {
      key: 'education' as keyof SectorBudgets,
      label: 'School Building & Classrooms',
      icon: <GraduationCap className="w-4 h-4 text-amber-400" />,
      color: 'bg-amber-500',
      tag: 'Need: Medium',
      minRecommended: 15000,
    },
    {
      key: 'roads' as keyof SectorBudgets,
      label: 'Market Road & Solar Streetlights',
      icon: <Truck className="w-4 h-4 text-yellow-400" />,
      color: 'bg-yellow-500',
      tag: 'Need: Medium',
      minRecommended: 15000,
    },
    {
      key: 'health' as keyof SectorBudgets,
      label: 'Health Centre & Medicine Supply',
      icon: <HeartPulse className="w-4 h-4 text-red-400" />,
      color: 'bg-red-500',
      tag: 'Need: Medium',
      minRecommended: 10000,
    },
    {
      key: 'community' as keyof SectorBudgets,
      label: 'Gram Sabha Hall & Public Spaces',
      icon: <Building className="w-4 h-4 text-purple-400" />,
      color: 'bg-purple-500',
      tag: 'Need: Low',
      minRecommended: 5000,
    },
  ];

  const handleAdjust = (key: keyof SectorBudgets, delta: number) => {
    const current = budgets[key];
    const updated = Math.max(0, Math.min(100000, current + delta));
    soundEngine.playCoin();
    onUpdateBudgets({
      ...budgets,
      [key]: updated,
    });
  };

  const handleSliderChange = (key: keyof SectorBudgets, value: number) => {
    onUpdateBudgets({
      ...budgets,
      [key]: value,
    });
  };

  const handleResetBalanced = () => {
    soundEngine.playCoin();
    onUpdateBudgets({
      water: 30000,
      education: 20000,
      sanitation: 20000,
      roads: 15000,
      health: 10000,
      community: 5000,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto bg-slate-900 border-2 border-yellow-500/70 rounded-3xl shadow-2xl p-5 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-500 text-slate-950 font-black shadow-glow">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-amber-400">
                PANCHAYAT BUDGET ALLOCATION
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                Allocate your annual ₹100,000 Village Fund across critical community sectors
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

        {/* Budget Status Meter */}
        <div className="my-5 p-4 rounded-2xl bg-slate-800/90 border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Village Fund</div>
            <div className="text-xl font-black text-white">₹{totalFund.toLocaleString('en-IN')}</div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Allocated So Far</div>
            <div className={`text-xl font-black ${isOverspent ? 'text-red-400' : 'text-emerald-400'}`}>
              ₹{totalAllocated.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Remaining Fund</div>
            <div className={`text-xl font-black ${isOverspent ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              {isOverspent ? `-₹${Math.abs(remaining).toLocaleString('en-IN')}` : `₹${remaining.toLocaleString('en-IN')}`}
            </div>
          </div>
        </div>

        {/* Overspending Warning Alert */}
        {isOverspent && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-500 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>Budget Overspent!</strong> You have exceeded the ₹100,000 village fund by ₹{Math.abs(remaining).toLocaleString('en-IN')}. Reduce some allocations before proceeding.
            </span>
          </div>
        )}

        {/* Sector Allocation Sliders */}
        <div className="space-y-3.5 my-5 max-h-[380px] overflow-y-auto pr-1">
          {sectorConfigs.map((sec) => {
            const amount = budgets[sec.key];
            const percentage = Math.round((amount / totalFund) * 100);

            return (
              <div
                key={sec.key}
                className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {sec.icon}
                    <span className="font-bold text-sm text-white">{sec.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 font-semibold border border-slate-700">
                      {sec.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-amber-400">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({percentage}%)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAdjust(sec.key, -5000)}
                    disabled={amount <= 0}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white transition-all"
                    title="-₹5,000"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="60000"
                    step="2500"
                    value={amount}
                    onChange={(e) => handleSliderChange(sec.key, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />

                  <button
                    onClick={() => handleAdjust(sec.key, 5000)}
                    disabled={isOverspent}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white transition-all"
                    title="+₹5,000"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Guidance & CTA */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleResetBalanced}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Apply Balanced Preset Allocation</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSuccessFanfare();
              onProceedToProjects();
            }}
            disabled={isOverspent || totalAllocated < 40000}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 text-slate-950 font-black text-sm rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Proceed to Project Selection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
