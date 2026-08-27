'use client';

import React from 'react';
import { NPCS } from '@/data/villageData';
import { VillagerNPC } from '@/types/game';
import { X, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface VillagersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVillager: (npcId: string) => void;
  onTeleport: (position: [number, number]) => void;
  discoveredNeeds: string[];
  isProjectCompleted: boolean;
}

export const VillagersListModal: React.FC<VillagersListModalProps> = ({
  isOpen,
  onClose,
  onSelectVillager,
  onTeleport,
  discoveredNeeds,
  isProjectCompleted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-emerald-400 flex items-center gap-2">
              👥 Villagers & Community Members
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Listen to the community to understand real grassroot challenges
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

        {/* Villagers Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {NPCS.map((npc) => {
            return (
              <div
                key={npc.id}
                className="flex flex-col justify-between p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-emerald-400/60 transition-all hover:shadow-glow group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                        {npc.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {npc.name}
                        </h3>
                        <p className="text-xs text-amber-400 font-medium">{npc.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 italic mb-3">
                    "{isProjectCompleted ? npc.happySpeech : npc.concernSpeech}"
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onTeleport([npc.position[0], npc.position[2]]);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>Meet Nearby</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectVillager(npc.id);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-soft"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Talk Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
