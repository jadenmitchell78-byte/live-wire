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
  Search,
  RefreshCw,
  Shield,
  Maximize2,
  Grid,
  Volume2,
  VolumeX,
  Plus,
  Check,
  AlertTriangle,
  PictureInPicture2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
} from 'lucide-react';

const NAV_TABS = [
  { id: 'Home', label: 'Home' },
  { id: 'LIVE NOW', label: 'Live Now' },
  { id: 'Sports', label: 'Sports' },
  { id: 'Channels', label: 'Live TV' },
  { id: 'Movies', label: 'Movies' },
  { id: 'Shows', label: 'TV Shows' },
  { id: 'Pinned', label: 'My List' },
];

const HERO_FALLBACK_BG =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1800&q=80';

function StreamPlayer({ stream, title, subtitle, useProxy, isMuted, onToggleMute }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [resolution, setResolution] = useState('AUTO HD');
  const [retrySeed, setRetrySeed] = useState(0);
  const [autoProxied, setAutoProxied] = useState(false);

  const isDirectMp4 = Boolean(stream?.url && /\.mp4(?:$|\?)/i.test(stream.url));
  const effectiveProxy = (useProxy || autoProxied) && !isDirectMp4;

  const finalUrl = useMemo(() => {
    if (!stream?.url) return '';
    if (effectiveProxy && stream.type === 'hls') {
      return `/api/proxy?url=${encodeURIComponent(stream.url)}`;
    }
    return stream.url;
  }, [stream, effectiveProxy]);

  useEffect(() => {
    setAutoProxied(false);
  }, [stream?.url]);

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
              if (!effectiveProxy) {
                // Auto-fallback to /api/proxy if direct browser HLS hits CORS
                setAutoProxied(true);
              } else {
                setStatus('error');
                hls.destroy();
              }
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
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.85)] group">
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10">
          <span className="h-2 w-2 rounded-full bg-[#E50914] animate-pulse" />
          <span className="text-xs font-bold tracking-wide uppercase text-white truncate max-w-[200px] sm:max-w-xs">
            {title}
          </span>
          {subtitle && <span className="text-xs text-gray-400 hidden sm:inline">• {subtitle}</span>}
        </div>
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[11px] font-mono text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {resolution}
        </div>
      </div>

      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85">
          <RefreshCw className="w-9 h-9 text-[#E50914] animate-spin mb-2" />
          <span className="text-xs text-gray-300 font-medium tracking-wider uppercase">Loading Stream...</span>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
          <p className="text-sm font-bold text-white mb-1">Stream Interrupted</p>
          <p className="text-xs text-gray-400 max-w-md mb-4">
            Try switching servers below or toggle Proxy ON/OFF for external M3U8 feeds.
          </p>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="px-4 py-2 bg-[#E50914] hover:bg-[#f6121d] text-white text-xs font-bold rounded-md flex items-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Stream
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
            className="p-2 rounded-md bg-black/80 hover:bg-[#E50914] text-white border border-white/15 transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handlePiP}
            className="p-2 rounded-md bg-black/80 hover:bg-[#E50914] text-white border border-white/15 transition"
            title="Picture in Picture"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="p-2 rounded-md bg-black/80 hover:bg-[#E50914] text-white border border-white/15 transition"
            title="Reload Stream"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function NetflixCard({ ev, isSelected, isPinned, onSelect, onTogglePin, onSelectSecondary, multiView, index = 0 }) {
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
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
      className={`group relative cursor-pointer rounded-lg overflow-hidden bg-[#181818] border transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1 hover:z-20 hover:shadow-[0_16px_40px_rgba(0,0,0,0.9)] focus:outline-none ${
        isSelected
          ? 'border-[#E50914] ring-2 ring-[#E50914]/50'
          : 'border-white/10 hover:border-white/40'
      }`}
    >
      {ev.poster ? (
        <div className="relative h-40 w-full overflow-hidden bg-[#111]">
          <img
            src={ev.poster}
            alt={ev.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = HERO_FALLBACK_BG;
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-black/30 to-transparent" />
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-black/75 text-gray-200">
              {ev.league}
            </span>
            {ev.isLive && (
              <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-[#E50914] text-white shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE
              </span>
            )}
          </div>
          <div className="absolute bottom-2 left-3 right-3">
            <p className="text-sm font-bold text-white truncate drop-shadow">{ev.shortTitle || ev.title}</p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 h-40 flex flex-col justify-between bg-gradient-to-br from-[#202020] to-[#141414]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-gray-200">
              {ev.league}
            </span>
            {ev.isLive ? (
              <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-[#E50914] text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                {ev.status}
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-gray-400">{ev.status}</span>
            )}
          </div>

          <div className="space-y-2 my-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <img src={ev.awayTeam?.logo} alt="" className="w-6 h-6 object-contain shrink-0" />
                <span className="text-xs font-bold text-white truncate">{ev.awayTeam?.name}</span>
              </div>
              <span className="text-sm font-black text-white">{ev.awayTeam?.score}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <img src={ev.homeTeam?.logo} alt="" className="w-6 h-6 object-contain shrink-0" />
                <span className="text-xs font-bold text-white truncate">{ev.homeTeam?.name}</span>
              </div>
              <span className="text-sm font-black text-white">{ev.homeTeam?.score}</span>
            </div>
          </div>
        </div>
      )}

      {/* Netflix Quick Action Footer */}
      <div className="px-3.5 py-2.5 bg-[#181818] border-t border-white/5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#E50914] transition">
          <span className="w-6 h-6 rounded-full bg-white text-black group-hover:bg-[#E50914] group-hover:text-white flex items-center justify-center transition">
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </span>
          {isSelected ? 'Playing' : 'Play'}
        </span>

        <div className="flex items-center gap-1.5">
          {multiView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectSecondary(ev);
              }}
              className="px-2 py-1 rounded bg-white/10 hover:bg-[#E50914] text-[10px] font-bold text-white transition"
            >
              #2
            </button>
          )}
          <button
            onClick={(e) => onTogglePin(ev.id, e)}
            className={`w-7 h-7 rounded-full border flex items-center justify-center transition ${
              isPinned
                ? 'border-white bg-white text-black'
                : 'border-white/30 text-gray-300 hover:border-white hover:text-white'
            }`}
            title={isPinned ? 'Remove from My List' : 'Add to My List'}
          >
            {isPinned ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function NetflixRow({ title, icon: Icon, items, selectedId, pinnedIds, onSelect, onTogglePin, onSelectSecondary, multiView }) {
  const railRef = useRef(null);
  if (!items || items.length === 0) return null;

  const scrollBy = (offset) => {
    railRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="relative group/row space-y-2.5">
      <div className="flex items-center justify-between px-4 sm:px-8">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
          <Icon className="w-4 h-4 text-[#E50914]" />
          {title}
          <span className="text-xs font-medium text-gray-500">({items.length})</span>
        </h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy(-520)}
          className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-30 w-10 h-28 rounded-lg bg-black/75 hover:bg-black/95 text-white items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 border border-white/10"
          aria-label="Scroll left"
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
              <NetflixCard
                ev={ev}
                index={idx}
                isSelected={selectedId === ev.id}
                isPinned={pinnedIds.includes(ev.id)}
                onSelect={onSelect}
                onTogglePin={onTogglePin}
                onSelectSecondary={onSelectSecondary}
                multiView={multiView}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scrollBy(520)}
          className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-30 w-10 h-28 rounded-lg bg-black/75 hover:bg-black/95 text-white items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 border border-white/10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}

export default function ClientHomePage({ initialCatalog }) {
  const initialEvents = initialCatalog?.events || [];
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [activeTab, setActiveTab] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(initialEvents[0] || null);
  const [secondaryEvent, setSecondaryEvent] = useState(initialEvents[1] || initialEvents[0] || null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [serverIdx, setServerIdx] = useState(0);
  const [useProxy, setUseProxy] = useState(false);
  const [multiView, setMultiView] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [rotationTick, setRotationTick] = useState(0);
  const [remoteResults, setRemoteResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const searchInputRef = useRef(null);

  useEffect(() => {
    try {
      const savedPins = localStorage.getItem('livewire_pins');
      if (savedPins) setPinnedIds(JSON.parse(savedPins));
    } catch {}

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        setShowCustomModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
    setActiveSeason(1);
    setActiveEpisode(1);
    setPlayerOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setRemoteResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (!cancelled) {
          setRemoteResults(Array.isArray(data.results) ? data.results : []);
        }
      } catch {
        if (!cancelled) setRemoteResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const fetchCatalog = async (rotateNext = false) => {
    setLoading(true);
    try {
      const nextSeed = rotateNext ? rotationTick + 1 : rotationTick;
      if (rotateNext) setRotationTick(nextSeed);
      const url = rotateNext ? `/api/catalog?rotate=${nextSeed}` : '/api/catalog';
      const res = await fetch(url);
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
    if (initialEvents.length <= 20) {
      fetchCatalog(false);
    }
    const interval = setInterval(fetchCatalog, 60000);
    return () => clearInterval(interval);
  }, []);

  const searchedEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return events;
    const localMatches = events.filter(
      (ev) =>
        ev.title?.toLowerCase().includes(q) ||
        ev.league?.toLowerCase().includes(q) ||
        ev.category?.toLowerCase().includes(q) ||
        ev.homeTeam?.name?.toLowerCase().includes(q) ||
        ev.awayTeam?.name?.toLowerCase().includes(q),
    );
    const seen = new Set(localMatches.map((e) => e.id));
    const merged = [...localMatches];
    for (const item of remoteResults) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
    return merged;
  }, [events, remoteResults, searchQuery]);

  const sportsCategories = new Set(['NFL', 'NBA', 'NHL', 'MLB', 'College', 'Soccer', 'MMA', 'Sports']);

  const visibleGridEvents = useMemo(() => {
    if (searchQuery.trim().length >= 2) return searchedEvents;
    if (activeTab === 'LIVE NOW') return searchedEvents.filter((e) => e.isLive);
    if (activeTab === 'Sports') return searchedEvents.filter((e) => sportsCategories.has(e.category));
    if (activeTab === 'Pinned') return searchedEvents.filter((e) => pinnedIds.includes(e.id));
    if (activeTab === 'Home') return searchedEvents;
    return searchedEvents.filter((e) => e.category === activeTab);
  }, [searchedEvents, activeTab, pinnedIds, searchQuery]);

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

  const heroEvent = selectedEvent || events[0];

  const resolvedServers = useMemo(() => {
    if (!selectedEvent) return [];
    if (selectedEvent.mediaType === 'anime' && (selectedEvent.aniId || selectedEvent.malId)) {
      const list = [];
      if (selectedEvent.aniId) {
        list.push(
          {
            name: `AutoEmbed (Ep ${activeEpisode})`,
            type: 'embed',
            url: `https://player.autoembed.cc/embed/anime/${selectedEvent.aniId}/${activeEpisode}`,
          },
          {
            name: `VidSrc.cc Sub (Ep ${activeEpisode})`,
            type: 'embed',
            url: `https://vidsrc.cc/v2/embed/anime/ani-${selectedEvent.aniId}/${activeEpisode}/sub`,
          },
          {
            name: `VidSrc.cc Dub (Ep ${activeEpisode})`,
            type: 'embed',
            url: `https://vidsrc.cc/v2/embed/anime/ani-${selectedEvent.aniId}/${activeEpisode}/dub`,
          },
          {
            name: `VidSrc.icu (Ep ${activeEpisode})`,
            type: 'embed',
            url: `https://vidsrc.icu/embed/anime/${selectedEvent.aniId}/${activeEpisode}/0`,
          },
        );
      }
      if (selectedEvent.malId) {
        list.push({
          name: `VidSrc MAL (Ep ${activeEpisode})`,
          type: 'embed',
          url: `https://vidsrc.cc/v2/embed/anime/mal-${selectedEvent.malId}/${activeEpisode}/sub`,
        });
      }
      return list;
    }
    if (selectedEvent.mediaType === 'tv' && selectedEvent.imdbId) {
      return [
        {
          name: `AutoEmbed (S${activeSeason} E${activeEpisode})`,
          type: 'embed',
          url: `https://player.autoembed.cc/embed/tv/${selectedEvent.imdbId}/${activeSeason}/${activeEpisode}`,
        },
        {
          name: `VidSrc.cc (S${activeSeason} E${activeEpisode})`,
          type: 'embed',
          url: `https://vidsrc.cc/v2/embed/tv/${selectedEvent.imdbId}/${activeSeason}/${activeEpisode}`,
        },
        {
          name: `VidSrc.xyz (S${activeSeason} E${activeEpisode})`,
          type: 'embed',
          url: `https://vidsrc.xyz/embed/tv/${selectedEvent.imdbId}/${activeSeason}-${activeEpisode}`,
        },
        {
          name: `2Embed (S${activeSeason} E${activeEpisode})`,
          type: 'embed',
          url: `https://www.2embed.cc/embedtv/${selectedEvent.imdbId}&s=${activeSeason}&e=${activeEpisode}`,
        },
      ];
    }
    return selectedEvent.servers || [];
  }, [selectedEvent, activeSeason, activeEpisode]);

  const activeServer = resolvedServers[serverIdx] || resolvedServers[0];

  const menuItems = useMemo(
    () => [
      { id: 'Home', label: 'All Catalogs', icon: Grid, count: events.length },
      { id: 'LIVE NOW', label: 'Live Now', icon: Flame, count: events.filter((e) => e.isLive).length },
      { id: 'Channels', label: '24/7 Live TV', icon: Tv, count: events.filter((e) => e.category === 'Channels').length },
      { id: 'Shows', label: 'Shows & Anime', icon: Clapperboard, count: events.filter((e) => e.category === 'Shows').length },
      { id: 'Movies', label: 'Movies', icon: Film, count: events.filter((e) => e.category === 'Movies').length },
      { id: 'Sports', label: 'All Sports', icon: Trophy, count: events.filter((e) => sportsCategories.has(e.category)).length },
      { id: 'NFL', label: 'NFL', icon: Radio, count: events.filter((e) => e.category === 'NFL').length },
      { id: 'NBA', label: 'NBA', icon: Radio, count: events.filter((e) => e.category === 'NBA').length },
      { id: 'NHL', label: 'NHL', icon: Radio, count: events.filter((e) => e.category === 'NHL').length },
      { id: 'MLB', label: 'MLB', icon: Radio, count: events.filter((e) => e.category === 'MLB').length },
      { id: 'College', label: 'College', icon: Radio, count: events.filter((e) => e.category === 'College').length },
      { id: 'Soccer', label: 'Soccer', icon: Radio, count: events.filter((e) => e.category === 'Soccer').length },
      { id: 'MMA', label: 'UFC / MMA', icon: Radio, count: events.filter((e) => e.category === 'MMA').length },
      { id: 'Pinned', label: 'My List', icon: Check, count: events.filter((e) => pinnedIds.includes(e.id)).length },
    ],
    [events, pinnedIds],
  );

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white overflow-x-hidden pb-24 lg:pb-14">
      {/* Top Cinema Control Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
          scrolled || playerOpen
            ? 'bg-[#0c0c0e]/95 backdrop-blur-xl border-b border-white/10'
            : 'bg-gradient-to-b from-black/95 via-black/60 to-transparent'
        }`}
      >
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setActiveTab('Home');
              setSearchQuery('');
            }}
            aria-label="Live Wire Home"
            className="text-xl sm:text-2xl font-black tracking-tighter text-[#E50914] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] rounded px-1"
          >
            LIVE WIRE
          </button>

          <div className="flex-1 max-w-md mx-2">
            <div className="flex items-center bg-white/10 hover:bg-white/15 focus-within:bg-black/80 focus-within:border-[#E50914] border border-white/15 rounded-full px-3.5 h-10 transition">
              <Search className="w-4 h-4 text-gray-300 mr-2 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search anime, TV shows, movies, and sports"
                placeholder="Search anime, shows, teams... (/)"
                className="bg-transparent text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="text-gray-400 hover:text-white ml-1 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseProxy((p) => !p)}
              aria-label="Toggle HLS Proxy"
              className={`h-10 px-3 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
                useProxy
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-white/10 border-white/15 text-gray-300 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Proxy</span> {useProxy ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setMultiView((m) => !m)}
              aria-label="Toggle Multi-View"
              className={`hidden sm:flex h-10 px-3 rounded-lg text-xs font-bold border items-center gap-1.5 transition ${
                multiView
                  ? 'bg-[#E50914] border-[#E50914] text-white'
                  : 'bg-white/10 border-white/15 text-gray-300 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Multi</span>
            </button>

            <button
              onClick={() => setShowCustomModal(true)}
              aria-label="Add Custom Stream"
              className="h-10 px-3 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Add</span>
            </button>

            <button
              onClick={() => fetchCatalog(true)}
              aria-label="Rotate Catalog"
              className="h-10 px-3 rounded-lg bg-white/10 hover:bg-[#E50914] text-white text-xs font-bold flex items-center gap-1.5 transition"
              title="Rotate New Movies & Shows"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Rotate</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Left Sidebar Rail */}
      <aside
        aria-label="Browse Categories"
        className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-60 z-30 bg-[#0c0c0e]/95 backdrop-blur-xl border-r border-white/10 px-3 py-4 overflow-y-auto"
      >
        <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Browse Menu
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id && !searchQuery.trim();
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSearchQuery('');
                }}
                className={`w-full min-h-[40px] flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  active
                    ? 'bg-[#E50914] text-white font-bold shadow-lg shadow-[#E50914]/25'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    active ? 'bg-black/30 text-white' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="lg:pl-60">

      {/* Active Player Theater OR Netflix Hero Billboard */}
      {playerOpen && selectedEvent ? (
        <section className={`pt-24 sm:pt-20 px-4 sm:px-8 mx-auto ${theaterMode ? 'max-w-full' : 'max-w-7xl'} space-y-3`}>
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

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#181818] border border-white/10 p-3">
            <div className="flex flex-wrap items-center gap-2">
              {resolvedServers.map((srv, idx) => (
                <button
                  key={`${srv.name}-${idx}`}
                  onClick={() => setServerIdx(idx)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                    serverIdx === idx
                      ? 'bg-[#E50914] text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {srv.name}
                </button>
              ))}

              {(selectedEvent.mediaType === 'anime' || selectedEvent.mediaType === 'tv') && (
                <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-white/15">
                  {selectedEvent.mediaType === 'tv' && (
                    <label className="flex items-center gap-1 text-[11px] text-gray-300 font-semibold">
                      S
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={activeSeason}
                        onChange={(e) => setActiveSeason(Math.max(1, Number(e.target.value) || 1))}
                        className="w-11 bg-black/60 border border-white/20 rounded px-1.5 py-1 text-xs text-white text-center"
                      />
                    </label>
                  )}
                  <label className="flex items-center gap-1 text-[11px] text-gray-300 font-semibold">
                    Ep
                    <input
                      type="number"
                      min={1}
                      max={selectedEvent.totalEpisodes || 200}
                      value={activeEpisode}
                      onChange={(e) => setActiveEpisode(Math.max(1, Number(e.target.value) || 1))}
                      className="w-12 bg-black/60 border border-white/20 rounded px-1.5 py-1 text-xs text-white text-center"
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeServer?.url && (
                <a
                  href={activeServer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded text-xs font-bold bg-white/10 hover:bg-[#E50914] text-white transition"
                >
                  Open Source ↗
                </a>
              )}
              <button
                onClick={() => setTheaterMode((t) => !t)}
                className="px-3 py-1.5 rounded text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Theater
              </button>
              <button
                onClick={() => setPlayerOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-bold bg-white/10 hover:bg-white/20 text-gray-200 flex items-center gap-1 transition"
              >
                <X className="w-3.5 h-3.5" /> Close Player
              </button>
            </div>
          </div>
        </section>
      ) : (
        heroEvent && (
          <section className="relative h-[58vh] min-h-[420px] max-h-[600px] w-full flex items-end overflow-hidden">
            <img
              src={heroEvent.bannerImage || heroEvent.poster || HERO_FALLBACK_BG}
              alt={heroEvent.title}
              className="absolute inset-0 w-full h-full object-cover scale-105 opacity-60 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e] via-[#0c0c0e]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-black/60" />

            <div className="relative z-10 max-w-3xl px-4 sm:px-8 pb-12 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#E50914] text-[11px] font-black tracking-wider uppercase text-white">
                  {heroEvent.isLive ? 'LIVE NOW' : 'FEATURED'}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
                  {heroEvent.league} • {events.length} Streams Ready
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                {heroEvent.title}
              </h1>

              <p className="text-sm text-gray-300 max-w-xl">
                {heroEvent.status} — Watch multi-source live sports, 24/7 channels, movies, and anime/TV series.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => handleSelectEvent(heroEvent)}
                  className="min-h-[44px] px-6 py-2.5 rounded-lg bg-white hover:bg-white/90 text-black font-extrabold text-sm flex items-center gap-2 transition transform hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play Now
                </button>
                <button
                  onClick={() => togglePin(heroEvent.id)}
                  className="min-h-[44px] px-5 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur text-white font-bold text-sm flex items-center gap-2 transition"
                >
                  {pinnedIds.includes(heroEvent.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  My List
                </button>
              </div>
            </div>
          </section>
        )
      )}

      {/* Catalog Rows OR Filtered Grid */}
      <div className={playerOpen ? 'mt-8 space-y-8' : '-mt-6 relative z-20 space-y-8'}>
        {/* Mobile & Tablet Category Strip (Desktop uses Left Sidebar Rail) */}
        <section className="lg:hidden px-4 sm:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {menuItems.map((item) => {
              const active = activeTab === item.id && !searchQuery.trim();
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchQuery('');
                  }}
                  className={`min-h-[40px] shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold transition ${
                    active
                      ? 'bg-[#E50914] border-[#E50914] text-white'
                      : 'bg-[#18181b] border-white/10 text-gray-300 hover:border-white/30'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] font-mono opacity-75">{item.count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {activeTab === 'Home' && !searchQuery.trim() ? (
          <>
            <NetflixRow
              title="Trending Live Now"
              icon={Flame}
              items={searchedEvents.filter((e) => e.isLive)}
              selectedId={selectedEvent?.id}
              pinnedIds={pinnedIds}
              onSelect={handleSelectEvent}
              onTogglePin={togglePin}
              onSelectSecondary={setSecondaryEvent}
              multiView={multiView}
            />
            <NetflixRow
              title="24/7 Live Channels"
              icon={Tv}
              items={searchedEvents.filter((e) => e.category === 'Channels')}
              selectedId={selectedEvent?.id}
              pinnedIds={pinnedIds}
              onSelect={handleSelectEvent}
              onTogglePin={togglePin}
              onSelectSecondary={setSecondaryEvent}
              multiView={multiView}
            />
            <NetflixRow
              title="Popular Movies"
              icon={Film}
              items={searchedEvents.filter((e) => e.category === 'Movies')}
              selectedId={selectedEvent?.id}
              pinnedIds={pinnedIds}
              onSelect={handleSelectEvent}
              onTogglePin={togglePin}
              onSelectSecondary={setSecondaryEvent}
              multiView={multiView}
            />
            <NetflixRow
              title="TV Shows & Live News"
              icon={Clapperboard}
              items={searchedEvents.filter((e) => e.category === 'Shows')}
              selectedId={selectedEvent?.id}
              pinnedIds={pinnedIds}
              onSelect={handleSelectEvent}
              onTogglePin={togglePin}
              onSelectSecondary={setSecondaryEvent}
              multiView={multiView}
            />
            <NetflixRow
              title="All Sports & Matchups"
              icon={Trophy}
              items={searchedEvents.filter((e) => sportsCategories.has(e.category))}
              selectedId={selectedEvent?.id}
              pinnedIds={pinnedIds}
              onSelect={handleSelectEvent}
              onTogglePin={togglePin}
              onSelectSecondary={setSecondaryEvent}
              multiView={multiView}
            />
          </>
        ) : (
          <section className="px-4 sm:px-8 pt-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#E50914]" />
              {searchQuery.trim() ? `Results for "${searchQuery}"` : activeTab} ({visibleGridEvents.length})
              {searching && (
                <span className="text-xs font-medium text-gray-400 animate-pulse ml-2">
                  Searching TV, Anime & Archive...
                </span>
              )}
            </h2>

            {visibleGridEvents.length === 0 ? (
              <div className="rounded-xl bg-[#181818] border border-white/10 p-10 text-center text-sm text-gray-400">
                {searching ? 'Searching across Anime, TV Shows & Archive...' : 'No streams matched your filter.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {visibleGridEvents.map((ev, idx) => (
                  <NetflixCard
                    key={ev.id}
                    ev={ev}
                    index={idx}
                    isSelected={selectedEvent?.id === ev.id}
                    isPinned={pinnedIds.includes(ev.id)}
                    onSelect={handleSelectEvent}
                    onTogglePin={togglePin}
                    onSelectSecondary={setSecondaryEvent}
                    multiView={multiView}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1 flex items-center justify-around"
      >
        {[
          { id: 'Home', label: 'Home', icon: Grid },
          { id: 'LIVE NOW', label: 'Live', icon: Flame },
          { id: 'Shows', label: 'Shows', icon: Clapperboard },
          { id: 'Movies', label: 'Movies', icon: Film },
          { id: 'Pinned', label: 'My List', icon: Check },
        ].map((nav) => {
          const Icon = nav.icon;
          const active = activeTab === nav.id && !searchQuery.trim();
          return (
            <button
              key={nav.id}
              onClick={() => {
                setActiveTab(nav.id);
                setSearchQuery('');
              }}
              className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-[11px] font-semibold transition ${
                active ? 'text-[#E50914]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{nav.label}</span>
            </button>
          );
        })}
      </nav>

      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleLoadCustomStream}
            className="w-full max-w-md rounded-xl bg-[#181818] border border-white/15 p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Add Custom Stream (M3U8 / MP4 / Embed)</h3>
            <input
              type="url"
              required
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/master.m3u8"
              className="w-full bg-black/60 border border-white/20 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E50914]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3.5 py-2 rounded-md bg-white/10 text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-md bg-[#E50914] text-xs font-bold text-white">
                Play Stream
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
