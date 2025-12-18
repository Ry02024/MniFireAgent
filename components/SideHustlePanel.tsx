import React from 'react';
import { SideHustle } from '../types';

interface SideHustlePanelProps {
  hustles: SideHustle[];
  totalSideIncome: number;
}

const SideHustlePanel: React.FC<SideHustlePanelProps> = ({ hustles, totalSideIncome }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">副業センター</h2>
          <p className="text-sm text-slate-500">データ分析スキルを活かして収入アップ</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">想定月間副業収入</div>
          <div className="text-2xl font-bold text-emerald-600">¥{totalSideIncome.toLocaleString()}</div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">おすすめ案件リスト</h3>
        <div className="grid gap-4">
          {hustles.map((hustle) => (
            <div key={hustle.id} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition-colors group">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium 
                      ${hustle.platform === 'Upwork' ? 'bg-green-100 text-green-800' : 
                        hustle.platform === 'CrowdWorks' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                      {hustle.platform}
                    </span>
                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600">{hustle.title}</h4>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {hustle.skills.map(skill => (
                      <span key={skill} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-slate-800">¥{hustle.hourlyRate.toLocaleString()}<span className="text-xs text-slate-400 font-normal"> /時間</span></div>
                    <div className="text-xs text-slate-500 mt-1">{hustle.estimatedHours} 時間/週</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                  詳細を見る &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
          <div className="flex items-start gap-3">
             <div className="bg-white p-2 rounded-full shadow-sm text-xl">💡</div>
             <div>
               <h4 className="font-bold text-emerald-900 text-sm">Pro Tip: 自動化の活用</h4>
               <p className="text-xs text-emerald-800 mt-1">
                 <strong>Firecrawl</strong> を活用して案件プラットフォームを自動監視しましょう。
                 「Python スクレイピング」や「Looker Studio」などのキーワードでアラート設定すれば、高単価案件を即座にキャッチできます。
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideHustlePanel;