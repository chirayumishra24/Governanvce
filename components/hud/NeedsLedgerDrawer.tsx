'use client';

import React from 'react';
import { COMMUNITY_NEEDS } from '@/data/villageData';
import { CommunityNeed, PriorityTier } from '@/types/game';
import { X, Users, AlertCircle, Droplets, Sparkles, GraduationCap, Truck, HeartPulse, Building } from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface NeedsLedgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  discoveredNeeds: string[];
  assignedPriorities: Record<string, PriorityTier>;
  onOpenMeeting: () => void;
}

export const NeedsLedgerDrawer: React.FC<NeedsLedgerDrawerProps> = ({
  isOpen,
  onClose,
  discoveredNeeds,
  assignedPriorities,
  onOpenMeeting,
}) => {
  if (!isOpen) return null;

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case 'water': return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'sanitation': return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'education': return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'roads': return <Truck className="w-4 h-4 text-yellow-400" />;
      case 'health': return <HeartPulse className="w-4 h-4 text-red-400" />;
      default: return <Building className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-amber-400 flex items-center gap-2">
              📋 Community Needs Ledger
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              {discoveredNeeds.length} of {COMMUNITY_NEEDS.length} issues identified across village wards
            </p>
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

        {/* Needs List */}
        <div className="space-y-3 my-6">
          {COMMUNITY_NEEDS.map((need) => {
            const isDiscovered = discoveredNeeds.includes(need.id);
            const priority = assignedPriorities[need.id] || need.basePriority;

            return (
              <div
                key={need.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDiscovered
                    ? 'bg-slate-800/80 border-slate-700 hover:border-amber-400/50'
                    : 'bg-slate-900/40 border-dashed border-slate-800 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                      {getSectorIcon(need.sector)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base">
                        {isDiscovered ? need.title : '🔒 Undiscovered Issue (Explore village to find)'}
                      </h3>
                      <p className="text-[11px] text-slate-400">{need.location}</p>
                    </div>
                  </div>

                  {isDiscovered && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-semibold text-slate-300">
                        <Users className="w-3 h-3 text-sky-400" />
                        {need.peopleAffected} Affected
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          priority === 'high'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : priority === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {priority} Priority
                      </span>
                    </div>
                  )}
                </div>

                {isDiscovered && (
                  <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                    <p className="leading-relaxed">{need.description}</p>
                    <div className="p-2 bg-red-950/30 border border-red-900/40 rounded-xl text-[11px] text-red-300 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Risk if neglected:</strong> {need.consequencesIfIgnored}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {discoveredNeeds.length < 2
              ? '⚠️ Talk to more villagers to identify more community needs before holding the Gram Sabha.'
              : '✅ Ready to debate and prioritize in the Gram Sabha!'}
          </p>

          <button
            onClick={() => {
              soundEngine.playGramSabhaGong();
              onClose();
              onOpenMeeting();
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-bold text-sm rounded-xl shadow-glow transition-all"
          >
            Enter Gram Sabha Meeting 🏛️
          </button>
        </div>
      </div>
    </div>
  );
};
