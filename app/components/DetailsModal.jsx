'use client';

import React, { useEffect, useRef } from 'react';
import { Check, Play, Plus, Star, X, AlertTriangle } from 'lucide-react';
import { EpisodeGrid } from './Episodes';
import { isSeries } from '../../lib/sources';
import { FALLBACK_IMG } from './MediaCard';

export default function DetailsModal({ ev, resume, isPinned, onTogglePin, onPlay, onClose, allowThirdParty }) {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const series = isSeries(ev);
  const needsThirdParty = (ev.servers || []).length > 0 && (ev.servers || []).every((s) => s.thirdParty);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const resumeLabel = resume
    ? series
      ? `Resume S${resume.season || 1} · E${resume.episode || 1}`
      : 'Resume'
    : 'Play';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ev.title}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#141416] border border-white/10 shadow-2xl"
      >
        <div className="relative h-52 sm:h-72 w-full overflow-hidden">
          <img
            src={ev.bannerImage || ev.poster || FALLBACK_IMG}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/40 to-transparent" />
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close details"
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-5 right-5 flex items-end gap-4">
            {ev.poster && (
              <img src={ev.poster} alt="" className="hidden sm:block w-24 h-36 object-cover rounded-lg border border-white/20 shadow-xl" />
            )}
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow">{ev.title}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-300 font-semibold">
                {ev.rating && (
                  <span className="flex items-center gap-1 text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-current" /> {ev.rating}
                  </span>
                )}
                <span>{ev.league}</span>
                {ev.status && <span className="text-gray-400">• {ev.status}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPlay(ev, resume?.season || 1, resume?.episode || 1)}
              className="min-h-[44px] px-6 py-2.5 rounded-lg bg-white hover:bg-white/90 text-black font-extrabold text-sm flex items-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-current" /> {resumeLabel}
            </button>
            {resume && (
              <button
                onClick={() => onPlay(ev, 1, 1, { fromStart: true })}
                className="min-h-[44px] px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition"
              >
                Start Over
              </button>
            )}
            <button
              onClick={(e) => onTogglePin(ev, e)}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center gap-2 transition"
            >
              {isPinned ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />} My List
            </button>
          </div>

          {needsThirdParty && !allowThirdParty && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                This title only plays from third-party embed sites (unlicensed, may show pop-ups). Turn on
                <strong> 3rd-party</strong> in the top bar to watch it.
              </span>
            </div>
          )}

          {ev.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ev.genres.map((g) => (
                <span key={g} className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-gray-200">
                  {g}
                </span>
              ))}
            </div>
          )}

          {ev.description && <p className="text-sm text-gray-300 leading-relaxed">{ev.description}</p>}

          {series && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white">Episodes</h3>
              <EpisodeGrid
                ev={ev}
                activeSeason={resume?.season || 1}
                activeEpisode={resume?.episode || 0}
                onPick={(s, e) => onPlay(ev, s, e)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
