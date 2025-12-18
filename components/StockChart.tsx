import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { getStockDetail } from '../services/geminiService';
import { StockDetailData, StockHistoryPoint, TimeRange } from '../types';

interface StockChartProps {
  code: string;
  name: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as StockHistoryPoint;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm max-w-[250px] z-50">
        <p className="text-slate-500 text-xs mb-1">{label}</p>
        <p className="text-indigo-600 font-bold text-lg mb-1">¥{data.price?.toLocaleString() ?? '-'}</p>
        <p className="text-xs text-slate-400 mt-1">クリックで詳細を表示</p>
      </div>
    );
  }
  return null;
};

const StockChart: React.FC<StockChartProps> = ({ code, name }) => {
  const [data, setData] = useState<StockDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<StockHistoryPoint | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Reset selected point when range changes
      setSelectedPoint(null);
      try {
        const result = await getStockDetail(code, name, timeRange);
        setData(result);
        if (result && result.history && result.history.length > 0) {
          // Default to the latest point
          setSelectedPoint(result.history[result.history.length - 1]);
        }
      } catch (e) {
        console.error("Failed to fetch stock detail", e);
      }
      setLoading(false);
    };
    fetchData();
  }, [code, name, timeRange]);

  const handleChartClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const point = state.activePayload[0].payload as StockHistoryPoint;
      setSelectedPoint(point);
    }
  };

  const ranges: { key: TimeRange; label: string }[] = [
    { key: '1D', label: '1日' },
    { key: '1M', label: '1ヶ月' },
    { key: '3M', label: '3ヶ月' },
    { key: '1Y', label: '1年' },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        <div className="flex gap-2 mb-4">
           {[...Array(4)].map((_, i) => <div key={i} className="h-8 w-16 bg-slate-200 rounded"></div>)}
        </div>
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-64 bg-slate-100 rounded"></div>
        <div className="h-32 bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (!data) return <div className="p-4 text-red-500">データが取得できませんでした。</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-slate-100 shadow-sm">
        {/* Range Selector */}
        <div className="flex justify-end mb-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {ranges.map((range) => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  timeRange === range.key
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
              <div>
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded mr-2">{data.code}</span>
                  <h2 className="text-2xl font-bold text-slate-800 inline-block">{data.name}</h2>
              </div>
              <div className="text-right">
                  <span className="text-3xl font-bold text-indigo-600">¥{data.currentPrice?.toLocaleString() ?? '-'}</span>
              </div>
          </div>
          <p className="text-sm text-slate-500">{data.description}</p>
        </div>

        <div className="h-80 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={data.history} 
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              onClick={handleChartClick}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                style={{ fontSize: '12px' }} 
                tick={{ fill: '#94a3b8' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['auto', 'auto']} 
                style={{ fontSize: '12px' }} 
                tick={{ fill: '#94a3b8' }}
                width={40}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              {selectedPoint && (
                <ReferenceLine x={selectedPoint.date} stroke="#indigo" strokeDasharray="3 3" />
              )}
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#4f46e5" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#4f46e5' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[10px] text-slate-400">
          ※ チャートをクリックすると、その時点の関連ニュースが右側に表示されます。
        </div>
      </div>

      {/* Linked News Panel */}
      <div className="lg:col-span-1 bg-slate-50 rounded-lg p-6 border border-slate-200 flex flex-col">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          関連ニュース ({selectedPoint ? timeRange : '-'})
        </h3>
        
        {selectedPoint ? (
          <div className="animate-fade-in flex-1 flex flex-col">
            <div className="mb-2">
               <span className="text-xs font-mono text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                 {selectedPoint.date}
               </span>
               <span className="ml-2 text-lg font-bold text-slate-800">
                 ¥{selectedPoint.price?.toLocaleString() ?? '-'}
               </span>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex-1">
              <h4 className="font-bold text-slate-800 mb-2 leading-snug">
                {selectedPoint.newsTitle || "関連ニュースなし"}
              </h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                {selectedPoint.newsSummary || "この時期の特定のニュースは見当たりませんでした。"}
              </p>
              
              {selectedPoint.newsUrl && (
                <a 
                  href={selectedPoint.newsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline mt-auto"
                >
                  記事を読む 
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            チャートをクリックして詳細を表示
          </div>
        )}
      </div>
    </div>
  );
};

export default StockChart;