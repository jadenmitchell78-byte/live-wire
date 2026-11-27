'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ExternalLink, RefreshCw, Radio } from 'lucide-react';
import { NFL_PLUS_URL } from '../../lib/nfl-live';

const REFRESH_MS = 15000;

function TeamRow({ team, hasBall, showScore }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {team.logo ? (
        <img src={team.logo} alt="" className="w-7 h-7 object-contain shrink-0" loading="lazy" />
      ) : (
        <span className="w-7 h-7 rounded-full bg-white/10 shrink-0" />
      )}
      <span className={`text-sm truncate ${hasBall ? 'font-black text-white' : 'font-semibold text-gray-300'}`}>
        {team.name || team.abbr}
        {hasBall && <span className="ml-1.5 text-[10px] align-middle text-amber-300" title="Possession">●</span>}
      </span>
      {team.record && <span className="hidden sm:inline text-[10px] text-gray-500 font-mono">{team.record}</span>}
      <span className="ml-auto text-xl font-black tabular-nums text-white">{showScore ? team.score ?? 0 : ''}</span>
    </div>
  );
}

function GameCard({ g }) {
  const showScore = g.state !== 'pre';
  return (
    <article
      data-redzone={g.redZone ? 'true' : 'false'}
      data-state={g.state}
      className={`relative rounded-xl border p-3 space-y-2 transition ${
        g.redZone
          ? 'border-[#E50914] bg-gradient-to-br from-[#2a0a0e] to-[#141416] shadow-lg shadow-[#E50914]/25'
          : 'border-white/10 bg-[#141416]'
      }`}
    >
      <header className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          {g.live ? (
            <span className="px-1.5 py-0.5 rounded bg-[#E50914] text-white flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </span>
          ) : g.state === 'post' ? (
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300">FINAL</span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300">UPCOMING</span>
          )}
          {g.redZone && (
            <span
              className="px-1.5 py-0.5 rounded bg-[#E50914] text-white animate-pulse ring-2 ring-[#E50914]/50"
              data-testid="redzone-badge"
            >
              RED ZONE
            </span>
          )}
        </span>
        <span className="text-gray-400 normal-case font-semibold tabular-nums truncate">
          {g.live ? `Q${g.period} · ${g.clock}` : g.detail}
        </span>
      </header>
      <TeamRow team={g.away} hasBall={g.possessionAbbr && g.possessionAbbr === g.away.abbr} showScore={showScore} />
      <TeamRow team={g.home} hasBall={g.possessionAbbr && g.possessionAbbr === g.home.abbr} showScore={showScore} />
      {g.live && (g.downDistance || g.possessionAbbr) && (
        <p className="text-xs text-gray-300 border-t border-white/10 pt-2">
          <span className="font-bold text-white">{g.downDistance || 'In play'}</span>
          {g.possessionAbbr && <span className="text-gray-400"> · {g.possessionAbbr} ball</span>}
          {g.spot && <span className="text-gray-400"> · at {g.spot}</span>}
        </p>
      )}
      {g.live && g.lastPlay && <p className="text-[11px] text-gray-500 line-clamp-2">{g.lastPlay}</p>}
      {g.network && <p className="text-[10px] text-gray-500 uppercase tracking-wider">{g.network}</p>}
    </article>
  );
}

export default function NflRedZonePanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState('');
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch('/api/nfl-live', { cache: 'no-store', signal: ctrl.signal });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error('bad');
      setData(json);
      setError(false);
      setUpdated(new Date(json.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      if (e?.name !== 'AbortError') setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, REFRESH_MS);
    const onVis = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
      abortRef.current?.abort();
    };
  }, [load]);

  const games = data?.games || [];

  return (
    <div className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-[#0e111a] to-[#05060a] p-3 sm:p-4 space-y-3" data-testid="nfl-redzone-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#E50914] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> NFL Live Panel{data?.week ? ` · Week ${data.week}` : ''}
          </p>
          <p className="text-xs text-gray-400">
            {data
              ? `${data.liveCount} live · ${data.redZoneCount} in the red zone`
              : loading
                ? 'Loading live scores…'
                : 'Live scores unavailable'}
            {updated && <span className="text-gray-500"> · updated {updated} · auto-refresh 15s</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            aria-label="Refresh scores"
            className="min-h-[44px] min-w-[44px] px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <a
            href={NFL_PLUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#f6121d] text-white text-xs font-extrabold flex items-center gap-2 transition"
          >
            Watch NFL RedZone on NFL+ <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {data ? 'Could not refresh — showing the last scores. Retrying…' : 'Could not load NFL scores right now. Retrying…'}
        </div>
      )}

      {games.length > 0 ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {games.map((g) => (
            <GameCard key={g.id} g={g} />
          ))}
        </div>
      ) : (
        !loading &&
        !error && <p className="text-sm text-gray-400 py-6 text-center">No NFL games on the scoreboard right now.</p>
      )}

      <p className="text-[11px] text-gray-500">
        Scores &amp; situation from ESPN. NFL RedZone video is licensed to NFL+ Premium and TV providers, so Live Wire links out instead of
        embedding a stream.
      </p>
    </div>
  );
}
