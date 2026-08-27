'use client';

import React, { useEffect, useState } from 'react';
import { ProjectOption } from '@/types/game';
import { Hammer, CheckCircle2, Sparkles, HardHat, FileCheck, PartyPopper } from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';
import confetti from 'canvas-confetti';

interface ConstructionCutsceneProps {
  project: ProjectOption;
  onFinish: () => void;
}

export const ConstructionCutscene: React.FC<ConstructionCutsceneProps> = ({
  project,
  onFinish,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { title: 'Gram Panchayat Resolution Approved', icon: <FileCheck className="w-8 h-8 text-sky-400" /> },
    { title: 'Materials Procured & Survey Complete', icon: <HardHat className="w-8 h-8 text-amber-400" /> },
    { title: 'Active Construction & Community Supervision', icon: <Hammer className="w-8 h-8 text-emerald-400 animate-bounce" /> },
    { title: 'Project Completed & Dedicated to Village!', icon: <PartyPopper className="w-8 h-8 text-purple-400" /> },
  ];

  useEffect(() => {
    soundEngine.playConstructionThud();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 25) setStepIndex(0);
    else if (progress < 60) setStepIndex(1);
    else if (progress < 90) setStepIndex(2);
    else {
      setStepIndex(3);
      if (progress === 100) {
        soundEngine.playSuccessFanfare();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [progress]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-emerald-500/70 rounded-3xl shadow-2xl p-8 text-center text-white">
        {/* Animated Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-glow">
          {steps[stepIndex].icon}
        </div>

        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
          Implementing Village Project
        </div>
        <h3 className="text-2xl font-black text-white mb-2">{project.title}</h3>
        <p className="text-sm text-slate-300 mb-6 font-medium">
          {steps[stepIndex].title}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-6 border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Action Button */}
        {progress >= 100 && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onFinish();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-base rounded-2xl shadow-glow transition-all transform hover:scale-105"
          >
            🌟 Inspect Impact & Village Consequences
          </button>
        )}
      </div>
    </div>
  );
};
