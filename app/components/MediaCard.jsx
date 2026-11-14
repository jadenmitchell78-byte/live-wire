'use client';

import React, { useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Play, Plus, Star } from 'lucide-react';

export const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=60';

export function formatCountdown(startTime, now) {
  if (!startTime) return '';
  const diff = startTime - now;
  if (diff <= 0) return 'Starting now';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return `in ${h}h ${m}m`;
  return `in ${Math.floor(h / 24)}d`;
}

function BlurImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [current, setCurrent] = useState(src);
  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-gradient-to-br from-[#26262b] to-[#141416] animate-pulse" />}
      <img
        src={current}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (current !== FALLBACK_IMG) setCurrent(FALLBACK_IMG);
          else setLoaded(true);
        }}
        className={`w-full h-full object-cover transition-all duration-500 motion-safe:group-hover:scale-110 ${
          loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
        }`}
      />
    </>
  );
}

export function MediaCard({
  ev,
  index = 0,
  isSelected,
  isPinned,
  onSelect,
  onTogglePin,
  onSelectSecondary,
  multiView,
  badge,
  progress,
}) {
  const isSports = !ev.poster && ev.homeTeam && ev.awayTeam;
  return (
    <div
      onClick={() => onSelect(ev)}
      role="button"
      tabIndex={0}
      aria-label={`Open ${ev.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(ev);
        }
      }}
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
      className={`group relative cursor-pointer rounded-lg overflow-hidden bg-[#18181b] border transition-all duration-300 ease-out motion-safe:hover:scale-105 motion-safe:hover:-translate-y-1 hover:z-20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.9)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] ${
        isSelected ? 'border-[#E50914] ring-2 ring-[#E50914]/50' : 'border-white/10 hover:border-white/40'
      }`}
    >
      {!isSports ? (
        <div className="relative h-40 w-full overflow-hidden bg-[#111]">
          <BlurImage key={ev.poster || 'fallback'} src={ev.poster || FALLBACK_IMG} alt={ev.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-black/30 to-transparent" />
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-black/75 text-gray-200 truncate">
              {ev.league}
            </span>
            {ev.isLive ? (
              <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-[#E50914] text-white shadow shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE
              </span>
            ) : ev.rating ? (
              <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-black/75 text-amber-300 shrink-0">
                <Star className="w-3 h-3 fill-current" />
                {ev.rating}
              </span>
            ) : null}
          </div>
          <div className="absolute bottom-2 left-3 right-3">
            <p className="text-sm font-bold text-white truncate drop-shadow">{ev.shortTitle || ev.title}</p>
            {(badge || ev.status) && (
              <p className="text-[11px] font-semibold text-gray-300 truncate">{badge || ev.status}</p>
            )}
          </div>
          {typeof progress === 'number' && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div className="h-full bg-[#E50914]" style={{ width: `${Math.min(progress * 100, 100)}%` }} />
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 h-40 flex flex-col justify-between bg-gradient-to-br from-[#222226] to-[#141416]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-gray-200 truncate">
              {ev.league}
            </span>
            {ev.isLive ? (
              <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-[#E50914] text-white shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-gray-400 truncate">{badge || ev.status}</span>
            )}
          </div>

          <div className="space-y-2 my-auto">
            {[ev.awayTeam, ev.homeTeam].map((team, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={team?.logo || FALLBACK_IMG}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.visibility = 'hidden';
                    }}
                    className="w-6 h-6 object-contain shrink-0"
                  />
                  <span className="text-xs font-bold text-white truncate">{team?.name}</span>
                </div>
                <span className="text-sm font-black text-white tabular-nums">{team?.score}</span>
              </div>
            ))}
          </div>
          {ev.isLive && <p className="text-[10px] text-gray-400 truncate">{ev.status}</p>}
        </div>
      )}

      <div className="px-3.5 py-2.5 bg-[#18181b] border-t border-white/5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#E50914] transition">
          <span className="w-6 h-6 rounded-full bg-white text-black group-hover:bg-[#E50914] group-hover:text-white flex items-center justify-center transition">
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </span>
          {isSelected ? 'Playing' : progress ? 'Resume' : 'Play'}
        </span>

        <div className="flex items-center gap-1.5">
          {multiView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectSecondary(ev);
              }}
              aria-label="Send to second screen"
              className="min-h-[32px] px-2 py-1 rounded bg-white/10 hover:bg-[#E50914] text-[10px] font-bold text-white transition"
            >
              #2
            </button>
          )}
          <button
            onClick={(e) => onTogglePin(ev, e)}
            aria-label={isPinned ? 'Remove from My List' : 'Add to My List'}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition ${
              isPinned ? 'border-white bg-white text-black' : 'border-white/30 text-gray-300 hover:border-white hover:text-white'
            }`}
          >
            {isPinned ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 6 }) {
  return (
    <section className="space-y-3 px-4 sm:px-8" aria-hidden="true">
      <div className="h-5 w-48 rounded bg-white/10 animate-pulse" />
      <div className="flex gap-3.5 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-[240px] sm:w-[270px] h-[212px] shrink-0 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </div>
    </section>
  );
}

export function MediaRow({ title, icon: Icon, items, action, getBadge, getProgress, cardProps }) {
  const railRef = useRef(null);
  if (!items || items.length === 0) return null;
  const scrollBy = (offset) => railRef.current?.scrollBy({ left: offset, behavior: 'smooth' });

  return (
    <section className="relative group/row space-y-2.5">
      <div className="flex items-center justify-between px-4 sm:px-8">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
          {Icon && <Icon className="w-4 h-4 text-[#E50914]" />}
          {title}
          <span className="text-xs font-medium text-gray-500">({items.length})</span>
        </h2>
        {action}
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy(-520)}
          className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-30 w-10 h-28 rounded-lg bg-black/75 hover:bg-black/95 text-white items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 border border-white/10"
          aria-label={`Scroll ${title} left`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={railRef}
          className="flex gap-3.5 overflow-x-auto px-4 sm:px-8 py-3 scroll-smooth snap-x"
          style={{ scrollbarWidth: 'none' }}
        >
          {items.map((ev, idx) => (
            <div key={ev.id} className="w-[240px] sm:w-[270px] shrink-0 snap-start">
              <MediaCard
                ev={ev}
                index={idx}
                isSelected={cardProps.selectedId === ev.id}
                isPinned={cardProps.pinnedIds.includes(ev.id)}
                onSelect={cardProps.onSelect}
                onTogglePin={cardProps.onTogglePin}
                onSelectSecondary={cardProps.onSelectSecondary}
                multiView={cardProps.multiView}
                badge={getBadge?.(ev)}
                progress={getProgress?.(ev)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollBy(520)}
          className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-30 w-10 h-28 rounded-lg bg-black/75 hover:bg-black/95 text-white items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 border border-white/10"
          aria-label={`Scroll ${title} right`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
