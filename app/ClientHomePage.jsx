'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  BookOpen,
  Box,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Clock,
  Film,
  Flame,
  Grid,
  Heart,
  History,
  Info,
  Maximize2,
  Moon,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  SkipForward,
  Sparkles,
  Star,
  Trophy,
  Tv,
  X,
  ZoomIn,
} from 'lucide-react';
import StreamPlayer from './components/StreamPlayer';
import NflRedZonePanel from './components/NflRedZonePanel';
import { MediaCard, MediaRow, SkeletonRow, formatCountdown, FALLBACK_IMG } from './components/MediaCard';
import { EpisodeGrid } from './components/Episodes';
import DetailsModal from './components/DetailsModal';
import VipAccessGate, { useVipAccess } from './components/VipAccessGate';
import { isOnDemand, isSeries, resolveServers } from '../lib/sources';

const CharacterStage = dynamic(() => import('./components/CharacterStage'), {
  ssr: false,
  loading: () => (
    <div className="mx-4 sm:mx-8 my-6 h-[480px] rounded-2xl bg-[#090A0F] border border-white/10 animate-pulse flex items-center justify-center text-xs font-mono text-gray-400">
      Initializing 3D Character Stage (Draco / KTX2 Pipeline)…
    </div>
  ),
});

const WebtoonReader = dynamic(() => import('./components/WebtoonReader'), {
  ssr: false,
  loading: () => (
    <div className="mx-4 sm:mx-8 my-6 h-[480px] rounded-2xl bg-[#090A0F] border border-white/10 animate-pulse flex items-center justify-center text-xs font-mono text-gray-400">
      Loading Vertical Continuous-Scroll Webtoon Engine…
    </div>
  ),
});

const SPORTS = new Set(['NFL', 'NBA', 'NHL', 'MLB', 'College', 'Soccer', 'MMA', 'Tennis', 'Sports']);
const TAB_IDS = new Set([
  'Home', 'LIVE NOW', 'Studio3D', 'Webtoons', 'Channels', 'Anime', 'Shows', 'Movies', 'Sports', 'NFL', 'NBA', 'NHL', 'MLB',
  'College', 'Soccer', 'MMA', 'Tennis', 'Pinned', 'History',
]);
const FIT_ORDER = ['contain', 'cover', 'zoom'];
const FIT_LABEL = { contain: 'Fit', cover: 'Fill', zoom: 'Zoom' };

const loadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const saveJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export default function ClientHomePage({ initialCatalog }) {
  const initialEvents = initialCatalog?.events || [];
  const [events, setEvents] = useState(initialEvents);
  const [rows, setRows] = useState(initialCatalog?.rows || {});
  const [updatedAt, setUpdatedAt] = useState(initialCatalog?.updatedAt || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteResults, setRemoteResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [secondaryEvent, setSecondaryEvent] = useState(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [serverIdx, setServerIdx] = useState(0);
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [startAt, setStartAt] = useState(0);
  const [useProxy, setUseProxy] = useState(false);
  const [allowThirdParty, setAllowThirdParty] = useState(true);
  const [multiView, setMultiView] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [dimMode, setDimMode] = useState(false);
  const [fitMode, setFitMode] = useState('contain');
  const [isMuted, setIsMuted] = useState(false);
  const [vipOddsOpen, setVipOddsOpen] = useState(false);
  const [vipGateOpen, setVipGateOpen] = useState(false);
  const vipAccess = useVipAccess();
  const [animeLangFilter, setAnimeLangFilter] = useState('all');

  const [pinned, setPinned] = useState([]);
  const [history, setHistory] = useState([]);
  const [favTeams, setFavTeams] = useState(['49ers']);
  const [detailsEvent, setDetailsEvent] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [now, setNow] = useState(0);
  const [toast, setToast] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const searchInputRef = useRef(null);
  const toastTimer = useRef(null);
  const rotationRef = useRef(0);
  const eventsRef = useRef(events);
  const historyRef = useRef(history);
  const selectedRef = useRef(selectedEvent);
  const episodeRef = useRef({ season: 1, episode: 1 });
  eventsRef.current = events;
  historyRef.current = history;
  selectedRef.current = selectedEvent;
  episodeRef.current = { season: activeSeason, episode: activeEpisode };

  const pinnedIds = useMemo(() => pinned.map((p) => p.id), [pinned]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3500);
  }, []);

  const recordHistory = useCallback((ev, patch) => {
    if (!ev) return;
    setHistory((prev) => {
      const existing = prev.find((h) => h.id === ev.id) || {};
      const entry = {
        ...existing,
        ...patch,
        id: ev.id,
        ev: { ...ev, description: (ev.description || '').slice(0, 300) },
        updatedAt: Date.now(),
      };
      const next = [entry, ...prev.filter((h) => h.id !== ev.id)].slice(0, 30);
      saveJson('livewire_history', next);
      return next;
    });
  }, []);

  const startPlayback = useCallback(
    (ev, season = 1, episode = 1, opts = {}) => {
      if (!ev) return;
      const hist = opts.hist || historyRef.current;
      const prev = hist.find((h) => h.id === ev.id);
      const sameEp = Boolean(prev) && (prev.season || 1) === season && (prev.episode || 1) === episode;
      setSelectedEvent(ev);
      setActiveSeason(season);
      setActiveEpisode(episode);
      setServerIdx(0);
      setFitMode('contain');
      setStartAt(!opts.fromStart && sameEp && prev.position ? prev.position : 0);
      setPlayerOpen(true);
      setDetailsEvent(null);
      if (!ev.isLive) {
        recordHistory(ev, sameEp && !opts.fromStart ? { season, episode } : { season, episode, position: 0, duration: 0 });
      }
      if (!opts.skipPush) {
        const params = new URLSearchParams(window.location.search);
        params.set('watch', ev.id);
        if (isSeries(ev)) {
          params.set('s', String(season));
          params.set('e', String(episode));
        } else {
          params.delete('s');
          params.delete('e');
        }
        window.history.pushState(null, '', `?${params.toString()}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [recordHistory],
  );

  const applyUrl = (params, hist = historyRef.current) => {
    const tab = params.get('tab');
    setActiveTab(tab && TAB_IDS.has(tab) ? tab : 'Home');
    setSearchQuery(params.get('q') || '');
    const watch = params.get('watch');
    if (watch) {
      const h = hist.find((x) => x.id === watch);
      const ev = eventsRef.current.find((e) => e.id === watch) || h?.ev;
      if (ev) {
        startPlayback(ev, Number(params.get('s')) || h?.season || 1, Number(params.get('e')) || h?.episode || 1, {
          skipPush: true,
          hist,
        });
        return;
      }
    }
    setPlayerOpen(false);
  };
  const applyUrlRef = useRef(applyUrl);
  applyUrlRef.current = applyUrl;

  // Mount: restore local state + deep link
  useEffect(() => {
    const legacyPins = loadJson('livewire_pins', []);
    let pins = loadJson('livewire_pins_v2', null);
    if (!Array.isArray(pins)) {
      pins = initialEvents.filter((e) => Array.isArray(legacyPins) && legacyPins.includes(e.id));
    }
    const hist = loadJson('livewire_history', []);
    setPinned(pins);
    setHistory(Array.isArray(hist) ? hist : []);
    setFavTeams(loadJson('livewire_teams', ['49ers']));
    setAllowThirdParty(loadJson('livewire_thirdparty', true) !== false);
    setNow(Date.now());
    setHydrated(true);
    applyUrlRef.current(new URLSearchParams(window.location.search), Array.isArray(hist) ? hist : []);

    const onScroll = () => setScrolled(window.scrollY > 20);
    const onPop = () => applyUrlRef.current(new URLSearchParams(window.location.search));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('popstate', onPop);
    const tick = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onPop);
      clearInterval(tick);
    };
  }, []);

  // Keep URL in sync (shareable links)
  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams();
    if (activeTab !== 'Home') params.set('tab', activeTab);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (playerOpen && selectedEvent) {
      params.set('watch', selectedEvent.id);
      if (isSeries(selectedEvent)) {
        params.set('s', String(activeSeason));
        params.set('e', String(activeEpisode));
      }
    }
    const qs = params.toString();
    const target = qs ? `?${qs}` : '';
    if (target !== window.location.search) {
      window.history.replaceState(null, '', target || window.location.pathname);
    }
  }, [hydrated, activeTab, searchQuery, playerOpen, selectedEvent?.id, activeSeason, activeEpisode]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setShowCustomModal(false);
        if (typing) searchInputRef.current?.blur();
      } else if ((e.key === 'n' || e.key === 'N') && !typing && playerOpen) {
        setServerIdx((i) => i + 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playerOpen]);

  // Debounced remote search (anime / TV / archive)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setRemoteResults([]);
      setSearching(false);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (!cancelled) setRemoteResults(Array.isArray(data.results) ? data.results : []);
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

  const fetchCatalog = useCallback(
    async (rotateNext = false) => {
      if (!rotateNext && typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      setLoading(true);
      try {
        let url = '/api/catalog';
        if (rotateNext) {
          rotationRef.current += 1;
          url = `/api/catalog?rotate=${rotationRef.current % 8}`;
        }
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        const list = Array.isArray(data.events) ? data.events : [];
        if (list.length > 0) {
          setEvents((prev) => [...prev.filter((e) => String(e.id).startsWith('custom-')), ...list]);
          setRows(data.rows || {});
          setUpdatedAt(data.updatedAt || new Date().toISOString());
          setSelectedEvent((prev) => (prev ? list.find((e) => e.id === prev.id) || prev : prev));
          setSecondaryEvent((prev) => (prev ? list.find((e) => e.id === prev.id) || prev : prev));
          if (rotateNext) showToast('Catalog rotated: new movies & shows loaded');
        }
      } catch {
        if (rotateNext) showToast('Could not refresh the catalog');
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  const hasLiveSports = useMemo(() => events.some((e) => e.isLive && SPORTS.has(e.category)), [events]);

  useEffect(() => {
    if (initialEvents.length <= 20) fetchCatalog(false);
  }, []);

  // Live scores: refresh every 30s while games are live, otherwise every 60s
  useEffect(() => {
    const id = setInterval(() => fetchCatalog(false), hasLiveSports ? 30000 : 60000);
    return () => clearInterval(id);
  }, [hasLiveSports, fetchCatalog]);

  const togglePin = useCallback((ev, e) => {
    e?.stopPropagation?.();
    setPinned((prev) => {
      const next = prev.some((p) => p.id === ev.id)
        ? prev.filter((p) => p.id !== ev.id)
        : [{ ...ev, description: (ev.description || '').slice(0, 300) }, ...prev];
      saveJson('livewire_pins_v2', next);
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (ev) => {
      if (isOnDemand(ev)) setDetailsEvent(ev);
      else startPlayback(ev, 1, 1);
    },
    [startPlayback],
  );

  const handleResume = useCallback(
    (ev) => {
      const h = historyRef.current.find((x) => x.id === ev.id);
      startPlayback(ev, h?.season || 1, h?.episode || 1);
    },
    [startPlayback],
  );

  const closeDetails = useCallback(() => setDetailsEvent(null), []);

  const toggleThirdParty = () => {
    if (!allowThirdParty) {
      const ok = window.confirm(
        'Third-party embed sites are unlicensed and may show pop-ups, ads, or redirects. Enable them anyway?',
      );
      if (!ok) return;
    }
    const next = !allowThirdParty;
    setAllowThirdParty(next);
    setServerIdx(0);
    saveJson('livewire_thirdparty', next);
    showToast(next ? '3rd-party sources ON' : '3rd-party sources OFF');
  };

  const editTeams = () => {
    const input = window.prompt('Your teams (comma separated)', favTeams.join(', '));
    if (input === null) return;
    const next = input.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10);
    setFavTeams(next);
    saveJson('livewire_teams', next);
  };

  const clearHistory = () => {
    setHistory([]);
    saveJson('livewire_history', []);
  };

  const toggleMultiView = useCallback(() => {
    setMultiView((prev) => {
      const next = !prev;
      if (next) {
        const candidates = eventsRef.current.filter(
          (e) => e.isLive || SPORTS.has(e.category) || e.category === 'Channels',
        );
        if (!selectedRef.current && candidates[0]) {
          startPlayback(candidates[0], 1, 1);
        }
        if (!secondaryEvent) {
          const primaryId = selectedRef.current?.id || candidates[0]?.id;
          const fallbackSecond =
            candidates.find((e) => e.id !== primaryId) ||
            eventsRef.current.find((e) => e.id !== primaryId) ||
            candidates[0];
          if (fallbackSecond) setSecondaryEvent(fallbackSecond);
        }
        showToast('Multi-View ON: Pick Screen #2 below the player or tap #2 on any card');
      } else {
        showToast('Multi-View OFF');
      }
      return next;
    });
  }, [secondaryEvent, startPlayback, showToast]);

  // ---------- Servers ----------
  const resolvedServers = useMemo(
    () => resolveServers(selectedEvent, activeSeason, activeEpisode),
    [selectedEvent, activeSeason, activeEpisode],
  );
  const visibleServers = useMemo(() => {
    const base = allowThirdParty ? resolvedServers : resolvedServers.filter((s) => !s.thirdParty);
    if (selectedEvent?.mediaType !== 'anime' || animeLangFilter === 'all') return base;
    const filtered = base.filter((s) =>
      animeLangFilter === 'dub' ? /dub/i.test(s.name) : /sub|mal/i.test(s.name),
    );
    return filtered.length > 0 ? filtered : base;
  }, [resolvedServers, allowThirdParty, selectedEvent?.mediaType, animeLangFilter]);
  const hiddenCount = resolvedServers.length - visibleServers.length;
  const safeIdx = Math.min(serverIdx, Math.max(visibleServers.length - 1, 0));
  const activeServer = visibleServers[safeIdx];
  const hasNext = safeIdx < visibleServers.length - 1;

  const nextServer = useCallback(() => {
    setServerIdx(Math.min(safeIdx + 1, Math.max(visibleServers.length - 1, 0)));
  }, [safeIdx, visibleServers.length]);

  const handleFail = useCallback(
    (reason) => {
      if (safeIdx < visibleServers.length - 1) {
        const from = visibleServers[safeIdx]?.name || 'Server';
        const to = visibleServers[safeIdx + 1]?.name || 'next server';
        showToast(`${from} ${reason === 'timeout' ? 'timed out' : 'failed'}, trying ${to}`);
        const target = safeIdx;
        setTimeout(() => setServerIdx((i) => (i === target ? target + 1 : i)), 1200);
      } else {
        showToast('All servers tried. Retry, toggle Proxy, or use Open Source.');
      }
    },
    [safeIdx, visibleServers, showToast],
  );

  const handleProgress = useCallback(
    (position, duration) => {
      const ev = selectedRef.current;
      if (!ev || ev.isLive || !Number.isFinite(duration) || duration <= 0) return;
      recordHistory(ev, { position, duration, ...episodeRef.current });
    },
    [recordHistory],
  );

  const changeEpisode = (season, episode) => {
    setActiveSeason(season);
    setActiveEpisode(episode);
    setServerIdx(0);
    setStartAt(0);
    recordHistory(selectedEvent, { season, episode, position: 0, duration: 0 });
  };

  const secondaryStream = useMemo(() => {
    const list = resolveServers(secondaryEvent, 1, 1);
    return (allowThirdParty ? list : list.filter((s) => !s.thirdParty))[0];
  }, [secondaryEvent, allowThirdParty]);

  // ---------- Catalog views ----------
  const eventMap = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);
  const byIds = useCallback((ids = []) => ids.map((id) => eventMap.get(id)).filter(Boolean), [eventMap]);

  const historyMap = useMemo(() => new Map(history.map((h) => [h.id, h])), [history]);
  const continueItems = useMemo(
    () => history.filter((h) => h.ev && !h.ev.isLive).map((h) => eventMap.get(h.id) || h.ev).slice(0, 20),
    [history, eventMap],
  );
  const pinnedItems = useMemo(() => pinned.map((p) => eventMap.get(p.id) || p), [pinned, eventMap]);

  const teamItems = useMemo(() => {
    const keys = favTeams.map((t) => t.toLowerCase()).filter(Boolean);
    if (!keys.length) return [];
    return events.filter(
      (e) =>
        SPORTS.has(e.category) &&
        keys.some((k) => `${e.title} ${e.homeTeam?.name || ''} ${e.awayTeam?.name || ''}`.toLowerCase().includes(k)),
    );
  }, [events, favTeams]);

  const liveItems = useMemo(() => events.filter((e) => e.isLive), [events]);
  const soonItems = useMemo(() => {
    if (!now) return [];
    return events
      .filter(
        (e) =>
          SPORTS.has(e.category) &&
          e.isUpcoming &&
          e.startTime &&
          e.startTime > now - 10 * 60000 &&
          e.startTime - now < 12 * 3600e3,
      )
      .sort((a, b) => a.startTime - b.startTime);
  }, [events, now]);
  const airingItems = useMemo(() => byIds(rows.airingToday), [byIds, rows]);
  const trendingAnimeItems = useMemo(() => byIds(rows.trendingAnime), [byIds, rows]);
  const topRatedItems = useMemo(() => byIds(rows.topRated), [byIds, rows]);
  const channelItems = useMemo(() => events.filter((e) => e.category === 'Channels'), [events]);
  const movieItems = useMemo(() => events.filter((e) => e.category === 'Movies'), [events]);
  const animeItems = useMemo(
    () => events.filter((e) => e.category === 'Anime' || e.mediaType === 'anime'),
    [events],
  );
  const showItems = useMemo(
    () => events.filter((e) => e.category === 'Shows' && e.mediaType !== 'anime'),
    [events],
  );
  const sportsItems = useMemo(() => events.filter((e) => SPORTS.has(e.category)), [events]);

  const becauseItems = useMemo(() => {
    if (!pinned.length) return [];
    const genres = new Set(pinned.flatMap((p) => p.genres || []));
    const cats = new Set(pinned.map((p) => p.category));
    return events
      .filter(
        (e) =>
          !pinnedIds.includes(e.id) &&
          ((e.genres || []).some((g) => genres.has(g)) ||
            (cats.has(e.category) && !SPORTS.has(e.category) && e.category !== 'Channels')),
      )
      .slice(0, 24);
  }, [events, pinned, pinnedIds]);

  const searchedEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return events;
    const local = events.filter((ev) =>
      [ev.title, ev.league, ev.category, ev.homeTeam?.name, ev.awayTeam?.name, ...(ev.genres || [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
    const seen = new Set(local.map((e) => e.id));
    return [...local, ...remoteResults.filter((r) => !seen.has(r.id))];
  }, [events, remoteResults, searchQuery]);

  const visibleGridEvents = useMemo(() => {
    if (searchQuery.trim()) return searchedEvents;
    switch (activeTab) {
      case 'LIVE NOW':
        return liveItems;
      case 'Anime':
        return animeItems;
      case 'Sports':
        return sportsItems;
      case 'Pinned':
        return pinnedItems;
      case 'History':
        return continueItems;
      default:
        return events.filter((e) => e.category === activeTab);
    }
  }, [searchQuery, searchedEvents, activeTab, liveItems, animeItems, sportsItems, pinnedItems, continueItems, events]);

  const menuItems = useMemo(
    () => [
      { id: 'Home', label: 'Home', icon: Grid, count: events.length },
      { id: 'LIVE NOW', label: 'Live Now (Streamed.pk)', icon: Flame, count: liveItems.length },
      { id: 'NBA', label: 'NBA Live Plugin', icon: Trophy, count: events.filter((e) => e.category === 'NBA').length },
      { id: 'Studio3D', label: '3D Character Stage', icon: Box, count: 3 },
      { id: 'Webtoons', label: 'Webtoon Studio', icon: BookOpen, count: 3 },
      { id: 'Anime', label: 'Anime (Sub & Dub)', icon: Sparkles, count: animeItems.length },
      { id: 'Channels', label: '24/7 Live TV', icon: Tv, count: channelItems.length },
      { id: 'Shows', label: 'TV Series', icon: Clapperboard, count: showItems.length },
      { id: 'Movies', label: 'Movies', icon: Film, count: movieItems.length },
      { id: 'History', label: 'Continue Watching', icon: History, count: continueItems.length },
      { id: 'Sports', label: 'All Sports', icon: Trophy, count: sportsItems.length },
      ...['NFL', 'NHL', 'MLB', 'College', 'Soccer', 'MMA', 'Tennis'].map((c) => ({
        id: c,
        label: c === 'MMA' ? 'UFC / MMA' : c === 'Tennis' ? 'ATP / WTA Tennis' : c,
        icon: Radio,
        count: events.filter((e) => e.category === c).length,
      })),
      { id: 'Pinned', label: 'My List', icon: Heart, count: pinned.length },
    ],
    [events, liveItems, continueItems, animeItems, channelItems, showItems, movieItems, sportsItems, pinned],
  );

  const heroEvent = useMemo(
    () =>
      events.find((e) => e.isLive && SPORTS.has(e.category)) ||
      trendingAnimeItems.find((e) => e.bannerImage) ||
      events.find((e) => e.poster) ||
      events[0],
    [events, trendingAnimeItems],
  );

  const getProgress = useCallback(
    (ev) => {
      const h = historyMap.get(ev.id);
      if (!h || !h.duration) return undefined;
      return h.position / h.duration;
    },
    [historyMap],
  );
  const getContinueBadge = useCallback(
    (ev) => {
      const h = historyMap.get(ev.id);
      if (!h) return undefined;
      if (isSeries(ev)) return `Continue S${h.season || 1} · E${h.episode || 1}`;
      if (h.duration) return `${Math.round((h.position / h.duration) * 100)}% watched`;
      return 'Continue';
    },
    [historyMap],
  );
  const getCountdownBadge = useCallback((ev) => (now ? formatCountdown(ev.startTime, now) : undefined), [now]);
  const getAiringBadge = useCallback(
    (ev) => {
      if (!ev.startTime || !now) return ev.status;
      return ev.startTime > now ? `${ev.status} · ${formatCountdown(ev.startTime, now)}` : `${ev.status} · out now`;
    },
    [now],
  );

  const cardProps = {
    selectedId: playerOpen ? selectedEvent?.id : null,
    pinnedIds,
    onSelect: handleSelect,
    onTogglePin: togglePin,
    onSelectSecondary: setSecondaryEvent,
    multiView,
  };

  const updatedLabel = hydrated && updatedAt ? new Date(updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }) : '';
  const isSportsEvent = selectedEvent && SPORTS.has(selectedEvent.category) && selectedEvent.homeTeam;

  const handleLoadCustomStream = (e) => {
    e.preventDefault();
    const trimmed = customUrl.trim();
    if (!trimmed) return;
    const isEmbed = !trimmed.includes('.m3u8') && !trimmed.includes('.mp4');
    const customEvent = {
      id: `custom-${Date.now()}`,
      title: 'Custom Stream',
      shortTitle: 'Custom Stream',
      category: 'Channels',
      league: isEmbed ? 'EMBED' : 'CUSTOM HLS',
      status: 'LIVE',
      isLive: true,
      homeTeam: { name: 'Custom', score: 'HD', logo: FALLBACK_IMG },
      awayTeam: { name: 'Source', score: 'LIVE', logo: FALLBACK_IMG },
      servers: [{ name: 'Custom Source', type: isEmbed ? 'embed' : 'hls', url: trimmed, thirdParty: false }],
    };
    setEvents((prev) => [customEvent, ...prev]);
    startPlayback(customEvent, 1, 1);
    setCustomUrl('');
    setShowCustomModal(false);
  };

  const selectTab = (id) => {
    setActiveTab(id);
    setSearchQuery('');
    if (playerOpen) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showRows = activeTab === 'Home' && !searchQuery.trim();
  const isEmptyCatalog = events.length === 0;

  return (
    <div className="min-h-screen bg-[#090A0F] text-white overflow-x-hidden pb-24 lg:pb-14">
      {/* ===== Header ===== */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
          scrolled || playerOpen
            ? 'bg-[#090A0F]/95 backdrop-blur-xl border-b border-white/10'
            : 'bg-gradient-to-b from-black/95 via-black/60 to-transparent'
        }`}
      >
        <div className="px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
          <button
            onClick={() => {
              selectTab('Home');
              setPlayerOpen(false);
            }}
            aria-label="AMG VIP Live Wire home"
            className="flex items-center gap-2 shrink-0 rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
          >
            <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-600 text-black text-[10px] sm:text-xs font-black tracking-wider uppercase shadow">
              AMG VIP
            </span>
            <span className="text-lg sm:text-2xl font-black tracking-tighter text-[#E50914]">
              LIVE WIRE
            </span>
          </button>

          <div className="flex-1 max-w-md">
            <div className="flex items-center bg-white/10 hover:bg-white/15 focus-within:bg-black/80 focus-within:border-[#E50914] border border-white/15 rounded-full px-3 h-10 transition">
              <Search className="w-4 h-4 text-gray-300 mr-2 shrink-0" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search anime, TV shows, movies, and sports"
                placeholder="Search anime, shows, teams…"
                className="bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none w-full min-w-0"
              />
              {searching && <RefreshCw className="w-3.5 h-3.5 text-gray-400 animate-spin shrink-0" />}
              {searchQuery && !searching && (
                <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="text-gray-400 hover:text-white p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleMultiView}
              aria-pressed={multiView}
              aria-label="Toggle multi-view split screen"
              title="Split-Screen Multi-View"
              className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
                multiView
                  ? 'bg-[#E50914] border-[#E50914] text-white shadow-lg shadow-[#E50914]/30'
                  : 'bg-white/10 border-white/15 text-gray-200 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4 shrink-0" />
              <span className="text-[11px] sm:text-xs">Multi</span>
            </button>
            <button
              onClick={() => setVipOddsOpen((v) => !v)}
              aria-pressed={vipOddsOpen}
              aria-label="Toggle AMG VIP AI Odds"
              title="AMG VIP Live Markov & Monte Carlo Edges"
              className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-lg text-xs font-bold border flex items-center gap-1 transition ${
                vipOddsOpen
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs">VIP</span>
            </button>
            <button
              onClick={() => setVipGateOpen(true)}
              aria-label="AMG VIP Access Gate"
              title={vipAccess.unlocked ? 'AMG VIP Unlocked' : 'Unlock AMG VIP Access'}
              className={`h-9 sm:h-10 px-2.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition ${
                vipAccess.unlocked
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-white/10 border-white/15 text-gray-300 hover:text-white'
              }`}
            >
              <span className="text-[11px]">{vipAccess.unlocked ? 'VIP ON' : 'Pass'}</span>
            </button>
            <button
              onClick={() => setUseProxy((p) => !p)}
              aria-pressed={useProxy}
              aria-label="Toggle HLS proxy"
              title="HLS CORS Proxy"
              className={`h-9 sm:h-10 px-2 sm:px-3 rounded-lg text-xs font-bold border flex items-center gap-1 transition ${
                useProxy
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-white/10 border-white/15 text-gray-300 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Proxy</span>
            </button>
            <button
              onClick={toggleThirdParty}
              aria-pressed={allowThirdParty}
              aria-label="Toggle third-party sources"
              title="Third-party embed sources"
              className={`hidden sm:flex h-10 px-2.5 sm:px-3 rounded-lg text-xs font-bold border items-center gap-1.5 transition ${
                allowThirdParty
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-white/10 border-white/15 text-gray-300 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden md:inline">3rd-party</span>
              <span>{allowThirdParty ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={() => setShowCustomModal(true)}
              aria-label="Add custom stream"
              title="Play custom M3U8/MP4/Embed URL"
              className="h-9 w-9 sm:h-10 sm:w-auto sm:px-3 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Add</span>
            </button>
            <button
              onClick={() => fetchCatalog(true)}
              aria-label="Rotate catalog"
              title="Rotate new movies & shows"
              className="h-9 w-9 sm:h-10 sm:w-auto sm:px-3 rounded-lg bg-white/10 hover:bg-[#E50914] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Rotate</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== Desktop sidebar ===== */}
      <aside
        aria-label="Browse categories"
        className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-60 z-30 bg-[#0c0c0e]/95 backdrop-blur-xl border-r border-white/10 px-3 py-4 overflow-y-auto"
      >
        <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">Browse</p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id && !searchQuery.trim();
            return (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`w-full min-h-[40px] flex items-center justify-between px-3 py-2 rounded-lg text-left transition ${
                  active ? 'bg-[#E50914] text-white font-bold shadow-lg shadow-[#E50914]/25' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${active ? 'bg-black/30 text-white' : 'bg-white/5 text-gray-400'}`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto pt-4 px-3 text-[11px] text-gray-500 space-y-1">
          {updatedLabel && <p>Scores updated {updatedLabel}</p>}
          <p>
            Press <kbd className="px-1 rounded bg-white/10">/</kbd> to search · <kbd className="px-1 rounded bg-white/10">N</kbd> next server
          </p>
        </div>
      </aside>

      <main className="lg:pl-60">
        {/* ===== Player OR Hero ===== */}
        {playerOpen && selectedEvent ? (
          <section
            className={`relative ${dimMode ? 'z-[35]' : ''} pt-20 px-3 sm:px-6 mx-auto ${theaterMode ? 'max-w-full' : 'max-w-6xl'} space-y-3`}
          >
            <div className={`grid gap-3 sm:gap-4 ${multiView ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {selectedEvent.panel === 'nfl-redzone' ? (
                <div className="md:col-span-full">
                  <NflRedZonePanel />
                </div>
              ) : activeServer ? (
                <StreamPlayer
                  key={activeServer.url}
                  stream={activeServer}
                  title={selectedEvent.shortTitle || selectedEvent.title}
                  subtitle={activeServer.name}
                  useProxy={useProxy}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted((m) => !m)}
                  onFail={handleFail}
                  onNext={nextServer}
                  hasNext={hasNext}
                  startAt={startAt}
                  onProgress={handleProgress}
                  fitMode={fitMode}
                />
              ) : hiddenCount === 0 ? (
                <div
                  data-testid="no-licensed-stream"
                  className="w-full aspect-video rounded-xl border border-white/10 bg-gradient-to-br from-[#0e111a] to-black flex flex-col items-center justify-center text-center p-6 gap-3"
                >
                  <AlertTriangle className="w-10 h-10 text-amber-400" />
                  <p className="text-sm font-bold text-white">No licensed stream available</p>
                  <p className="text-xs text-gray-400 max-w-md">
                    There isn&apos;t an official stream for this title right now. Check the league or broadcaster&apos;s own app for it.
                  </p>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-xl border border-amber-500/30 bg-gradient-to-br from-[#1a1508] to-black flex flex-col items-center justify-center text-center p-6 gap-3">
                  <AlertTriangle className="w-10 h-10 text-amber-400" />
                  <p className="text-sm font-bold text-white">Only third-party sources available</p>
                  <p className="text-xs text-gray-400 max-w-md">
                    {hiddenCount} source{hiddenCount === 1 ? '' : 's'} hidden. These embed sites are unlicensed and may show pop-ups
                    or redirects.
                  </p>
                  <button
                    onClick={toggleThirdParty}
                    className="min-h-[44px] px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition"
                  >
                    Enable 3rd-party sources
                  </button>
                </div>
              )}
              {multiView && secondaryEvent && secondaryStream && (
                <StreamPlayer
                  key={`second-${secondaryStream.url}`}
                  stream={secondaryStream}
                  title={`#2 · ${secondaryEvent.shortTitle || secondaryEvent.title}`}
                  subtitle={secondaryStream.name}
                  useProxy={useProxy}
                  isMuted
                  onToggleMute={() => {}}
                />
              )}
            </div>

            {multiView && (
              <div className="rounded-xl bg-[#141416] border border-[#E50914]/40 p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#E50914] flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5" /> Split-Screen #2 Picker
                  </span>
                  {secondaryEvent && (
                    <button
                      onClick={() => {
                        const first = selectedEvent;
                        setSelectedEvent(secondaryEvent);
                        setSecondaryEvent(first);
                        setServerIdx(0);
                      }}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-[#E50914] text-[11px] font-bold text-white transition"
                    >
                      Swap #1 ↔ #2
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {events
                    .filter((e) => e.id !== selectedEvent.id && (e.isLive || e.category === 'Channels' || SPORTS.has(e.category)))
                    .slice(0, 14)
                    .map((ev) => (
                      <button
                        key={`pick2-${ev.id}`}
                        onClick={() => setSecondaryEvent(ev)}
                        className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                          secondaryEvent?.id === ev.id
                            ? 'bg-[#E50914] border-[#E50914] text-white'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/15'
                        }`}
                      >
                        {ev.shortTitle || ev.title}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-[#141416] border border-white/10 p-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-black text-white truncate">{selectedEvent.title}</h1>
                  <p className="text-xs text-gray-400 truncate">
                    {isSportsEvent ? (
                      <>
                        <span className="text-white font-bold tabular-nums">
                          {selectedEvent.awayTeam?.name} {selectedEvent.awayTeam?.score} – {selectedEvent.homeTeam?.score}{' '}
                          {selectedEvent.homeTeam?.name}
                        </span>{' '}
                        · {selectedEvent.status}
                        {updatedLabel && <span className="text-gray-500"> · updated {updatedLabel}</span>}
                      </>
                    ) : (
                      <>
                        {selectedEvent.league}
                        {isSeries(selectedEvent) && ` · Season ${activeSeason} · Episode ${activeEpisode}`}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeServer?.url && (
                    <a
                      href={activeServer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-[#E50914] text-white flex items-center transition"
                    >
                      Open Source ↗
                    </a>
                  )}
                  <button
                    onClick={() => setFitMode((f) => FIT_ORDER[(FIT_ORDER.indexOf(f) + 1) % FIT_ORDER.length])}
                    aria-label="Cycle zoom"
                    className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition"
                  >
                    <ZoomIn className="w-3.5 h-3.5" /> {FIT_LABEL[fitMode]}
                  </button>
                  {fitMode !== 'contain' && (
                    <button
                      onClick={() => setFitMode('contain')}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-gray-200 transition"
                    >
                      Reset zoom
                    </button>
                  )}
                  <button
                    onClick={() => setDimMode((d) => !d)}
                    aria-pressed={dimMode}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      dimMode ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Dim
                  </button>
                  <button
                    onClick={toggleMultiView}
                    aria-pressed={multiView}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      multiView ? 'bg-[#E50914] text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" /> {multiView ? 'Multi ON' : 'Multi'}
                  </button>
                  <button
                    onClick={() => setTheaterMode((t) => !t)}
                    aria-pressed={theaterMode}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      theaterMode ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Theater
                  </button>
                  <button
                    onClick={() => {
                      setPlayerOpen(false);
                      setDimMode(false);
                    }}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-gray-200 flex items-center gap-1 transition"
                  >
                    <X className="w-3.5 h-3.5" /> Close
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedEvent?.mediaType === 'anime' && (
                  <div className="flex items-center rounded-lg bg-black/60 border border-white/15 p-0.5 mr-1">
                    {['all', 'sub', 'dub'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setAnimeLangFilter(lang);
                          setServerIdx(0);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase transition ${
                          animeLangFilter === lang ? 'bg-amber-400 text-black' : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
                {visibleServers.map((srv, idx) => (
                  <button
                    key={`${srv.url}-${idx}`}
                    onClick={() => setServerIdx(idx)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      safeIdx === idx ? 'bg-[#E50914] text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {srv.name}
                    {srv.thirdParty && (
                      <span className="text-[9px] font-black px-1 py-0.5 rounded bg-amber-500/30 text-amber-200" title="Third-party source">
                        3P
                      </span>
                    )}
                  </button>
                ))}
                {hasNext && (
                  <button
                    onClick={nextServer}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-black hover:bg-white/90 flex items-center gap-1.5 transition"
                  >
                    <SkipForward className="w-3.5 h-3.5" /> Next server
                  </button>
                )}
                {hiddenCount > 0 && activeServer && (
                  <button onClick={toggleThirdParty} className="text-[11px] text-amber-300/80 hover:text-amber-200 underline underline-offset-2">
                    +{hiddenCount} third-party hidden
                  </button>
                )}
              </div>

              {isSeries(selectedEvent) && (
                <div className="space-y-2 pt-1 border-t border-white/10">
                  <div className="flex items-center justify-between pt-2">
                    <h2 className="text-sm font-bold text-white">Episodes</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeEpisode(activeSeason, Math.max(1, activeEpisode - 1))}
                        disabled={activeEpisode <= 1}
                        aria-label="Previous episode"
                        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => changeEpisode(activeSeason, activeEpisode + 1)}
                        aria-label="Next episode"
                        className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1"
                      >
                        Next ep <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <EpisodeGrid
                    ev={selectedEvent}
                    activeSeason={activeSeason}
                    activeEpisode={activeEpisode}
                    onPick={changeEpisode}
                    compact
                  />
                </div>
              )}
            </div>
          </section>
        ) : (
          heroEvent && (
            <section className="relative h-[56vh] min-h-[400px] max-h-[580px] w-full flex items-end overflow-hidden">
              <img
                key={heroEvent.id}
                src={heroEvent.bannerImage || heroEvent.poster || FALLBACK_IMG}
                alt=""
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMG;
                }}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e] via-[#0c0c0e]/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-black/60" />

              <div className="relative z-10 max-w-3xl px-4 sm:px-8 pb-12 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#E50914] text-[11px] font-black tracking-wider uppercase text-white">
                    {heroEvent.isLive ? 'LIVE NOW' : 'FEATURED'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
                    {heroEvent.league} · {events.length} titles
                  </span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg line-clamp-2">
                  {heroEvent.title}
                </h1>
                {SPORTS.has(heroEvent.category) && heroEvent.homeTeam ? (
                  <p className="text-lg font-black text-white tabular-nums">
                    {heroEvent.awayTeam?.name} {heroEvent.awayTeam?.score} – {heroEvent.homeTeam?.score} {heroEvent.homeTeam?.name}
                    <span className="ml-2 text-sm font-semibold text-gray-300">{heroEvent.status}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-300 max-w-xl line-clamp-3">
                    {heroEvent.description || `${heroEvent.status}: live sports, 24/7 channels, movies, and anime/TV series.`}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => handleSelect(heroEvent)}
                    className="min-h-[44px] px-6 py-2.5 rounded-lg bg-white hover:bg-white/90 text-black font-extrabold text-sm flex items-center gap-2 transition motion-safe:hover:scale-105"
                  >
                    <Play className="w-4 h-4 fill-current" /> Play
                  </button>
                  {isOnDemand(heroEvent) && (
                    <button
                      onClick={() => setDetailsEvent(heroEvent)}
                      className="min-h-[44px] px-5 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur text-white font-bold text-sm flex items-center gap-2 transition"
                    >
                      <Info className="w-4 h-4" /> More Info
                    </button>
                  )}
                  <button
                    onClick={(e) => togglePin(heroEvent, e)}
                    className="min-h-[44px] px-5 py-2.5 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur text-white font-bold text-sm flex items-center gap-2 transition"
                  >
                    {pinnedIds.includes(heroEvent.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />} My List
                  </button>
                </div>
              </div>
            </section>
          )
        )}

        {/* ===== Catalog ===== */}
        <div className={playerOpen ? 'mt-8 space-y-8' : '-mt-6 relative z-20 space-y-8'}>
          {vipOddsOpen && (
            <section className="px-4 sm:px-8 pt-4">
              <div className="rounded-xl bg-gradient-to-r from-[#1a1508] via-[#141416] to-[#1a0d10] border border-amber-500/40 p-4 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> AMG VIP · Live Slip-Maker AI & Markov Edges
                  </span>
                  <button onClick={() => setVipOddsOpen(false)} className="text-xs font-bold text-gray-400 hover:text-white">
                    Hide
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  <div className="rounded-lg bg-black/60 border border-white/10 p-3 space-y-1">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">ATP Markov · Quarter-Kelly 3x</p>
                    <p className="font-extrabold text-white">Sinner vs Alcaraz (Hard)</p>
                    <p className="text-gray-300">Model: <b>55.1%</b> · Total Games: <b>25.9</b> · Aces: <b>8.0 / 6.2</b></p>
                  </div>
                  <div className="rounded-lg bg-black/60 border border-white/10 p-3 space-y-1">
                    <p className="text-[10px] font-bold text-amber-300 uppercase">Break-of-Serve Mean Reversion</p>
                    <p className="font-extrabold text-white">Sabalenka vs Swiatek (WTA)</p>
                    <p className="text-gray-300">Live Recovery: <b>58.4%</b> · Entry Cap: <b>≤52¢ (0¢ Maker)</b></p>
                  </div>
                  <div className="rounded-lg bg-black/60 border border-white/10 p-3 space-y-1">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Kalshi KXBTC15M · 100% Cluster WR</p>
                    <p className="font-extrabold text-white">Maker Spread Harvest ≤52¢</p>
                    <p className="text-gray-300">Auto-Scalp Lock: <b>80¢ Bid</b> · Hard Cap: <b>55¢ Max</b></p>
                  </div>
                  <div className="rounded-lg bg-black/60 border border-white/10 p-3 space-y-1">
                    <p className="text-[10px] font-bold text-purple-300 uppercase">Paper Crucible Gate Progress</p>
                    <p className="font-extrabold text-white">206 / 500 Verified Trades</p>
                    <p className="text-gray-300">Win Rate: <b>77.2%</b> · Net PnL: <b>+$478.85</b></p>
                  </div>
                </div>
              </div>
            </section>
          )}
          {/* Mobile/tablet category strip */}
          <section className="lg:hidden px-4 sm:px-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {menuItems.map((item) => {
                const active = activeTab === item.id && !searchQuery.trim();
                return (
                  <button
                    key={item.id}
                    onClick={() => selectTab(item.id)}
                    className={`min-h-[44px] shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold transition ${
                      active ? 'bg-[#E50914] border-[#E50914] text-white' : 'bg-[#18181b] border-white/10 text-gray-300 hover:border-white/30'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] font-mono opacity-75">{item.count}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {activeTab === 'Studio3D' && !searchQuery.trim() ? (
            <CharacterStage />
          ) : activeTab === 'Webtoons' && !searchQuery.trim() ? (
            <WebtoonReader />
          ) : isEmptyCatalog ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : showRows ? (
            <>
              <MediaRow
                title="Continue Watching"
                icon={History}
                items={continueItems}
                getBadge={getContinueBadge}
                getProgress={getProgress}
                cardProps={{ ...cardProps, onSelect: handleResume }}
                action={
                  <button onClick={clearHistory} className="text-xs font-semibold text-gray-400 hover:text-white">
                    Clear
                  </button>
                }
              />
              <MediaRow
                title={`Your Teams${favTeams.length ? ` · ${favTeams.join(', ')}` : ''}`}
                icon={Heart}
                items={teamItems}
                getBadge={(ev) => (ev.isUpcoming ? getCountdownBadge(ev) : undefined)}
                cardProps={cardProps}
                action={
                  <button onClick={editTeams} className="text-xs font-semibold text-gray-400 hover:text-white">
                    Edit teams
                  </button>
                }
              />
              <MediaRow title="Trending Live Now" icon={Flame} items={liveItems} cardProps={cardProps} />
              <MediaRow title="Starting Soon" icon={Clock} items={soonItems} getBadge={getCountdownBadge} cardProps={cardProps} />
              <MediaRow title="Airing Today" icon={Calendar} items={airingItems} getBadge={getAiringBadge} cardProps={cardProps} />
              <MediaRow title="Trending Anime" icon={Sparkles} items={trendingAnimeItems} getProgress={getProgress} cardProps={cardProps} />
              <MediaRow title="24/7 Live Channels" icon={Tv} items={channelItems} cardProps={cardProps} />
              <MediaRow title="Top Rated" icon={Star} items={topRatedItems} getProgress={getProgress} cardProps={cardProps} />
              <MediaRow title="Movies" icon={Film} items={movieItems} getProgress={getProgress} cardProps={cardProps} />
              <MediaRow title="TV Shows & Live News" icon={Clapperboard} items={showItems} getProgress={getProgress} cardProps={cardProps} />
              <MediaRow title="Because You Pinned…" icon={Heart} items={becauseItems} cardProps={cardProps} />
              <MediaRow title="All Sports & Matchups" icon={Trophy} items={sportsItems} getBadge={(ev) => (ev.isUpcoming ? getCountdownBadge(ev) : undefined)} cardProps={cardProps} />
            </>
          ) : (
            <section className="px-4 sm:px-8 pt-2 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#E50914]" />
                  {searchQuery.trim()
                    ? `Results for “${searchQuery.trim()}”`
                    : menuItems.find((m) => m.id === activeTab)?.label || activeTab}{' '}
                  <span className="text-sm text-gray-500">({visibleGridEvents.length})</span>
                </h2>
                {(activeTab === 'LIVE NOW' || SPORTS.has(activeTab)) && updatedLabel && !searchQuery.trim() && (
                  <span className="text-xs text-gray-500">Scores auto-update · {updatedLabel}</span>
                )}
                {activeTab === 'History' && continueItems.length > 0 && (
                  <button onClick={clearHistory} className="text-xs font-semibold text-gray-400 hover:text-white">
                    Clear history
                  </button>
                )}
              </div>

              {visibleGridEvents.length === 0 ? (
                searching ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" aria-busy="true">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-[212px] rounded-lg bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#18181b] border border-white/10 p-10 text-center text-sm text-gray-400">
                    {activeTab === 'Pinned'
                      ? 'Your list is empty. Tap + on any title to save it.'
                      : activeTab === 'History'
                        ? 'Nothing watched yet.'
                        : searchQuery.trim()
                          ? 'No matches. Try another spelling or the English title.'
                          : 'Nothing here right now. Check back soon.'}
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {visibleGridEvents.map((ev, idx) => (
                    <MediaCard
                      key={ev.id}
                      ev={ev}
                      index={idx}
                      isSelected={cardProps.selectedId === ev.id}
                      isPinned={pinnedIds.includes(ev.id)}
                      onSelect={activeTab === 'History' && !searchQuery.trim() ? handleResume : handleSelect}
                      onTogglePin={togglePin}
                      onSelectSecondary={setSecondaryEvent}
                      multiView={multiView}
                      badge={
                        activeTab === 'History'
                          ? getContinueBadge(ev)
                          : ev.isUpcoming
                            ? getCountdownBadge(ev)
                            : undefined
                      }
                      progress={getProgress(ev)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Dim overlay (click to exit) */}
      {dimMode && playerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/85 transition-opacity"
          onClick={() => setDimMode(false)}
          aria-hidden="true"
        />
      )}

      {/* ===== Mobile bottom nav ===== */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-white/10 px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] flex items-center justify-around"
      >
        {[
          { id: 'Home', label: 'Home', icon: Grid },
          { id: 'NBA', label: 'NBA', icon: Trophy },
          { id: 'Studio3D', label: '3D Stage', icon: Box },
          { id: 'Webtoons', label: 'Webtoons', icon: BookOpen },
          { id: 'Anime', label: 'Anime', icon: Sparkles },
          { id: 'Shows', label: 'Shows', icon: Clapperboard },
        ].map((nav) => {
          const Icon = nav.icon;
          const active = activeTab === nav.id && !searchQuery.trim();
          return (
            <button
              key={nav.id}
              onClick={() => {
                selectTab(nav.id);
                if (!playerOpen) window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-current={active ? 'page' : undefined}
              className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-[11px] font-semibold transition ${
                active ? 'text-[#E50914]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{nav.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed left-1/2 -translate-x-1/2 bottom-20 lg:bottom-6 z-[60] max-w-[90vw] px-4 py-2.5 rounded-lg bg-white text-black text-xs font-bold shadow-2xl transition-all duration-300 ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        {toast}
      </div>

      {detailsEvent && (
        <DetailsModal
          ev={detailsEvent}
          resume={historyMap.get(detailsEvent.id)}
          isPinned={pinnedIds.includes(detailsEvent.id)}
          onTogglePin={togglePin}
          onPlay={startPlayback}
          onClose={closeDetails}
          allowThirdParty={allowThirdParty}
        />
      )}

      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCustomModal(false)}>
          <form
            onSubmit={handleLoadCustomStream}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-[#18181b] border border-white/15 p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Add custom stream</h3>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-gray-300">Stream URL (M3U8, MP4, or embed page)</span>
              <input
                type="url"
                required
                autoFocus
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/master.m3u8"
                className="w-full bg-black/60 border border-white/20 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#E50914]"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="min-h-[40px] px-4 py-2 rounded-md bg-white/10 text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button type="submit" className="min-h-[40px] px-4 py-2 rounded-md bg-[#E50914] text-xs font-bold text-white">
                Play stream
              </button>
            </div>
          </form>
        </div>
      )}
      <VipAccessGate
        open={vipGateOpen}
        onClose={() => setVipGateOpen(false)}
        unlocked={vipAccess.unlocked}
        onUnlocked={(data) => {
          vipAccess.unlockVip(data);
          showToast('AMG VIP unlocked across Multi-View, Themes & Fast Pass');
        }}
        onLock={() => {
          vipAccess.lockVip();
          showToast('AMG VIP session locked');
        }}
      />
    </div>
  );
}
