'use client';

import React from 'react';
import { LANDMARKS } from '@/data/villageData';
import { Landmark } from '@/types/game';
import { X, Navigation, CheckCircle2, AlertTriangle, Droplets, GraduationCap, Cross, ShoppingBag, Users, Sparkles, Home, Sun } from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface MiniMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeleport: (position: [number, number]) => void;
  isProjectCompleted: boolean;
}

export const MiniMapModal: React.FC<MiniMapModalProps> = ({
  isOpen,
  onClose,
  onTeleport,
  isProjectCompleted,
}) => {
  if (!isOpen) return null;

  const getIcon = (name: string) => {
    switch (name) {
      case 'Droplets': return <Droplets className="w-5 h-5 text-sky-400" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-amber-400" />;
      case 'Cross': return <Cross className="w-5 h-5 text-red-400" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-yellow-400" />;
      case 'Users': return <Users className="w-5 h-5 text-purple-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'Home': return <Home className="w-5 h-5 text-slate-400" />;
      default: return <Sun className="w-5 h-5 text-lime-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-amber-400 flex items-center gap-2">
              🗺️ Interactive Village Map
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Gram Panchayat Layout & Community Landmarks
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

        {/* Landmarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {LANDMARKS.map((lm) => {
            const status = isProjectCompleted && lm.status === 'Critical Need' ? 'Upgraded' : lm.status;
            return (
              <div
                key={lm.id}
                className="flex flex-col justify-between p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-amber-400/60 transition-all hover:shadow-glow group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                        {getIcon(lm.iconName)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-amber-300 transition-colors">
                          {lm.name}
                        </h3>
                        <p className="text-[11px] text-amber-400/90 font-medium">{lm.hindiName}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        status === 'Critical Need'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : status === 'Needs Attention'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {status === 'Critical Need' ? (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      )}
                      {status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">{lm.description}</p>
                  <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    ℹ️ {lm.details}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Coords: ({lm.position[0]}, {lm.position[2]})
                  </span>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onTeleport([lm.position[0], lm.position[2]]);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Travel Here</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 text-center font-medium">
          💡 Tip: You can walk freely using WASD or click "Travel Here" to fast-navigate to any location.
        </div>
      </div>
    </div>
  );
};
