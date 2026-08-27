'use client';

import React from 'react';
import { GameState, AssessmentScores } from '@/types/game';
import { TEACHER_RUBRIC_DESCRIPTIONS } from '@/data/assessmentRubric';
import {
  X,
  ShieldCheck,
  Clock,
  Award,
  Wallet,
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';

interface TeacherDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  scores: AssessmentScores | null;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  isOpen,
  onClose,
  gameState,
  scores,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto bg-slate-900 border-2 border-indigo-500/80 rounded-3xl shadow-2xl p-6 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white font-black shadow-glow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-xs font-bold uppercase">
                  Class VI Social Science
                </span>
                <span className="text-xs text-slate-400">Teacher Assessment Console</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                STUDENT GOVERNANCE AUDIT & RUBRICS
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

        {/* Student Quick Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-5 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Student Candidate</div>
            <div className="text-base font-bold text-white mt-0.5">{gameState.studentName || 'Student'}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Completion Status</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              {gameState.isProjectCompleted ? 'Completed ✅' : 'In Progress ⏳'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Assessment Score</div>
            <div className="text-base font-black text-amber-400 mt-0.5">
              {scores ? `${scores.total} / 90` : 'Pending'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Performance Band</div>
            <div className="text-base font-bold text-sky-400 mt-0.5">
              {scores?.performanceLevel || 'Evaluating'}
            </div>
          </div>
        </div>

        {/* Chronological Decision History Timeline */}
        <div className="my-5 p-5 rounded-2xl bg-slate-800/60 border border-slate-700">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Chronological Decision Trail (Audit Log):</span>
          </h3>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
            {gameState.decisionLogs.map((log, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
              >
                <span className="px-2 py-0.5 bg-slate-800 text-amber-300 rounded font-mono font-bold shrink-0">
                  {log.timeDisplay}
                </span>
                <div>
                  <div className="font-bold text-white">{log.step}: {log.summary}</div>
                  <div className="text-slate-400 mt-0.5 leading-snug">{log.detail}</div>
                </div>
              </div>
            ))}

            {gameState.decisionLogs.length === 0 && (
              <div className="text-xs text-slate-500 italic p-3 text-center">
                Decision events will appear here as the student interacts with the simulation.
              </div>
            )}
          </div>
        </div>

        {/* Teacher Rubrics Guide */}
        <div className="my-5 p-5 rounded-2xl bg-slate-800/60 border border-slate-700">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>CBSE/NCERT Class VI Assessment Rubrics:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {Object.entries(TEACHER_RUBRIC_DESCRIPTIONS).map(([lvl, info]) => (
              <div key={lvl} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between font-bold text-white mb-1">
                  <span>{info.badge}</span>
                  <span className="text-amber-400 text-[11px]">{info.range}</span>
                </div>
                <p className="text-slate-300 leading-snug text-[11px]">{info.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
          >
            Close Teacher Console
          </button>
        </div>
      </div>
    </div>
  );
};
