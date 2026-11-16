'use client';

import React, { useEffect, useState } from 'react';

const STUDIO_API_BASE = (process.env.NEXT_PUBLIC_STUDIO_API_URL || '').replace(/\/+$/, '');

export default function SignalOverlay({ sport = 'ALL' }) {
  const [propsList, setPropsList] = useState([]);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (!STUDIO_API_BASE) return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${STUDIO_API_BASE}/api/v1/markets/props?sport=${encodeURIComponent(sport)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setPropsList(Array.isArray(data.props) ? data.props.slice(0, 4) : []);
          setSummary(data.scan_summary || '');
        }
      } catch {}
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [sport]);

  if (!STUDIO_API_BASE || propsList.length === 0) return null;

  return (
    <div className="rounded-xl border border-cyan-500/35 bg-slate-950/90 p-3 text-xs text-slate-100">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-black uppercase tracking-wider text-cyan-300">Live Studio Edge Signals</span>
        <span className="text-[11px] text-slate-400">{summary}</span>
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {propsList.map((p) => (
          <a
            key={p.ticker}
            href={`https://kalshi.com/?search=${encodeURIComponent(p.ticker || '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/80 px-2.5 py-1.5 hover:border-cyan-400/50 transition"
          >
            <span className="truncate font-semibold">
              [{p.sport}] {p.player || p.ticker}
            </span>
            <span className="ml-2 shrink-0 font-mono text-emerald-300">
              {p.yes_ask_cents}¢ • {p.net_ev_pct >= 0 ? '+' : ''}{p.net_ev_pct}% EV
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
