/* eslint-disable @next/next/no-img-element */
'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const PIN_STORAGE_KEY = 'livewire:pinned:v2';
const PROXY_STORAGE_KEY = 'livewire:proxy:v2';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'LIVE NOW' },
  { id: 'nba', label: 'NBA' },
  { id: 'nfl', label: 'NFL' },
  { id: 'college', label: 'College' },
  { id: 'soccer', label: 'Soccer' },
  { id: 'mma', label: 'MMA' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'movies', label: 'Movies' },
  { id: 'shows', label: 'Shows' },
  { id: 'channels', label: 'Channels' },
  { id: 'pinned', label: 'Pinned' },
];

const SPORTS_TABS = new Set(['nba', 'nfl', 'college', 'soccer', 'mma']);

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function initials(value = '') {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'LW'
  );
}

function serverTypeLabel(server) {
  if (!server) return 'STREAM';
  if (server.type === 'hls') return 'HLS';
  if (server.type === 'embed') return 'EMBED';
  if (server.type === 'link') return 'OFFICIAL';
  return String(server.type || 'STREAM').toUpperCase();
}

function formatGenerated(value) {
  if (!value) return 'just now';
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return 'just now';
  }
}

function scoreOrDash(value) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function TeamLogo({ team }) {
  if (team?.logo) {
    return <img src={team.logo} alt="" loading="lazy" />;
  }

  return (
    <span className="team-initials">
      {initials(team?.shortName || team?.name || 'TBD')}
    </span>
  );
}

function SportsArt({ item }) {
  const game = item.game || {};
  const away = game.away || {};
  const home = game.home || {};
  const status = game.status || {};
  const state = status.state || 'pre';

  return (
    <div
      className="sports-art"
      style={{
        '--away-color': away.color || '#1d4ed8',
        '--home-color': home.color || '#b91c1c',
      }}
    >
      <div className="arena-side arena-away">
        <div className="arena-glow" />
        <TeamLogo team={away} />
        <span className="team-code">{away.shortName || 'AWAY'}</span>
      </div>

      <div className="arena-seam" />

      <div className="arena-side arena-home">
        <div className="arena-glow" />
        <TeamLogo team={home} />
        <span className="team-code">{home.shortName || 'HOME'}</span>
      </div>

      <div className="arena-center">
        <span className="vs">VS</span>
        <span className="score">
          {scoreOrDash(away.score)} <i>:</i> {scoreOrDash(home.score)}
        </span>
        <span className={cx('game-pill', item.live && 'live')}>
          {item.live ? 'LIVE' : state === 'post' ? 'FINAL' : 'UPCOMING'}
        </span>
        <span className="game-clock">
          {status.clock || status.detail || status.shortDetail || 'TBD'}
          {status.period ? ` · ${status.period}` : ''}
        </span>
      </div>
    </div>
  );
}

function PosterArt({ item }) {
  const image =
    item.backdrop ||
    item.poster ||
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=82';

  return (
    <div className="poster-art">
      <img src={image} alt="" loading="lazy" />
      <div className="poster-vignette" />
      <div className="poster-topline">
        <span>{item.badge || 'OPEN'}</span>
        <span>{item.category || item.kind || 'STREAM'}</span>
      </div>
    </div>
  );
}

