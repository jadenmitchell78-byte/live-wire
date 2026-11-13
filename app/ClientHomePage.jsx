'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Radio,
  Tv,
  Film,
  Clapperboard,
  Trophy,
  Home,
  Search,
  RefreshCw,
  Shield,
  Maximize2,
  Grid,
  Volume2,
  VolumeX,
  PlusCircle,
  Star,
  AlertTriangle,
  PictureInPicture2,
  CheckCircle2,
  Palette,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Clock,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'Home', label: 'Home', icon: Home },
  { id: 'LIVE NOW', label: 'Live Now', icon: Radio },
  { id: 'Sports', label: 'Live Sports', icon: Trophy },
  { id: 'Channels', label: 'Live TV', icon: Tv },
  { id: 'Movies', label: 'Movies', icon: Film },
  { id: 'Shows', label: 'TV Shows', icon: Clapperboard },
  { id: 'Pinned', label: 'Favorites', icon: Star },
];

const THEMES = {
  estuary: {
    label: 'Estuary Blue',
    bg: 'bg-[#080d14]',
    sidebar: 'bg-[#0b131e]/95',
    card: 'bg-[#101a28]',
    accent: 'bg-sky-500 hover:bg-sky-400 border-sky-400',
    activeNav: 'bg-sky-500/20 text-sky-300 border-l-4 border-sky-400',
    glow: 'hover:border-sky-400/70 hover:shadow-[0_12px_36px_rgba(56,189,248,0.22)]',
    ring: 'border-sky-400 ring-2 ring-sky-400/40',
  },
  amg: {
    label: 'AMG Crimson',
    bg: 'bg-[#09080d]',
    sidebar: 'bg-[#100b14]/95',
    card: 'bg-[#16101c]',
    accent: 'bg-rose-600 hover:bg-rose-500 border-rose-500',
    activeNav: 'bg-rose-500/20 text-rose-300 border-l-4 border-rose-500',
    glow: 'hover:border-rose-500/70 hover:shadow-[0_12px_36px_rgba(244,63,94,0.24)]',
    ring: 'border-rose-500 ring-2 ring-rose-500/40',
  },
  pitch: {
    label: 'Emerald Pitch',
    bg: 'bg-[#060d0b]',
    sidebar: 'bg-[#091511]/95',
    card: 'bg-[#0e1f19]',
    accent: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500',
    activeNav: 'bg-emerald-500/20 text-emerald-300 border-l-4 border-emerald-400',
    glow: 'hover:border-emerald-400/70 hover:shadow-[0_12px_36px_rgba(52,211,153,0.22)]',
    ring: 'border-emerald-400 ring-2 ring-emerald-400/40',
  },
};

