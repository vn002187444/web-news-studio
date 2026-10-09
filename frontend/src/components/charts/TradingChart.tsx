'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickSeries, Time } from 'lightweight-charts';
import Decimal from 'decimal.js';
import { CHART_POLL_MS } from './chartMeta';

// Poll REST mỗi 12s thay vì SSE/WS liên tục → tiết kiệm CPU Workers Free.
// Chỉ gọi khi tab đang mở (document.visibilityState === 'visible').
const POLL_MS = CHART_POLL_MS;

interface Candle {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

function toCandle(k: [number, string, string, string, string, ...unknown[]]): Candle {
  return {
    time: Math.floor(k[0] / 1000) as Time,
    open: new Decimal(k[1]).toNumber(),
    high: new Decimal(k[2]).toNumber(),
    low: new Decimal(k[3]).toNumber(),
    close: new Decimal(k[4]).toNumber(),
  };
}

export default function TradingChart({ symbol = 'BTCUSDT', interval = '1m' }: { symbol?: string; interval?: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const reqRef = useRef(0);

  // Tạo chart 1 lần duy nhất
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 400,
      layout: {
        background: { color: 'transparent' },
        textColor: '#D9D9D9',
        attributionLogo: true,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;
    seriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width: Math.floor(width), height: Math.floor(height) });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Nạp nến + poll khi đổi mã / khung giờ
  useEffect(() => {
    const myReq = ++reqRef.current;
    const alive = () => myReq === reqRef.current && seriesRef.current;

    const loadHistory = async () => {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`);
        const rows = await r.json();
        if (!alive() || !Array.isArray(rows)) return;
        seriesRef.current!.setData(rows.map(toCandle));
      } catch {
        // Giữ dữ liệu cũ khi Binance chặn (không vẽ mock để tránh nhiễu giá)
      }
    };

    const pollLatest = async () => {
      if (document.visibilityState !== 'visible') return; // Tab ẩn → bỏ qua, tiết kiệm request
      try {
        const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=2`);
        const rows = await r.json();
        if (!alive() || !Array.isArray(rows) || rows.length === 0) return;
        seriesRef.current!.update(toCandle(rows[rows.length - 1]));
      } catch { /* bỏ qua tick lỗi */ }
    };

    loadHistory();
    const timer = setInterval(pollLatest, POLL_MS);

    // Tab mở lại → cập nhật ngay thay vì chờ hết chu kỳ poll
    const onVisibility = () => {
      if (document.visibilityState === 'visible') pollLatest();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      reqRef.current++; // Hủy các fetch đang bay của symbol/interval cũ
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [symbol, interval]);

  return (
    <div ref={chartContainerRef} className="w-full h-[400px] lg:h-[600px]" />
  );
}
