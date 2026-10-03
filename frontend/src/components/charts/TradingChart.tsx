'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';
import Decimal from 'decimal.js';

export default function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart — đúng spec GĐ6: attribution + Canvas 2D
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

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    seriesRef.current = candlestickSeries;

    // Nến lịch sử: Binance REST, fallback mock khi bị chặn
    let lastClose = new Decimal(65000);
    fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100')
      .then((r) => r.json())
      .then((rows: any[]) => {
        if (!Array.isArray(rows) || !seriesRef.current) return;
        const data = rows.map((k) => ({
          time: Math.floor(k[0] / 1000) as any,
          open: new Decimal(k[1]).toNumber(),
          high: new Decimal(k[2]).toNumber(),
          low: new Decimal(k[3]).toNumber(),
          close: new Decimal(k[4]).toNumber(),
        }));
        seriesRef.current.setData(data);
        lastClose = new Decimal(rows[rows.length - 1][4]);
      })
      .catch(() => {
        // Fallback mock — dùng Decimal.js tránh sai số float (spec GĐ6)
        const initialData = [];
        let currentTime = Math.floor(Date.now() / 1000) - 100 * 60;
        for (let i = 0; i < 100; i++) {
          const open = lastClose;
          const high = open.plus(new Decimal(Math.random() * 200));
          const low = open.minus(new Decimal(Math.random() * 200));
          const close = open.plus(high).plus(low).dividedBy(3).plus(new Decimal((Math.random() - 0.5) * 100));
          initialData.push({ time: currentTime as any, open: open.toNumber(), high: high.toNumber(), low: low.toNumber(), close: close.toNumber() });
          lastClose = close;
          currentTime += 60;
        }
        seriesRef.current?.setData(initialData);
      });

    // Realtime: Binance WS, fallback SSE mock nếu WS chết 3 lần liên tiếp
    let ws: WebSocket | null = null;
    let sse: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let lastTickAt = Date.now();
    let closed = false;
    let wsFails = 0;

    const connectSSEFallback = () => {
      if (closed || sse) return;
      sse = new EventSource('/api/finance/stream');
      sse.onmessage = (event) => {
        if (!seriesRef.current) return;
        try {
          const d = JSON.parse(event.data);
          const tick = { time: d.time, open: new Decimal(d.open).toNumber(), high: new Decimal(d.high).toNumber(), low: new Decimal(d.low).toNumber(), close: new Decimal(d.close).toNumber() };
          seriesRef.current.update(tick);
          lastClose = new Decimal(d.close);
          lastTickAt = Date.now();
        } catch { /* ignore */ }
      };
    };

    const connectWS = () => {
      if (closed) return;
      ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');

      ws.onmessage = (event) => {
        if (!seriesRef.current) return;
        try {
          const data = JSON.parse(event.data);
          if (data.e === 'kline') {
            const { t, o, h, l, c } = data.k;
            const tick = {
              time: Math.floor(t / 1000) as any,
              open: new Decimal(o).toNumber(),
              high: new Decimal(h).toNumber(),
              low: new Decimal(l).toNumber(),
              close: new Decimal(c).toNumber(),
            };
            seriesRef.current.update(tick);
            lastClose = new Decimal(c);
            lastTickAt = Date.now();
          }
        } catch (err) {
          console.error("Lỗi parse WS data", err);
        }
      };

      ws.onclose = () => {
        if (closed) return;
        wsFails += 1;
        if (wsFails >= 3) { connectSSEFallback(); return; }
        reconnectTimer = setTimeout(connectWS, 3000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connectWS();

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastTickAt > 5000) {
        ws?.close();
        if (reconnectTimer) clearTimeout(reconnectTimer);
        connectWS();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // ResizeObserver — đúng spec GĐ6 (thay window.resize width-only)
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width: Math.floor(width), height: Math.floor(height) });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
      sse?.close();
      document.removeEventListener('visibilitychange', onVisibility);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  return (
    <div ref={chartContainerRef} className="w-full h-[400px] lg:h-[600px]" />
  );
}
