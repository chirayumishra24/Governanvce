'use client';

import React, { useState } from 'react';
import { X, Compass, MousePointer, MessageSquare, Map, CheckCircle2, ChevronRight } from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Movement & Camera Controls',
      description: 'Use W/A/S/D or Arrow keys on your keyboard to walk through the village. Hold Shift to sprint. Drag with your mouse to rotate the camera.',
      icon: <Compass className="w-8 h-8 text-sky-400" />,
      keyboardHints: ['W', 'A', 'S', 'D'],
    },
    {
      title: '2. Interacting with Villagers & Landmarks',
      description: 'Approach any villager or landmark. When close, press E on your keyboard or click the golden Talk/Inspect button to start a dialogue.',
      icon: <MessageSquare className="w-8 h-8 text-amber-400" />,
      keyboardHints: ['E', 'Space', 'Click'],
    },
    {
      title: '3. Gram Sabha & Budget Allocation',
      description: 'Once you explore the village and identify community needs, enter the Gram Sabha Hall to prioritize issues and allocate the ₹100,000 Village Fund!',
      icon: <Map className="w-8 h-8 text-emerald-400" />,
      keyboardHints: ['Gram Sabha', 'Budget', 'Report'],
    },
  ];

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-sky-500/60 rounded-3xl shadow-2xl p-6 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              💡
            </span>
            <div>
              <h3 className="text-lg font-black text-sky-400">Interactive Tutorial</h3>
              <p className="text-xs text-slate-400">How to navigate and govern your village</p>
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

        {/* Step Content */}
        <div className="my-6 p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
            {step.icon}
          </div>
          <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-4">
            {step.description}
          </p>

          {/* Key tags */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {step.keyboardHints.map((k, idx) => (
              <kbd
                key={idx}
                className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-400 shadow-sm"
              >
                {k}
              </kbd>
            ))}
          </div>
        </div>

        {/* Pagination Dots & Navigation */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentStep ? 'w-6 bg-sky-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setCurrentStep((p) => p + 1);
                }}
                className="flex items-center gap-1 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-glow transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Start Exploring!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
