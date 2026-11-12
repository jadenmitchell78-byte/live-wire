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
  Sparkles,
  ChevronRight,
  Info
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
        name: 'Server 1 (Live Game Broadcast HD)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/houston-rockets-vs-golden-state-warriors/1'
      },
      {
        name: 'Server 2 (ESPN Live Feed)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/espn/1'
      },
      {
        name: 'Server 3 (Red Bull TV Sports HLS)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
      },
      {
        name: 'Server 4 (CBS Sports HQ)',
        type: 'hls',
        proxyRequired: true,
        url: 'https://dai.google.com/linear/hls/event/Sid4xiTQTkCT1SLu6rjUSQ/master.m3u8'
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
        name: 'Server 1 (Live Broadcast HD)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/portland-trail-blazers-vs-oklahoma-city-thunder/1'
      },
      {
        name: 'Server 2 (NBA TV Feed)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/nba-tv/1'
      },
      {
        name: 'Server 3 (Red Bull TV Sports)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
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
        name: 'Server 1 (ESPN Live Stream)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/espn/1'
      },
      {
        name: 'Server 2 (Red Bull TV Sports HLS)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
      },
      {
        name: 'Server 3 (CBS Sports Direct HLS)',
        type: 'hls',
        proxyRequired: true,
        url: 'https://dai.google.com/linear/hls/event/Sid4xiTQTkCT1SLu6rjUSQ/master.m3u8'
      }
    ]
  },
  {
    id: 'ch-nfl',
    title: 'NFL Network & NFL RedZone 24/7',
    shortTitle: 'NFL Network',
    category: 'Channels',
    league: 'NFL NETWORK',
    status: 'LIVE 24/7',
    isLive: true,
    broadcast: 'NFL LIVE WIRE',
    backdrop: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=1200&q=80',
    homeTeam: {
      name: 'NFL Network',
      score: 'LIVE',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png'
    },
    awayTeam: {
      name: 'RedZone',
      score: '24/7',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png'
    },
    servers: [
      {
        name: 'Server 1 (NFL Network HD)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/nfl-network/1'
      },
      {
        name: 'Server 2 (NFL RedZone)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/nfl-redzone/1'
      },
      {
        name: 'Server 3 (Red Bull Sports)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
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
        name: 'Server 1 (CBS Sports Direct HLS)',
        type: 'hls',
        proxyRequired: true,
        url: 'https://dai.google.com/linear/hls/event/Sid4xiTQTkCT1SLu6rjUSQ/master.m3u8'
      },
      {
        name: 'Server 2 (Red Bull TV Sports HLS)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
      }
    ]
  },
  {
    id: 'mov-1',
    title: 'Nightfall Protocol: The Final Directive',
    shortTitle: 'Action • 4K UHD',
    category: 'Movies',
    league: 'HULU PREMIERE',
    status: '4K HDR',
    isLive: false,
    rating: '98% Match',
    year: '2026',
    duration: '2h 14m',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    servers: [
      {
        name: 'Server 1 (Full Movie Stream)',
        type: 'embed',
        url: 'https://vidsrc.xyz/embed/movie/tt15398776'
      },
      {
        name: 'Server 2 (Direct 1080p Stream)',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      }
    ]
  },
  {
    id: 'show-1',
    title: 'Hardwood Dynasty: Warriors vs The West',
    shortTitle: 'Season 3 • Episode 5',
    category: 'Shows',
    league: 'ORIGINAL SERIES',
    status: 'S3:E5',
    isLive: false,
    rating: '99% Match',
    year: '2026',
    duration: '52m',
    backdrop: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1200&q=80',
    servers: [
      {
        name: 'Server 1 (Full Episode 1080p)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
      }
    ]
  }
];

