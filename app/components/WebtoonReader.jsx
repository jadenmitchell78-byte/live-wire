'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  Lock,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  ZoomIn,
} from 'lucide-react';

export const WEBTOON_SERIES = [
  {
    id: 'wt-cyber-ronin',
    title: 'Cyber-Ronin: Zero Protocol',
    author: 'AMG Studio Originals',
    genre: 'Cyberpunk · Action',
    chapters: [
      {
        number: 1,
        title: 'Ep. 1 — The Neon Rain of Sector 9',
        free: true,
        panels: [
          {
            id: 'p1',
            caption: 'SECTOR 9 // 02:14 AM — THE SKYLINE BLEEDS CRIMSON.',
            dialogue: 'Kaelen: "They said the neural net couldn\'t be breached. They lied."',
            img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
          },
          {
            id: 'p2',
            caption: 'HIGH ABOVE THE MONORAIL TRACKS…',
            dialogue: 'Nyx (Comms): "Two Enforcer drones locking onto your thermal signature. Draw the plasma katana!"',
            img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
          },
          {
            id: 'p3',
            caption: 'BLADE CHARGE: 100% // DRACO RIG ENGAGED',
            dialogue: 'Kaelen: "One slash is all I need."',
            img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80',
          },
          {
            id: 'p4',
            caption: 'TO BE CONTINUED IN EPISODE 2…',
            dialogue: 'System Alert: [AMG VIP FAST PASS UNLOCKS NEXT 3 CHAPTERS]',
            img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80',
          },
        ],
      },
      {
        number: 2,
        title: 'Ep. 2 — Void Valkyrie Descending',
        free: true,
        panels: [
          {
            id: 'p2-1',
            caption: 'THE CITADEL UNDERGROUND // SUB-LEVEL 4',
            dialogue: 'Nyx: "You\'re late, Ronin. The syndicate already moved the core."',
            img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
          },
          {
            id: 'p2-2',
            caption: 'CHRONO-DRIVE ACTIVATED',
            dialogue: 'Kaelen: "Then we rewind the clock and take it back."',
            img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
          },
        ],
      },
      {
        number: 3,
        title: 'Ep. 3 — Mecha Titan Awakening (Fast Pass)',
        free: false,
        panels: [
          {
            id: 'p3-1',
            caption: 'AMG VIP FAST PASS EXCLUSIVE PREVIEW',
            dialogue: 'Vex: "Armor integrity at 100%. Target acquired."',
            img: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=900&q=80',
          },
        ],
      },
    ],
  },
];

const CONTRAST_MODES = {
  dark: { label: 'Obsidian (#090A0F)', bg: 'bg-[#090A0F]', text: 'text-gray-100', panelBorder: 'border-white/10' },
  sepia: { label: 'Warm Sepia', bg: 'bg-[#18130d]', text: 'text-amber-100', panelBorder: 'border-amber-500/20' },
  light: { label: 'Daylight Contrast', bg: 'bg-[#f4f4f6]', text: 'text-gray-900', panelBorder: 'border-black/15' },
};

function WebtoonPanel({ panel, index, contrast }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <article
      className={`relative w-full aspect-[3/4] overflow-hidden border-b ${contrast.panelBorder} bg-[#12131c] select-none`}
    >
      {/* Blurred LQIP Placeholder to guarantee zero Cumulative Layout Shift (CLS = 0) */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e2030] via-[#12131c] to-[#090A0F] animate-pulse flex items-center justify-center">
          <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
            Loading Panel #{index + 1} (WebP/AVIF)…
          </span>
        </div>
      )}
      <img
        src={panel.img}
        alt={panel.caption}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ${
          loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-105'
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/60 pointer-events-none" />

      {/* Top Narrative Caption Box */}
      <div className="absolute top-5 left-5 right-5">
        <span className="inline-block px-3 py-1.5 rounded bg-black/85 border border-white/15 text-[11px] sm:text-xs font-black tracking-widest uppercase text-amber-300 shadow-lg">
          {panel.caption}
        </span>
      </div>

      {/* Bottom Speech Bubble */}
      <div className="absolute bottom-6 left-5 right-5">
        <div className="max-w-lg rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 p-4 shadow-2xl">
          <p className="text-sm sm:text-base font-bold text-white leading-relaxed">{panel.dialogue}</p>
        </div>
      </div>
    </article>
  );
}

