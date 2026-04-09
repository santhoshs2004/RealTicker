import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTopStocks } from "../api";

function StockTable() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getTopStocks()
      .then((res) => {
        setStocks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load stocks. Is the backend running?");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-textMuted font-medium animate-pulse">Loading market data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-negative/10 border border-negative/30 rounded-xl text-negative text-center shadow-lg">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/30">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Real<span className="text-gradient">Ticker</span>
        </h1>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-textMuted text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Ticker</th>
                <th className="px-6 py-4 font-semibold">Company</th>
                <th className="px-6 py-4 font-semibold text-right">Price</th>
                <th className="px-6 py-4 font-semibold text-right">Change %</th>
                <th className="px-6 py-4 font-semibold text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stocks.map((stock) => (
                <tr
                  key={stock.ticker}
                  onClick={() => navigate(`/stock/${stock.ticker}`)}
                  className="group cursor-pointer hover:bg-white/5 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-primary/10 text-primary font-bold text-sm tracking-wide group-hover:bg-primary/20 transition-colors">
                      {stock.ticker}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-textMain">{stock.company}</td>
                  <td className="px-6 py-4 font-semibold text-right text-textMain">
                    ${stock.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    <span className={`inline-flex items-center space-x-1 ${stock.change_percent >= 0 ? "text-positive" : "text-negative"}`}>
                      <span>{stock.change_percent >= 0 ? "+" : ""}</span>
                      <span>{stock.change_percent.toFixed(2)}%</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-textMuted font-medium">
                    {stock.volume.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StockTable;
