import { BrowserRouter, Routes, Route } from "react-router-dom";
import StockTable from "./components/StockTable";
import StockDetail from "./components/StockDetail";

function App() {
  return (
    <BrowserRouter>
      {/* Background visual elements */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <Routes>
          <Route path="/" element={<StockTable />} />
          <Route path="/stock/:ticker" element={<StockDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
