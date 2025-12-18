import React, { useState } from 'react';
import { generateFireAdvice } from '../services/geminiService';
import { Asset, Expense, UserProfile, SideHustle, AiAdvice } from '../types';

interface AiAdvisorProps {
  profile: UserProfile;
  expenses: Expense[];
  hustles: SideHustle[];
}

const AiAdvisor: React.FC<AiAdvisorProps> = ({ profile, expenses, hustles }) => {
  const [advice, setAdvice] = useState<AiAdvice | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConsult = async () => {
    setLoading(true);
    const result = await generateFireAdvice(profile, expenses, hustles);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl shadow-xl overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">MiniFIRE コンサルタント</h2>
              <p className="text-xs text-indigo-200">Powered by Gemini 2.0</p>
            </div>
          </div>
          
          <button 
            onClick={handleConsult}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              loading 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-white text-indigo-900 hover:bg-indigo-50 shadow-md transform hover:scale-105'
            }`}
          >
            {loading ? '分析中...' : 'レポート生成'}
          </button>
        </div>

        {advice ? (
          <div className="space-y-6 animate-fade-in">
            {/* Motivation */}
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
              <p className="text-lg italic font-light">"{advice.motivationalMessage}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Savings */}
              <div>
                <h3 className="text-sm font-bold text-indigo-300 uppercase mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    支出の最適化
                </h3>
                <ul className="space-y-2">
                  {advice.savingsTips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-slate-200 flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Earnings */}
              <div>
                <h3 className="text-sm font-bold text-indigo-300 uppercase mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    収入アップの提案
                </h3>
                <ul className="space-y-2">
                  {advice.hustleRecommendations.map((tip, idx) => (
                    <li key={idx} className="text-sm text-slate-200 flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">★</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {advice.riskWarning && (
               <div className="bg-red-900/30 border border-red-500/30 p-3 rounded text-xs text-red-200 flex items-center gap-2">
                 <span className="text-lg">⚠️</span> {advice.riskWarning}
               </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-indigo-200/60">
            <p>「レポート生成」をクリックして、AIによる個別戦略を表示してください。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAdvisor;