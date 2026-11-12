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
  Film,
  ExternalLink,
  ArrowLeftRight,
  X,
  Sparkles,
  ChevronRight,
  Share2
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'LIVE NOW',
  'NBA',
  'NFL',
  'College',
  'Soccer',
  'MMA',
  'Channels',
  'Movies',
  'Shows',
  'Pinned'
];

// Rich, guaranteed instant-load catalog (Ensures the page NEVER renders blank or 0 items)
const INITIAL_HULU_CATALOG = [
  {
    id: 'nba-live-1',
    title: 'Golden State Warriors at Houston Rockets',
    shortTitle: 'Warriors @ Rockets',
    category: 'NBA',
    league: 'NBA',
    status: 'LIVE 3rd Qtr',
    isLive: true,
    broadcast: 'ESPN LIVE HD',
    backdrop: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    homeTeam: {
      name: 'Rockets',
      abbr: 'HOU',
      score: '88',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/hou.png'
    },
    awayTeam: {
      name: 'Warriors',
      abbr: 'GSW',
      score: '94',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/gsw.png'
    },
    servers: [
      {
        name: 'Server 1 · Live Sports Net (1080p HD)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
      },
      {
        name: 'Server 2 · Live Backup Edge (720p HD)',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      },
      {
        name: 'Server 3 · Official Broadcast (ESPN)',
        type: 'gate',
        network: 'ESPN',
        url: 'https://www.espn.com/watch/'
      },
      {
        name: 'Server 4 · Gamecast Live Data',
        type: 'gamecast',
        url: 'https://www.espn.com/nba/game/_/gameId/401584893'
      }
    ]
  },
  {
    id: 'nba-live-2',
    title: 'Oklahoma City Thunder at Portland Trail Blazers',
    shortTitle: 'Thunder @ Trail Blazers',
    category: 'NBA',
    league: 'NBA',
    status: 'LIVE 2nd Qtr',
    isLive: true,
    broadcast: 'NBA TV LIVE',
    backdrop: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1200&q=80',
    homeTeam: {
      name: 'Trail Blazers',
      abbr: 'POR',
      score: '51',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/por.png'
    },
    awayTeam: {
      name: 'Thunder',
      abbr: 'OKC',
      score: '62',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/okc.png'
    },
    servers: [
      {
        name: 'Server 1 · Live Sports Net (1080p HD)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
      },
      {
        name: 'Server 2 · Live Backup Edge (720p HD)',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      },
      {
        name: 'Server 3 · Official Broadcast (NBA TV)',
        type: 'gate',
        network: 'NBA TV',
        url: 'https://www.nba.com/watch'
      }
    ]
  },
  {
    id: 'ch-espn',
    title: 'ESPN HD — SportsCenter Live Desk',
    shortTitle: 'ESPN Main Network',
    category: 'Channels',
    league: 'ESPN LIVE',
    status: 'LIVE 24/7',
    isLive: true,
    broadcast: 'ESPN USA',
    backdrop: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    homeTeam: {
      name: 'ESPN HD',
      score: 'LIVE',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png'
    },
    awayTeam: {
      name: 'SportsCenter',
      score: '24/7',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png'
    },
    servers: [
      {
        name: 'Server 1 · Live Sports Net (1080p HD)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
      },
      {
        name: 'Server 2 · CBS Sports HQ (US Direct)',
        type: 'hls',
        proxyRequired: true,
        url: 'https://dai.google.com/linear/hls/event/Sid4xiTQTkCT1SLu6rjUSQ/master.m3u8'
      }
    ]
  },
  {
    id: 'ch-cbssports',
    title: 'CBS Sports HQ — 24/7 Live Scores & Breaking Desk',
    shortTitle: 'CBS Sports HQ',
    category: 'Channels',
    league: 'CBS SPORTS',
    status: 'LIVE 24/7',
    isLive: true,
    broadcast: 'CBS SPORTS HQ',
    backdrop: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    homeTeam: {
      name: 'CBS Sports',
      score: 'LIVE',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png'
    },
    awayTeam: {
      name: 'HQ Desk',
      score: '24/7',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png'
    },
    servers: [
      {
        name: 'Server 1 · CBS Sports HQ (US Direct)',
        type: 'hls',
        proxyRequired: true,
        url: 'https://dai.google.com/linear/hls/event/Sid4xiTQTkCT1SLu6rjUSQ/master.m3u8'
      },
      {
        name: 'Server 2 · Live Sports Net (1080p HD)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
      }
    ]
  },
  {
    id: 'mov-metropolis',
    title: 'Metropolis (1927) — 4K Restored Masterpiece',
    shortTitle: 'Metropolis (1927)',
    category: 'Movies',
    league: 'CINEMA CLASSIC',
    status: '4K RESTORED',
    isLive: false,
    rating: '99% Match',
    year: '1927',
    duration: '2h 33m',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    servers: [
      {
        name: 'Server 1 · Restored Archive Stream (1080p)',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      }
    ]
  },
  {
    id: 'show-dragnet',
    title: 'Dragnet — Just The Facts (Classic Police Procedural)',
    shortTitle: 'Dragnet',
    category: 'Shows',
    league: 'CLASSIC TV',
    status: 'S1:E1',
    isLive: false,
    rating: '95% Match',
    year: '1951',
    duration: '26m',
    backdrop: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    servers: [
      {
        name: 'Server 1 · Episode Stream (HD)',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      }
    ]
  }
];

