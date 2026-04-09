import axios from "axios";

const API = axios.create({
  baseURL: "",
});

export const getTopStocks = () => API.get("/api/stocks/top10");

export const getStockHistory = (ticker) =>
  API.get(`/api/stocks/${ticker}/history`);

export const analyzeStock = (ticker, prices) =>
  API.post(`/api/stocks/${ticker}/analyze`, { prices });

export default API;
