'use client';

import React, { useState } from 'react';
import { ReflectionAnswers } from '@/types/game';
import {
  X,
  BookOpen,
  CheckCircle2,
  Sparkles,
  PenTool,
  Award,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';
import confetti from 'canvas-confetti';

interface ReflectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  answers: ReflectionAnswers;
  onSaveAnswers: (answers: ReflectionAnswers) => void;
  onGenerateReport: () => void;
}

export const ReflectionForm: React.FC<ReflectionFormProps> = ({
  isOpen,
  onClose,
  answers,
  onSaveAnswers,
  onGenerateReport,
}) => {
  const [formData, setFormData] = useState<ReflectionAnswers>(answers);

  if (!isOpen) return null;

  const handleChange = (key: keyof ReflectionAnswers, value: string) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onSaveAnswers(updated);
  };

  const isFormValid =
    formData.changedDecision.trim().length > 5 &&
    formData.mostImportantNeed.trim().length > 5 &&
    formData.governanceInsight.trim().length > 5;

  const handleSubmit = () => {
    soundEngine.playSuccessFanfare();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });
    onGenerateReport();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto bg-slate-900 border-2 border-purple-500/70 rounded-3xl shadow-2xl p-6 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-black shadow-glow">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-purple-300">
                BAL SARPANCH REFLECTION
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                Express your civic reasoning and learnings from the governance simulation
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

        {/* Form Prompts */}
        <div className="space-y-5 my-6">
          {/* Prompt 1 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" />
              <span>Prompt 1: Decision-Making & Trade-offs</span>
            </label>
            <p className="text-xs text-slate-300 mb-2">
              Complete the thought: <strong className="text-white">“I formed / adjusted my decision when...”</strong>
            </p>
            <textarea
              rows={2}
              value={formData.changedDecision}
              onChange={(e) => handleChange('changedDecision', e.target.value)}
              placeholder="e.g. I spoke with Amina Bi and realized 140 families were drinking muddy water daily, making safe water an urgent lifeline over cosmetic parks."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
            />
          </div>

          {/* Prompt 2 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" />
              <span>Prompt 2: Community Needs & Equality</span>
            </label>
            <p className="text-xs text-slate-300 mb-2">
              Complete the thought: <strong className="text-white">“The most important community need was...”</strong>
            </p>
            <textarea
              rows={2}
              value={formData.mostImportantNeed}
              onChange={(e) => handleChange('mostImportantNeed', e.target.value)}
              placeholder="e.g. Clean drinking water and covered drainage because preventing disease protects all children and frees up women's time."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
            />
          </div>

          {/* Prompt 3 */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
            <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" />
              <span>Prompt 3: Democratic Governance Insight</span>
            </label>
            <p className="text-xs text-slate-300 mb-2">
              Complete the thought: <strong className="text-white">“One thing I learned about Grassroots Democracy is...”</strong>
            </p>
            <textarea
              rows={2}
              value={formData.governanceInsight}
              onChange={(e) => handleChange('governanceInsight', e.target.value)}
              placeholder="e.g. In a Gram Sabha, a leader must listen to every citizen and manage limited public money transparently for everyone."
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {isFormValid ? '✨ Ready to view your Final Report Card!' : '✍️ Please complete all 3 prompts with your thoughts.'}
          </p>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 text-white font-black text-sm md:text-base rounded-2xl shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5" />
            <span>Generate Governance Report Card 🏆</span>
          </button>
        </div>
      </div>
    </div>
  );
};
