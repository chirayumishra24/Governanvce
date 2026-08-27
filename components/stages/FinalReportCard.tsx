'use client';

import React, { useRef } from 'react';
import { AssessmentScores, GameState } from '@/types/game';
import { CIVIC_BADGES_LIST } from '@/data/translations';
import {
  X,
  Award,
  Star,
  CheckCircle2,
  TrendingUp,
  Printer,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface FinalReportCardProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  scores: AssessmentScores;
  onRestart: () => void;
  onOpenTeacherMode: () => void;
}

export const FinalReportCard: React.FC<FinalReportCardProps> = ({
  isOpen,
  onClose,
  gameState,
  scores,
  onRestart,
  onOpenTeacherMode,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    soundEngine.playClick();
    window.print();
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-4 h-4 ${
              s <= count ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div
        ref={printRef}
        className="relative w-full max-w-4xl my-auto bg-slate-900 border-2 border-amber-500/80 rounded-3xl shadow-2xl p-6 md:p-10 text-white"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black shadow-glow">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold uppercase">
                  Governance Lab Report
                </span>
                <span className="text-xs text-slate-400">Class VI Social Science</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
                YOUR GOVERNANCE REPORT CARD
              </h1>
              <p className="text-xs text-slate-400">
                Decision-Maker: <strong className="text-amber-400">{gameState.studentName}</strong> • Grassroots Democracy (Panchayati Raj)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all print:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Score Badge */}
        <div className="my-6 p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-800 to-indigo-950/60 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              Performance Level
            </div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {scores.performanceLevel === 'EXCELLENT' && '🌟 Master Bal Sarpanch'}
              {scores.performanceLevel === 'GOOD' && '🎖️ Skilled Democratic Leader'}
              {scores.performanceLevel === 'DEVELOPING' && '🌱 Emerging Decision Maker'}
              {scores.performanceLevel === 'BEGINNING' && '📘 Civic Explorer'}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Evaluated on Democratic Participation, Need Discovery & Consequence Awareness
            </p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <div className="text-xs font-bold text-slate-400 uppercase">Overall Assessment Score</div>
            <div className="text-4xl md:text-5xl font-black text-amber-400">
              {scores.total} <span className="text-lg text-slate-400 font-normal">/ 90</span>
            </div>
          </div>
        </div>

        {/* 5 Assessment Dimension Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <ScoreBar label="1. Decision Making (Urgency & Relevance)" score={scores.decisionMaking} max={20} color="bg-blue-500" />
          <ScoreBar label="2. Prioritisation (Gram Sabha Consensus)" score={scores.prioritisation} max={20} color="bg-amber-500" />
          <ScoreBar label="3. Resource Management (₹100k Budget)" score={scores.resourceManagement} max={20} color="bg-emerald-500" />
          <ScoreBar label="4. Consequence Awareness (Village Impact)" score={scores.consequenceAwareness} max={20} color="bg-sky-500" />
          <div className="md:col-span-2">
            <ScoreBar label="5. Civic Reflection (Democratic Reasoning)" score={scores.reflection} max={10} color="bg-purple-500" />
          </div>
        </div>

        {/* Star Rating Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
          <div className="text-center">
            <div className="text-[11px] font-bold text-slate-400 mb-1">Community Impact</div>
            <div className="flex justify-center mb-1">{renderStars(scores.starRatings.communityImpact)}</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] font-bold text-slate-400 mb-1">Budget Discipline</div>
            <div className="flex justify-center mb-1">{renderStars(scores.starRatings.budgetManagement)}</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] font-bold text-slate-400 mb-1">Participation</div>
            <div className="flex justify-center mb-1">{renderStars(scores.starRatings.participation)}</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] font-bold text-slate-400 mb-1">Civic Reasoning</div>
            <div className="flex justify-center mb-1">{renderStars(scores.starRatings.reasoning)}</div>
          </div>
        </div>

        {/* Earned Civic Badges Showcase */}
        {gameState.earnedBadges && gameState.earnedBadges.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 to-purple-950/30 border border-amber-500/40">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Civic Merit Badges Earned:</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {CIVIC_BADGES_LIST.filter((b) => gameState.earnedBadges.includes(b.id)).map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-amber-500/50 shadow-sm"
                >
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      {gameState.language === 'hi' ? badge.hindiTitle : badge.title}
                    </h5>
                    <span className="text-[10px] text-amber-400 font-medium">Earned Honor</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths & Growth Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Demonstrated Democratic Strengths:</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {scores.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Areas for Democratic Growth:</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {scores.growthAreas.map((g, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Print Certificate / PDF</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenTeacherMode();
              }}
              className="px-4 py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-xl text-xs font-bold border border-indigo-500/40 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Teacher Mode</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again with Different Choices</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ScoreBar: React.FC<{
  label: string;
  score: number;
  max: number;
  color: string;
}> = ({ label, score, max, color }) => {
  const percentage = Math.round((score / max) * 100);
  return (
    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold text-slate-300">{label}</span>
        <span className="font-bold text-white">
          {score} / {max} <span className="text-[10px] text-slate-400">({percentage}%)</span>
        </span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
