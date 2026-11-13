'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Radio,
  Tv,
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
} from 'lucide-react';

const CATEGORIES = ['All', 'LIVE NOW', 'NFL', 'NBA', 'College', 'Soccer', 'MMA', 'Channels', 'Pinned'];

const THEMES = {
  broadcast: {
    label: 'Broadcast Dark',
    bg: 'bg-[#090a0f]',
    header: 'bg-[#0c0e16]/90',
    card: 'bg-[#11131e]',
    accent: 'bg-red-600 hover:bg-red-500 border-red-500',
    accentText: 'text-red-400',
  },
  midnight: {
    label: 'AMG Midnight',
    bg: 'bg-[#07070c]',
    header: 'bg-[#100b14]/90',
    card: 'bg-[#14101a]',
    accent: 'bg-rose-600 hover:bg-rose-500 border-rose-500',
    accentText: 'text-rose-400',
  },
  pitch: {
    label: 'Emerald Pitch',
    bg: 'bg-[#060d0b]',
    header: 'bg-[#091612]/90',
    card: 'bg-[#0d1c17]',
    accent: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500',
    accentText: 'text-emerald-400',
  },
};

function StreamPlayer({ stream, title, subtitle, useProxy, isMuted, onToggleMute }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [resolution, setResolution] = useState('AUTO HD');
  const [retrySeed, setRetrySeed] = useState(0);

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
  }, [finalUrl, stream, retrySeed]);

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
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
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
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mb-2" />
          <span className="text-xs text-gray-300 font-medium tracking-wide">Negotiating Live Stream...</span>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
          <p className="text-sm font-semibold text-white mb-1">Stream Connection Interrupted</p>
          <p className="text-xs text-gray-400 max-w-md mb-4">
            Switch to Server 2/3 below, or toggle the CORS Proxy switch for external M3U8 feeds.
          </p>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Stream Engine
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
        <div className="absolute bottom-14 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-black/80 hover:bg-red-600 text-white border border-white/10 transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handlePiP}
            className="p-2 rounded-lg bg-black/80 hover:bg-red-600 text-white border border-white/10 transition"
            title="Picture in Picture"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="p-2 rounded-lg bg-black/80 hover:bg-red-600 text-white border border-white/10 transition"
            title="Reload Buffer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ClientHomePage({ initialCatalog }) {
  const initialEvents = initialCatalog?.events || [];
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(initialEvents[0] || null);
  const [secondaryEvent, setSecondaryEvent] = useState(initialEvents[1] || initialEvents[0] || null);
  const [serverIdx, setServerIdx] = useState(0);
  const [useProxy, setUseProxy] = useState(true);
  const [multiView, setMultiView] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [themeKey, setThemeKey] = useState('broadcast');

  const theme = THEMES[themeKey] || THEMES.broadcast;

  useEffect(() => {
    try {
      const savedPins = localStorage.getItem('livewire_pins');
      if (savedPins) setPinnedIds(JSON.parse(savedPins));
      const savedTheme = localStorage.getItem('livewire_theme');
      if (savedTheme && THEMES[savedTheme]) setThemeKey(savedTheme);
    } catch {}
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

  const fetchCatalog = async () => {
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

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter((ev) => {
      const matchesSearch =
        !q ||
        ev.title?.toLowerCase().includes(q) ||
        ev.league?.toLowerCase().includes(q) ||
        ev.homeTeam?.name?.toLowerCase().includes(q) ||
        ev.awayTeam?.name?.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (activeCategory === 'All') return true;
      if (activeCategory === 'LIVE NOW') return ev.isLive;
      if (activeCategory === 'Pinned') return pinnedIds.includes(ev.id);
      return ev.category === activeCategory;
    });
  }, [events, activeCategory, searchQuery, pinnedIds]);

  const handleLoadCustomStream = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const trimmed = customUrl.trim();
    const isEmbed = !trimmed.includes('.m3u8') && !trimmed.includes('.mp4');
    const customEvent = {
      id: `custom-${Date.now()}`,
      title: 'Custom Live Feed',
      category: 'Channels',
      league: isEmbed ? 'EMBED STREAM' : 'CUSTOM HLS',
      status: 'LIVE',
      isLive: true,
      homeTeam: {
        name: 'Custom',
        score: 'HD',
        logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png',
      },
      awayTeam: {
        name: 'Stream',
        score: 'LIVE',
        logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png',
      },
      servers: [
        {
          name: 'Custom Source 1',
          type: isEmbed ? 'embed' : 'hls',
          url: trimmed,
        },
      ],
    };
    setEvents((prev) => [customEvent, ...prev]);
    setSelectedEvent(customEvent);
    setServerIdx(0);
    setCustomUrl('');
    setShowCustomModal(false);
  };

  const activeServer = selectedEvent?.servers?.[serverIdx] || selectedEvent?.servers?.[0];

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden ${theme.bg}`}>
      <header className={`sticky top-0 z-40 ${theme.header} backdrop-blur-md border-b border-white/10`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-lg text-white">LIVE WIRE</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  v2.1 PRO
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">Multi-Source Sports & Broadcast Engine</p>
            </div>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams (e.g. 49ers, Lakers), leagues..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={cycleTheme}
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition"
              title={`Theme: ${theme.label}`}
            >
              <Palette className="w-4 h-4" />
              <span className="hidden md:inline">{theme.label}</span>
            </button>
            <button
              onClick={() => setShowCustomModal(true)}
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition"
              title="Load Custom M3U8 / Embed"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Custom</span>
            </button>
            <button
              onClick={fetchCatalog}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition"
              title="Refresh Live Scores"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className={`${theaterMode ? 'max-w-full px-4 sm:px-8' : 'max-w-7xl px-4'} w-full mx-auto py-5 space-y-6`}>
        {selectedEvent && (
          <section className="space-y-3">
            <div className={`grid gap-4 ${multiView ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
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

            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11131e]/90 border border-white/10 rounded-xl p-3">
              <div className="flex flex-wrap items-center gap-2">
                {selectedEvent.servers?.map((srv, idx) => (
                  <button
                    key={`${srv.name}-${idx}`}
                    onClick={() => setServerIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      serverIdx === idx
                        ? `${theme.accent} text-white`
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {srv.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUseProxy((p) => !p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
                    useProxy
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Proxy: {useProxy ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setMultiView((m) => !m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
                    multiView
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  Multi-View
                </button>
                <button
                  onClick={() => setTheaterMode((t) => !t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
                    theaterMode
                      ? 'bg-red-500/20 border-red-500/40 text-red-300'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Theater
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                activeCategory === cat
                  ? `${theme.accent} text-white shadow-lg`
                  : `${theme.card} border-white/10 text-gray-400 hover:text-white hover:border-white/20`
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Tv className="w-4 h-4 text-red-500" />
              {activeCategory} Catalog ({filteredEvents.length})
            </h2>
            {multiView && (
              <span className="text-xs text-amber-400">
                Click &quot;Watch #2&quot; on any card to load the second screen
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEvents.map((ev) => {
              const isSelected = selectedEvent?.id === ev.id;
              const isPinned = pinnedIds.includes(ev.id);

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setServerIdx(0);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`group cursor-pointer rounded-xl p-4 ${theme.card} border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-red-500 ring-1 ring-red-500/50'
                      : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-gray-300">
                        {ev.league}
                      </span>
                      <div className="flex items-center gap-2">
                        {ev.isLive ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            {ev.status}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-gray-400">{ev.status}</span>
                        )}
                        <button
                          onClick={(e) => togglePin(ev.id, e)}
                          className={`p-1 rounded hover:bg-white/10 ${
                            isPinned ? 'text-amber-400' : 'text-gray-600 hover:text-gray-300'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 my-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={ev.awayTeam?.logo} alt="" className="w-6 h-6 object-contain shrink-0" />
                          <span className="text-xs font-bold text-white truncate">{ev.awayTeam?.name}</span>
                        </div>
                        <span className="text-sm font-black text-gray-200">{ev.awayTeam?.score}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={ev.homeTeam?.logo} alt="" className="w-6 h-6 object-contain shrink-0" />
                          <span className="text-xs font-bold text-white truncate">{ev.homeTeam?.name}</span>
                        </div>
                        <span className="text-sm font-black text-gray-200">{ev.homeTeam?.score}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
                    <span className={`text-[11px] text-gray-400 group-hover:${theme.accentText} font-semibold flex items-center gap-1 transition`}>
                      <Play className="w-3 h-3 fill-current" />
                      {isSelected ? 'Playing Now' : 'Watch Live'}
                    </span>

                    {multiView && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSecondaryEvent(ev);
                        }}
                        className="px-2 py-1 rounded bg-white/10 hover:bg-red-600 text-[10px] font-bold text-white transition"
                      >
                        Watch #2
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleLoadCustomStream}
            className="w-full max-w-md rounded-2xl bg-[#11131e] border border-white/15 p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Load Custom Stream (M3U8 / Embed)</h3>
            <input
              type="url"
              required
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/master.m3u8"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-red-600 text-xs font-bold text-white">
                Load Stream
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
