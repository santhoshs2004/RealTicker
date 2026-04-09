"""
RealTicker — Stock Analysis API
A FastAPI backend that serves mock stock data and AI-powered analysis
via the HuggingFace Inference API.
"""

import os
import random
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env file
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# ──────────────────────────────────────────────
# App setup
# ──────────────────────────────────────────────

app = FastAPI(
    title="RealTicker API",
    description="Stock analysis backend powered by AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# HuggingFace config
# ──────────────────────────────────────────────

HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base"
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")  # Loaded from .env file

# ──────────────────────────────────────────────
# Pydantic models
# ──────────────────────────────────────────────

class HistoryPoint(BaseModel):
    date: str
    price: float


class Stock(BaseModel):
    ticker: str
    company: str
    price: float
    change_percent: float
    volume: int
    history: Optional[List[HistoryPoint]] = None



class AnalyzeRequest(BaseModel):
    prices: List[float]


class AnalysisResult(BaseModel):
    ticker: str
    trend: str
    risk: str
    suggestion: str
    summary: str

# ──────────────────────────────────────────────
# Mock data
# ──────────────────────────────────────────────

MOCK_STOCKS: List[Stock] = [
    Stock(ticker="AAPL",  company="Apple Inc.",             price=189.84, change_percent=1.23,  volume=54_320_100),
    Stock(ticker="MSFT",  company="Microsoft Corporation",  price=378.91, change_percent=0.67,  volume=22_150_400),
    Stock(ticker="GOOGL", company="Alphabet Inc.",          price=141.56, change_percent=-0.45, volume=18_730_200),
    Stock(ticker="AMZN",  company="Amazon.com Inc.",        price=178.25, change_percent=2.10,  volume=48_900_300),
    Stock(ticker="NVDA",  company="NVIDIA Corporation",     price=875.38, change_percent=3.52,  volume=41_200_500),
    Stock(ticker="META",  company="Meta Platforms Inc.",     price=493.50, change_percent=-1.12, volume=16_480_700),
    Stock(ticker="TSLA",  company="Tesla Inc.",             price=175.21, change_percent=-2.34, volume=95_610_800),
    Stock(ticker="JPM",   company="JPMorgan Chase & Co.",   price=196.42, change_percent=0.89,  volume=9_340_600),
    Stock(ticker="V",     company="Visa Inc.",              price=279.13, change_percent=0.32,  volume=6_720_900),
    Stock(ticker="WMT",   company="Walmart Inc.",           price=168.75, change_percent=1.05,  volume=7_890_100),
]

# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _generate_history(base_price: float, days: int = 180) -> List[HistoryPoint]:
    """Generate realistic-looking daily price data using a random walk."""
    history: List[HistoryPoint] = []
    price = base_price * 0.85  # start ~15 % lower than current
    today = datetime.utcnow().date()
    start = today - timedelta(days=days)

    for i in range(days):
        date = start + timedelta(days=i)
        # skip weekends
        if date.weekday() >= 5:
            continue
        change = random.gauss(0, base_price * 0.012)
        price = max(price + change, base_price * 0.5)
        history.append(HistoryPoint(date=date.isoformat(), price=round(price, 2)))

    return history


def _query_huggingface(prompt: str) -> str:
    """Send a text-generation prompt to the HuggingFace Inference API."""
    headers = {}
    if HF_API_TOKEN:
        headers["Authorization"] = f"Bearer {HF_API_TOKEN}"

    payload = {"inputs": prompt}

    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()

        # flan-t5 returns [{"generated_text": "..."}]
        if isinstance(data, list) and len(data) > 0:
            return data[0].get("generated_text", "").strip()
        return str(data)

    except requests.RequestException as exc:
        print(f"HuggingFace API error: {exc}")
        return ""

# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

# Get the path to the built frontend
# backend/main.py -> backend -> parent (root) -> frontend -> dist
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend", "dist")

@app.get("/api/health")
def health():
    return {"status": "ok"}

# Mount frontend assets
if os.path.exists(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")




@app.get("/api/stocks/top10", response_model=List[Stock])
def get_top_stocks():
    """Return the top 10 mock stocks, including 6 months of history for each."""
    stocks_with_history = []
    for stock in MOCK_STOCKS:
        # Create a copy and add history
        stock_dict = stock.dict()
        stock_dict["history"] = _generate_history(stock.price)
        stocks_with_history.append(Stock(**stock_dict))
    return stocks_with_history


@app.get("/api/stocks/{ticker}/history", response_model=List[HistoryPoint])
def get_stock_history(ticker: str):
    """Return ~180 days of mock daily price data for a given ticker."""
    ticker = ticker.upper()
    stock = next((s for s in MOCK_STOCKS if s.ticker == ticker), None)

    if stock is None:
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found")

    return _generate_history(stock.price)


@app.post("/api/stocks/{ticker}/analyze", response_model=AnalysisResult)
def analyze_stock(ticker: str, body: AnalyzeRequest):
    """
    Accept a price array, call HuggingFace flan-t5-base,
    and return a structured trend / risk / suggestion analysis.
    """
    ticker = ticker.upper()
    stock = next((s for s in MOCK_STOCKS if s.ticker == ticker), None)

    if stock is None:
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found")

    if not body.prices or len(body.prices) < 2:
        raise HTTPException(status_code=400, detail="At least 2 price values are required")

    # Summarize price data for the prompt
    first_price = body.prices[0]
    last_price = body.prices[-1]
    min_price = min(body.prices)
    max_price = max(body.prices)
    avg_price = sum(body.prices) / len(body.prices)

    price_summary = (
        f"Stock: {ticker} ({stock.company})\n"
        f"Period: {len(body.prices)} days\n"
        f"Start Price: ${first_price:.2f}\n"
        f"End Price: ${last_price:.2f}\n"
        f"Min: ${min_price:.2f}, Max: ${max_price:.2f}, Avg: ${avg_price:.2f}"
    )

    prompt = (
        f"Analyze the following 6 months stock price data:\n"
        f"{price_summary}\n\n"
        f"Return strictly in this format:\n"
        f"Trend: Upward or Downward or Sideways\n"
        f"Risk: Low or Medium or High\n"
        f"Suggestion: Short-term or Long-term or Avoid"
    )

    raw_response = _query_huggingface(prompt)

    # Parse the AI response — fall back to heuristics if parsing fails
    trend = "Sideways"
    risk = "Medium"
    suggestion = "Long-term"

    response_lower = raw_response.lower()

    # Trend detection
    if "upward" in response_lower or "bullish" in response_lower:
        trend = "Upward"
    elif "downward" in response_lower or "bearish" in response_lower:
        trend = "Downward"
    else:
        # heuristic fallback
        if last_price > first_price * 1.05:
            trend = "Upward"
        elif last_price < first_price * 0.95:
            trend = "Downward"

    # Risk detection
    if "high" in response_lower:
        risk = "High"
    elif "low" in response_lower:
        risk = "Low"
    else:
        volatility = (max_price - min_price) / avg_price
        if volatility > 0.3:
            risk = "High"
        elif volatility < 0.1:
            risk = "Low"

    # Suggestion detection
    if "avoid" in response_lower:
        suggestion = "Avoid"
    elif "short" in response_lower:
        suggestion = "Short-term"
    elif "long" in response_lower:
        suggestion = "Long-term"
    else:
        if trend == "Downward" and risk == "High":
            suggestion = "Avoid"
        elif trend == "Upward" and risk == "Low":
            suggestion = "Short-term"

    return AnalysisResult(
        ticker=ticker,
        trend=trend,
        risk=risk,
        suggestion=suggestion,
        summary=raw_response if raw_response else "Analysis generated via heuristic fallback.",
    )

# Catch-all route to serve the React index.html for any non-API route
# This must be at the very bottom of the file
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")
        
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    
    return {"message": "RealTicker API is running. Frontend assets not discovered."}


