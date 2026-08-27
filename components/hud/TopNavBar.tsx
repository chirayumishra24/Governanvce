'use client';

import React from 'react';
import { IndicatorMetrics, CameraMode, Language, TimeOfDay } from '@/types/game';
import { TRANSLATIONS } from '@/data/translations';
import {
  Coins,
  Volume2,
  VolumeX,
  Compass,
  Layers,
  GraduationCap,
  Sparkles,
  Heart,
  TrendingUp,
  Smile,
  HelpCircle,
  ShieldCheck,
  Award,
  FileCheck2,
  Globe,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface TopNavBarProps {
  studentName: string;
  villageFund: number;
  indicators: IndicatorMetrics;
  cameraMode: CameraMode;
  onToggleCamera: () => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
  onOpenTeacherMode: () => void;
  onOpenTutorial: () => void;
  onOpenBriefing: () => void;
  language: Language;
  onToggleLanguage: () => void;
  timeOfDay: TimeOfDay;
  onToggleTimeOfDay: () => void;
  onOpenBadges: () => void;
  onOpenSocialAudit: () => void;
  earnedBadgesCount: number;
  isAuditDone: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  studentName,
  villageFund,
  indicators,
  cameraMode,
  onToggleCamera,
  audioMuted,
  onToggleAudio,
  onOpenTeacherMode,
  onOpenTutorial,
  onOpenBriefing,
  language,
  onToggleLanguage,
  timeOfDay,
  onToggleTimeOfDay,
  onOpenBadges,
  onOpenSocialAudit,
  earnedBadgesCount,
  isAuditDone,
}) => {
  const t = TRANSLATIONS[language];
  return (
    <header className="absolute top-0 left-0 right-0 z-40 px-3 py-2 md:px-6 md:py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/60 shadow-card text-white flex flex-wrap items-center justify-between gap-3">
      {/* Left: Student Profile & Role */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-soft">
            <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center text-xl">
              🧑🏽‍💼
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-emerald-500 text-[10px] font-black rounded-md text-slate-950 uppercase">
            Yr 1
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold text-white tracking-tight">
              {studentName || 'Student Leader'}
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[11px] font-semibold">
              Bal Sarpanch
            </span>
          </div>
          <p className="text-[11px] md:text-xs text-slate-400">
            Village Decision-Maker • <span className="text-amber-400 font-medium">Class VI Social Science</span>
          </p>
        </div>
      </div>

      {/* Center: Village Fund & Camera Toggle */}
      <div className="flex items-center gap-2 md:gap-4 order-3 sm:order-2">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 md:px-5 md:py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 rounded-2xl shadow-inner">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
            ₹
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
              Village Fund
            </div>
            <div className="text-base md:text-lg font-black text-amber-400 tracking-tight">
              ₹{villageFund.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleCamera();
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            cameraMode === 'isometric'
              ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-glow'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
          title="Switch between 3rd-Person Walk and Isometric Map View"
        >
          {cameraMode === 'walk' ? (
            <>
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">Map View</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4" />
              <span className="hidden md:inline">Walk View</span>
            </>
          )}
        </button>
      </div>

      {/* Right: 5 Live Indicator Bars */}
      <div className="flex items-center gap-2 md:gap-3 order-2 sm:order-3">
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
          {/* Wellbeing */}
          <IndicatorItem
            icon={<Smile className="w-3.5 h-3.5 text-pink-400" />}
            label="Wellbeing"
            value={indicators.communityWellbeing}
            color="bg-pink-500"
          />
          {/* Health */}
          <IndicatorItem
            icon={<Heart className="w-3.5 h-3.5 text-red-400" />}
            label="Health"
            value={indicators.health}
            color="bg-red-500"
          />
          {/* Education */}
          <IndicatorItem
            icon={<GraduationCap className="w-3.5 h-3.5 text-amber-400" />}
            label="Education"
            value={indicators.education}
            color="bg-amber-500"
          />
          {/* Cleanliness */}
          <IndicatorItem
            icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
            label="Cleanliness"
            value={indicators.cleanliness}
            color="bg-emerald-500"
          />
          {/* Development */}
          <IndicatorItem
            icon={<TrendingUp className="w-3.5 h-3.5 text-sky-400" />}
            label="Development"
            value={indicators.development}
            color="bg-sky-500"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Language Switcher */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleLanguage();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            title="Switch Language (English / हिंदी)"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Time of Day Cycle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleTimeOfDay();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            title="Change Time of Day (Day / Sunset / Night)"
          >
            {timeOfDay === 'day' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
            {timeOfDay === 'sunset' && <Sunset className="w-3.5 h-3.5 text-orange-400" />}
            {timeOfDay === 'night' && <Moon className="w-3.5 h-3.5 text-sky-300" />}
            <span className="capitalize hidden md:inline">{t[timeOfDay]}</span>
          </button>

          {/* Badges Modal Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenBadges();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-glow"
            title="View Civic Merit Badges"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{t.badges}</span>
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black">
              {earnedBadgesCount}
            </span>
          </button>

          {/* Social Audit Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenSocialAudit();
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isAuditDone
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600'
                : 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border-purple-500/40 shadow-glow'
            }`}
            title="Social Audit & RTI Transparency Inspection"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">{t.socialAudit}</span>
            {isAuditDone && <span className="text-emerald-400 font-black">✓</span>}
          </button>

          {/* Mentors Guide */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenBriefing();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600/30 to-rose-600/30 hover:brightness-110 text-pink-300 border border-pink-500/40 text-xs font-bold transition-all shadow-glow"
            title="Step-by-step Mentors Briefing"
          >
            <span>👩🏽‍🏫</span>
            <span className="hidden md:inline">{t.mentorsGuide}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenTutorial();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Tutorial & Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onToggleAudio();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenTeacherMode();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all"
            title="Teacher Assessment Mode"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="hidden xl:inline">{t.teacherView}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const IndicatorItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}> = ({ icon, label, value, color }) => {
  return (
    <div className="flex flex-col gap-0.5 min-w-[62px]">
      <div className="flex items-center justify-between text-[10px] font-medium text-slate-300">
        <span className="flex items-center gap-1">
          {icon}
          {label}
        </span>
        <span className="font-bold text-white">{Math.round(value)}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(5, value))}%` }}
        />
      </div>
    </div>
  );
};
