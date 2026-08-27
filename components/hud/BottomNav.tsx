'use client';

import React from 'react';
import { GamePhase } from '@/types/game';
import {
  Map,
  Users,
  ClipboardList,
  Building2,
  Hammer,
  Wallet,
  Award,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface BottomNavProps {
  currentPhase: GamePhase;
  discoveredNeedsCount: number;
  totalNeedsCount: number;
  onOpenMap: () => void;
  onOpenVillagers: () => void;
  onOpenNeeds: () => void;
  onOpenMeeting: () => void;
  onOpenProjects: () => void;
  onOpenBudget: () => void;
  onOpenReport: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPhase,
  discoveredNeedsCount,
  totalNeedsCount,
  onOpenMap,
  onOpenVillagers,
  onOpenNeeds,
  onOpenMeeting,
  onOpenProjects,
  onOpenBudget,
  onOpenReport,
}) => {
  const isMeetingReady = discoveredNeedsCount >= 2;

  return (
    <nav className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 max-w-full px-2">
      <div className="flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl">
        {/* Map Button */}
        <NavButton
          icon={<Map className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />}
          label="Map"
          onClick={() => {
            soundEngine.playClick();
            onOpenMap();
          }}
        />

        {/* Villagers Button */}
        <NavButton
          icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
          label="Villagers"
          onClick={() => {
            soundEngine.playClick();
            onOpenVillagers();
          }}
        />

        {/* Needs Button */}
        <NavButton
          icon={<ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />}
          label="Needs"
          badge={`${discoveredNeedsCount}/${totalNeedsCount}`}
          onClick={() => {
            soundEngine.playClick();
            onOpenNeeds();
          }}
        />

        <div className="h-6 w-px bg-slate-700 mx-0.5" />

        {/* Gram Sabha Meeting Button */}
        <button
          onClick={() => {
            soundEngine.playGramSabhaGong();
            onOpenMeeting();
          }}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            isMeetingReady
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-glow animate-pulse hover:brightness-110'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Gram Sabha</span>
        </button>

        {/* Projects Button */}
        <NavButton
          icon={<Hammer className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />}
          label="Projects"
          onClick={() => {
            soundEngine.playClick();
            onOpenProjects();
          }}
        />

        {/* Budget Button */}
        <NavButton
          icon={<Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />}
          label="Budget"
          onClick={() => {
            soundEngine.playClick();
            onOpenBudget();
          }}
        />

        {/* Final Report Button */}
        <NavButton
          icon={<Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />}
          label="Report"
          onClick={() => {
            soundEngine.playClick();
            onOpenReport();
          }}
        />
      </div>
    </nav>
  );
};

const NavButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
}> = ({ icon, label, badge, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-all text-xs font-semibold"
    >
      {icon}
      <span className="text-[11px] sm:text-xs">{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[9px] font-black">
          {badge}
        </span>
      )}
    </button>
  );
};
