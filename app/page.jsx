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
  CheckCircle2
} from 'lucide-react';

const CATEGORIES = ['All', 'LIVE NOW', 'NFL', 'NBA', 'College', 'Soccer', 'MMA', 'Channels', 'Pinned'];

// Reusable Dual-Engine Video Player (HLS.js + Native Safari + Iframe Embed)
function StreamPlayer({ stream, title, subtitle, useProxy, isMuted, onToggleMute }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'playing' | 'error'
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
          // Autoplay fallback: mute and play
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
      // Native Safari / iOS HLS support
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
    } catch (e) {
      console.error('PiP failed:', e);
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
      {/* Top Status Overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-white">{title}</span>
          {subtitle && <span className="text-xs text-gray-400 hidden sm:inline">• {subtitle}</span>}
        </div>
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {resolution}
        </div>
      </div>

      {/* Loading Spinner */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mb-2" />
          <span className="text-xs text-gray-300 font-medium tracking-wide">Negotiating Live Stream...</span>
        </div>
      )}

      {/* Error Recovery Overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
          <p className="text-sm font-semibold text-white mb-1">Stream Connection Interrupted</p>
          <p className="text-xs text-gray-400 max-w-md mb-4">
            Try switching to Server 2/3 below, or toggle the CORS Proxy switch if this is an external M3U8 feed.
          </p>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload Stream Engine
          </button>
        </div>
      )}

      {/* Render Embed OR Video */}
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

      {/* Quick Floating Controls */}
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

export default function LiveWireApp() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [secondaryEvent, setSecondaryEvent] = useState(null);
  const [serverIdx, setServerIdx] = useState(0);
  const [useProxy, setUseProxy] = useState(false);
  const [multiView, setMultiView] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Load saved pins from localStorage
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

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      const list = data.events || [];
      setEvents(list);
      if (!selectedEvent && list.length > 0) {
        setSelectedEvent(list[0]);
        setSecondaryEvent(list[1] || list[0]);
      }
    } catch (e) {
      console.error('Failed to load catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
    const interval = setInterval(fetchCatalog, 60000);
    return () => clearInterval(interval);
  }, []);

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
      homeTeam: { name: 'Custom', score: 'HD', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
      awayTeam: { name: 'Stream', score: 'LIVE', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
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

  const activeServer = selectedEvent?.servers?.[serverIdx] || selectedEvent?.servers?.[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0c0e16]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-lg text-white">LIVE WIRE</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  v2.0 PRO
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">Multi-Source Sports & Broadcast Engine</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams (e.g. 49ers, Lakers), leagues, or channels..."
              className="w-full bg-[#141724] border border-white/10 focus:border-red-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomModal(!showCustomModal)}
              className="px-3 py-2 rounded-xl bg-[#141724] hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4 text-red-500" />
              <span className="hidden md:inline">Custom M3U8</span>
            </button>
            <button
              onClick={fetchCatalog}
              className="p-2 rounded-xl bg-[#141724] hover:bg-white/10 border border-white/10 text-gray-300 transition"
              title="Refresh Live Scores & Streams"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Custom Stream Modal Bar */}
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
              Load Into Player
            </button>
          </form>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-7xl w-full mx-auto px-4 py-6 flex-1 space-y-6">
        {/* Player Section + Live Match Control Deck */}
        {selectedEvent && (
          <section className="space-y-3">
            <div
              className={`grid gap-4 ${
                multiView ? 'grid-cols-1 lg:grid-cols-2' : theaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'
              }`}
            >
              {/* Primary Stream Player */}
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

              {/* Multi-View Second Screen OR Live Scoreboard Sidebar */}
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

                      {/* Teams & Live Score */}
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

                      {/* Server Switcher */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                          Select Broadcast Server
                        </label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {(selectedEvent.servers || []).map((srv, idx) => (
                            <button
                              key={idx}
                              onClick={() => setServerIdx(idx)}
                              className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between border transition ${
                                serverIdx === idx
                                  ? 'bg-red-600/20 border-red-500 text-white'
                                  : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Play className="w-3.5 h-3.5 text-red-500" />
                                {srv.name}
                              </span>
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/10">
                                {srv.type}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Player Controls & CORS Toggle */}
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
                          title="Toggle Theater Width"
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

        {/* Category Filter Pills */}
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

        {/* Live Catalog Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Tv className="w-4 h-4 text-red-500" />
              {activeCategory} Catalog ({filteredEvents.length})
            </h2>
            {multiView && (
              <span className="text-xs text-amber-400">
                Tip: Click "Watch #2" on any card to load it into the second screen
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
                  className={`group cursor-pointer rounded-xl p-4 bg-[#11131e] border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-red-500 ring-1 ring-red-500/50 bg-[#161929]'
                      : 'border-white/10 hover:border-white/25 hover:bg-[#151826]'
                  }`}
                >
                  <div>
                    {/* Card Top Metadata */}
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

                    {/* Teams Row */}
                    <div className="space-y-2.5 my-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={ev.awayTeam?.logo} alt="" className="w-6 h-6 object-contain" />
                          <span className="text-xs font-bold text-white">{ev.awayTeam?.name}</span>
                        </div>
                        <span className="text-sm font-black text-gray-200">{ev.awayTeam?.score}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={ev.homeTeam?.logo} alt="" className="w-6 h-6 object-contain" />
                          <span className="text-xs font-bold text-white">{ev.homeTeam?.name}</span>
                        </div>
                        <span className="text-sm font-black text-gray-200">{ev.homeTeam?.score}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
                    <span className="text-[11px] text-gray-400 group-hover:text-red-400 font-semibold flex items-center gap-1 transition">
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
    </div>
  );
}
