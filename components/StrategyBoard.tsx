import React, { useEffect, useState } from 'react';
import { getNationalStrategyData } from '../services/geminiService';
import { NationalStrategyData, StrategySector, StrategyStock } from '../types';
import StockChart from './StockChart';

type ViewState = 'SECTORS' | 'STOCKS' | 'CHART';

const StrategyBoard: React.FC = () => {
  const [data, setData] = useState<NationalStrategyData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [viewState, setViewState] = useState<ViewState>('SECTORS');
  const [selectedSector, setSelectedSector] = useState<StrategySector | null>(null);
  const [selectedStock, setSelectedStock] = useState<StrategyStock | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getNationalStrategyData();
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Navigation Handlers
  const handleSectorClick = (sector: StrategySector) => {
    setSelectedSector(sector);
    setViewState('STOCKS');
  };

  const handleStockClick = (stock: StrategyStock) => {
    setSelectedStock(stock);
    setViewState('CHART');
  };

  const handleBackToSectors = () => {
    setViewState('SECTORS');
    setSelectedSector(null);
  };

  const handleBackToStocks = () => {
    setViewState('STOCKS');
    setSelectedStock(null);
  };

  // Loading State
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.sectors || data.sectors.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
      {/* Header & Breadcrumbs */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
        <button 
          onClick={handleBackToSectors}
          className={`flex items-center gap-1 text-sm font-bold ${viewState === 'SECTORS' ? 'text-slate-800' : 'text-indigo-600 hover:text-indigo-800'}`}
          disabled={viewState === 'SECTORS'}
        >
          <span className="text-xl">🇯🇵</span> 国策ボード
        </button>
        
        {viewState !== 'SECTORS' && (
          <>
            <span className="text-slate-400">/</span>
            <button 
               onClick={handleBackToStocks}
               className={`text-sm font-bold ${viewState === 'STOCKS' ? 'text-slate-800' : 'text-indigo-600 hover:text-indigo-800'}`}
               disabled={viewState === 'STOCKS'}
            >
              {selectedSector?.name}
            </button>
          </>
        )}

        {viewState === 'CHART' && (
          <>
             <span className="text-slate-400">/</span>
             <span className="text-sm font-bold text-slate-800">{selectedStock?.name}</span>
          </>
        )}
      </div>

      <div className="p-6">
        {/* VIEW: SECTORS GRID */}
        {viewState === 'SECTORS' && (
          <div className="animate-fade-in">
             <div className="mb-6 text-center">
               <h3 className="text-lg font-bold text-slate-800 mb-2">国家戦略 重点6分野</h3>
               <p className="text-sm text-slate-500">興味のある分野を選択して、関連銘柄を確認しましょう</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
               {data.sectors.map((sector, idx) => (
                 <button
                   key={idx}
                   onClick={() => handleSectorClick(sector)}
                   className="flex flex-col items-center text-center p-6 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group h-full"
                 >
                   <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                     {idx + 1}
                   </div>
                   <h4 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-indigo-700">{sector.name}</h4>
                   <p className="text-sm text-slate-500 leading-relaxed">{sector.description}</p>
                 </button>
               ))}
             </div>
          </div>
        )}

        {/* VIEW: STOCK LIST */}
        {viewState === 'STOCKS' && selectedSector && (
          <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <span className="w-2 h-6 bg-indigo-500 rounded-sm"></span>
                 「{selectedSector.name}」関連銘柄リスト
               </h3>
               <button onClick={handleBackToSectors} className="text-sm text-slate-500 hover:text-slate-700">
                 &larr; 分野一覧に戻る
               </button>
             </div>

             <div className="grid gap-3">
               {selectedSector.stocks.map((stock, idx) => (
                 <button
                   key={idx}
                   onClick={() => handleStockClick(stock)}
                   className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:shadow-md hover:bg-indigo-50/30 transition-all text-left group"
                 >
                   <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded w-16 text-center group-hover:bg-white group-hover:text-indigo-600">{stock.code}</span>
                      <div>
                        <div className="font-bold text-slate-800 text-lg group-hover:text-indigo-700">{stock.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{stock.reason}</div>
                      </div>
                   </div>
                   <div className="text-indigo-400 group-hover:translate-x-1 transition-transform">
                     Chart &rarr;
                   </div>
                 </button>
               ))}
             </div>
          </div>
        )}

        {/* VIEW: CHART */}
        {viewState === 'CHART' && selectedStock && (
          <div className="animate-fade-in">
             <div className="mb-4">
               <button onClick={handleBackToStocks} className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-flex items-center gap-1">
                 &larr; {selectedSector?.name}一覧に戻る
               </button>
             </div>
             <StockChart code={selectedStock.code} name={selectedStock.name} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyBoard;