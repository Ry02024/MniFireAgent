import React, { useState } from 'react';
import { Asset, Expense, UserProfile } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';

interface FinancialOverviewProps {
  assets: Asset[];
  expenses: Expense[];
  profile: UserProfile;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ assets, expenses, profile, onAddExpense }) => {
  const [newExpense, setNewExpense] = useState({ category: '食費', amount: '', date: new Date().toISOString().split('T')[0] });

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsRate = Math.max(0, ((profile.monthlyIncome - totalExpenses) / profile.monthlyIncome) * 100).toFixed(1);

  const expensesByCategory = expenses.reduce((acc, curr) => {
    const found = acc.find(x => x.name === curr.category);
    if (found) {
      found.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const handleAdd = () => {
    if (!newExpense.amount) return;
    onAddExpense({
      category: newExpense.category,
      amount: parseInt(newExpense.amount),
      date: newExpense.date
    });
    setNewExpense({ ...newExpense, amount: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Metrics */}
      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-semibold">総資産</p>
          <p className="text-2xl font-bold text-slate-800">¥{totalAssets.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">前月比 +1.2%</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-semibold">月収 (手取り)</p>
          <p className="text-2xl font-bold text-slate-800">¥{profile.monthlyIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-semibold">今月の支出</p>
          <p className="text-2xl font-bold text-red-600">¥{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-semibold">貯蓄率</p>
          <p className={`text-2xl font-bold ${Number(savingsRate) > 20 ? 'text-green-600' : 'text-yellow-600'}`}>
            {savingsRate}%
          </p>
        </div>
      </div>

      {/* Expense Input & List */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">支出管理</h3>
        
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-slate-50 rounded-lg">
          <select 
            className="p-2 border border-slate-300 rounded-md text-sm flex-1"
            value={newExpense.category}
            onChange={e => setNewExpense({...newExpense, category: e.target.value})}
          >
            <option value="家賃">家賃</option>
            <option value="食費">食費</option>
            <option value="光熱費">光熱費</option>
            <option value="交際・娯楽">交際・娯楽</option>
            <option value="交通費">交通費</option>
            <option value="通信費">通信費</option>
            <option value="その他">その他</option>
          </select>
          <input 
            type="number" 
            placeholder="金額 (¥)" 
            className="p-2 border border-slate-300 rounded-md text-sm flex-1"
            value={newExpense.amount}
            onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
          />
          <input 
            type="date"
            className="p-2 border border-slate-300 rounded-md text-sm"
            value={newExpense.date}
            onChange={e => setNewExpense({...newExpense, date: e.target.value})}
          />
          <button 
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
          >
            追加
          </button>
        </div>

        <div className="overflow-auto max-h-60">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-2">日付</th>
                <th className="px-4 py-2">カテゴリ</th>
                <th className="px-4 py-2 text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{expense.date}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{expense.category}</td>
                  <td className="px-4 py-3 text-right text-slate-700">¥{expense.amount.toLocaleString()}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={3} className="text-center py-4 text-slate-400">支出記録がありません。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold text-slate-800 mb-4 w-full text-left">支出内訳</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full mt-4 space-y-2">
            {expensesByCategory.map((entry, index) => (
                <div key={index} className="flex justify-between text-xs text-slate-600">
                    <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        {entry.name}
                    </span>
                    <span>¥{entry.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;