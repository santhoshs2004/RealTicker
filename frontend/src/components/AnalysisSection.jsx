import { useState } from "react";
import { analyzeStock } from "../api";

function AnalysisSection({ ticker, prices }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    analyzeStock(ticker, prices)
      .then((res) => {
        setAnalysis(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Analysis failed. Please try again.");
        setLoading(false);
      });
  };

  return (
    <div className="mt-8 glass-panel p-6 md:p-8 relative overflow-hidden group">
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full group-hover:bg-primary/20 transition-colors duration-500" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
              <span className="text-2xl">🤖</span> AI Analysis
            </h2>
            <p className="text-textMuted text-sm mt-1">Get algorithmic insights on recent price movements.</p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || prices.length < 2}
            className="relative overflow-hidden inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 focus:ring-2 focus:ring-primary/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 group/btn"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Model...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Analyze Movement 
                <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-negative/10 border border-negative/20 text-negative rounded-lg text-sm mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-4 flex flex-col justify-center">
                <span className="text-textMuted text-xs uppercase tracking-wider mb-1 font-semibold">Overall Trend</span>
                <span className={`text-xl font-bold flex items-center gap-2 ${
                  analysis.trend.includes('Upward') ? 'text-positive' : 
                  analysis.trend.includes('Downward') ? 'text-negative' : 'text-warning'
                }`}>
                  {analysis.trend.includes('Upward') && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                  {analysis.trend.includes('Downward') && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>}
                  {analysis.trend.includes('Sideways') && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16M4 12l4-4m-4 4l4 4" /></svg>}
                  {analysis.trend}
                </span>
              </div>
              <div className="glass-card p-4 flex flex-col justify-center">
                <span className="text-textMuted text-xs uppercase tracking-wider mb-1 font-semibold">Risk Level</span>
                <span className={`text-xl font-bold ${
                  analysis.risk.includes('High') ? 'text-negative' : 
                  analysis.risk.includes('Low') ? 'text-positive' : 'text-warning'
                }`}>
                  {analysis.risk}
                </span>
              </div>
              <div className="glass-card p-4 flex flex-col justify-center">
                <span className="text-textMuted text-xs uppercase tracking-wider mb-1 font-semibold">Suggestion</span>
                <span className="text-xl font-bold text-white">
                  {analysis.suggestion}
                </span>
              </div>
            </div>

            {analysis.summary && (
              <div className="pt-6 border-t border-white/5">
                <span className="text-textMuted text-xs uppercase tracking-wider font-semibold">Model Summary</span>
                <p className="mt-2 text-textMain leading-relaxed p-4 bg-black/20 rounded-xl italic">"{analysis.summary}"</p>
              </div>
            )}
            
            <div className="flex items-start gap-2 pt-2 px-1 text-warning/80 text-xs">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>This is AI-generated analysis and absolutely not financial advice. Do your own research.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalysisSection;
