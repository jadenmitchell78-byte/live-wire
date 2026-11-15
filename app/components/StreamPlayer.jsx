'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  AlertTriangle,
  CheckCircle2,
  PictureInPicture2,
  RefreshCw,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';

const STALL_MS = 9000;

export const FIT_CLASSES = {
  contain: 'object-contain',
  cover: 'object-cover',
  zoom: 'object-cover scale-125',
};

// Remount this component per stream URL (key={url}) so all state resets cleanly.
export default function StreamPlayer({
  stream,
  title,
  subtitle,
  useProxy,
  isMuted,
  onToggleMute,
  onFail,
  onNext,
  hasNext = false,
  startAt = 0,
  onProgress,
  fitMode = 'contain',
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const hudTimer = useRef(null);
  const lastProgress = useRef(0);
  const failedRef = useRef(false);
  const onFailRef = useRef(onFail);
  const onProgressRef = useRef(onProgress);
  onFailRef.current = onFail;
  onProgressRef.current = onProgress;

  const [status, setStatus] = useState('loading');
  const [resolution, setResolution] = useState('AUTO');
  const [retrySeed, setRetrySeed] = useState(0);
  const [autoProxied, setAutoProxied] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);
  const [adShield, setAdShield] = useState(false);

  const isEmbed = stream?.type === 'embed';
  const isLink = stream?.type === 'link';
  const isDirectMp4 = Boolean(
    stream?.type === 'mp4' ||
      (stream?.url && (/\.mp4(?:$|\?)/i.test(stream.url) || String(stream.url).startsWith('/api/archive-stream'))),
  );
  const effectiveProxy = (useProxy || autoProxied) && !isEmbed && !isLink;

  const finalUrl = useMemo(() => {
    if (!stream?.url) return '';
    if (effectiveProxy && !String(stream.url).startsWith('/api/')) {
      const externalBase = (process.env.NEXT_PUBLIC_HLS_PROXY_URL || '').trim().replace(/\/+$/, '');
      if (externalBase) {
        return `${externalBase}/?url=${encodeURIComponent(stream.url)}`;
      }
      return `/api/proxy?url=${encodeURIComponent(stream.url)}`;
    }
    return stream.url;
  }, [stream, effectiveProxy]);

  const fail = (reason) => {
    if (failedRef.current) return;
    failedRef.current = true;
    setStatus('error');
    onFailRef.current?.(reason);
  };

  // HUD auto-hide after taps
  const pokeHud = () => {
    setHudVisible(true);
    clearTimeout(hudTimer.current);
    hudTimer.current = setTimeout(() => setHudVisible(false), 3500);
  };
  useEffect(() => {
    pokeHud();
    return () => clearTimeout(hudTimer.current);
  }, []);

  // Stall watchdog: still loading after STALL_MS -> try proxy once (HLS/MP4), else report failure
  useEffect(() => {
    if (status !== 'loading') return undefined;
    if (isLink) {
      setStatus('playing');
      return undefined;
    }
    if (isEmbed) {
      // Some cross-origin embed iframes never fire onLoad smoothly; clear spinner after 2.5s so user can click play inside iframe
      const embedTimer = setTimeout(() => {
        setStatus((prev) => (prev === 'loading' ? 'playing' : prev));
      }, 2500);
      return () => clearTimeout(embedTimer);
    }
    const t = setTimeout(() => {
      if (!effectiveProxy && !String(stream?.url || '').startsWith('/api/')) {
        setAutoProxied(true);
      } else {
        fail('timeout');
      }
    }, STALL_MS);
    return () => clearTimeout(t);
  }, [status, finalUrl, retrySeed, isEmbed, effectiveProxy, stream?.url]);

  useEffect(() => {
    failedRef.current = false;
    if (!stream?.url) return undefined;
    if (isLink) {
      setStatus('playing');
      return undefined;
    }
    setStatus('loading');
    if (isEmbed) return undefined;

    const video = videoRef.current;
    if (!video || !finalUrl) return undefined;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const seekResume = () => {
      if (startAt > 5 && Number.isFinite(video.duration) && startAt < video.duration - 10) {
        video.currentTime = startAt;
      }
    };

    const onTime = () => {
      const now = Date.now();
      if (now - lastProgress.current > 5000) {
        lastProgress.current = now;
        onProgressRef.current?.(video.currentTime, video.duration);
      }
    };
    video.addEventListener('timeupdate', onTime);

    if (isDirectMp4 || !Hls.isSupported()) {
      if (!isDirectMp4 && !video.canPlayType('application/vnd.apple.mpegurl')) {
        fail('unsupported');
        return () => video.removeEventListener('timeupdate', onTime);
      }
      video.src = finalUrl;
      const onLoaded = () => {
        setResolution(isDirectMp4 ? 'MP4' : 'HLS');
        setStatus('playing');
        seekResume();
        video.play().catch(() => {});
      };
      const onErr = () => fail('error');
      video.addEventListener('loadedmetadata', onLoaded);
      video.addEventListener('error', onErr);
      return () => {
        video.removeEventListener('timeupdate', onTime);
        video.removeEventListener('loadedmetadata', onLoaded);
        video.removeEventListener('error', onErr);
        video.removeAttribute('src');
        video.load();
      };
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 60,
      startPosition: startAt > 5 ? startAt : -1,
    });
    hlsRef.current = hls;
    hls.loadSource(finalUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      const highest = data.levels?.[data.levels.length - 1];
      if (highest?.height) setResolution(`${highest.height}p`);
      setStatus('playing');
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    });

    let mediaRecoveries = 0;
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return;
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !effectiveProxy) {
        setAutoProxied(true);
        return;
      }
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRecoveries < 2) {
        mediaRecoveries += 1;
        hls.recoverMediaError();
        return;
      }
      hls.destroy();
      hlsRef.current = null;
      fail('error');
    });

    return () => {
      video.removeEventListener('timeupdate', onTime);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [finalUrl, retrySeed]);

  const handlePiP = async (e) => {
    e.stopPropagation();
    try {
      if (videoRef.current && document.pictureInPictureElement !== videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      } else if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
    } catch {}
  };

  const retry = (e) => {
    e?.stopPropagation();
    failedRef.current = false;
    setStatus('loading');
    setRetrySeed((s) => s + 1);
  };

  const fitClass = FIT_CLASSES[fitMode] || FIT_CLASSES.contain;
  const showHud = hudVisible || status !== 'playing';

  return (
    <div
      onClick={pokeHud}
      onMouseMove={pokeHud}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.85)]"
    >
      <div
        className={`absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${
          showHud ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 min-w-0">
          <span className="h-2 w-2 rounded-full bg-[#E50914] animate-pulse shrink-0" />
          <span className="text-xs font-bold tracking-wide uppercase text-white truncate max-w-[180px] sm:max-w-xs">
            {title}
          </span>
          {subtitle && <span className="text-xs text-gray-400 hidden sm:inline truncate">• {subtitle}</span>}
        </div>
        {isLink ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0e111a] to-[#05060a] p-6 text-center gap-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            Official Broadcaster Destination
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white">{stream.name || title}</h3>
          <p className="text-xs text-gray-400 max-w-md">
            Live game broadcasts are hosted by the official league or network rights holder.
          </p>
          <a
            href={stream.url}
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#f6121d] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition"
          >
            Open Official Broadcast ↗
          </a>
        </div>
      ) : isEmbed ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAdShield((s) => !s);
              setRetrySeed((r) => r + 1);
            }}
            className={`pointer-events-auto flex items-center gap-1.5 backdrop-blur-md px-2.5 py-1 rounded-md border text-[11px] font-bold transition ${
              adShield
                ? 'bg-emerald-950/85 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/85 border-amber-500/50 text-amber-300'
            }`}
            title="Ad-Shield Strict Sandbox blocks all pop-ups & redirects. Switch to Compat if an embed player refuses sandbox."
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {adShield ? 'Ad-Shield: STRICT (No Pop-Ups)' : 'Ad-Shield: COMPAT'}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {resolution}
            {effectiveProxy && <span className="text-amber-300">· PROXY</span>}
          </div>
        )}
      </div>

      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 pointer-events-none">
          <RefreshCw className="w-9 h-9 text-[#E50914] animate-spin mb-2" />
          <span className="text-xs text-gray-300 font-medium tracking-wider uppercase">
            {autoProxied ? 'Retrying via proxy...' : 'Loading stream...'}
          </span>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
          <p className="text-sm font-bold text-white mb-1">This server didn&apos;t load</p>
          <p className="text-xs text-gray-400 max-w-md mb-4">
            {hasNext ? 'Switching to the next server…' : 'All servers tried. Retry, toggle Proxy, or use Open Source.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={retry}
              className="min-h-[40px] px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-md flex items-center gap-2 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
            {hasNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext?.();
                }}
                className="min-h-[40px] px-4 py-2 bg-[#E50914] hover:bg-[#f6121d] text-white text-xs font-bold rounded-md flex items-center gap-2 transition"
              >
                <SkipForward className="w-3.5 h-3.5" /> Next Server
              </button>
            )}
          </div>
        </div>
      )}

      {isLink ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0e111a] to-[#05060a] p-6 text-center gap-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
            Official Broadcaster Destination
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white">{stream.name || title}</h3>
          <p className="text-xs text-gray-400 max-w-md">
            Live game broadcasts are hosted by the official league or network rights holder.
          </p>
          <a
            href={stream.url}
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#f6121d] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition"
          >
            Open Official Broadcast ↗
          </a>
        </div>
      ) : isEmbed ? (
        <iframe
          key={`${stream.url}-${adShield ? 'strict' : 'compat'}-${retrySeed}`}
          src={stream.url}
          title={title || 'Stream'}
          onLoad={() => setStatus('playing')}
          sandbox={adShield ? 'allow-scripts allow-same-origin allow-forms allow-presentation' : undefined}
          className={`w-full h-full border-0 bg-black transition-transform duration-300 origin-center ${
            fitMode === 'zoom' ? 'scale-125' : ''
          }`}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      ) : (
        <video
          ref={videoRef}
          className={`w-full h-full bg-black transition-transform duration-300 ${fitClass}`}
          controls
          playsInline
          muted={isMuted}
        />
      )}

      {!isEmbed && !isLink && (
        <div
          className={`absolute bottom-14 right-3 z-20 flex items-center gap-2 transition-opacity duration-300 ${
            showHud ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute?.();
            }}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="w-10 h-10 flex items-center justify-center rounded-md bg-black/80 hover:bg-[#E50914] text-white border border-white/15 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handlePiP}
            aria-label="Picture in Picture"
            className="w-10 h-10 flex items-center justify-center rounded-md bg-black/80 hover:bg-[#E50914] text-white border border-white/15 transition"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>
          <button
            onClick={retry}
            aria-label="Reload stream"
            className="w-10 h-10 flex items-center justify-center rounded-md bg-black/80 hover:bg-[#E50914] text-white border border-white/15 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
