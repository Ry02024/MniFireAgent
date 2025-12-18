export type TimeRange = '1D' | '1M' | '3M' | '1Y';

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
}

export interface Asset {
  id: string;
  type: 'CASH' | 'STOCK' | 'BOND' | 'CRYPTO';
  name: string;
  value: number;
}

export interface SimulationPoint {
  month: number;
  year: number;
  totalAssets: number;
  passiveIncomeMonthly: number;
}

export interface SideHustle {
  id: string;
  title: string;
  platform: string;
  estimatedHours: number;
  hourlyRate: number;
  status: 'NEW' | 'APPLIED' | 'IN_PROGRESS' | 'COMPLETED';
  skills: string[];
}

export interface UserProfile {
  monthlyIncome: number;
  currentAssets: number;
  targetAssets: number;
  monthlySavingsTarget: number;
}

export interface AiAdvice {
  savingsTips: string[];
  hustleRecommendations: string[];
  riskWarning: string | null;
  motivationalMessage: string;
}

export interface MarketInsight {
  indexName: string;
  currentValue: string;
  changePercent: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impactSummary: string;
  newsTitle: string;
  newsUrl: string;
}

export interface StrategyStock {
  code: string;
  name: string;
  reason: string;
}

export interface StrategySector {
  id: number;
  name: string;
  description: string;
  stocks: StrategyStock[];
}

export interface NationalStrategyData {
  sectors: StrategySector[];
}

export interface StockHistoryPoint {
  date: string;
  price: number;
  newsTitle?: string;
  newsUrl?: string;
  newsSummary?: string;
}

export interface StockDetailData {
  code: string;
  name: string;
  currentPrice: number;
  description: string;
  history: StockHistoryPoint[];
}