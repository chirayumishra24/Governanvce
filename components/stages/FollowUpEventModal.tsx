'use client';

import React, { useState } from 'react';
import { FOLLOW_UP_SCENARIO } from '@/data/projectsData';
import {
  X,
  CloudRain,
  ShieldAlert,
  CheckCircle2,
  Coins,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface FollowUpEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChoice: (choiceId: string) => void;
  onProceedToReflection: () => void;
  activeChoiceId: string | null;
}

export const FollowUpEventModal: React.FC<FollowUpEventModalProps> = ({
  isOpen,
  onClose,
  onSelectChoice,
  onProceedToReflection,
  activeChoiceId,
}) => {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(activeChoiceId);

  if (!isOpen) return null;

  const scenario = FOLLOW_UP_SCENARIO;
  const chosenChoice = scenario.choices.find((c) => c.id === selectedChoiceId);

  const handleChoiceClick = (choiceId: string) => {
    soundEngine.playCoin();
    setSelectedChoiceId(choiceId);
    onSelectChoice(choiceId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto bg-slate-900 border-2 border-sky-500/70 rounded-3xl shadow-2xl p-6 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black shadow-glow">
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-full text-xs font-bold">
                  {scenario.triggerEvent}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                {scenario.title}
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

        {/* Narrative Description */}
        <div className="my-5 p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-sm text-slate-200 leading-relaxed">
          {scenario.scenarioDescription}
        </div>

        {/* Choices Grid */}
        <div className="space-y-3 my-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Your Panchayat Governance Response:
          </div>

          {scenario.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            return (
              <button
                key={choice.id}
                onClick={() => handleChoiceClick(choice.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-sky-950/70 border-sky-400 shadow-glow'
                    : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs text-sky-400 shrink-0">
                      {isSelected ? '✓' : '•'}
                    </span>
                    <span>{choice.title}</span>
                  </h3>
                  <span className="text-xs font-black text-amber-400 shrink-0">
                    {choice.cost > 0 ? `Reserve: ₹${choice.cost.toLocaleString('en-IN')}` : 'Cost: ₹0'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 ml-7 leading-relaxed">{choice.description}</p>
              </button>
            );
          })}
        </div>

        {/* Outcome Display when Selected */}
        {chosenChoice && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs md:text-sm leading-relaxed mb-6">
            <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Governance Result:</span>
            </div>
            {chosenChoice.outcomeText}
          </div>
        )}

        {/* CTA */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playSuccessFanfare();
              onProceedToReflection();
            }}
            disabled={!selectedChoiceId}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 text-slate-950 font-black text-sm md:text-base rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Complete Reflection & View Report Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