export default function WebtoonReader() {
  const [chapterIdx, setChapterIdx] = useState(0);
  const [hudVisible, setHudVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [zoomPct, setZoomPct] = useState(100);
  const [contrastKey, setContrastKey] = useState('dark');
  const [vipUnlocked, setVipUnlocked] = useState(false);
  const readerRef = useRef(null);

  const series = WEBTOON_SERIES[0];
  const chapter = series.chapters[chapterIdx] || series.chapters[0];
  const contrast = CONTRAST_MODES[contrastKey] || CONTRAST_MODES.dark;
  const isLocked = !chapter.free && !vipUnlocked;

  const selectChapter = useCallback((idx) => {
    setChapterIdx(idx);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Cycle zoom between 100%, 115%, 130%
  const cycleZoom = () => {
    setZoomPct((z) => (z === 100 ? 115 : z === 115 ? 130 : 100));
  };

  return (
    <section className={`min-h-screen ${contrast.bg} ${contrast.text} overflow-x-hidden transition-colors duration-300`}>
      {/* Sticky Tap-to-Toggle Reading HUD (44px min mobile tap targets) */}
      <div
        className={`sticky top-16 z-30 transition-all duration-300 ${
          hudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-3">
          <div className="rounded-2xl bg-[#0e1017]/95 backdrop-blur-xl border border-white/15 p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xl">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setDrawerOpen((d) => !d)}
                aria-label="Toggle chapter drawer"
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-black flex items-center gap-1.5 shrink-0"
              >
                <Layers className="w-4 h-4" /> Chapters
              </button>
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">{series.title}</p>
                <p className="text-[11px] text-gray-400 truncate">{chapter.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={cycleZoom}
                aria-label="Zoom webtoon panels"
                className="min-h-[44px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1"
              >
                <ZoomIn className="w-3.5 h-3.5" /> {zoomPct}%
              </button>
              {zoomPct !== 100 && (
                <button
                  onClick={() => setZoomPct(100)}
                  aria-label="Reset zoom"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
              <button
                onClick={() =>
                  setContrastKey((k) => (k === 'dark' ? 'sepia' : k === 'sepia' ? 'light' : 'dark'))
                }
                aria-label="Cycle ambient contrast mode"
                className="min-h-[44px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1"
              >
                {contrastKey === 'light' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{contrast.label}</span>
              </button>
            </div>
          </div>

          {/* Collapsible Chapter Drawer */}
          {drawerOpen && (
            <div className="mt-2 rounded-2xl bg-[#0e1017] border border-white/15 p-3 space-y-1.5 shadow-2xl">
              {series.chapters.map((ch, idx) => (
                <button
                  key={ch.number}
                  onClick={() => selectChapter(idx)}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition ${
                    chapterIdx === idx ? 'bg-[#E50914] text-white' : 'bg-white/5 hover:bg-white/10 text-gray-200'
                  }`}
                >
                  <span>{ch.title}</span>
                  {!ch.free && !vipUnlocked ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                      <Lock className="w-3 h-3" /> Fast Pass $0.99
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400">FREE</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Continuous Vertical Scroll Webtoon Strip (Zero Horizontal Overflow) */}
      <div
        ref={readerRef}
        onClick={() => setHudVisible((v) => !v)}
        className="max-w-2xl mx-auto my-4 px-0 sm:px-4 overflow-x-hidden cursor-pointer"
        style={{
          WebkitOverflowScrolling: 'touch',
          width: `${zoomPct}%`,
          maxWidth: zoomPct > 100 ? '92vw' : undefined,
        }}
      >
        {isLocked ? (
          <div className="rounded-2xl bg-gradient-to-b from-[#1a1408] to-[#0e1017] border border-amber-500/40 p-8 text-center space-y-4 my-8 mx-4">
            <Lock className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-xl font-black text-white">{chapter.title}</h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
              This unreleased chapter is locked behind <b>AMG VIP Fast Pass</b>. Unlock early access to the next 3 chapters plus ad-free 4-way Multi-View streams.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVipUnlocked(true);
              }}
              className="min-h-[44px] px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider shadow-lg"
            >
              Unlock Fast Pass Chapter (AMG VIP Preview)
            </button>
          </div>
        ) : (
          <div className="rounded-none sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {chapter.panels.map((panel, i) => (
              <WebtoonPanel key={panel.id} panel={panel} index={i} contrast={contrast} />
            ))}
          </div>
        )}

        {/* Bottom Chapter Prev/Next Bar (44px min mobile tap targets) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between gap-3 px-4 py-6"
        >
          <button
            onClick={() => selectChapter(Math.max(0, chapterIdx - 1))}
            disabled={chapterIdx <= 0}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold text-white flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Chapter
          </button>
          <span className="text-xs text-gray-400 font-semibold">
            Tap any panel to toggle HUD
          </span>
          <button
            onClick={() => selectChapter(Math.min(series.chapters.length - 1, chapterIdx + 1))}
            disabled={chapterIdx >= series.chapters.length - 1}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#f6121d] disabled:opacity-30 text-xs font-bold text-white flex items-center gap-1.5"
          >
            Next Chapter <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
