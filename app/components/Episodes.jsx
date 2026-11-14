'use client';

import React, { useEffect, useMemo, useState } from 'react';

const episodeCache = new Map();

export function useEpisodes(ev) {
  const key = ev?.mediaType === 'tv' && ev.tvmazeId
    ? `tvmaze:${ev.tvmazeId}`
    : ev?.mediaType === 'anime' && ev.aniId
      ? `anilist:${ev.aniId}`
      : null;
  const [state, setState] = useState(() => ({
    loading: Boolean(key && !episodeCache.has(key)),
    episodes: key ? episodeCache.get(key) || [] : [],
  }));

  useEffect(() => {
    if (!key) {
      setState({ loading: false, episodes: [] });
      return undefined;
    }
    if (episodeCache.has(key)) {
      setState({ loading: false, episodes: episodeCache.get(key) });
      return undefined;
    }
    let cancelled = false;
    setState({ loading: true, episodes: [] });
    const [source, id] = key.split(':');
    fetch(`/api/episodes?source=${source}&id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data.episodes) ? data.episodes : [];
        episodeCache.set(key, list);
        if (!cancelled) setState({ loading: false, episodes: list });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, episodes: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  // Fallback for anime/tv without an episode list: numbered episodes
  const episodes = useMemo(() => {
    if (state.episodes.length > 0) return state.episodes;
    if (!ev || state.loading) return [];
    const total = Math.min(ev.totalEpisodes || 12, 200);
    return Array.from({ length: total }, (_, i) => ({ season: 1, number: i + 1, name: `Episode ${i + 1}`, image: '' }));
  }, [state, ev]);

  return { loading: state.loading, episodes };
}

export function EpisodeGrid({ ev, activeSeason, activeEpisode, onPick, compact = false }) {
  const { loading, episodes } = useEpisodes(ev);
  const seasons = useMemo(() => Array.from(new Set(episodes.map((e) => e.season))).sort((a, b) => a - b), [episodes]);
  const [season, setSeason] = useState(activeSeason || 1);

  useEffect(() => {
    if (activeSeason) setSeason(activeSeason);
  }, [activeSeason]);

  useEffect(() => {
    if (seasons.length > 0 && !seasons.includes(season)) setSeason(seasons[0]);
  }, [seasons]);

  const list = episodes.filter((e) => e.season === season);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5" aria-busy="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (list.length === 0) return null;

  return (
    <div className="space-y-3">
      {seasons.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {seasons.map((s) => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              className={`min-h-[36px] shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                season === s ? 'bg-white text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Season {s}
            </button>
          ))}
        </div>
      )}
      <div
        className={`grid gap-2.5 ${
          compact ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 max-h-64' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-h-[420px]'
        } overflow-y-auto pr-1`}
      >
        {list.map((ep) => {
          const active = ep.season === activeSeason && ep.number === activeEpisode;
          return (
            <button
              key={`${ep.season}-${ep.number}`}
              onClick={() => onPick(ep.season, ep.number)}
              className={`group text-left rounded-lg overflow-hidden border transition ${
                active ? 'border-[#E50914] ring-2 ring-[#E50914]/40' : 'border-white/10 hover:border-white/40'
              }`}
            >
              {!compact && (
                <div className="relative h-20 bg-[#1c1c20] overflow-hidden">
                  {ep.image ? (
                    <img src={ep.image} alt="" loading="lazy" className="w-full h-full object-cover motion-safe:group-hover:scale-105 transition-transform" />
                  ) : (
                    <img src={ev.poster} alt="" loading="lazy" className="w-full h-full object-cover opacity-40 blur-[1px]" />
                  )}
                  <span className="absolute bottom-1 left-1.5 text-[10px] font-black px-1.5 py-0.5 rounded bg-black/80 text-white">
                    E{ep.number}
                  </span>
                </div>
              )}
              <div className={`px-2 py-1.5 ${active ? 'bg-[#E50914]/20' : 'bg-[#18181b]'}`}>
                <p className="text-[11px] font-semibold text-white truncate">
                  {compact ? `Ep ${ep.number}` : ep.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
