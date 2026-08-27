'use client';

import React from 'react';
import { X, Award, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';
import { CIVIC_BADGES_LIST, TRANSLATIONS } from '@/data/translations';
import { Language } from '@/types/game';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  earnedBadges: string[];
  language: Language;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  earnedBadges,
  language,
}) => {
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  const earnedCount = earnedBadges.length;
  const totalBadges = CIVIC_BADGES_LIST.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-slate-900 border-2 border-amber-500/70 rounded-3xl shadow-2xl p-5 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-glow">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold uppercase">
                  {earnedCount} of {totalBadges} Badges Unlocked
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-0.5">
                {t.badgesTitle}
              </h2>
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

        {/* Subtitle */}
        <p className="text-xs md:text-sm text-slate-300 my-3">
          {t.badgesSubtitle}
        </p>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
          {CIVIC_BADGES_LIST.map((badge) => {
            const isEarned = earnedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  isEarned
                    ? 'bg-slate-850 border-amber-500/80 shadow-glow'
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md ${
                        isEarned
                          ? `bg-gradient-to-tr ${badge.color}`
                          : 'bg-slate-800 text-slate-600'
                      }`}
                    >
                      {badge.icon}
                    </div>

                    {isEarned ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Earned</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-black text-sm text-white">
                    {language === 'hi' ? badge.hindiTitle : badge.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                {isEarned && (
                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-1 text-[10px] text-amber-300 font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>Included in Diploma</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Close CTA */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-glow transition-all"
          >
            {language === 'hi' ? 'बंद करें' : 'Back to Village'}
          </button>
        </div>
      </div>
    </div>
  );
};