function MediaCard({
  item,
  index,
  pinned,
  onPin,
  onPlay,
  onMultiView,
}) {
  const cardRef = useRef(null);

  const handlePointerMove = useCallback((event) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = x / Math.max(rect.width, 1);
    const py = y / Math.max(rect.height, 1);

    const rotateY = (px - 0.5) * 14;
    const rotateX = (0.5 - py) * 12;

    card.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
    card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
  }, []);

  const handlePointerLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
  }, []);

  const play = useCallback(() => {
    onPlay(item);
  }, [item, onPlay]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        play();
      }
    },
    [play],
  );

  const isSports = item.kind === 'sports';

  return (
    <article
      ref={cardRef}
      className={cx(
        'catalog-card',
        `card-${item.kind || 'custom'}`,
        item.live && 'is-live',
      )}
      style={{
        '--stagger': `${Math.min(index, 18) * 42}ms`,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={play}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${item.title}`}
    >
      <button
        type="button"
        className={cx('pin-button', pinned && 'active')}
        aria-label={pinned ? `Unpin ${item.title}` : `Pin ${item.title}`}
        onClick={(event) => {
          event.stopPropagation();
          onPin(item.id);
        }}
      >
        {pinned ? '★' : '☆'}
      </button>

      {isSports ? <SportsArt item={item} /> : <PosterArt item={item} />}

      <div className="card-body">
        <div className="card-eyebrow">
          <span>{item.league || item.subtitle || item.category}</span>
          {item.live ? <span className="live-now">LIVE NOW</span> : null}
        </div>
        <h3>{item.title}</h3>
        <p>{item.subtitle || item.description || 'Live Wire catalog'}</p>
      </div>

      <div className="quick-actions">
        <button
          type="button"
          className="watch-btn"
          onClick={(event) => {
            event.stopPropagation();
            play();
          }}
        >
          Watch Now
        </button>
        <button
          type="button"
          className="multi-btn"
          onClick={(event) => {
            event.stopPropagation();
            onMultiView(item);
          }}
        >
          + Multi-View
        </button>
      </div>

      <button
        type="button"
        className="play-orb"
        aria-label={`Play ${item.title}`}
        onClick={(event) => {
          event.stopPropagation();
          play();
        }}
      >
        ▶
      </button>
    </article>
  );
}

function StreamPlayer({
  server,
  proxyEnabled,
  onReady,
  onError,
  onVideoElement,
  autoplay = true,
}) {
  const videoRef = useRef(null);
  const readyRef = useRef(false);
  const errorRef = useRef(false);

  const markReady = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    onReady?.();
  }, [onReady]);

  const markError = useCallback(
    (message) => {
      if (errorRef.current) return;
      errorRef.current = true;
      onError?.(message || 'Stream failed.');
    },
    [onError],
  );

  useEffect(() => {
    if (!server || server.type !== 'embed') return undefined;

    readyRef.current = false;
    errorRef.current = false;

    const timer = window.setTimeout(() => {
      markReady();
    }, 1500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [server?.url, server?.type, markReady]);

  useEffect(() => {
    if (!server || server.type !== 'hls') return undefined;

    const video = videoRef.current;
    if (!video) return undefined;

    readyRef.current = false;
    errorRef.current = false;
    onVideoElement?.(video);

    const src =
      proxyEnabled && server.allowProxy !== false
        ? `/api/proxy?url=${encodeURIComponent(server.url)}`
        : server.url;

    let cancelled = false;
    let hls = null;
    let networkRetries = 0;
    let mediaRetries = 0;

    const cleanupEvents = [];

    const listen = (target, event, handler, options) => {
      target.addEventListener(event, handler, options);
      cleanupEvents.push(() =>
        target.removeEventListener(event, handler, options),
      );
    };

    listen(video, 'loadedmetadata', markReady);
    listen(video, 'loadeddata', markReady);
    listen(video, 'canplay', markReady);
    listen(video, 'playing', markReady);
    listen(video, 'error', () => {
      markError('The video element could not load this stream.');
    });

    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) markReady();
    }, 15000);

    const startPlayback = () => {
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          // Autoplay can be blocked by the browser. The user still has controls.
        });
      }
    };

    async function setup() {
      if (cancelled) return;

      const nativeHls = video.canPlayType(
        'application/vnd.apple.mpegurl',
      );

      if (nativeHls) {
        video.src = src;
        startPlayback();
        return;
      }

      try {
        const module = await import('hls.js');
        const Hls = module.default || module.Hls;

        if (!Hls || !Hls.isSupported()) {
          markError(
            'HLS.js is unavailable in this browser. Try Safari or another HLS-capable browser.',
          );
          return;
        }

        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          manifestLoadingTimeOut: 12000,
          levelLoadingTimeOut: 12000,
          fragLoadingTimeOut: 20000,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          markReady();
          startPlayback();
        });

        hls.on(Hls.Events.LEVEL_LOADED, markReady);
        hls.on(Hls.Events.FRAG_LOADED, markReady);

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data?.fatal) return;

          if (
            data.type === Hls.ErrorTypes.NETWORK_ERROR &&
            networkRetries < 2
          ) {
            networkRetries += 1;
            hls.startLoad();
            return;
          }

          if (
            data.type === Hls.ErrorTypes.MEDIA_ERROR &&
            mediaRetries < 2
          ) {
            mediaRetries += 1;
            hls.recoverMediaError();
            return;
          }

          markError(data.details || 'HLS playback failed.');
          try {
            hls.destroy();
          } catch {
            // Ignore teardown errors.
          }
          hls = null;
        });
      } catch {
        markError('The HLS engine failed to load.');
      }
    }

    setup();

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      cleanupEvents.forEach((remove) => remove());

      if (hls) {
        try {
          hls.destroy();
        } catch {
          // Ignore teardown errors.
        }
      }

      try {
        video.removeAttribute('src');
        video.load();
      } catch {
        // Ignore teardown errors.
      }

      onVideoElement?.(null);
    };
  }, [
    server?.url,
    server?.type,
    server?.allowProxy,
    proxyEnabled,
    markReady,
    markError,
    onVideoElement,
  ]);

  if (!server) return null;

  if (server.type === 'embed') {
    return (
      <iframe
        key={server.url}
        className="stream-frame"
        src={server.url}
        title={server.label || 'Embedded stream'}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="no-referrer"
        onLoad={markReady}
      />
    );
  }

  if (server.type !== 'hls') return null;

  return (
    <video
      ref={videoRef}
      className="stream-video"
      playsInline
      controls
      autoPlay={autoplay}
      preload="metadata"
    />
  );
}

function MiniStreamPlayer({ item, proxyEnabled }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const server = safeArray(item?.servers)[0];

  const handleReady = useCallback(() => {
    setReady(true);
    setError('');
  }, []);

  const handleError = useCallback((message) => {
    setReady(true);
    setError(message || 'Stream failed.');
  }, []);

  useEffect(() => {
    setReady(false);
    setError('');
  }, [item?.id, proxyEnabled]);

  if (!server) {
    return <div className="mini-empty">No source available.</div>;
  }

  if (server.type === 'link') {
    return (
      <div className="mini-link">
        <p>This is an official broadcaster destination.</p>
        <a href={server.url} target="_blank" rel="noreferrer">
          Open official broadcast ↗
        </a>
      </div>
    );
  }

  return (
    <div className="mini-player">
      <StreamPlayer
        server={server}
        proxyEnabled={proxyEnabled}
        onReady={handleReady}
        onError={handleError}
        autoplay
      />
      {!ready && !error ? (
        <div className="mini-loading">
          <span className="spinner small" />
          <span>Connecting…</span>
        </div>
      ) : null}
      {error ? <div className="mini-error">{error}</div> : null}
    </div>
  );
}

function OfficialPanel({ server, item }) {
  return (
    <div className="official-panel">
      <div className="official-pulse" />
      <span className="eyebrow">OFFICIAL SOURCE</span>
      <h3>{server.label || 'Official broadcast'}</h3>
      <p>
        {server.note ||
          'This destination is operated by the rights holder. A subscription or TV Everywhere login may be required.'}
      </p>
      <a
        className="official-link"
        href={server.url}
        target="_blank"
        rel="noreferrer"
      >
        Open official broadcast ↗
      </a>
      {item.game?.broadcast ? (
        <p className="official-meta">
          Listed broadcast: {item.game.broadcast}
        </p>
      ) : null}
    </div>
  );
}

function PlayerModal({
  item,
  initialServerIndex,
  onClose,
  onAddMultiView,
  proxyEnabled,
  setProxyEnabled,
}) {
  const [serverIndex, setServerIndex] = useState(initialServerIndex || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theater, setTheater] = useState(false);
  const [streamNonce, setStreamNonce] = useState(0);
  const videoRef = useRef(null);

  const orderedServers = useMemo(() => {
    const servers = safeArray(item?.servers);
    return [
      ...servers.filter((server) => server.kind !== 'highlight'),
      ...servers.filter((server) => server.kind === 'highlight'),
    ];
  }, [item]);

  const liveServers = useMemo(
    () => orderedServers.filter((server) => server.kind !== 'highlight'),
    [orderedServers],
  );

  const highlightServers = useMemo(
    () => orderedServers.filter((server) => server.kind === 'highlight'),
    [orderedServers],
  );

  const active = orderedServers[serverIndex] || orderedServers[0] || null;

  useEffect(() => {
    setServerIndex(initialServerIndex || 0);
  }, [item?.id, initialServerIndex]);

  useEffect(() => {
    setError('');
    setLoading(active?.type !== 'link');
  }, [active?.url, active?.type, serverIndex, item?.id]);

  const handleReady = useCallback(() => {
    setLoading(false);
    setError('');
  }, []);

  const handleError = useCallback((message) => {
    setLoading(false);
    setError(message || 'Stream failed.');
  }, []);

  const handleVideoElement = useCallback((element) => {
    videoRef.current = element;
  }, []);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return;
      }

      if (
        document.pictureInPictureEnabled &&
        typeof video.requestPictureInPicture === 'function'
      ) {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP may be unavailable for a given stream/browser combination.
    }
  }, []);

  const retry = useCallback(() => {
    setError('');
    setLoading(true);
    setStreamNonce((value) => value + 1);
  }, []);

  const addMultiAndClose = useCallback(() => {
    onAddMultiView(item);
    onClose();
  }, [item, onAddMultiView, onClose]);

  if (!item) return null;

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} player`}
    >
      <div className={cx('player-shell', theater && 'theater')}>
        <header className="player-head">
          <div className="player-title">
            <span className="eyebrow">
              {item.live ? 'LIVE NOW' : item.badge || item.category}
            </span>
            <h2>{item.title}</h2>
            <p>{item.subtitle}</p>
          </div>

          <div className="player-head-actions">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setTheater((value) => !value)}
            >
              {theater ? 'Exit Theater' : 'Theater'}
            </button>
            <button
              type="button"
              className="close-btn"
              onClick={onClose}
              aria-label="Close player"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="player-layout">
          <div className="player-main">
            <div className="player-stage">
              {!active ? (
                <div className="player-empty">
                  No playable source is available for this title.
                </div>
              ) : active.type === 'link' ? (
                <OfficialPanel server={active} item={item} />
              ) : (
                <StreamPlayer
                  key={`${item.id}:${active.url}:${proxyEnabled}:${streamNonce}`}
                  server={active}
                  proxyEnabled={proxyEnabled}
                  onReady={handleReady}
                  onError={handleError}
                  onVideoElement={handleVideoElement}
                />
              )}

              {loading && active && active.type !== 'link' ? (
                <div className="player-loading">
                  <span className="spinner" />
                  <span>Connecting to {active.label || 'stream'}…</span>
                </div>
              ) : null}

              {error ? (
                <div className="player-error">
                  <strong>Signal interrupted</strong>
                  <span>{error}</span>
                  <button type="button" onClick={retry}>
                    Retry
                  </button>
                </div>
              ) : null}

              {active?.kind === 'highlight' ? (
                <div className="clip-ribbon">
                  Short highlight clip — not a full game broadcast
                </div>
              ) : null}
            </div>

            <div className="player-meta">
              <span>
                {active
                  ? `${serverTypeLabel(active)} · ${
                      active.quality || 'Adaptive'
                    }`
                  : 'No source'}
              </span>
              {active?.note ? <span>{active.note}</span> : null}
              {item.game?.status?.detail ? (
                <span>{item.game.status.detail}</span>
              ) : null}
            </div>
          </div>

          <aside className="player-sidebar">
            <div className="server-block">
              <h3>Full broadcast / feature</h3>

              {liveServers.length ? (
                liveServers.map((server, index) => (
                  <button
                    key={server.id || `${server.label}-${index}`}
                    type="button"
                    className={cx(
                      'server-row',
                      serverIndex === index && 'active',
                    )}
                    onClick={() => setServerIndex(index)}
                  >
                    <span className="server-index">{index + 1}</span>
                    <span className="server-copy">
                      <strong>{server.label || `Server ${index + 1}`}</strong>
                      <small>
                        {server.quality || server.type || 'Stream'}
                        {server.provider ? ` · ${server.provider}` : ''}
                      </small>
                    </span>
                    <span className="server-type">
                      {serverTypeLabel(server)}
                    </span>
                  </button>
                ))
              ) : (
                <p className="muted">
                  No full-broadcast source is available for this title.
                </p>
              )}
            </div>

            {highlightServers.length ? (
              <div className="server-block highlight-block">
                <h3>
                  In-game highlights <small>short clips</small>
                </h3>

                {highlightServers.map((server, index) => {
                  const actualIndex = liveServers.length + index;

                  return (
                    <button
                      key={server.id || `${server.label}-${actualIndex}`}
                      type="button"
                      className={cx(
                        'server-row',
                        serverIndex === actualIndex && 'active',
                      )}
                      onClick={() => setServerIndex(actualIndex)}
                    >
                      <span className="server-index">▶</span>
                      <span className="server-copy">
                        <strong>{server.label || 'Highlight'}</strong>
                        <small>{server.quality || 'Short clip'}</small>
                      </span>
                      <span className="server-type">CLIP</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="player-tools">
              <button
                type="button"
                className={cx('tool-btn', proxyEnabled && 'active')}
                onClick={() => setProxyEnabled((value) => !value)}
                disabled={active?.type !== 'hls'}
              >
                CORS Proxy {proxyEnabled ? 'On' : 'Off'}
              </button>

              <button
                type="button"
                className="tool-btn"
                onClick={togglePip}
                disabled={active?.type !== 'hls'}
              >
                PiP
              </button>

              <button
                type="button"
                className="tool-btn"
                onClick={addMultiAndClose}
              >
                + Multi-View
              </button>
            </div>

            <p className="legal-note">
              Official broadcast links may require a league login. No
              unlicensed stream matchers or geo-spoofing are used.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MultiViewModal({ items, onClose, proxyEnabled, removeSlot }) {
  return (
    <div
      className="modal-layer multi-layer"
      role="dialog"
      aria-modal="true"
      aria-label="Multi-view player"
    >
      <div className="multi-shell">
        <header className="player-head">
          <div>
            <span className="eyebrow">2-SCREEN MULTI-VIEW</span>
            <h2>Dual signal</h2>
            <p>
              Run two sources side by side. Browser autoplay may require a tap
              on each player.
            </p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close multi-view"
          >
            ✕
          </button>
        </header>

        <div className="multi-grid">
          {[0, 1].map((index) => {
            const item = items[index];

            return (
              <div
                className="multi-cell"
                key={item?.id || `empty-${index}`}
              >
                {item ? (
                  <>
                    <div className="multi-label">
                      <span>{item.title}</span>
                      <button
                        type="button"
                        onClick={() => removeSlot(item.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <MiniStreamPlayer
                      item={item}
                      proxyEnabled={proxyEnabled}
                    />
                  </>
                ) : (
                  <div className="multi-empty">
                    <span>+</span>
                    <p>
                      Add another card with “+ Multi-View” to populate this
                      screen.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CustomSourceModal({ open, onClose, onLaunch, proxyEnabled }) {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('hls');
  const [error, setError] = useState('');

  if (!open) return null;

  function submit(event) {
    event.preventDefault();

    const trimmed = url.trim();

    if (!isHttpUrl(trimmed)) {
      setError('Enter a full http(s) URL.');
      return;
    }

    setError('');
    onLaunch(trimmed, type);
    setUrl('');
  }

  return (
    <div className="modal-layer custom-layer" role="dialog" aria-modal="true">
      <div className="custom-shell">
        <header className="player-head">
          <div>
            <span className="eyebrow">CUSTOM SOURCE</span>
            <h2>Add an M3U8 or embed</h2>
            <p>
              Paste a lawful HLS manifest or an allowed iframe embed URL.
            </p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close custom source dialog"
          >
            ✕
          </button>
        </header>

        <form className="custom-form" onSubmit={submit}>
          <label>
            Source URL
            <input
              autoFocus
              type="url"
              inputMode="url"
              placeholder="https://example.com/live/master.m3u8"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </label>

          <label>
            Source type
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="hls">HLS / M3U8</option>
              <option value="embed">Iframe embed</option>
            </select>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <p className="modal-note">
            {type === 'hls' && proxyEnabled
              ? 'The CORS proxy is on. Only allowlisted hosts will be proxied; add trusted domains through PROXY_ALLOWED_HOSTS.'
              : 'Use only sources you are authorized to play. Iframes are not proxied by the browser.'}
          </p>

          <div className="custom-actions">
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Open Source
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="catalog-grid" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ activeTab, onReset }) {
  return (
    <div className="empty-state">
      <span className="empty-orbit" />
      <h2>No titles in this lane yet</h2>
      <p>
        The ESPN scoreboard or this category has no matching items right now.
        Try another tab or refresh the signal.
      </p>
      <button type="button" className="primary-btn" onClick={onReset}>
        Return to All
      </button>
    </div>
  );
}

export default function HomePage() {
  const [catalog, setCatalog] = useState({
    sports: [],
    movies: [],
    shows: [],
    channels: [],
    generatedAt: null,
  });
  const [loadState, setLoadState] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [pinned, setPinned] = useState([]);
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [selected, setSelected] = useState(null);
  const [multiSlots, setMultiSlots] = useState([]);
  const [multiOpen, setMultiOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);

  const fetchCatalog = useCallback(async () => {
    setLoadState('loading');
    setLoadError('');

    try {
      const response = await fetch('/api/catalog', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Catalog request failed (${response.status})`);
      }

      const data = await response.json();

      setCatalog({
        sports: safeArray(data.sports),
        movies: safeArray(data.movies),
        shows: safeArray(data.shows),
        channels: safeArray(data.channels),
        generatedAt: data.generatedAt || null,
      });

      setLoadState('ready');
    } catch (error) {
      setLoadState('error');
      setLoadError(error?.message || 'Unable to load the catalog.');
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PIN_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];

      if (Array.isArray(parsed)) {
        setPinned(parsed);
      }
    } catch {
      // Ignore unavailable storage.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pinned));
    } catch {
      // Ignore unavailable storage.
    }
  }, [pinned]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROXY_STORAGE_KEY);
      if (raw === '1') setProxyEnabled(true);
    } catch {
      // Ignore unavailable storage.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PROXY_STORAGE_KEY,
        proxyEnabled ? '1' : '0',
      );
    } catch {
      // Ignore unavailable storage.
    }
  }, [proxyEnabled]);

  useEffect(() => {
    if (multiSlots.length === 2) {
      setMultiOpen(true);
    }
  }, [multiSlots.length]);

  const togglePinned = useCallback((id) => {
    setPinned((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : [...previous, id],
    );
  }, []);

  const allItems = useMemo(
    () => [
      ...safeArray(catalog.sports),
      ...safeArray(catalog.movies),
      ...safeArray(catalog.shows),
      ...safeArray(catalog.channels),
    ],
    [catalog],
  );

  const highlightItems = useMemo(() => {
    const collected = [];

    for (const item of allItems) {
      for (const server of safeArray(item.servers)) {
        if (server.kind === 'highlight') {
          collected.push({
            ...item,
            id: `${item.id}:hi:${server.id || server.url}`,
            kind: 'highlight',
            title: `${item.title} — ${server.label || 'Highlight'}`,
            subtitle: 'Short highlight clip · not a full broadcast',
            servers: [server],
            live: false,
            badge: 'CLIP',
          });
        }
      }
    }

    return collected;
  }, [allItems]);

  const visibleItems = useMemo(() => {
    let items = [];

    if (activeTab === 'movies') {
      items = safeArray(catalog.movies);
    } else if (activeTab === 'shows') {
      items = safeArray(catalog.shows);
    } else if (activeTab === 'channels') {
      items = safeArray(catalog.channels);
    } else if (activeTab === 'highlights') {
      items = highlightItems;
    } else if (activeTab === 'live') {
      items = allItems.filter(
        (item) => item.live === true || item.kind === 'channel',
      );
    } else if (activeTab === 'pinned') {
      items = [...allItems, ...highlightItems].filter((item) =>
        pinned.includes(item.id),
      );
    } else if (SPORTS_TABS.has(activeTab)) {
      items = safeArray(catalog.sports).filter(
        (item) => item.category === activeTab,
      );
    } else {
      items = allItems;
    }

    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery) {
      items = items.filter((item) =>
        `${item.title || ''} ${item.subtitle || ''} ${
          item.description || ''
        } ${item.league || ''} ${item.category || ''}`
          .toLowerCase()
          .includes(normalizedQuery),
      );
    }

    return items;
  }, [
    activeTab,
    allItems,
    catalog,
    highlightItems,
    pinned,
    query,
  ]);

  const liveCount = useMemo(
    () =>
      allItems.filter(
        (item) =>
          item.live === true ||
          item.kind === 'channel' ||
          item.kind === 'sports',
      ).length,
    [allItems],
  );

  const openItem = useCallback((item, serverIndex = 0) => {
    if (!item) return;
    setSelected({ item, serverIndex });
  }, []);

  const addMulti = useCallback((item) => {
    if (!item) return;

    setMultiSlots((previous) => {
      if (previous.some((slot) => slot.id === item.id)) {
        return previous;
      }

      return [...previous, item].slice(-2);
    });
  }, []);

  const removeSlot = useCallback((id) => {
    setMultiSlots((previous) =>
      previous.filter((item) => item.id !== id),
    );
  }, []);

  const launchCustom = useCallback(
    (url, type) => {
      const item = {
        id: `custom:${Date.now()}`,
        kind: 'custom',
        category: 'custom',
        title:
          type === 'hls' ? 'Custom HLS stream' : 'Custom embedded stream',
        subtitle: 'User-provided lawful source',
        description: url,
        badge: 'CUSTOM',
        live: false,
        servers: [
          {
            id: 'custom-server',
            label: 'Custom source',
            type,
            url,
            kind: 'feature',
            quality: 'Custom',
            allowProxy: true,
            note: 'Only use sources you are authorized to access.',
          },
        ],
      };

      setCustomOpen(false);
      setSelected({ item, serverIndex: 0 });
    },
    [],
  );

  const fillPinned = useCallback(() => {
    setActiveTab('all');
  }, []);

  useEffect(() => {
    const anyModalOpen = Boolean(selected || multiOpen || customOpen);

    if (!anyModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selected, multiOpen, customOpen]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;

      if (selected) {
        setSelected(null);
        return;
      }

      if (customOpen) {
        setCustomOpen(false);
        return;
      }

      if (multiOpen) {
        setMultiOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected, customOpen, multiOpen]);

  const featured = visibleItems[0] || allItems[0] || null;
  const activeTabLabel =
    TABS.find((tab) => tab.id === activeTab)?.label || 'All';

  return (
    <div className="app-shell" id="top">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Live Wire home">
          <span className="brand-mark">
            <span />
          </span>
          <span className="brand-copy">
            <strong>LIVE WIRE</strong>
            <small>SPORTS · CINEMA · 24/7</small>
          </span>
        </a>

        <div className="search-wrap">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search games, movies, channels…"
            aria-label="Search catalog"
          />
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className={cx('ghost-btn', proxyEnabled && 'active')}
            onClick={() => setProxyEnabled((value) => !value)}
            title="Route allowlisted HLS through the server proxy"
          >
            CORS Proxy {proxyEnabled ? 'On' : 'Off'}
          </button>

          <button
            type="button"
            className="ghost-btn"
            onClick={() => setMultiOpen(true)}
          >
            Multi-View
            {multiSlots.length ? ` (${multiSlots.length}/2)` : ''}
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={() => setCustomOpen(true)}
          >
            + Custom
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="kicker">
              <span className="live-dot" />
              ESPN SCOREBOARDS · OFFICIAL BROADCASTS · OPEN MEDIA
            </div>

            <h1>
              One screen.
              <br />
              <span>Every kind of live.</span>
            </h1>

            <p>
              Live Wire blends live sports scoreboards, legal broadcaster
              destinations, open movies, public-domain classics, and 24/7
              channels into one fast interface. No Pluto. No misleading
              highlight-first servers.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="primary-btn"
                onClick={() => setActiveTab('live')}
              >
                Browse Live Now
              </button>

              <button
                type="button"
                className="ghost-btn"
                onClick={() => setActiveTab('movies')}
              >
                Open Cinema
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{liveCount}</strong>
                <span>live / 24-7</span>
              </div>
              <div>
                <strong>{safeArray(catalog.movies).length}</strong>
                <span>open films</span>
              </div>
              <div>
                <strong>{safeArray(catalog.shows).length}</strong>
                <span>open shows</span>
              </div>
              <div>
                <strong>{safeArray(catalog.sports).length}</strong>
                <span>ESPN events</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="signal-card">
              <span className="signal-label">SIGNAL PREVIEW</span>

              {featured ? (
                <>
                  <div className="signal-logos">
                    {featured.kind === 'sports' ? (
                      <>
                        <div className="signal-team">
                          <TeamLogo team={featured.game?.away} />
                          <span>
                            {featured.game?.away?.shortName || 'AWAY'}
                          </span>
                        </div>

                        <span className="signal-vs">VS</span>

                        <div className="signal-team">
                          <TeamLogo team={featured.game?.home} />
                          <span>
                            {featured.game?.home?.shortName || 'HOME'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="signal-poster">
                        <PosterArt item={featured} />
                      </div>
                    )}
                  </div>

                  <h2>{featured.title}</h2>
                  <p>
                    {featured.subtitle ||
                      featured.description ||
                      'Live Wire catalog'}
                  </p>

                  <button
                    type="button"
                    className="primary-btn wide"
                    onClick={() => openItem(featured)}
                  >
                    Open Featured Signal
                  </button>
                </>
              ) : (
                <>
                  <h2>Syncing catalog</h2>
                  <p>
                    ESPN scoreboards and the open-media catalog will appear
                    here as soon as the route responds.
                  </p>
                </>
              )}

              <div className="signal-ticker">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </section>

        <nav className="tab-rail" aria-label="Catalog categories">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={cx('tab', activeTab === tab.id && 'active')}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
              {tab.id === 'live' && liveCount ? (
                <span className="tab-count">{liveCount}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <section className="catalog-section">
          <div className="section-head">
            <div>
              <span className="eyebrow">NOW BROWSING</span>
              <h2>{activeTabLabel}</h2>
              {activeTab === 'highlights' ? (
                <p className="section-note">
                  Short clips live here — never above full broadcasts.
                </p>
              ) : null}
            </div>

            <div className="sync">
              <span>Updated {formatGenerated(catalog.generatedAt)}</span>
              <button type="button" onClick={fetchCatalog}>
                Refresh
              </button>
            </div>
          </div>

          {loadState === 'loading' ? (
            <SkeletonGrid />
          ) : loadState === 'error' ? (
            <div className="empty-state">
              <span className="empty-orbit" />
              <h2>Catalog signal lost</h2>
              <p>{loadError}</p>
              <button type="button" className="primary-btn" onClick={fetchCatalog}>
                Retry
              </button>
            </div>
          ) : visibleItems.length === 0 ? (
            <EmptyState activeTab={activeTab} onReset={fillPinned} />
          ) : (
            <div className="catalog-grid" key={activeTab}>
              {visibleItems.map((item, index) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  index={index}
                  pinned={pinned.includes(item.id)}
                  onPin={togglePinned}
                  onPlay={openItem}
                  onMultiView={addMulti}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="site-footer">
          <span>LIVE WIRE</span>
          <span>
            ESPN scoreboards are public data. Broadcast buttons open official
            rights-holder destinations. Movies, shows, and open channels are
            public-domain or openly licensed sources.
          </span>
          <span>No Pluto TV URLs. No geo-spoofing.</span>
        </footer>
      </main>

      {selected ? (
        <PlayerModal
          item={selected.item}
          initialServerIndex={selected.serverIndex}
          onClose={() => setSelected(null)}
          onAddMultiView={addMulti}
          proxyEnabled={proxyEnabled}
          setProxyEnabled={setProxyEnabled}
        />
      ) : null}

      {multiOpen ? (
        <MultiViewModal
          items={multiSlots}
          onClose={() => setMultiOpen(false)}
          proxyEnabled={proxyEnabled}
          removeSlot={removeSlot}
        />
      ) : null}

      <CustomSourceModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onLaunch={launchCustom}
        proxyEnabled={proxyEnabled}
      />
    </div>
  );
}
