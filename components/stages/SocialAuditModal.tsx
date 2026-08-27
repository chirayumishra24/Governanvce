'use client';

import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Search,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';
import { soundEngine } from '@/components/ui/AudioController';
import { ProjectOption, Language } from '@/types/game';
import { TRANSLATIONS } from '@/data/translations';

interface SocialAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProject: ProjectOption | null;
  language: Language;
  onCompleteAudit: () => void;
  isAuditDone: boolean;
}

export const SocialAuditModal: React.FC<SocialAuditModalProps> = ({
  isOpen,
  onClose,
  selectedProject,
  language,
  onCompleteAudit,
  isAuditDone,
}) => {
  const [checkedVouchers, setCheckedVouchers] = useState<Record<string, boolean>>({
    v1: false,
    v2: false,
    v3: false,
  });

  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  const cost = selectedProject?.cost || 35000;
  const materialsCost = Math.round(cost * 0.55);
  const laborCost = Math.round(cost * 0.35);
  const contingencyCost = cost - materialsCost - laborCost;

  const vouchers = [
    {
      id: 'v1',
      title: language === 'hi' ? 'सामग्री खरीद वाउचर (Materials Bill)' : 'Material Procurement Invoice',
      supplier: language === 'hi' ? 'जिला ग्रामीण आपूर्ति केंद्र' : 'District Rural Supply Depot',
      amount: `₹${materialsCost.toLocaleString('en-IN')}`,
      cert: language === 'hi' ? 'ISI ग्रेड एवं गुणवत्ता प्रमाण पत्र संलग्न' : 'ISI Grade & Lab Quality Certificate Attached',
    },
    {
      id: 'v2',
      title: language === 'hi' ? 'श्रमिक मजदूरी मस्टर रोल (MGNREGA / Labor Muster Roll)' : 'Local Labor & Craft Muster Roll',
      supplier: language === 'hi' ? 'सुंदरपुर ग्राम श्रमिक संघ' : 'Sundarpur Village Workers Cooperative',
      amount: `₹${laborCost.toLocaleString('en-IN')}`,
      cert: language === 'hi' ? '28 ग्रामीणों को 100% प्रत्यक्ष बैंक भुगतान' : '100% Direct Bank Transfer to 28 Local Workers',
    },
    {
      id: 'v3',
      title: language === 'hi' ? 'इंजीनियर निरीक्षण एवं सुरक्षा जांच (Safety Audit)' : 'Junior Engineer Technical Verification',
      supplier: language === 'hi' ? 'ब्लॉक विकास अधिकारी (BDO) कार्यालय' : 'Block Development Office (BDO)',
      amount: `₹${contingencyCost.toLocaleString('en-IN')}`,
      cert: language === 'hi' ? 'स्ट्रक्चरल सुरक्षा एवं जीवनकाल 15 वर्ष सत्यापित' : 'Structural Stability & 15-Year Life Span Verified',
    },
  ];

  const allVouchersChecked = Object.values(checkedVouchers).filter(Boolean).length === vouchers.length;

  const toggleCheck = (id: string) => {
    soundEngine.playClick();
    setCheckedVouchers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFinishAudit = () => {
    soundEngine.playSuccessFanfare();
    onCompleteAudit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-slate-900 border-2 border-purple-500/70 rounded-3xl shadow-2xl p-5 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500 text-slate-950 font-black shadow-glow">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-xs font-bold uppercase">
                  Social Audit & RTI • सूचना का अधिकार
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-0.5">
                {t.socialAuditTitle}
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

        {/* Informative Civic Banner */}
        <div className="my-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs md:text-sm text-slate-200 flex items-center gap-3">
          <Receipt className="w-6 h-6 text-purple-400 shrink-0" />
          <p>
            {language === 'hi'
              ? 'लोकतंत्र में सरकार और पंचायत का हर एक रुपया जनता का है। सामाजिक अंकेक्षण (Social Audit) में सभी ग्रामवासी मिलकर हिसाब-किताब की जांच करते हैं ताकि कोई भ्रष्टाचार न हो।'
              : 'In grassroots democracy, every rupee belongs to the public. Social Audit ensures transparency by allowing citizens to scrutinize receipts, muster rolls, and material certifications.'}
          </p>
        </div>

        {/* Expense Vouchers Scrutiny List */}
        <div className="space-y-3 my-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === 'hi' ? 'खर्च बिलों का सार्वजनिक सत्यापन (Click to Verify):' : 'Public Expense Vouchers (Click to Verify):'}
          </h3>

          {vouchers.map((v) => {
            const isChecked = checkedVouchers[v.id] || isAuditDone;
            return (
              <div
                key={v.id}
                onClick={() => !isAuditDone && toggleCheck(v.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isChecked
                    ? 'bg-purple-950/40 border-purple-400/80 shadow-glow'
                    : 'bg-slate-850 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-purple-500 border-purple-300 text-slate-950'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {isChecked && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{v.title}</h4>
                    <p className="text-xs text-slate-400">{v.supplier} • <span className="text-emerald-400">{v.cert}</span></p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-amber-300">{v.amount}</span>
                  <span className="block text-[10px] text-slate-400">GST Paid</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gram Sabha Transparency Resolution */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/40 my-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            <div>
              <h4 className="text-sm font-bold text-purple-200">
                {language === 'hi' ? 'ग्राम सभा सामाजिक अंकेक्षण प्रस्ताव' : 'Gram Sabha Social Audit Resolution'}
              </h4>
              <p className="text-xs text-slate-300">
                {language === 'hi'
                  ? 'सभी 6 वार्ड प्रतिनिधियों ने व्यय को 100% संतोषजनक एवं निष्पक्ष माना।'
                  : 'Unanimously passed: Expenditure declared 100% transparent and verified.'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold">
            {t.verifiedBadge}
          </span>
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {language === 'hi'
              ? 'सत्यापन पूर्ण होने पर आपको "पारदर्शिता प्रहरी" पदक मिलेगा।'
              : 'Verifying all vouchers awards the "Transparency Auditor" civic badge.'}
          </p>

          <button
            disabled={!allVouchersChecked && !isAuditDone}
            onClick={isAuditDone ? onClose : handleFinishAudit}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 ${
              allVouchersChecked || isAuditDone
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-glow hover:brightness-110'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isAuditDone
                ? language === 'hi'
                  ? 'अंकेक्षण बंद करें'
                  : 'Close Audit'
                : language === 'hi'
                ? 'पारदर्शिता पुष्टि करें (Sign-Off)'
                : 'Confirm & Sign-Off Audit'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