// Dual-Engine Watchdog-Protected Media Player
function StreamPlayer({
  stream,
  title,
  subtitle,
  useProxy,
  isMuted,
  onToggleMute,
  tileLabel,
  onSwitchServer
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'playing' | 'error'
  const [resolution, setResolution] = useState('1080p60');
  const [retrySeed, setRetrySeed] = useState(0);

  const shouldProxy = useProxy || stream?.proxyRequired;

  const finalUrl = useMemo(() => {
    if (!stream?.url) return '';
    if (shouldProxy && stream.type === 'hls') {
      return `/api/proxy?url=${encodeURIComponent(stream.url)}`;
    }
    return stream.url;
  }, [stream, shouldProxy]);

  useEffect(() => {
    if (!stream) return;

    // 1. Official Broadcast Gate (Rendered cleanly as rights-holder gate)
    if (stream.type === 'gate' || stream.type === 'gamecast') {
      setStatus('playing');
      return;
    }

    // 2. Iframe Embeds: 2s timeout fallback so spinner never hangs
    if (stream.type === 'embed') {
      setStatus('loading');
      const timer = setTimeout(() => setStatus('playing'), 2000);
      return () => clearTimeout(timer);
    }

    const video = videoRef.current;
    if (!video || !finalUrl) return;

    setStatus('loading');

    // 3. 22s Watchdog Timer: Guarantees zero infinite spinners
    const watchdog = setTimeout(() => {
      if (video.readyState >= 2) {
        setStatus('playing');
      } else {
        setStatus('error');
      }
    }, 22000);

    // 4. Stall check: If data arrived, set playing
    const stallTimer = setTimeout(() => {
      if (video.readyState >= 2) setStatus('playing');
    }, 3500);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported() && finalUrl.includes('.m3u8')) {
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
    } else {
      video.src = finalUrl;
      video.onloadeddata = () => {
        setStatus('playing');
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      };
      video.onerror = () => setStatus('error');
    }

    return () => {
      clearTimeout(watchdog);
      clearTimeout(stallTimer);
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
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#1ce783]/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] group">
      {/* Tile Label sitting strictly ABOVE the player controls */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-[#06080b]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 max-w-[75%] shadow-lg">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#1ce783] animate-pulse" />
          <span className="text-xs font-black tracking-wider uppercase text-white truncate">
            {tileLabel ? `${tileLabel} • ` : ''}
            {title}
          </span>
          {subtitle && (
            <span className="text-[11px] text-gray-400 hidden sm:inline truncate">
              • {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-[#06080b]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#1ce783]/30 text-[10px] font-mono font-black text-[#1ce783] shadow-lg">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {stream?.type === 'embed' ? 'LIVE HD' : resolution}
        </div>
      </div>

      {/* Loading Spinner with Watchdog Protection */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#06080b]/90 pointer-events-none">
          <RefreshCw className="w-8 h-8 text-[#1ce783] animate-spin mb-2.5" />
          <span className="text-xs text-gray-200 font-black tracking-wider uppercase">
            Connecting to Live Broadcast...
          </span>
        </div>
      )}

      {/* Error Recovery Card */}
      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#06080b]/95 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
          <p className="text-sm font-bold text-white mb-1">Feed Unavailable on This Server</p>
          <p className="text-xs text-gray-400 max-w-md mb-4">
            Select another Server below in the Match Center or toggle the CORS Proxy.
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setRetrySeed((s) => s + 1)}
              className="px-5 py-2 bg-[#1ce783] hover:bg-[#00ed82] text-black text-xs font-black rounded-full flex items-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Stream
            </button>
            {onSwitchServer && (
              <button
                onClick={onSwitchServer}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full transition"
              >
                Switch to Next Server
              </button>
            )}
          </div>
        </div>
      )}

      {/* Official Broadcast Gate Card */}
      {stream?.type === 'gate' ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0c121e] via-[#080c14] to-black text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1ce783]/15 border border-[#1ce783]/30 flex items-center justify-center shadow-lg">
            <Tv className="w-8 h-8 text-[#1ce783]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">Official Broadcast Portal</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Live broadcast rights-holder stream on <strong className="text-white">{stream.network || 'Official Network'}</strong>.
            </p>
          </div>
          <a
            href={stream.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full bg-[#1ce783] hover:bg-[#00ed82] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 transition transform hover:scale-105 shadow-[0_0_20px_rgba(28,231,131,0.35)]"
          >
            Open Official Stream <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : stream?.type === 'gamecast' ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0a0f18] to-black text-center space-y-3">
          <Flame className="w-10 h-10 text-red-500 animate-pulse" />
          <h3 className="text-base font-black text-white">Live ESPN Gamecast Active</h3>
          <p className="text-xs text-gray-400 max-w-xs">
            Real-time play-by-play statistics and court visualization.
          </p>
          <a
            href={stream.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            Launch ESPN Gamecast <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : stream?.type === 'embed' ? (
        <iframe
          key={`${stream.url}-${retrySeed}`}
          src={stream.url}
          onLoad={() => setStatus('playing')}
          className="w-full h-full border-0 bg-black"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      ) : (
        <video
          ref={videoRef}
          onPlaying={() => setStatus('playing')}
          className="w-full h-full object-contain bg-black"
          controls
          playsInline
          muted={isMuted}
        />
      )}

      {/* Quick Floating Controls */}
      {stream?.type !== 'embed' && stream?.type !== 'gate' && stream?.type !== 'gamecast' && (
        <div className="absolute bottom-12 right-3 z-30 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-full bg-black/80 hover:bg-[#1ce783] hover:text-black text-white border border-white/10 transition shadow-lg"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handlePiP}
            className="p-2.5 rounded-full bg-black/80 hover:bg-[#1ce783] hover:text-black text-white border border-white/10 transition shadow-lg"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="p-2.5 rounded-full bg-black/80 hover:bg-[#1ce783] hover:text-black text-white border border-white/10 transition shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function HuluLiveWireApp() {
  const [events, setEvents] = useState(INITIAL_HULU_CATALOG);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(INITIAL_HULU_CATALOG[0]);
  const [secondaryEvent, setSecondaryEvent] = useState(INITIAL_HULU_CATALOG[1]);
  const [serverIdx, setServerIdx] = useState(0);
  const [useProxy, setUseProxy] = useState(false);
  const [multiView, setMultiView] = useState(false);
  const [audioFocus, setAudioFocus] = useState(1); // 1 = Tile 1 unmuted, 2 = Tile 2 unmuted
  const [pinnedIds, setPinnedIds] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Custom Stream Import Form State
  const [importTitle, setImportTitle] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [importType, setImportType] = useState('hls');
  const [importProxy, setImportProxy] = useState(false);

  // Load Pinned IDs and Saved Custom Streams from localStorage
  useEffect(() => {
    try {
      const savedPins = localStorage.getItem('livewire_pins');
      if (savedPins) setPinnedIds(JSON.parse(savedPins));

      const savedStreams = localStorage.getItem('livewire_custom_streams');
      if (savedStreams) {
        const parsed = JSON.parse(savedStreams);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents((prev) => [...parsed, ...prev]);
        }
      }
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

  // Resilient catalog fetch: Hits /api/catalog with 4s timeout, never wipes out local catalog
  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('/api/catalog', {
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          setEvents((prev) => {
            // Keep imported custom streams intact
            const customStreams = prev.filter((ev) => ev.isCustom);
            return [...customStreams, ...data.events];
          });
          setSelectedEvent((prev) => {
            const match = data.events.find((i) => i.id === prev?.id);
            return match || data.events[0];
          });
          return;
        }
      }
    } catch (e) {
      console.warn('API Catalog fallback to instant catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
    const interval = setInterval(fetchCatalog, 45000);
    return () => clearInterval(interval);
  }, []);

  const servers = selectedEvent?.servers || [];
  const activeServer = servers[serverIdx] || servers[0];

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

  const liveNowEvents = useMemo(() => events.filter((ev) => ev.isLive), [events]);

  // Handle Multi-View Swap
  const handleSwapTiles = () => {
    const temp = selectedEvent;
    setSelectedEvent(secondaryEvent);
    setSecondaryEvent(temp);
  };

  // Handle Custom Stream Import & LocalStorage Persistence
  const handleImportStream = (e) => {
    e.preventDefault();
    if (!importUrl.trim()) return;

    const newStream = {
      id: `custom-${Date.now()}`,
      title: importTitle.trim() || 'Imported Live Stream',
      shortTitle: 'Custom Stream',
      category: 'Channels',
      league: importType === 'hls' ? 'HLS STREAM' : 'EMBED STREAM',
      status: 'CUSTOM',
      isLive: true,
      isCustom: true,
      backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      homeTeam: {
        name: 'Custom',
        score: 'LIVE',
        logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png'
      },
      awayTeam: {
        name: 'Feed',
        score: 'HD',
        logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png'
      },
      servers: [
        {
          name: `Server 1 · ${importTitle.trim() || 'Custom Feed'}`,
          type: importType,
          proxyRequired: importProxy,
          url: importUrl.trim()
        }
      ]
    };

    setEvents((prev) => [newStream, ...prev]);
    setSelectedEvent(newStream);
    setServerIdx(0);

    try {
      const saved = localStorage.getItem('livewire_custom_streams');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(newStream);
      localStorage.setItem('livewire_custom_streams', JSON.stringify(list));
    } catch (_) {}

    setImportTitle('');
    setImportUrl('');
    setShowImportModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#06080b] text-gray-100">
      {/* Sticky Hulu Glass Header */}
      <header className="sticky top-0 z-50 bg-[#06080b]/95 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="flex items-center gap-1.5 cursor-pointer"
              onClick={() => {
                setActiveCategory('All');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="font-black text-xl tracking-tight text-white flex items-center">
                LIVE<span className="text-[#1ce783]">WIRE</span>
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#1ce783] animate-pulse" />
            </div>
            <span className="hidden md:inline-block text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#1ce783]/15 text-[#1ce783] border border-[#1ce783]/30">
              HULU + LIVE TV
            </span>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-lg relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live games, teams, networks, movies..."
              className="w-full bg-[#121620] border border-white/10 focus:border-[#1ce783] focus:ring-1 focus:ring-[#1ce783] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none transition"
            />
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 rounded-full bg-[#121620] hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 flex items-center gap-2 transition"
              title="Import Stream URL"
            >
              <PlusCircle className="w-4 h-4 text-[#1ce783]" />
              <span className="hidden sm:inline">Import Stream</span>
            </button>

            <button
              onClick={fetchCatalog}
              className="p-2 rounded-full bg-[#121620] hover:bg-white/10 border border-white/10 text-gray-300 transition"
              title="Refresh Live Scores"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1ce783]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Import Stream Modal with localStorage Persistence */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e121a] border border-[#1ce783]/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#1ce783]" /> Import Live Stream
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Drop in any licensed .m3u8 HLS playlist, direct .mp4 feed, or embed URL. Persists automatically across browser sessions.
            </p>

            <form onSubmit={handleImportStream} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                  Stream Name
                </label>
                <input
                  type="text"
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  placeholder="e.g. My Premium Sports Feed"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#1ce783]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                  Stream URL (HLS / MP4 / Embed)
                </label>
                <input
                  type="url"
                  required
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://example.com/live/master.m3u8"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#1ce783]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                    Feed Engine
                  </label>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#1ce783]"
                  >
                    <option value="hls">Native HLS (M3U8)</option>
                    <option value="embed">Iframe Embed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-gray-400 block mb-1">
                    CORS Proxy
                  </label>
                  <button
                    type="button"
                    onClick={() => setImportProxy(!importProxy)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      importProxy
                        ? 'bg-[#1ce783]/20 border-[#1ce783] text-[#1ce783]'
                        : 'bg-black/60 border-white/15 text-gray-400'
                    }`}
                  >
                    {importProxy ? 'Proxy Enabled' : 'Proxy Off'}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1ce783] hover:bg-[#00ed82] text-black text-xs font-black rounded-full transition shadow-[0_0_15px_rgba(28,231,131,0.3)]"
                >
                  Save & Play Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Swipeable Category Navigation Pills */}
      <nav className="sticky top-18 z-40 bg-[#06080b]/90 backdrop-blur-md border-b border-white/[0.06] py-2.5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1ce783] text-black shadow-[0_0_20px_rgba(28,231,131,0.35)] scale-105'
                    : 'bg-[#10141e] text-gray-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat === 'LIVE NOW' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-ping" />
                )}
                {cat}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-8">
        {/* Spotlight Hero Player Section */}
        {selectedEvent && (
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0d121c] via-[#090d14] to-[#06080b] border border-white/10 shadow-2xl">
            {multiView ? (
              /* Multi-View Dual Screen Grid */
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase text-[#1ce783] flex items-center gap-2">
                      <Grid className="w-4 h-4" /> Multi-View Quad/Dual Screen Mode
                    </span>
                    <button
                      onClick={handleSwapTiles}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white flex items-center gap-1.5 transition"
                      title="Swap Tile Positions"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" /> Swap Screens
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-bold">Audio Routing:</span>
                    <button
                      onClick={() => setAudioFocus(1)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                        audioFocus === 1
                          ? 'bg-[#1ce783] text-black border-[#1ce783]'
                          : 'bg-white/5 text-gray-300 border-white/10'
                      }`}
                    >
                      Tile 1 Audio
                    </button>
                    <button
                      onClick={() => setAudioFocus(2)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                        audioFocus === 2
                          ? 'bg-[#1ce783] text-black border-[#1ce783]'
                          : 'bg-white/5 text-gray-300 border-white/10'
                      }`}
                    >
                      Tile 2 Audio
                    </button>
                    <button
                      onClick={() => setMultiView(false)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-white"
                      title="Close Multi-View"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <StreamPlayer
                    stream={activeServer}
                    title={selectedEvent.title}
                    subtitle={selectedEvent.league}
                    useProxy={useProxy}
                    isMuted={audioFocus !== 1}
                    onToggleMute={() => setAudioFocus(audioFocus === 1 ? 0 : 1)}
                    tileLabel="Screen 1 (Primary)"
                    onSwitchServer={() => setServerIdx((i) => (i + 1) % servers.length)}
                  />

                  {secondaryEvent && (
                    <StreamPlayer
                      stream={secondaryEvent.servers?.[0]}
                      title={secondaryEvent.title}
                      subtitle={secondaryEvent.league}
                      useProxy={useProxy}
                      isMuted={audioFocus !== 2}
                      onToggleMute={() => setAudioFocus(audioFocus === 2 ? 0 : 2)}
                      tileLabel="Screen 2"
                      onSwitchServer={() => {}}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Standard Hero Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
                {/* Left Column: Match Details & Actions */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#1ce783]/20 text-[#1ce783] border border-[#1ce783]/30">
                      {selectedEvent.league} • LIVE ON HULU
                    </span>
                    {selectedEvent.isLive ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        {selectedEvent.status}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 text-gray-300">
                        {selectedEvent.status}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                    {selectedEvent.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">
                    {selectedEvent.category === 'Movies' || selectedEvent.category === 'Shows'
                      ? `${selectedEvent.rating || '99% Match'} • ${selectedEvent.year || '2026'} • Full Playable Stream`
                      : `Live Broadcast Feed • ${selectedEvent.broadcast || 'LIVE WIRE HD'} • ${servers.length} Available Servers`}
                  </p>

                  {/* Scoreboard Pill */}
                  {selectedEvent.awayTeam && selectedEvent.homeTeam && (
                    <div className="flex items-center gap-4 py-3 px-4 rounded-2xl bg-black/50 border border-white/10 max-w-md">
                      <div className="flex items-center gap-2 flex-1">
                        <img src={selectedEvent.awayTeam.logo} alt="" className="w-8 h-8 object-contain" />
                        <span className="text-xs font-bold text-white truncate">{selectedEvent.awayTeam.name}</span>
                        <span className="text-lg font-black text-white ml-auto">{selectedEvent.awayTeam.score}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-500">VS</span>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-lg font-black text-white mr-auto">{selectedEvent.homeTeam.score}</span>
                        <span className="text-xs font-bold text-white truncate text-right">{selectedEvent.homeTeam.name}</span>
                        <img src={selectedEvent.homeTeam.logo} alt="" className="w-8 h-8 object-contain" />
                      </div>
                    </div>
                  )}

                  {/* Hero Actions */}
                  <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <button
                      onClick={() => {
                        setServerIdx(0);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3 rounded-full bg-[#1ce783] hover:bg-[#00ed82] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 transition transform hover:scale-105 shadow-[0_0_25px_rgba(28,231,131,0.4)]"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" /> Watch Live Now
                    </button>

                    <button
                      onClick={() => setMultiView(true)}
                      className="px-5 py-3 rounded-full text-xs font-bold transition flex items-center gap-2 border bg-white/10 hover:bg-white/15 border-white/15 text-white"
                    >
                      <Grid className="w-4 h-4" /> Multi-View (Dual Screen)
                    </button>

                    <button
                      onClick={() => setUseProxy(!useProxy)}
                      className={`px-4 py-3 rounded-full text-xs font-bold transition flex items-center gap-1.5 border ${
                        useProxy
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-400'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      CORS: {useProxy ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Right Column: Video Player & Server Switcher */}
                <div className="lg:col-span-7 space-y-3">
                  <StreamPlayer
                    stream={activeServer}
                    title={selectedEvent.title}
                    subtitle={selectedEvent.league}
                    useProxy={useProxy}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted(!isMuted)}
                    tileLabel="Main Feed"
                    onSwitchServer={() => setServerIdx((i) => (i + 1) % servers.length)}
                  />

                  {/* Server Selection Pills Carousel */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                    <span className="text-[11px] font-black uppercase text-gray-400 shrink-0 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#1ce783]" /> Broadcast Rail ({servers.length}):
                    </span>
                    {servers.map((srv, idx) => {
                      const isSelected = serverIdx === idx;
                      const isHighlight = srv.name.startsWith('Highlight');
                      return (
                        <button
                          key={idx}
                          onClick={() => setServerIdx(idx)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#1ce783] text-black border-[#1ce783] shadow-[0_0_15px_rgba(28,231,131,0.3)]'
                              : 'bg-black/60 border-white/10 text-gray-300 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {isHighlight ? (
                            <Film className="w-3 h-3 text-amber-400 shrink-0" />
                          ) : (
                            <Play className={`w-3 h-3 ${isSelected ? 'fill-current text-black' : 'text-[#1ce783]'}`} />
                          )}
                          <span className="truncate max-w-[160px]">{srv.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Live Right Now on Air Row */}
        {activeCategory === 'All' && liveNowEvents.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  Live Right Now on Air
                </h2>
              </div>
              <span
                className="text-xs font-bold text-[#1ce783] flex items-center gap-1 cursor-pointer"
                onClick={() => setActiveCategory('LIVE NOW')}
              >
                View All Live ({liveNowEvents.length}) <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {liveNowEvents.slice(0, 4).map((ev, index) => renderHuluCard(ev, index))}
            </div>
          </section>
        )}

        {/* Main Filtered Catalog Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-[#1ce783]" />
              {activeCategory} Catalog ({filteredEvents.length})
            </h2>
            {multiView && (
              <span className="text-xs text-[#1ce783] animate-pulse">
                Click &quot;+ Screen 2&quot; on any thumbnail below to populate the second view
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEvents.map((ev, index) => renderHuluCard(ev, index))}
          </div>
        </section>
      </main>

      {/* Floating Score Trigger for Mobile Match Center */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setMobileSheetOpen(!mobileSheetOpen)}
          className="p-3.5 rounded-full bg-[#1ce783] text-black shadow-[0_0_25px_rgba(28,231,131,0.5)] font-black flex items-center gap-2"
        >
          <Flame className="w-5 h-5 fill-current" />
          <span className="text-xs uppercase">Scores</span>
        </button>
      </div>

      {/* Mobile Match Center Bottom Sheet */}
      {mobileSheetOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e121a] rounded-t-3xl border-t border-[#1ce783]/40 p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#1ce783]" /> Mobile Match Center
              </h3>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {events.slice(0, 8).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setServerIdx(0);
                    setMobileSheetOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#1ce783]">{ev.league}</span>
                    <h4 className="text-xs font-black text-white">{ev.title}</h4>
                  </div>
                  <span className="text-xs font-black px-2 py-1 rounded-md bg-white/10 text-white">
                    {ev.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Hulu 3D Thumbnail Card
  function renderHuluCard(ev, index) {
    const isSelected = selectedEvent?.id === ev.id;
    const isPinned = pinnedIds.includes(ev.id);
    const isMedia = ev.category === 'Movies' || ev.category === 'Shows';

    return (
      <div
        key={ev.id}
        tabIndex={0}
        style={{ animationDelay: `${Math.min(index * 35, 400)}ms` }}
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
        className={`catalog-card animate-card-enter opacity-0 group cursor-pointer rounded-2xl overflow-hidden bg-[#0e121a] border outline-none flex flex-col justify-between ${
          isSelected
            ? 'border-[#1ce783] ring-2 ring-[#1ce783]/60 bg-[#141a26]'
            : 'border-white/10 hover:border-[#1ce783]/70 focus-visible:border-[#1ce783]'
        }`}
      >
        {/* Dynamic Green Spotlight Glow */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background:
              'radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(28, 231, 131, 0.16), transparent 70%)'
          }}
        />

        {/* Thumbnail Visual Area */}
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#131722] via-[#0b0e14] to-black">
          {ev.backdrop ? (
            <img
              src={ev.backdrop}
              alt={ev.title}
              className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-around px-4">
              <div className="absolute -left-6 -top-6 w-32 h-32 bg-[#1ce783]/10 rounded-full blur-2xl group-hover:bg-[#1ce783]/20 transition-all duration-500" />

              {/* Away Team */}
              <div className="relative z-10 flex flex-col items-center gap-1.5 transform group-hover:-translate-x-1.5 group-hover:scale-110 transition-all duration-500">
                <img
                  src={ev.awayTeam?.logo}
                  alt={ev.awayTeam?.name}
                  className="w-14 h-14 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                />
                <span className="text-[11px] font-black text-gray-200 max-w-[90px] truncate">
                  {ev.awayTeam?.name}
                </span>
              </div>

              {/* Score / VS Badge */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/75 border border-white/10 backdrop-blur-md group-hover:border-[#1ce783]/60 transition-colors">
                  <span className="text-base font-black text-white">{ev.awayTeam?.score}</span>
                  <span className="text-[10px] font-black text-[#1ce783]">VS</span>
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
                <span className="text-[11px] font-black text-gray-200 max-w-[90px] truncate">
                  {ev.homeTeam?.name}
                </span>
              </div>
            </div>
          )}

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e121a] via-[#0e121a]/30 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[#1ce783] border border-[#1ce783]/30">
              {ev.league}
            </span>

            <div className="flex items-center gap-1.5">
              {ev.isLive ? (
                <span className="flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  {ev.status}
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/80 text-gray-300 border border-white/10">
                  {ev.status}
                </span>
              )}

              <button
                onClick={(e) => togglePin(ev.id, e)}
                className={`p-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 transition transform hover:scale-110 ${
                  isPinned ? 'text-amber-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

          {/* Hover Center Play Button */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
            <div className="w-12 h-12 rounded-full bg-[#1ce783] text-black flex items-center justify-center shadow-xl shadow-[#1ce783]/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        {/* Card Details & Slide-Up Quick Action Bar */}
        <div className="relative z-20 p-4 pt-2 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white group-hover:text-[#1ce783] transition-colors line-clamp-1">
              {ev.title}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
              {isMedia
                ? `${ev.rating || '99% Match'} • ${ev.year || '2026'} • Full Stream`
                : `${ev.broadcast || 'LIVE WIRE HD'} • ${ev.servers?.length || 1} Streams Available`}
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
            <span className="text-[11px] text-gray-300 group-hover:text-white font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1ce783] group-hover:animate-ping" />
              {isSelected ? 'Watching Now' : isMedia ? 'Watch Movie' : 'Watch Live Broadcast'}
            </span>

            {multiView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSecondaryEvent(ev);
                }}
                className="px-2.5 py-1 rounded-full bg-[#1ce783]/20 hover:bg-[#1ce783] hover:text-black text-[10px] font-black text-[#1ce783] transition"
              >
                + Screen 2
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
