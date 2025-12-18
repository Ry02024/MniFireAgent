import React, { useEffect, useState } from 'react';
import { getMarketInsights } from '../services/geminiService';
import { MarketInsight } from '../types';

const MarketInsights: React.FC = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      const data = await getMarketInsights();
      setInsights(data);
      setLoading(false);
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-slate-50 rounded-lg"></div>
          <div className="h-20 bg-slate-50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="text-blue-500">📊</span> 市場概況 & 最新ニュース
        </h3>
        <span className="text-xs text-slate-400">Google Search 連動済</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {insights.map((item, idx) => (
          <div key={idx} className={`p-4 rounded-xl border ${
            item.sentiment === 'positive' ? 'border-green-100 bg-green-50' : 
            item.sentiment === 'negative' ? 'border-red-100 bg-red-50' : 'border-slate-100 bg-slate-50'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">{item.indexName}</span>
              <span className={`text-xs font-bold ${item.sentiment === 'positive' ? 'text-green-600' : item.sentiment === 'negative' ? 'text-red-600' : 'text-slate-600'}`}>
                {item.changePercent}
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">{item.currentValue}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-600">あなたのポートフォリオへの影響</h4>
        {insights.map((item, idx) => (
          <div key={`news-${idx}`} className="group relative pl-4 border-l-2 border-indigo-200 hover:border-indigo-500 transition-colors">
            <div className="flex flex-col">
              <span className="text-xs text-indigo-500 font-medium">{item.indexName} 関連</span>
              <a href={item.newsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-800 hover:text-indigo-600 mt-1 line-clamp-1">
                {item.newsTitle}
              </a>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {item.impactSummary}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketInsights;