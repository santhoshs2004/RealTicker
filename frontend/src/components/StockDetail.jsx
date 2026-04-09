import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStockHistory } from "../api";
import AnalysisSection from "./AnalysisSection";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function StockDetail() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getStockHistory(ticker)
      .then((res) => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load history. Check if the ticker is valid.");
        setLoading(false);
      });
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-textMuted font-medium animate-pulse">Loading {ticker} history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-negative/10 border border-negative/30 rounded-xl text-negative text-center shadow-lg max-w-lg mx-auto mt-10">
        <p className="font-semibold mb-4">{error}</p>
        <button onClick={() => navigate("/")} className="px-4 py-2 bg-negative/20 hover:bg-negative/30 rounded-lg transition-colors text-sm">Return Home</button>
      </div>
    );
  }

  const prices = history.map((h) => h.price);
  
  // Create a reversed array or simple map solely for chronological charting (oldest to newest)
  const chartData = [...history].reverse();
  const isUpward = chartData.length > 0 && chartData[chartData.length - 1].price >= chartData[0].price;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate("/")} 
        className="group inline-flex items-center text-sm font-medium text-textMuted hover:text-white transition-colors"
      >
        <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Markets
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary font-bold tracking-widest text-sm border border-primary/20">
              {ticker}
            </span>
            <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Historical Data</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white flex flex-col gap-1">
            Price History
            {history.length > 0 && (
              <span className="text-sm font-medium text-textMuted mt-1">
                Last {history.length} active market days ({history[0].date} to {history[history.length - 1].date})
              </span>
            )}
          </h1>
        </div>
        {history.length > 0 && (
          <div className="text-right">
             <div className="text-3xl font-bold text-white">${history[history.length - 1].price.toFixed(2)}</div>
             <div className="text-xs text-textMuted uppercase font-semibold">Latest Price</div>
          </div>
        )}
      </div>

      {chartData.length > 0 && (
        <div className="glass-panel p-6 animate-fade-in">
          <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-6">Price Progress Trend</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis 
                  dataKey="date" 
                  stroke="#8b8fa3" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  stroke="#8b8fa3" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d2e', borderColor: '#2a2d3e', borderRadius: '8px', color: '#e1e4ed' }}
                  itemStyle={{ color: '#e1e4ed' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isUpward ? "#00c896" : "#ff4d6a"} 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: isUpward ? "#00c896" : "#ff4d6a", stroke: "#1a1d2e", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="glass-panel overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1a1d2e] sticky top-0 z-10 box-shadow-sm border-b border-white/5">
              <tr className="text-textMuted text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold w-16">#</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Closing Price</th>
                <th className="px-6 py-4 font-semibold text-right">Daily Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {history.map((point, idx) => {
                const prev = idx > 0 ? history[idx - 1].price : point.price;
                const change = point.price - prev;
                return (
                  <tr key={point.date} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-textMuted font-mono text-xs">{idx + 1}</td>
                    <td className="px-6 py-3 text-textMain font-medium">{point.date}</td>
                    <td className="px-6 py-3 font-semibold text-right text-white">
                      ${point.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-right font-medium">
                      <span className={`inline-flex items-center space-x-1 ${change >= 0 ? "text-positive" : "text-negative"}`}>
                        {idx !== 0 && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {change >= 0 
                              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                            }
                          </svg>
                        )}
                        <span>{change >= 0 ? "+" : ""}{change.toFixed(2)}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnalysisSection ticker={ticker} prices={prices} />
    </div>
  );
}

export default StockDetail;
