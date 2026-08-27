'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MissionBriefing, DialogueLine } from '@/data/missionBriefingsData';
import {
  X,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Play,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface MissionBriefingModalProps {
  briefing: MissionBriefing;
  isOpen: boolean;
  onClose: () => void;
  onStartMission: () => void;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  briefing,
  isOpen,
  onClose,
  onStartMission,
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const dialogue = briefing.dialogue;
  const currentLine = dialogue[currentLineIndex] || dialogue[0];

  // Stop TTS on close or unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-play TTS on line change if TTS is active or user requested
  const playTTS = (text: string, gender: 'female' | 'male') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = gender === 'female' ? 1.15 : 0.85;

    // Pick suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find((v) =>
      gender === 'female'
        ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.lang.includes('en-IN')
        : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.lang.includes('en-IN')
    );
    if (targetVoice) utterance.voice = targetVoice;

    utterance.onstart = () => setIsTtsPlaying(true);
    utterance.onend = () => setIsTtsPlaying(false);
    utterance.onerror = () => setIsTtsPlaying(false);

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopTTS = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTtsPlaying(false);
    }
  };

  const handleNext = () => {
    soundEngine.playDialogueChime();
    stopTTS();
    if (currentLineIndex < dialogue.length - 1) {
      const nextIdx = currentLineIndex + 1;
      setCurrentLineIndex(nextIdx);
      playTTS(dialogue[nextIdx].text, dialogue[nextIdx].gender);
    } else {
      onStartMission();
    }
  };

  const handlePrev = () => {
    soundEngine.playClick();
    stopTTS();
    if (currentLineIndex > 0) {
      const prevIdx = currentLineIndex - 1;
      setCurrentLineIndex(prevIdx);
      playTTS(dialogue[prevIdx].text, dialogue[prevIdx].gender);
    }
  };

  const handleToggleTTS = () => {
    if (isTtsPlaying) {
      stopTTS();
    } else {
      playTTS(currentLine.text, currentLine.gender);
    }
  };

  if (!isOpen) return null;

  const isAnanyaSpeaking = currentLine.speakerId === 'ananya';
  const isRajeshSpeaking = currentLine.speakerId === 'rajesh';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto bg-slate-900 border-2 border-amber-500/70 rounded-3xl shadow-2xl p-5 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-glow">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold uppercase">
                  Mission Briefing • Step {currentLineIndex + 1} of {dialogue.length}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-0.5">
                {briefing.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              stopTTS();
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Mentors Conversation Stage */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
          {/* Mentor 1: Didi Ananya (Left) */}
          <div
            className={`md:col-span-3 flex flex-col items-center text-center transition-all duration-300 ${
              isAnanyaSpeaking ? 'scale-105 opacity-100' : 'scale-95 opacity-50 grayscale-[40%]'
            }`}
          >
            <div className="relative">
              <div
                className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-600 p-1 shadow-2xl transition-all ${
                  isAnanyaSpeaking ? 'ring-4 ring-pink-400 ring-offset-2 ring-offset-slate-900 animate-pulse' : ''
                }`}
              >
                <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-5xl">
                  👩🏽‍🏫
                </div>
              </div>
              {isAnanyaSpeaking && (
                <div className="absolute -bottom-2 -right-1 px-2 py-0.5 bg-pink-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider animate-bounce">
                  Speaking 💬
                </div>
              )}
            </div>

            <div className="mt-3">
              <h4 className="font-black text-sm md:text-base text-pink-300">Didi Ananya</h4>
              <p className="text-[11px] text-slate-400 font-medium">Civics Educator</p>
            </div>
          </div>

          {/* Center Speech Bubble */}
          <div className="md:col-span-6 flex flex-col justify-between p-5 rounded-3xl bg-slate-800/90 border-2 border-slate-700 shadow-2xl relative">
            {/* Speaker Name Tag */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs md:text-sm font-black text-amber-300">
                  {currentLine.speakerName} ({currentLine.role})
                </span>
              </div>

              {/* TTS Audio Button */}
              <button
                onClick={handleToggleTTS}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                  isTtsPlaying
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-glow animate-pulse'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-750'
                }`}
                title="Text-To-Speech Audio Voiceover"
              >
                {isTtsPlaying ? (
                  <>
                    <Volume2 className="w-4 h-4 text-slate-950 animate-bounce" />
                    <span>Speaking...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Listen (TTS)</span>
                  </>
                )}
              </button>
            </div>

            {/* Speech Text */}
            <div className="my-2 min-h-[90px]">
              <p className="text-sm md:text-base text-slate-100 leading-relaxed font-medium">
                "{currentLine.text}"
              </p>
              {currentLine.hindiSnippet && (
                <p className="mt-2 text-xs text-amber-400 italic">
                  💡 {currentLine.hindiSnippet}
                </p>
              )}
            </div>

            {/* Step Action Hint */}
            {currentLine.actionHint && (
              <div className="mt-3 p-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-[11px] text-sky-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  <strong>Step Guide:</strong> {currentLine.actionHint}
                </span>
              </div>
            )}
          </div>

          {/* Mentor 2: Kaka Rajesh (Right) */}
          <div
            className={`md:col-span-3 flex flex-col items-center text-center transition-all duration-300 ${
              isRajeshSpeaking ? 'scale-105 opacity-100' : 'scale-95 opacity-50 grayscale-[40%]'
            }`}
          >
            <div className="relative">
              <div
                className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 p-1 shadow-2xl transition-all ${
                  isRajeshSpeaking ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900 animate-pulse' : ''
                }`}
              >
                <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-5xl">
                  👨🏽‍💼
                </div>
              </div>
              {isRajeshSpeaking && (
                <div className="absolute -bottom-2 -right-1 px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-wider animate-bounce">
                  Speaking 💬
                </div>
              )}
            </div>

            <div className="mt-3">
              <h4 className="font-black text-sm md:text-base text-amber-300">Kaka Rajesh</h4>
              <p className="text-[11px] text-slate-400 font-medium">Senior Panchayat Advisor</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Step indicator bubbles */}
          <div className="flex items-center gap-1.5">
            {dialogue.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  stopTTS();
                  soundEngine.playClick();
                  setCurrentLineIndex(idx);
                  playTTS(dialogue[idx].text, dialogue[idx].gender);
                }}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentLineIndex
                    ? 'w-7 bg-amber-400'
                    : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {currentLineIndex > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            {currentLineIndex < dialogue.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-glow transition-all"
              >
                <span>Next Instruction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  stopTTS();
                  soundEngine.playSuccessFanfare();
                  onStartMission();
                }}
                className="flex items-center gap-1.5 px-7 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-glow transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Start Mission Now!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
