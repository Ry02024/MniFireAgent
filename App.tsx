import React, { useState, useMemo } from 'react';
import FinancialOverview from './components/FinancialOverview';
import FireSimulator from './components/FireSimulator';
import SideHustlePanel from './components/SideHustlePanel';
import AiAdvisor from './components/AiAdvisor';
import MarketInsights from './components/MarketInsights';
import StrategyBoard from './components/StrategyBoard';
import { Asset, Expense, SideHustle, UserProfile } from './types';

// Mock Initial Data based on the PDF proposal
const INITIAL_ASSETS: Asset[] = [
  { id: '1', type: 'STOCK', name: 'eMAXIS Slim 全世界株式', value: 1500000 },
  { id: '2', type: 'BOND', name: 'eMAXIS Slim 先進国債券', value: 900000 },
  { id: '3', type: 'STOCK', name: '日経225 ETF', value: 600000 },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: '1', category: '家賃', amount: 55000, date: '2023-10-01' },
  { id: '2', category: '食費', amount: 30000, date: '2023-10-05' },
  { id: '3', category: '光熱費', amount: 10000, date: '2023-10-10' },
  { id: '4', category: '通信費', amount: 3000, date: '2023-10-15' },
  { id: '5', category: '交際・娯楽', amount: 15000, date: '2023-10-20' },
];

const INITIAL_HUSTLES: SideHustle[] = [
  { id: '1', title: 'Python スクレイピング案件', platform: 'CrowdWorks', estimatedHours: 5, hourlyRate: 3500, status: 'NEW', skills: ['Python', 'Selenium'] },
  { id: '2', title: 'SQL ダッシュボード構築', platform: 'Upwork', estimatedHours: 10, hourlyRate: 5000, status: 'APPLIED', skills: ['SQL', 'Tableau'] },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'hustle'>('dashboard');
  const [assets] = useState<Asset[]>(INITIAL_ASSETS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [hustles] = useState<SideHustle[]>(INITIAL_HUSTLES);

  const profile: UserProfile = {
    monthlyIncome: 160000,
    currentAssets: assets.reduce((a, b) => a + b.value, 0),
    targetAssets: 30000000,
    monthlySavingsTarget: 40000
  };

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense = {
      ...newExpense,
      id: Math.random().toString(36).substr(2, 9),
    };
    setExpenses(prev => [expense, ...prev]);
  };

  const totalSideIncome = useMemo(() => {
    return hustles.reduce((acc, h) => acc + (h.hourlyRate * h.estimatedHours * 4), 0);
  }, [hustles]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400">
                MiniFIRE Agent
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ダッシュボード
              </button>
              <button 
                onClick={() => setActiveTab('simulator')}
                className={`text-sm font-medium transition-colors ${activeTab === 'simulator' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                シミュレーション
              </button>
              <button 
                onClick={() => setActiveTab('hustle')}
                className={`text-sm font-medium transition-colors ${activeTab === 'hustle' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                副業案件
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="md:hidden flex rounded-lg bg-white p-1 shadow-sm border border-slate-200 mb-6">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}>ホーム</button>
          <button onClick={() => setActiveTab('simulator')} className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'simulator' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}>予測</button>
          <button onClick={() => setActiveTab('hustle')} className={`flex-1 py-2 text-sm font-medium rounded-md ${activeTab === 'hustle' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}>副業</button>
        </div>

        <AiAdvisor profile={profile} expenses={expenses} hustles={hustles} />

        {activeTab === 'dashboard' && (
          <div className="animate-fade-in space-y-8">
             <MarketInsights />
             <StrategyBoard />
             <FinancialOverview 
              assets={assets} 
              expenses={expenses} 
              profile={profile}
              onAddExpense={handleAddExpense}
            />
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="animate-fade-in">
            <FireSimulator profile={profile} />
          </div>
        )}

        {activeTab === 'hustle' && (
          <div className="animate-fade-in">
            <SideHustlePanel hustles={hustles} totalSideIncome={totalSideIncome} />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;