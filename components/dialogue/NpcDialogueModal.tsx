'use client';

import React, { useState } from 'react';
import { VillagerNPC } from '@/types/game';
import { X, MessageSquare, HelpCircle, Users, CheckCircle2, BookmarkPlus, ArrowRight } from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface NpcDialogueModalProps {
  npc: VillagerNPC;
  isOpen: boolean;
  onClose: () => void;
  onRecordNeed: (sector: string) => void;
  isNeedDiscovered: boolean;
  onOpenMap: () => void;
}

export const NpcDialogueModal: React.FC<NpcDialogueModalProps> = ({
  npc,
  isOpen,
  onClose,
  onRecordNeed,
  isNeedDiscovered,
  onOpenMap,
}) => {
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [recordedSuccess, setRecordedSuccess] = useState(isNeedDiscovered);

  if (!isOpen) return null;

  const handleOptionClick = (option: typeof npc.dialogue.options[0]) => {
    soundEngine.playDialogueChime();
    if (option.action === 'close') {
      onClose();
      return;
    }

    if (option.action === 'record_need') {
      onRecordNeed(npc.associatedSector);
      setRecordedSuccess(true);
      soundEngine.playCoin();
    }

    if (option.responseText) {
      setCurrentResponse(option.responseText);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl p-6 md:p-8 text-white">
        {/* Header with Character Portrait */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shadow-glow">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-3xl">
                  {npc.avatar}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-emerald-500 text-[10px] font-black text-slate-950 rounded-md">
                NPC
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{npc.name}</h3>
                {npc.dialogue.hindiSnippet && (
                  <span className="text-xs text-amber-400 font-medium">({npc.dialogue.hindiSnippet})</span>
                )}
              </div>
              <p className="text-xs text-amber-300 font-semibold">{npc.role}</p>
              <p className="text-[11px] text-slate-400">Representative • Ward Community</p>
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

        {/* Speech Bubble */}
        <div className="my-6">
          <div className="relative p-5 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-100 shadow-inner">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm md:text-base leading-relaxed">
                {currentResponse || npc.dialogue.text}
              </p>
            </div>

            {recordedSuccess && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Need recorded in Community Ledger</span>
              </div>
            )}
          </div>
        </div>

        {/* Dialogue Interaction Options */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Choose your response / question:
          </p>
          {npc.dialogue.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              className="w-full text-left p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 hover:border-amber-400 border border-slate-700 text-xs md:text-sm font-medium text-slate-200 hover:text-white transition-all flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  {idx + 1}
                </span>
                <span>{option.label}</span>
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
