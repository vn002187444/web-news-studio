// Danh mục mã + khung giờ dùng chung cho chart Finance (poll REST, không SSE/WS).
export const CHART_SYMBOLS = [
  { id: 'BTCUSDT', label: 'BTC/USD' },
  { id: 'ETHUSDT', label: 'ETH/USD' },
  { id: 'SOLUSDT', label: 'SOL/USD' },
  { id: 'BNBUSDT', label: 'BNB/USD' },
  { id: 'XRPUSDT', label: 'XRP/USD' },
  { id: 'DOGEUSDT', label: 'DOGE/USD' },
] as const;

export const CHART_INTERVALS = [
  { id: '15m', label: '15M' },
  { id: '1h', label: '1H' },
  { id: '4h', label: '4H' },
] as const;

// Poll REST mỗi 12s (10–15s) thay vì giữ kết nối SSE/WS liên tục → tiết kiệm CPU Workers Free.
export const CHART_POLL_MS = 12_000;