function StreamPlayer({ stream, title, subtitle, useProxy, isMuted, onToggleMute }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [resolution, setResolution] = useState('AUTO HD');
  const [retrySeed, setRetrySeed] = useState(0);

  const isDirectMp4 = Boolean(stream?.url && /\.mp4(?:$|\?)/i.test(stream.url));

  const finalUrl = useMemo(() => {
    if (!stream?.url) return '';
    if (useProxy && stream.type === 'hls') {
      return `/api/proxy?url=${encodeURIComponent(stream.url)}`;
    }
    return stream.url;
  }, [stream, useProxy]);

  useEffect(() => {
    if (!stream || stream.type === 'embed') {
      setStatus('playing');
      return;
    }

    const video = videoRef.current;
    if (!video || !finalUrl) return;

    setStatus('loading');

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isDirectMp4) {
      video.src = finalUrl;
      const onLoaded = () => {
        setResolution('MP4 HD');
        setStatus('playing');
        video.play().catch(() => {});
      };
      const onErr = () => setStatus('error');
      video.addEventListener('loadedmetadata', onLoaded);
      video.addEventListener('error', onErr);
      return () => {
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onErr);
      };
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;

      hls.loadSource(finalUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        if (data.levels?.length > 0) {
          const highest = data.levels[data.levels.length - 1];
          if (highest?.height) setResolution(`${highest.height}p60`);
        }
        setStatus('playing');
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setStatus('error');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = finalUrl;
      video.addEventListener('loadedmetadata', () => {
        setStatus('playing');
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => setStatus('error'));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [finalUrl, stream, retrySeed, isDirectMp4]);

  const handlePiP = async () => {
    try {
      if (videoRef.current && document.pictureInPictureElement !== videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      } else if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    } catch {}
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/15 shadow-2xl group">
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-white truncate max-w-[200px] sm:max-w-xs">
            {title}
          </span>
          {subtitle && <span className="text-xs text-gray-400 hidden sm:inline">• {subtitle}</span>}
        </div>
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {resolution}
        </div>
      </div>

      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mb-2" />
          <span className="text-xs text-gray-300 font-medium tracking-wide">Buffering Kodi Stream...</span>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
          <p className="text-sm font-semibold text-white mb-1">Stream Connection Interrupted</p>
          <p className="text-xs text-gray-400 max-w-md mb-4">
            Switch servers below or toggle the CORS Proxy switch for external M3U8 feeds.
          </p>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Stream
          </button>
        </div>
      )}

      {stream?.type === 'embed' ? (
        <iframe
          key={stream.url}
          src={stream.url}
          className="w-full h-full border-0 bg-black"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          controls
          playsInline
          muted={isMuted}
        />
      )}

      {stream?.type !== 'embed' && (
        <div className="absolute bottom-14 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-black/80 hover:bg-sky-500 text-white border border-white/10 transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handlePiP}
            className="p-2 rounded-lg bg-black/80 hover:bg-sky-500 text-white border border-white/10 transition"
            title="Picture in Picture"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="p-2 rounded-lg bg-black/80 hover:bg-sky-500 text-white border border-white/10 transition"
            title="Reload Buffer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function KodiCard({ ev, isSelected, isPinned, onSelect, onTogglePin, onSelectSecondary, multiView, theme }) {
  return (
    <div
      onClick={() => onSelect(ev)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(ev);
        }
      }}
      className={`group relative cursor-pointer rounded-2xl overflow-hidden ${theme.card} border transition-all duration-300 ease-out transform hover:-translate-y-1.5 hover:scale-[1.03] focus:outline-none ${
        isSelected ? theme.ring : `border-white/10 ${theme.glow}`
      }`}
    >
      {ev.poster ? (
        <div className="relative h-36 w-full overflow-hidden bg-black/40">
          <img
            src={ev.poster}
            alt={ev.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-85 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/70 backdrop-blur text-gray-200 border border-white/10">
              {ev.league}
            </span>
            <button
              onClick={(e) => onTogglePin(ev.id, e)}
              className={`p-1.5 rounded-full bg-black/60 backdrop-blur hover:bg-black/80 transition ${
                isPinned ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'
              }`}
              title="Toggle Favorite"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
            <span className="text-sm font-bold text-white truncate">{ev.shortTitle || ev.title}</span>
            {ev.isLive && (
              <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-gray-300">
              {ev.league}
            </span>
            <div className="flex items-center gap-1.5">
              {ev.isLive ? (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  {ev.status}
                </span>
              ) : (
                <span className="text-[10px] font-medium text-gray-400">{ev.status}</span>
              )}
              <button
                onClick={(e) => onTogglePin(ev.id, e)}
                className={`p-1 rounded hover:bg-white/10 transition ${
                  isPinned ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <img src={ev.awayTeam?.logo} alt="" className="w-6 h-6 object-contain shrink-0" />
                <span className="text-xs font-bold text-white truncate">{ev.awayTeam?.name}</span>
              </div>
              <span className="text-sm font-black text-gray-200">{ev.awayTeam?.score}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <img src={ev.homeTeam?.logo} alt="" className="w-6 h-6 object-contain shrink-0" />
                <span className="text-xs font-bold text-white truncate">{ev.homeTeam?.name}</span>
              </div>
              <span className="text-sm font-black text-gray-200">{ev.homeTeam?.score}</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-2.5 border-t border-white/5 bg-black/20 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white flex items-center gap-1.5 transition">
          <Play className="w-3 h-3 fill-current" />
          {isSelected ? 'Playing Now' : 'Play Stream'}
        </span>
        {multiView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectSecondary(ev);
            }}
            className="px-2 py-1 rounded bg-white/10 hover:bg-sky-500 text-[10px] font-bold text-white transition"
          >
            Screen #2
          </button>
        )}
      </div>
    </div>
  );
}

function KodiShelf({ title, icon: Icon, items, selectedId, pinnedIds, onSelect, onTogglePin, onSelectSecondary, multiView, theme }) {
  const railRef = useRef(null);
  if (!items || items.length === 0) return null;

  const scrollBy = (offset) => {
    railRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
          <Icon className="w-4 h-4 text-sky-400" />
          {title}
          <span className="text-xs font-normal text-gray-500">({items.length})</span>
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollBy(-340)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 transition"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollBy(340)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 transition"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="flex gap-4 overflow-x-auto pb-3 scroll-smooth snap-x"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((ev) => (
          <div key={ev.id} className="w-[260px] sm:w-[280px] shrink-0 snap-start">
            <KodiCard
              ev={ev}
              isSelected={selectedId === ev.id}
              isPinned={pinnedIds.includes(ev.id)}
              onSelect={onSelect}
              onTogglePin={onTogglePin}
              onSelectSecondary={onSelectSecondary}
              multiView={multiView}
              theme={theme}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ClientHomePage({ initialCatalog }) {
  const initialEvents = initialCatalog?.events || [];
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [activeNav, setActiveNav] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(initialEvents[0] || null);
  const [secondaryEvent, setSecondaryEvent] = useState(initialEvents[1] || initialEvents[0] || null);
  const [playerOpen, setPlayerOpen] = useState(Boolean(initialEvents[0]));
  const [serverIdx, setServerIdx] = useState(0);
  const [useProxy, setUseProxy] = useState(true);
  const [multiView, setMultiView] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeKey, setThemeKey] = useState('estuary');
  const [clockText, setClockText] = useState('');
  const searchInputRef = useRef(null);

  const theme = THEMES[themeKey] || THEMES.estuary;

  useEffect(() => {
    try {
      const savedPins = localStorage.getItem('livewire_pins');
      if (savedPins) setPinnedIds(JSON.parse(savedPins));
      const savedTheme = localStorage.getItem('livewire_theme');
      if (savedTheme && THEMES[savedTheme]) setThemeKey(savedTheme);
    } catch {}

    const updateClock = () => {
      setClockText(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      );
    };
    updateClock();
    const t = setInterval(updateClock, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setShowCustomModal(false);
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const cycleTheme = () => {
    const keys = Object.keys(THEMES);
    const next = keys[(keys.indexOf(themeKey) + 1) % keys.length];
    setThemeKey(next);
    try {
      localStorage.setItem('livewire_theme', next);
    } catch {}
  };

  const togglePin = (id, e) => {
    e?.stopPropagation();
    const updated = pinnedIds.includes(id)
      ? pinnedIds.filter((item) => item !== id)
      : [...pinnedIds, id];
    setPinnedIds(updated);
    try {
      localStorage.setItem('livewire_pins', JSON.stringify(updated));
    } catch {}
  };

  const handleSelectEvent = (ev) => {
    setSelectedEvent(ev);
    setServerIdx(0);
    setPlayerOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      const list = data.events || [];
      if (list.length > 0) {
        setEvents(list);
        setSelectedEvent((prev) => prev || list[0]);
        setSecondaryEvent((prev) => prev || list[1] || list[0]);
      }
    } catch (e) {
      console.error('Failed to refresh catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchCatalog, 60000);
    return () => clearInterval(interval);
  }, []);

  const searchedEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (ev) =>
        ev.title?.toLowerCase().includes(q) ||
        ev.league?.toLowerCase().includes(q) ||
        ev.category?.toLowerCase().includes(q) ||
        ev.homeTeam?.name?.toLowerCase().includes(q) ||
        ev.awayTeam?.name?.toLowerCase().includes(q),
    );
  }, [events, searchQuery]);

  const sportsCategories = new Set(['NFL', 'NBA', 'College', 'Soccer', 'MMA', 'Sports']);

  const counts = useMemo(
    () => ({
      Home: searchedEvents.length,
      'LIVE NOW': searchedEvents.filter((e) => e.isLive).length,
      Sports: searchedEvents.filter((e) => sportsCategories.has(e.category)).length,
      Channels: searchedEvents.filter((e) => e.category === 'Channels').length,
      Movies: searchedEvents.filter((e) => e.category === 'Movies').length,
      Shows: searchedEvents.filter((e) => e.category === 'Shows').length,
      Pinned: searchedEvents.filter((e) => pinnedIds.includes(e.id)).length,
    }),
    [searchedEvents, pinnedIds],
  );

  const visibleGridEvents = useMemo(() => {
    if (activeNav === 'LIVE NOW') return searchedEvents.filter((e) => e.isLive);
    if (activeNav === 'Sports') return searchedEvents.filter((e) => sportsCategories.has(e.category));
    if (activeNav === 'Pinned') return searchedEvents.filter((e) => pinnedIds.includes(e.id));
    if (activeNav === 'Home') return searchedEvents;
    return searchedEvents.filter((e) => e.category === activeNav);
  }, [searchedEvents, activeNav, pinnedIds]);

  const handleLoadCustomStream = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const trimmed = customUrl.trim();
    const isEmbed = !trimmed.includes('.m3u8') && !trimmed.includes('.mp4');
    const customEvent = {
      id: `custom-${Date.now()}`,
      title: 'Custom Live Feed',
      shortTitle: 'Custom Stream',
      category: 'Channels',
      league: isEmbed ? 'EMBED' : 'CUSTOM HLS',
      status: 'LIVE',
      isLive: true,
      homeTeam: { name: 'Custom', score: 'HD', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
      awayTeam: { name: 'Source', score: 'LIVE', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
      servers: [{ name: 'Custom Source', type: isEmbed ? 'embed' : 'hls', url: trimmed }],
    };
    setEvents((prev) => [customEvent, ...prev]);
    handleSelectEvent(customEvent);
    setCustomUrl('');
    setShowCustomModal(false);
  };

  const activeServer = selectedEvent?.servers?.[serverIdx] || selectedEvent?.servers?.[0];

  return (
    <div className={`min-h-screen flex overflow-x-hidden text-gray-100 ${theme.bg}`}>
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Kodi Estuary Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 ${theme.sidebar} backdrop-blur-xl border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/25">
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="font-black tracking-wider text-base text-white">LIVE WIRE</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-sky-400">
                  Kodi Media UI
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    active
                      ? theme.activeNav
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                    {counts[item.id] ?? 0}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={() => setShowCustomModal(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 transition"
          >
            <PlusCircle className="w-4 h-4 text-sky-400" />
            Add Custom Stream
          </button>
          <button
            onClick={cycleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 transition"
          >
            <span className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-sky-400" />
              {theme.label}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Kodi Content Canvas */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 px-4 lg:px-6 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sports, movies, shows, channels... (/)"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-400 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setUseProxy((p) => !p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                useProxy
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Proxy:</span> {useProxy ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setMultiView((m) => !m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                multiView
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Multi-View</span>
            </button>
            <button
              onClick={fetchCatalog}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition"
              title="Sync Catalog"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>
            {clockText && (
              <div className="hidden md:flex items-center gap-1.5 pl-2 text-xs font-mono text-gray-300">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                {clockText}
              </div>
            )}
          </div>
        </header>

        <main className={`${theaterMode ? 'max-w-full' : 'max-w-7xl'} w-full mx-auto px-4 lg:px-6 py-6 space-y-8`}>
          {/* Docked Kodi Player Section */}
          {playerOpen && selectedEvent && (
            <section className="space-y-3 animate-fadeIn">
              <div className={`grid gap-4 ${multiView ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
                <StreamPlayer
                  stream={activeServer}
                  title={selectedEvent.shortTitle || selectedEvent.title}
                  subtitle={activeServer?.name}
                  useProxy={useProxy}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted((m) => !m)}
                />
                {multiView && secondaryEvent && (
                  <StreamPlayer
                    stream={secondaryEvent.servers?.[0]}
                    title={secondaryEvent.shortTitle || secondaryEvent.title}
                    subtitle={secondaryEvent.servers?.[0]?.name}
                    useProxy={useProxy}
                    isMuted={true}
                    onToggleMute={() => {}}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedEvent.servers?.map((srv, idx) => (
                    <button
                      key={`${srv.name}-${idx}`}
                      onClick={() => setServerIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        serverIdx === idx
                          ? `${theme.accent} text-white shadow-lg`
                          : 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {srv.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTheaterMode((t) => !t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                      theaterMode
                        ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                        : 'bg-black/30 border-white/10 text-gray-300'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Theater
                  </button>
                  <button
                    onClick={() => setPlayerOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10 bg-black/30 text-gray-400 hover:text-white transition"
                  >
                    Hide Player
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Home Shelves OR Category Grid */}
          {activeNav === 'Home' && !searchQuery.trim() ? (
            <div className="space-y-8">
              <KodiShelf
                title="Live Now"
                icon={Radio}
                items={searchedEvents.filter((e) => e.isLive)}
                selectedId={selectedEvent?.id}
                pinnedIds={pinnedIds}
                onSelect={handleSelectEvent}
                onTogglePin={togglePin}
                onSelectSecondary={setSecondaryEvent}
                multiView={multiView}
                theme={theme}
              />
              <KodiShelf
                title="24/7 Live Channels"
                icon={Tv}
                items={searchedEvents.filter((e) => e.category === 'Channels')}
                selectedId={selectedEvent?.id}
                pinnedIds={pinnedIds}
                onSelect={handleSelectEvent}
                onTogglePin={togglePin}
                onSelectSecondary={setSecondaryEvent}
                multiView={multiView}
                theme={theme}
              />
              <KodiShelf
                title="Movies Catalog"
                icon={Film}
                items={searchedEvents.filter((e) => e.category === 'Movies')}
                selectedId={selectedEvent?.id}
                pinnedIds={pinnedIds}
                onSelect={handleSelectEvent}
                onTogglePin={togglePin}
                onSelectSecondary={setSecondaryEvent}
                multiView={multiView}
                theme={theme}
              />
              <KodiShelf
                title="TV Shows & News"
                icon={Clapperboard}
                items={searchedEvents.filter((e) => e.category === 'Shows')}
                selectedId={selectedEvent?.id}
                pinnedIds={pinnedIds}
                onSelect={handleSelectEvent}
                onTogglePin={togglePin}
                onSelectSecondary={setSecondaryEvent}
                multiView={multiView}
                theme={theme}
              />
              <KodiShelf
                title="Sports Scoreboard"
                icon={Trophy}
                items={searchedEvents.filter((e) => sportsCategories.has(e.category))}
                selectedId={selectedEvent?.id}
                pinnedIds={pinnedIds}
                onSelect={handleSelectEvent}
                onTogglePin={togglePin}
                onSelectSecondary={setSecondaryEvent}
                multiView={multiView}
                theme={theme}
              />
            </div>
          ) : (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-sky-400" />
                  {searchQuery.trim() ? `Search: "${searchQuery}"` : activeNav} ({visibleGridEvents.length})
                </h2>
                {!playerOpen && selectedEvent && (
                  <button
                    onClick={() => setPlayerOpen(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white border ${theme.accent} transition`}
                  >
                    Show Player
                  </button>
                )}
              </div>

              {visibleGridEvents.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-gray-400">
                  No matching streams found in this catalog.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visibleGridEvents.map((ev) => (
                    <KodiCard
                      key={ev.id}
                      ev={ev}
                      isSelected={selectedEvent?.id === ev.id}
                      isPinned={pinnedIds.includes(ev.id)}
                      onSelect={handleSelectEvent}
                      onTogglePin={togglePin}
                      onSelectSecondary={setSecondaryEvent}
                      multiView={multiView}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleLoadCustomStream}
            className="w-full max-w-md rounded-2xl bg-[#101a28] border border-white/15 p-5 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white">Add Custom Stream (M3U8 / MP4 / Embed)</h3>
            <input
              type="url"
              required
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/master.m3u8"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-sky-500 text-xs font-bold text-white">
                Load Stream
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
