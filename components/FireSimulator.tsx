import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { UserProfile, SimulationPoint } from '../types';

interface FireSimulatorProps {
  profile: UserProfile;
}

const FireSimulator: React.FC<FireSimulatorProps> = ({ profile }) => {
  const [annualReturn, setAnnualReturn] = useState<number>(4.5); // 4-5% as per proposal
  const [monthlySavings, setMonthlySavings] = useState<number>(40000); // Default 3-40k

  const data: SimulationPoint[] = useMemo(() => {
    const points: SimulationPoint[] = [];
    let currentAmount = profile.currentAssets;
    const monthlyRate = annualReturn / 100 / 12;
    const monthsToSimulate = 12 * 15; // 15 years

    for (let i = 0; i <= monthsToSimulate; i++) {
      const year = i / 12;
      
      // Calculate Passive Income (4% rule approximation for display)
      const passiveIncomeMonthly = (currentAmount * 0.04) / 12;

      points.push({
        month: i,
        year: parseFloat(year.toFixed(1)),
        totalAssets: Math.round(currentAmount),
        passiveIncomeMonthly: Math.round(passiveIncomeMonthly),
      });

      // Compound Interest Formula: previous * (1 + rate) + savings
      if (currentAmount < profile.targetAssets * 1.5) {
         currentAmount = currentAmount * (1 + monthlyRate) + monthlySavings;
      }
    }
    return points;
  }, [profile.currentAssets, profile.targetAssets, annualReturn, monthlySavings]);

  const yearsToTarget = useMemo(() => {
    const targetPoint = data.find(p => p.totalAssets >= profile.targetAssets);
    return targetPoint ? targetPoint.year : '>15';
  }, [data, profile.targetAssets]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">FIRE ロードマップ・シミュレーション</h2>
          <p className="text-sm text-slate-500">複利と積立貯蓄に基づく資産推移予測</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">目標達成まで (3000万円)</div>
          <div className="text-3xl font-bold text-indigo-600">{yearsToTarget} 年</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">想定年利回り (%)</label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-right text-sm text-slate-600 mt-1">{annualReturn}%</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">毎月の貯蓄額 (円)</label>
          <input
            type="range"
            min="0"
            max="200000"
            step="5000"
            value={monthlySavings}
            onChange={(e) => setMonthlySavings(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-right text-sm text-slate-600 mt-1">¥{monthlySavings.toLocaleString()}</div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="year" 
              type="number" 
              domain={[0, 'dataMax']} 
              tickCount={10} 
              tickFormatter={(val) => `${val}年`}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              tickFormatter={(val) => `${val / 10000}万`}
              style={{ fontSize: '12px' }}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <Tooltip 
              formatter={(value: number) => `¥${value.toLocaleString()}`}
              labelFormatter={(label) => `${label}年目`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <ReferenceLine y={profile.targetAssets} label="目標 (3000万)" stroke="#ef4444" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="totalAssets" 
              stroke="#4f46e5" 
              fillOpacity={1} 
              fill="url(#colorAssets)" 
              name="総資産"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-4 bg-indigo-50 rounded-lg flex items-center justify-between">
        <span className="text-indigo-800 font-medium text-sm">7年後の想定不労所得 (月額):</span>
        <span className="text-indigo-900 font-bold">
          ¥{data.find(d => Math.abs(d.year - 7) < 0.1)?.passiveIncomeMonthly?.toLocaleString() ?? 0} / 月
        </span>
      </div>
    </div>
  );
};

export default FireSimulator;