function StreamPlayer({ stream, title, subtitle, useProxy, isMuted, onToggleMute }) {
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

    if (stream.type === 'embed') {
      setStatus('loading');
      const timer = setTimeout(() => setStatus('playing'), 1100);
      return () => clearTimeout(timer);
    }

    const video = videoRef.current;
    if (!video || !finalUrl) return;

    setStatus('loading');

    const stallTimeout = setTimeout(() => {
      if (video.readyState >= 2) {
        setStatus('playing');
      }
    }, 4500);

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
      clearTimeout(stallTimeout);
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
      {/* Top Status Overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-[#06080b]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 max-w-[75%]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#1ce783] animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-white truncate">
            {title}
          </span>
          {subtitle && (
            <span className="text-[11px] text-gray-400 hidden sm:inline truncate">
              • {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-[#06080b]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#1ce783]/30 text-[10px] font-mono font-bold text-[#1ce783]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {stream?.type === 'embed' ? 'LIVE HD' : resolution}
        </div>
      </div>

      {/* Loading Spinner */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#06080b]/90 pointer-events-none">
          <RefreshCw className="w-8 h-8 text-[#1ce783] animate-spin mb-2.5" />
          <span className="text-xs text-gray-200 font-semibold tracking-wider uppercase">
            Connecting to Live Broadcast...
          </span>
        </div>
      )}

      {/* Error Recovery Overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#06080b]/95 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
          <p className="text-sm font-bold text-white mb-1">Feed Unavailable on This Server</p>
          <p className="text-xs text-gray-400 max-w-md mb-4">
            Select another Server below in the Match Center or toggle CORS Proxy.
          </p>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="px-5 py-2 bg-[#1ce783] hover:bg-[#00ed82] text-black text-xs font-black rounded-full flex items-center gap-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Stream
          </button>
        </div>
      )}

      {/* Render Embed OR Video */}
      {stream?.type === 'embed' ? (
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

      {/* Floating Controls */}
      {stream?.type !== 'embed' && (
        <div className="absolute bottom-12 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-full bg-black/80 hover:bg-[#1ce783] hover:text-black text-white border border-white/10 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handlePiP}
            className="p-2.5 rounded-full bg-black/80 hover:bg-[#1ce783] hover:text-black text-white border border-white/10 transition"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRetrySeed((s) => s + 1)}
            className="p-2.5 rounded-full bg-black/80 hover:bg-[#1ce783] hover:text-black text-white border border-white/10 transition"
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

  // Resilient catalog fetch: Fallback to INITIAL_HULU_CATALOG if API is slow or offline
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
          setEvents(data.events);
          setSelectedEvent((prev) => {
            const match = data.events.find((i) => i.id === prev?.id);
            return match || data.events[0];
          });
          return;
        }
      }
    } catch (e) {
      console.warn('API Catalog fallback triggered:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
    const interval = setInterval(fetchCatalog, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch optional in-game ESPN video clips for the selected matchup
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
              v.links?.source?.full?.href;
            if (!url) return null;
            return {
              name: `Highlight: ${v.headline || 'In-Game Play'}`,
              type: 'hls',
              url
            };
          })
          .filter(Boolean)
          .slice(0, 4);

        if (extracted.length > 0) {
          setGameClips(extracted);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [selectedEvent?.id]);

  const combinedServers = useMemo(() => {
    const base = selectedEvent?.servers || [];
    return [...base, ...gameClips];
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

  const liveNowEvents = useMemo(() => events.filter((ev) => ev.isLive), [events]);
  const networkEvents = useMemo(() => events.filter((ev) => ev.category === 'Channels'), [events]);
  const movieEvents = useMemo(
    () => events.filter((ev) => ev.category === 'Movies' || ev.category === 'Shows'),
    [events]
  );

  const handleLoadCustomStream = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const isEmbed = !customUrl.includes('.m3u8') && !customUrl.includes('.mp4');
    const customEvent = {
      id: `custom-${Date.now()}`,
      title: 'Custom User Live Feed',
      category: 'Channels',
      league: isEmbed ? 'EMBED STREAM' : 'CUSTOM HLS',
      status: 'LIVE',
      isLive: true,
      homeTeam: {
        name: 'Custom',
        score: 'LIVE',
        logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png'
      },
      awayTeam: {
        name: 'Stream',
        score: 'HD',
        logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png'
      },
      servers: [
        {
          name: 'Custom Server 1',
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
    <div className="min-h-screen flex flex-col bg-[#06080b] text-gray-100">
      {/* Hulu Sleek Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#06080b]/95 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Hulu Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveCategory('All')}>
              <span className="font-black text-xl tracking-tight text-white flex items-center">
                LIVE<span className="text-[#1ce783]">WIRE</span>
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#1ce783] animate-pulse" />
            </div>
            <span className="hidden md:inline-block text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#1ce783]/15 text-[#1ce783] border border-[#1ce783]/30">
              HULU + LIVE TV
            </span>
          </div>

          {/* Search Bar */}
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowCustomModal(!showCustomModal)}
              className="px-3.5 py-2 rounded-full bg-[#121620] hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 flex items-center gap-2 transition"
              title="Paste custom M3U8 or Embed stream"
            >
              <PlusCircle className="w-4 h-4 text-[#1ce783]" />
              <span className="hidden sm:inline">Add URL</span>
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

      {/* Custom Stream Input Modal */}
      {showCustomModal && (
        <div className="bg-[#0b0f17] border-b border-[#1ce783]/30 px-4 py-3">
          <form onSubmit={handleLoadCustomStream} className="max-w-[1600px] mx-auto flex flex-col sm:flex-row gap-2.5">
            <input
              type="url"
              required
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Paste any direct .m3u8 sports feed or iframe embed URL..."
              className="flex-1 bg-black/70 border border-white/15 rounded-full px-4 py-2 text-xs text-white outline-none focus:border-[#1ce783]"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-[#1ce783] hover:bg-[#00ed82] text-black text-xs font-black rounded-full transition shadow-[0_0_15px_rgba(28,231,131,0.3)]"
            >
              Play Custom Stream
            </button>
          </form>
        </div>
      )}

      {/* Hulu Category Navigation Tabs */}
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
                {cat === 'LIVE NOW' && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-ping" />}
                {cat}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-8">
        {/* Hulu Spotlight Hero Banner (Featured Game / Selected Stream) */}
        {selectedEvent && (
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0d121c] via-[#090d14] to-[#06080b] border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
              {/* Left Column: Game Info & Hero Call-To-Action */}
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
                    ? `${selectedEvent.rating || '98% Match'} • ${selectedEvent.year || '2026'} • Full Length Feature Stream`
                    : `Live Game Broadcast • ${selectedEvent.broadcast || 'LIVE WIRE HD'} • ${combinedServers.length} Dedicated Broadcast Feeds`}
                </p>

                {/* Scoreboard Widget */}
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

                {/* Hulu Action Buttons */}
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
                    onClick={() => setMultiView(!multiView)}
                    className={`px-5 py-3 rounded-full text-xs font-bold transition flex items-center gap-2 border ${
                      multiView
                        ? 'bg-[#1ce783]/20 border-[#1ce783] text-[#1ce783]'
                        : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" /> Multi-View {multiView ? 'ON' : '2-Screen'}
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

              {/* Right Column: Hulu Live Media Player */}
              <div className="lg:col-span-7 space-y-3">
                <StreamPlayer
                  stream={activeServer}
                  title={selectedEvent.title}
                  subtitle={selectedEvent.league}
                  useProxy={useProxy}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                />

                {/* Broadcast Server Selector Pill Carousel */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                  <span className="text-[11px] font-black uppercase text-gray-400 shrink-0 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#1ce783]" /> Feeds ({combinedServers.length}):
                  </span>
                  {combinedServers.map((srv, idx) => {
                    const isSelected = serverIdx === idx;
                    const isHighlight =
                      srv.name.startsWith('Live Highlight') || srv.name.startsWith('Highlight:');
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
                        <span className="truncate max-w-[150px]">{srv.name}</span>
                        <span className={`text-[9px] uppercase px-1 rounded ${isSelected ? 'bg-black/20' : 'bg-white/10'}`}>
                          {srv.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Multi-View Dual Screen Section */}
        {multiView && secondaryEvent && (
          <section className="p-4 sm:p-6 rounded-3xl bg-[#0c1018] border border-[#1ce783]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#1ce783] flex items-center gap-2">
                <Grid className="w-4 h-4" /> Multi-View Screen #2 ({secondaryEvent.title})
              </span>
              <button
                onClick={() => setMultiView(false)}
                className="text-xs font-bold text-gray-400 hover:text-white"
              >
                Close Screen 2
              </button>
            </div>
            <div className="max-w-3xl mx-auto">
              <StreamPlayer
                stream={secondaryEvent.servers?.[0]}
                title={secondaryEvent.title}
                subtitle={`${secondaryEvent.league} • SCREEN 2`}
                useProxy={useProxy}
                isMuted={true}
                onToggleMute={() => {}}
              />
            </div>
          </section>
        )}

        {/* Row 1: Trending Live Sports Right Now */}
        {activeCategory === 'All' && liveNowEvents.length > 0 && (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  Live Now on Hulu + Live Wire
                </h2>
              </div>
              <span className="text-xs font-bold text-[#1ce783] flex items-center gap-1 cursor-pointer" onClick={() => setActiveCategory('LIVE NOW')}>
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
                Click &quot;+ Screen 2&quot; on any game below to load into the second view
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEvents.map((ev, index) => renderHuluCard(ev, index))}
          </div>
        </section>
      </main>
    </div>
  );

  // Hulu-Styled Thumbnail Card Component
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
        {/* Dynamic Green Radial Spotlight */}
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

          {/* Hover Play Button */}
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
                ? `${ev.rating || '98% Match'} • ${ev.year || '2026'} • Full Stream`
                : `${ev.broadcast || 'LIVE WIRE HD'} • ${ev.servers?.length || 1} Streams`}
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
