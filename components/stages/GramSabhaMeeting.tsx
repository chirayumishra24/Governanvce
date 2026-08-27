'use client';

import React, { useState } from 'react';
import { COMMUNITY_NEEDS, NPCS } from '@/data/villageData';
import { PriorityTier, CommunityNeed } from '@/types/game';
import {
  X,
  Building2,
  Users,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Droplets,
  GraduationCap,
  Truck,
  HeartPulse,
  Building,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface GramSabhaMeetingProps {
  isOpen: boolean;
  onClose: () => void;
  discoveredNeeds: string[];
  assignedPriorities: Record<string, PriorityTier>;
  onUpdatePriority: (needId: string, tier: PriorityTier) => void;
  onProceedToBudget: () => void;
}

export const GramSabhaMeeting: React.FC<GramSabhaMeetingProps> = ({
  isOpen,
  onClose,
  discoveredNeeds,
  assignedPriorities,
  onUpdatePriority,
  onProceedToBudget,
}) => {
  if (!isOpen) return null;

  // Active feedback message from villagers based on current high priority needs
  const getVillagerFeedback = () => {
    if (assignedPriorities['need_water'] === 'high') {
      return {
        avatar: '👩🏽‍🌾',
        name: 'Amina Bi',
        text: '“Prioritising safe piped drinking water brings relief to 140 households. Our children will stay healthy!”',
      };
    }
    if (assignedPriorities['need_sanitation'] === 'high') {
      return {
        avatar: '👩🏽‍🔧',
        name: 'Sunita Devi',
        text: '“Thank you for putting cleanliness first! Covered drainage will stop mosquito diseases in our wards.”',
      };
    }
    if (assignedPriorities['need_school'] === 'high') {
      return {
        avatar: '👨🏽‍🏫',
        name: 'Masterji Ramesh',
        text: '“A community that values education ensures a bright future for its children. Well prioritized!”',
      };
    }
    if (assignedPriorities['need_road'] === 'high') {
      return {
        avatar: '👨🏽‍🌾',
        name: 'Deepak Kumar',
        text: '“Fixing the market road will help 320 farmers transport their crops and connect us to town hospitals!”',
      };
    }
    return {
      avatar: '👨🏽‍💼',
      name: 'Sarpanch Rajesh',
      text: '“Every voice in the Gram Sabha matters. Categorize each issue carefully into High, Medium, or Low priority.”',
    };
  };

  const activeFeedback = getVillagerFeedback();

  const getNeedIcon = (sector: string) => {
    switch (sector) {
      case 'water': return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'sanitation': return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'education': return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'roads': return <Truck className="w-4 h-4 text-yellow-400" />;
      case 'health': return <HeartPulse className="w-4 h-4 text-red-400" />;
      default: return <Building className="w-4 h-4 text-purple-400" />;
    }
  };

  const highPriorityNeeds = COMMUNITY_NEEDS.filter(
    (n) => (assignedPriorities[n.id] || n.basePriority) === 'high'
  );
  const mediumPriorityNeeds = COMMUNITY_NEEDS.filter(
    (n) => (assignedPriorities[n.id] || n.basePriority) === 'medium'
  );
  const lowPriorityNeeds = COMMUNITY_NEEDS.filter(
    (n) => (assignedPriorities[n.id] || n.basePriority) === 'low'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border-2 border-amber-500/70 rounded-3xl shadow-2xl p-5 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black shadow-glow">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-amber-400">
                  GRAM SABHA ASSEMBLY
                </h2>
                <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-full">
                  Deliberation Phase
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400">
                Debate, balance community trade-offs, and prioritize village issues
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

        {/* Live Villager Reaction Box */}
        <div className="my-5 p-4 rounded-2xl bg-slate-800/90 border border-amber-500/30 flex items-center gap-3.5 shadow-inner">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
            {activeFeedback.avatar}
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400">{activeFeedback.name} says:</div>
            <p className="text-xs md:text-sm text-slate-200 italic leading-snug">
              {activeFeedback.text}
            </p>
          </div>
        </div>

        {/* Priority Columns Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {/* HIGH PRIORITY */}
          <PriorityColumn
            title="High Priority"
            tier="high"
            color="border-red-500/50 bg-red-950/20"
            badgeColor="bg-red-500 text-white"
            description="Immediate lifelines & urgent health/water needs"
            needs={highPriorityNeeds}
            onMovePriority={(needId, tier) => {
              soundEngine.playClick();
              onUpdatePriority(needId, tier);
            }}
            getNeedIcon={getNeedIcon}
          />

          {/* MEDIUM PRIORITY */}
          <PriorityColumn
            title="Medium Priority"
            tier="medium"
            color="border-amber-500/50 bg-amber-950/20"
            badgeColor="bg-amber-500 text-slate-950 font-bold"
            description="Crucial infrastructure, school & transport"
            needs={mediumPriorityNeeds}
            onMovePriority={(needId, tier) => {
              soundEngine.playClick();
              onUpdatePriority(needId, tier);
            }}
            getNeedIcon={getNeedIcon}
          />

          {/* LOW PRIORITY */}
          <PriorityColumn
            title="Low / Later Priority"
            tier="low"
            color="border-blue-500/50 bg-blue-950/20"
            badgeColor="bg-blue-500 text-white"
            description="Secondary enhancements & decorative spaces"
            needs={lowPriorityNeeds}
            onMovePriority={(needId, tier) => {
              soundEngine.playClick();
              onUpdatePriority(needId, tier);
            }}
            getNeedIcon={getNeedIcon}
          />
        </div>

        {/* Footer Guidance & CTA */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            💡 <strong>Democratic Principle:</strong> In governance, resources are limited. Prioritizing ensures that the most vulnerable and critical needs receive budget first.
          </div>

          <button
            onClick={() => {
              soundEngine.playCoin();
              onProceedToBudget();
            }}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-sm rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Priorities & Allocate Budget (₹100k)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const PriorityColumn: React.FC<{
  title: string;
  tier: PriorityTier;
  color: string;
  badgeColor: string;
  description: string;
  needs: CommunityNeed[];
  onMovePriority: (needId: string, tier: PriorityTier) => void;
  getNeedIcon: (sector: string) => React.ReactNode;
}> = ({ title, tier, color, badgeColor, description, needs, onMovePriority, getNeedIcon }) => {
  return (
    <div className={`p-4 rounded-2xl border ${color} flex flex-col justify-between min-h-[280px]`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-white text-sm">{title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${badgeColor}`}>
            {needs.length} {needs.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">{description}</p>

        {/* Needs Cards */}
        <div className="space-y-2.5">
          {needs.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-soft"
            >
              <div className="flex items-center gap-2 mb-1">
                {getNeedIcon(item.sector)}
                <h4 className="font-bold text-xs text-white leading-tight">{item.title}</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug mb-2">{item.description}</p>

              {/* Action Buttons to Move Tier */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                <span className="text-[10px] text-slate-400">
                  👥 {item.peopleAffected} People
                </span>

                <div className="flex items-center gap-1">
                  {tier !== 'high' && (
                    <button
                      onClick={() => onMovePriority(item.id, tier === 'low' ? 'medium' : 'high')}
                      className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold flex items-center gap-0.5"
                      title="Promote Priority"
                    >
                      <ArrowUp className="w-3 h-3 text-emerald-400" />
                      <span>Up</span>
                    </button>
                  )}
                  {tier !== 'low' && (
                    <button
                      onClick={() => onMovePriority(item.id, tier === 'high' ? 'medium' : 'low')}
                      className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold flex items-center gap-0.5"
                      title="Lower Priority"
                    >
                      <ArrowDown className="w-3 h-3 text-red-400" />
                      <span>Down</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {needs.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No items in this tier
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
