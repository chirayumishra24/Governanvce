'use client';

import React from 'react';
import { ProjectOption, IndicatorMetrics } from '@/types/game';
import {
  X,
  TrendingUp,
  Sparkles,
  Smile,
  Heart,
  GraduationCap,
  Users,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface ConsequenceReviewProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectOption;
  indicators: IndicatorMetrics;
  onProceedToFollowUp: () => void;
}

export const ConsequenceReview: React.FC<ConsequenceReviewProps> = ({
  isOpen,
  onClose,
  project,
  indicators,
  onProceedToFollowUp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-slate-900 border-2 border-emerald-500/70 rounded-3xl shadow-2xl p-6 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-black shadow-glow">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-emerald-400">
                GOVERNANCE IMPACT REPORT
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                Observing the real-world consequences of your decision in the village
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

        {/* 3D Visual Transformation Summary */}
        <div className="my-5 p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/30">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Visible 3D Village Upgrades:</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {project.visualChangeDescription}
          </p>
        </div>

        {/* Indicator Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
          <StatBox
            icon={<Smile className="w-4 h-4 text-pink-400" />}
            label="Wellbeing"
            value={indicators.communityWellbeing}
            change={project.indicatorImpacts.communityWellbeing || 0}
          />
          <StatBox
            icon={<Heart className="w-4 h-4 text-red-400" />}
            label="Health"
            value={indicators.health}
            change={project.indicatorImpacts.health || 0}
          />
          <StatBox
            icon={<GraduationCap className="w-4 h-4 text-amber-400" />}
            label="Education"
            value={indicators.education}
            change={project.indicatorImpacts.education || 0}
          />
          <StatBox
            icon={<Sparkles className="w-4 h-4 text-emerald-400" />}
            label="Cleanliness"
            value={indicators.cleanliness}
            change={project.indicatorImpacts.cleanliness || 0}
          />
          <StatBox
            icon={<TrendingUp className="w-4 h-4 text-sky-400" />}
            label="Development"
            value={indicators.development}
            change={project.indicatorImpacts.development || 0}
          />
          <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col justify-center items-center text-center">
            <Users className="w-5 h-5 text-indigo-400 mb-1" />
            <div className="text-[11px] text-slate-400">Beneficiaries</div>
            <div className="text-base font-bold text-white">
              {project.beneficiariesCount} Villagers
            </div>
          </div>
        </div>

        {/* Educational Takeaway */}
        <div className="p-3.5 bg-blue-950/30 border border-blue-500/30 rounded-2xl text-xs text-blue-200 leading-relaxed">
          📖 <strong>Civics Lesson:</strong> Every rupee spent on community welfare creates ripple effects. Notice how improving basic amenities elevates overall happiness and child health.
        </div>

        {/* CTA */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onProceedToFollowUp();
            }}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-sm rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to 3-Month Follow-Up Event</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  change: number;
}> = ({ icon, label, value, change }) => {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          {icon}
          <span>{label}</span>
        </div>
        {change > 0 && (
          <span className="text-[11px] font-bold text-emerald-400">+{change}%</span>
        )}
      </div>
      <div className="text-xl font-black text-white">{Math.round(value)}%</div>
      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1.5">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(5, value))}%` }}
        />
      </div>
    </div>
  );
};
