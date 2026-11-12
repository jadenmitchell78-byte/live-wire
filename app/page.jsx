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
  Flame,
  CheckCircle2,
  Film
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'LIVE NOW',
  'NFL',
  'NBA',
  'College',
  'Soccer',
  'MMA',
  'Movies',
  'Shows',
  'Channels',
  'Pinned'
];

const FALLBACK_CHANNELS = [
  {
    id: 'fallback-cbs',
    title: 'CBS Sports HQ (24/7 Live Sports Desk)',
    category: 'Channels',
    league: 'CBS SPORTS HQ',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: {
      name: 'CBS Sports',
      score: 'LIVE',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png'
    },
    awayTeam: {
      name: 'HQ Live',
      score: '24/7',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png'
    },
    servers: [
      {
        name: 'Server 1 (CBS Sports HQ Direct HLS)',
        type: 'hls',
        url: 'https://dai.google.com/linear/hls/event/Sid4xiTQTkCT1SLu6rjUSQ/master.m3u8'
      }
    ]
  }
];

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
    if (!stream) return;
    if (stream.type === 'embed') {
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

    // Direct MP4 clip support (for official ESPN in-game highlight feeds)
    if (finalUrl.includes('.mp4')) {
      video.src = finalUrl;
      video.onloadedmetadata = () => {
        setResolution('1080p CLIP');
        setStatus('playing');
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      };
      video.onerror = () => setStatus('error');
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
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
      video.onloadedmetadata = () => {
        setStatus('playing');
        video.play().catch(() => {});
      };
      video.onerror = () => setStatus('error');
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
    } catch (e) {}
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-white line-clamp-1">{title}</span>
          {subtitle && <span className="text-xs text-gray-400 hidden sm:inline">• {subtitle}</span>}
        </div>
        <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-emerald-400 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {resolution}
        </div>
      </div>

      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mb-2" />
          <span className="text-xs text-gray-300 font-medium tracking-wide">Connecting to Live Sports Feed...</span>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
          <p className="text-sm font-semibold text-white mb-1">Feed Temporarily Unavailable</p>
          <p className="text-xs text-gray-400 max-w-md mb-4">
            Switch to another server in the Match Center below or toggle CORS Proxy.
          </p>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Stream
          </button>
        </div>
      )}

      {stream?.type === 'embed' ? (
        <iframe
          key={stream.url}
          src={stream.url}
          className="w-full h-full border-0 bg-[#090a0f]"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
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
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handlePiP}
            className="p-2 rounded-lg bg-black/80 hover:bg-red-600 text-white border border-white/10 transition"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="p-2 rounded-lg bg-black/80 hover:bg-red-600 text-white border border-white/10 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function LiveWireApp() {
  const [events, setEvents] = useState(FALLBACK_CHANNELS);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(FALLBACK_CHANNELS[0]);
  const [secondaryEvent, setSecondaryEvent] = useState(FALLBACK_CHANNELS[0]);
  const [gameClips, setGameClips] = useState([]);
  const [serverIdx, setServerIdx] = useState(0);
  const [useProxy, setUseProxy] = useState(false);
  const [multiView, setMultiView] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('livewire_pins');
      if (saved) setPinnedIds(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const togglePin = (id, e) => {
    e?.stopPropagation();
    const updated = pinnedIds.includes(id)
      ? pinnedIds.filter((item) => item !== id)
      : [...pinnedIds, id];
    setPinnedIds(updated);
    try {
      localStorage.setItem('livewire_pins', JSON.stringify(updated));
    } catch (e) {}
  };

  // Fetch catalog from API; if empty or cold-starting, never wipe out existing list
  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/catalog', { cache: 'no-store' });
      const data = await res.json();
      const list = data.events?.length > 0 ? data.events : FALLBACK_CHANNELS;
      setEvents(list);
      setSelectedEvent((prev) => {
        const updatedMatch = list.find((item) => item.id === prev?.id);
        return updatedMatch || list[0];
      });
    } catch (e) {
      console.error('Catalog fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
    const interval = setInterval(fetchCatalog, 45000);
    return () => clearInterval(interval);
  }, []);

  // Whenever user selects a live NBA/NFL/College/Soccer game, pull live video clips for that exact game from ESPN Summary API
  useEffect(() => {
    setGameClips([]);
    if (!selectedEvent?.espnEventId || !selectedEvent?.sportPath) return;

    const controller = new AbortController();
    fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${selectedEvent.sportPath}/summary?event=${selectedEvent.espnEventId}`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((summary) => {
        const rawVideos = summary?.videos || [];
        const extracted = rawVideos
          .map((v) => {
            const url =
              v.links?.source?.HLS?.HD?.href ||
              v.links?.source?.HLS?.href ||
              v.links?.source?.HD?.href ||
              v.links?.source?.mezzanine?.href ||
              v.links?.source?.full?.href;
            if (!url) return null;
            return {
              name: `Live Highlight: ${v.headline || 'In-Game Clip'}`,
              type: 'hls',
              url
            };
          })
          .filter(Boolean)
          .slice(0, 4);

        if (extracted.length > 0) {
          setGameClips(extracted);
          setServerIdx(0); // Automatically play the real game video first!
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [selectedEvent?.id]);

  // Combine real in-game ESPN clips with the 24/7 sports broadcast servers
  const combinedServers = useMemo(() => {
    const base = selectedEvent?.servers || [];
    return [...gameClips, ...base];
  }, [gameClips, selectedEvent]);

  const activeServer = combinedServers[serverIdx] || combinedServers[0];

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.league.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.homeTeam?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.awayTeam?.name?.toLowerCase().includes(searchQuery.toLowerCase());

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
    const isEmbed = !customUrl.includes('.m3u8') && !customUrl.includes('.mp4');
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
        logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png'
      },
      awayTeam: {
        name: 'Stream',
        score: 'LIVE',
        logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png'
      },
      servers: [
        {
          name: 'Custom Source 1',
          type: isEmbed ? 'embed' : 'hls',
          url: customUrl.trim()
        }
      ]
    };
    setEvents((prev) => [customEvent, ...prev]);
    setSelectedEvent(customEvent);
    setServerIdx(0);
    setCustomUrl('');
    setShowCustomModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0c0e16]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-base sm:text-lg text-white">LIVE WIRE</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                v2.1
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams, games..."
              className="w-full bg-[#141724] border border-white/10 focus:border-red-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCustomModal(!showCustomModal)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#141724] hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition"
              title="Paste Custom M3U8 or Embed Link"
            >
              <PlusCircle className="w-4 h-4 text-red-500" />
              <span className="hidden md:inline">Custom Link</span>
            </button>
            <button
              onClick={fetchCatalog}
              className="p-2 rounded-xl bg-[#141724] hover:bg-white/10 border border-white/10 text-gray-300 transition"
              title="Refresh Live Scores"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {showCustomModal && (
        <div className="bg-[#121521] border-b border-white/10 px-4 py-3">
          <form onSubmit={handleLoadCustomStream} className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              required
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Paste any direct .m3u8 stream link or embed iframe URL..."
              className="flex-1 bg-black/60 border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition"
            >
              Load Stream
            </button>
          </form>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto px-4 py-5 flex-1 space-y-6">
        {selectedEvent && (
          <section className="space-y-3">
            <div
              className={`grid gap-4 ${
                multiView ? 'grid-cols-1 lg:grid-cols-2' : theaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'
              }`}
            >
              <div className={multiView ? 'col-span-1' : theaterMode ? 'col-span-1' : 'lg:col-span-2'}>
                <StreamPlayer
                  stream={activeServer}
                  title={selectedEvent.title}
                  subtitle={`${selectedEvent.league} • ${selectedEvent.status}`}
                  useProxy={useProxy}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                />
              </div>

              {multiView && secondaryEvent ? (
                <div className="col-span-1">
                  <StreamPlayer
                    stream={secondaryEvent.servers?.[0]}
                    title={secondaryEvent.title}
                    subtitle={`${secondaryEvent.league} • MULTI-VIEW #2`}
                    useProxy={useProxy}
                    isMuted={true}
                    onToggleMute={() => {}}
                  />
                </div>
              ) : (
                !theaterMode && (
                  <div className="bg-[#11131e] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                          <Flame className="w-4 h-4" /> Match Center
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-300">
                          {selectedEvent.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 items-center text-center py-4 bg-black/40 rounded-xl border border-white/5 mb-4">
                        <div className="flex flex-col items-center gap-2 px-2">
                          <img
                            src={selectedEvent.awayTeam?.logo}
                            alt={selectedEvent.awayTeam?.name}
                            className="w-12 h-12 object-contain"
                          />
                          <span className="text-xs font-bold text-white line-clamp-1">
                            {selectedEvent.awayTeam?.name}
                          </span>
                          <span className="text-2xl font-black text-white">{selectedEvent.awayTeam?.score}</span>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                            {selectedEvent.league}
                          </span>
                          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                            VS
                          </span>
                        </div>

                        <div className="flex flex-col items-center gap-2 px-2">
                          <img
                            src={selectedEvent.homeTeam?.logo}
                            alt={selectedEvent.homeTeam?.name}
                            className="w-12 h-12 object-contain"
                          />
                          <span className="text-xs font-bold text-white line-clamp-1">
                            {selectedEvent.homeTeam?.name}
                          </span>
                          <span className="text-2xl font-black text-white">{selectedEvent.homeTeam?.score}</span>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                          Select Broadcast / In-Game Feed ({combinedServers.length})
                        </label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {combinedServers.map((srv, idx) => (
                            <button
                              key={idx}
                              onClick={() => setServerIdx(idx)}
                              className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between border transition text-left ${
                                serverIdx === idx
                                  ? 'bg-red-600/20 border-red-500 text-white'
                                  : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span className="flex items-center gap-2 line-clamp-1 pr-2">
                                {srv.name.startsWith('Live Highlight') ? (
                                  <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                )}
                                <span className="truncate">{srv.name}</span>
                              </span>
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/10 shrink-0">
                                {srv.type}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-4 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => setUseProxy(!useProxy)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                          useProxy
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-black/40 border-white/10 text-gray-400'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        CORS Proxy: {useProxy ? 'ON' : 'OFF'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setMultiView(!multiView)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                            multiView
                              ? 'bg-red-600 border-red-500 text-white'
                              : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          <Grid className="w-3.5 h-3.5" /> Multi-View
                        </button>
                        <button
                          onClick={() => setTheaterMode(!theaterMode)}
                          className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-white"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* Category Selector */}
        <section className="flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                activeCategory === cat
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/25'
                  : 'bg-[#121521] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Live Catalog Grid with Hover & Focus Animations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Tv className="w-4 h-4 text-red-500" />
              {activeCategory} Catalog ({filteredEvents.length})
            </h2>
            {multiView && (
              <span className="text-xs text-amber-400 animate-pulse">
                Tip: Hover any thumbnail and click &quot;Watch #2&quot; to load the second screen
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEvents.map((ev, index) => {
              const isSelected = selectedEvent?.id === ev.id;
              const isPinned = pinnedIds.includes(ev.id);
              const isMedia = ev.category === 'Movies' || ev.category === 'Shows';

              return (
                <div
                  key={ev.id}
                  tabIndex={0}
                  style={{ animationDelay: `${Math.min(index * 45, 450)}ms` }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                  }}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setServerIdx(0);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedEvent(ev);
                      setServerIdx(0);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`catalog-card animate-card-enter opacity-0 group cursor-pointer rounded-2xl overflow-hidden bg-[#11131e] border outline-none flex flex-col justify-between ${
                    isSelected
                      ? 'border-red-500 ring-2 ring-red-500/60 bg-[#161929]'
                      : 'border-white/10 hover:border-red-500/70 focus-visible:border-red-500'
                  }`}
                >
                  {/* Dynamic Mouse-Tracking Radial Spotlight */}
                  <div
                    className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    style={{
                      background:
                        'radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(239, 68, 68, 0.16), transparent 70%)'
                    }}
                  />

                  {/* Top Thumbnail Visual Area */}
                  <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#181c2e] via-[#0f111c] to-black">
                    {isMedia && ev.backdrop ? (
                      /* Movie / Show Poster Backdrop with Zoom Animation */
                      <img
                        src={ev.backdrop}
                        alt={ev.title}
                        className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      /* Live Sports Split-Arena Thumbnail with Animated Team Logos */
                      <div className="relative w-full h-full flex items-center justify-around px-4">
                        {/* Subtle animated background glow */}
                        <div className="absolute -left-6 -top-6 w-32 h-32 bg-red-600/15 rounded-full blur-2xl group-hover:bg-red-600/30 transition-all duration-500" />
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-600/15 rounded-full blur-2xl group-hover:bg-blue-600/30 transition-all duration-500" />

                        {/* Away Team */}
                        <div className="relative z-10 flex flex-col items-center gap-1.5 transform group-hover:-translate-x-1.5 group-hover:scale-110 transition-all duration-500">
                          <img
                            src={ev.awayTeam?.logo}
                            alt={ev.awayTeam?.name}
                            className="w-14 h-14 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                          />
                          <span className="text-[11px] font-bold text-gray-200 max-w-[90px] truncate">
                            {ev.awayTeam?.name}
                          </span>
                        </div>

                        {/* Center Score / VS Badge */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md group-hover:border-red-500/50 transition-colors">
                            <span className="text-base font-black text-white">{ev.awayTeam?.score}</span>
                            <span className="text-[10px] font-bold text-red-400">VS</span>
                            <span className="text-base font-black text-white">{ev.homeTeam?.score}</span>
                          </div>
                        </div>

                        {/* Home Team */}
                        <div className="relative z-10 flex flex-col items-center gap-1.5 transform group-hover:translate-x-1.5 group-hover:scale-110 transition-all duration-500">
                          <img
                            src={ev.homeTeam?.logo}
                            alt={ev.homeTeam?.name}
                            className="w-14 h-14 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                          />
                          <span className="text-[11px] font-bold text-gray-200 max-w-[90px] truncate">
                            {ev.homeTeam?.name}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Dark Bottom Gradient Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#11131e] via-[#11131e]/25 to-transparent" />

                    {/* Top Floating Badges (League + Live Status + Favorite Star) */}
                    <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-gray-200 border border-white/10">
                        {ev.league}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {ev.isLive ? (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md bg-red-600/90 text-white shadow-lg shadow-red-600/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            {ev.status}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/75 text-gray-300 border border-white/10">
                            {ev.status}
                          </span>
                        )}

                        <button
                          onClick={(e) => togglePin(ev.id, e)}
                          className={`p-1.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 transition transform hover:scale-110 ${
                            isPinned ? 'text-amber-400' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>

                    {/* Center Animated Play Button Overlay on Hover */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/35 backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Card Details & Slide-Up Action Footer */}
                  <div className="relative z-20 p-4 pt-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {ev.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                        {isMedia
                          ? `${ev.rating || 'HD'} • ${ev.year || '2026'} • ${ev.duration || 'Full Length'}`
                          : `${ev.broadcast || 'LIVE WIRE HD'} • ${ev.servers?.length || 1} Streams Available`}
                      </p>
                    </div>

                    {/* Slide-Up Quick Action Bar */}
                    <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-[11px] text-gray-300 group-hover:text-white font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 group-hover:animate-ping" />
                        {isSelected ? 'Playing Now' : isMedia ? 'Watch Now' : 'Watch Live Broadcast'}
                      </span>

                      {multiView && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSecondaryEvent(ev);
                          }}
                          className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-red-600 text-[10px] font-bold text-white transition"
                        >
                          + Screen 2
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
