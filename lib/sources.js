// Shared (client + server safe) stream-source helpers.
// Third-party embed hosts are unlicensed aggregators that may show pop-ups/redirects.
// They are flagged so the UI can keep them opt-in and clearly labeled.

export const THIRD_PARTY_HOSTS = [
  'embedme.top',
  'embedstreams.top',
  'thedaddy.li',
  'thedaddy.pk',
  'dlhd.dad',
  'ppv.st',
  'ppv.to',
  'streamed.pk',
  'streamed.su',
  'vidlink.pro',
  'vidcore.org',
  'vidsrc.vip',
  'vidsrc.me',
  'vidsrc.cc',
  'vidsrc.icu',
  'vidsrc.net',
  'vidsrc.xyz',
  'vidsrc.to',
  'multiembed.mov',
  'autoembed.cc',
  '2embed.cc',
  '2anime.xyz',
  'embed.su',
];

export function isThirdPartyUrl(url) {
  if (!url) return false;
  if (String(url).startsWith('/api/streamed')) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return THIRD_PARTY_HOSTS.some((t) => host === t || host.endsWith(`.${t}`));
  } catch {
    return false;
  }
}

export function withFlags(servers = []) {
  return servers.map((s) => ({ ...s, thirdParty: s.thirdParty ?? isThirdPartyUrl(s.url) }));
}

export function buildAnimeServers(aniId, malId, ep = 1) {
  const servers = [];
  if (malId) {
    servers.push(
      {
        name: `VidLink Pro Sub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidlink.pro/anime/${malId}/${ep}/sub?autoplay=true`,
      },
      {
        name: `VidLink Pro Dub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidlink.pro/anime/${malId}/${ep}/dub?autoplay=true`,
      },
      {
        name: `VidSrc.cc MAL Sub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidsrc.cc/v2/embed/anime/mal-${malId}/${ep}/sub`,
      },
      {
        name: `VidSrc.cc MAL Dub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidsrc.cc/v2/embed/anime/mal-${malId}/${ep}/dub`,
      },
    );
  }
  if (aniId) {
    servers.push(
      {
        name: `VidSrc.icu Sub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidsrc.icu/embed/anime/${aniId}/${ep}/0`,
      },
      {
        name: `VidSrc.icu Dub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidsrc.icu/embed/anime/${aniId}/${ep}/1`,
      },
      {
        name: `VidSrc.cc Ani Sub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidsrc.cc/v2/embed/anime/ani-${aniId}/${ep}/sub`,
      },
      {
        name: `VidSrc.cc Ani Dub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidsrc.cc/v2/embed/anime/ani-${aniId}/${ep}/dub`,
      },
    );
  }
  return withFlags(servers);
}

export function buildTvServers(imdbId, season = 1, ep = 1, tmdbId = null) {
  if (!imdbId && !tmdbId) return [];
  const servers = [];
  if (tmdbId) {
    servers.push(
      {
        name: `VidCore 4K · S${season}E${ep}`,
        type: 'embed',
        url: `https://vidcore.org/embed/tv/${tmdbId}/${season}/${ep}?autoplay=true&theme=e50914`,
      },
      {
        name: `VidLink Pro · S${season}E${ep}`,
        type: 'embed',
        url: `https://vidlink.pro/tv/${tmdbId}/${season}/${ep}?autoplay=true&primaryColor=e50914`,
      },
      {
        name: `VidSrc.vip · S${season}E${ep}`,
        type: 'embed',
        url: `https://vidsrc.vip/embed/tv/${tmdbId}/${season}/${ep}`,
      },
      {
        name: `VidSrc.cc · S${season}E${ep}`,
        type: 'embed',
        url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${ep}`,
      },
      {
        name: `Embed.su · S${season}E${ep}`,
        type: 'embed',
        url: `https://embed.su/embed/tv/${tmdbId}/${season}/${ep}`,
      },
    );
  }
  if (imdbId) {
    servers.push(
      {
        name: `VidSrc.me · S${season}E${ep}`,
        type: 'embed',
        url: `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${ep}`,
      },
      {
        name: `VidSrc.xyz · S${season}E${ep}`,
        type: 'embed',
        url: `https://vidsrc.xyz/embed/tv?imdb=${imdbId}&season=${season}&episode=${ep}`,
      },
      {
        name: `SuperEmbed · S${season}E${ep}`,
        type: 'embed',
        url: `https://multiembed.mov/?video_id=${imdbId}&s=${season}&e=${ep}`,
      },
      {
        name: `AutoEmbed · S${season}E${ep}`,
        type: 'embed',
        url: `https://player.autoembed.cc/embed/tv/${tmdbId || imdbId}/${season}/${ep}`,
      },
      {
        name: `VidSrc.to · S${season}E${ep}`,
        type: 'embed',
        url: `https://vidsrc.to/embed/tv/${imdbId}/${season}/${ep}`,
      },
    );
  }
  return withFlags(servers);
}

export function buildMovieServers(imdbId, tmdbId = null) {
  if (!imdbId && !tmdbId) return [];
  const servers = [];
  if (tmdbId) {
    servers.push(
      {
        name: 'VidCore · 4K HDR',
        type: 'embed',
        url: `https://vidcore.org/embed/movie/${tmdbId}?autoplay=true&theme=e50914`,
      },
      {
        name: 'VidLink Pro · 1080p',
        type: 'embed',
        url: `https://vidlink.pro/movie/${tmdbId}?autoplay=true&primaryColor=e50914`,
      },
      {
        name: 'VidSrc.vip · 1080p',
        type: 'embed',
        url: `https://vidsrc.vip/embed/movie/${tmdbId}`,
      },
      {
        name: 'VidSrc.cc · 1080p',
        type: 'embed',
        url: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
      },
      {
        name: 'Embed.su · 1080p',
        type: 'embed',
        url: `https://embed.su/embed/movie/${tmdbId}`,
      },
    );
  }
  if (imdbId) {
    servers.push(
      {
        name: 'VidSrc.me · HD',
        type: 'embed',
        url: `https://vidsrc.me/embed/movie?imdb=${imdbId}`,
      },
      {
        name: 'VidSrc.xyz · HD',
        type: 'embed',
        url: `https://vidsrc.xyz/embed/movie?imdb=${imdbId}`,
      },
      {
        name: 'SuperEmbed · HD',
        type: 'embed',
        url: `https://multiembed.mov/?video_id=${imdbId}`,
      },
      {
        name: 'AutoEmbed · HD',
        type: 'embed',
        url: `https://player.autoembed.cc/embed/movie/${tmdbId || imdbId}`,
      },
      {
        name: 'VidSrc.to · HD',
        type: 'embed',
        url: `https://vidsrc.to/embed/movie/${imdbId}`,
      },
    );
  }
  return withFlags(servers);
}

export function isSeries(ev) {
  return (
    (ev?.mediaType === 'anime' && Boolean(ev.aniId || ev.malId)) ||
    (ev?.mediaType === 'tv' && Boolean(ev.imdbId || ev.tmdbId))
  );
}

export function isOnDemand(ev) {
  if (!ev) return false;
  if (isSeries(ev)) return true;
  return !ev.isLive && (ev.category === 'Movies' || ev.category === 'Shows' || ev.category === 'Anime');
}

export function resolveServers(ev, season = 1, episode = 1) {
  if (!ev) return [];
  if (ev.mediaType === 'anime' && (ev.aniId || ev.malId)) {
    return buildAnimeServers(ev.aniId, ev.malId, episode);
  }
  if (ev.mediaType === 'tv' && (ev.imdbId || ev.tmdbId)) {
    return buildTvServers(ev.imdbId, season, episode, ev.tmdbId);
  }
  if (ev.mediaType === 'movie' && (ev.imdbId || ev.tmdbId)) {
    return [...withFlags(ev.servers || []), ...buildMovieServers(ev.imdbId, ev.tmdbId)];
  }
  return withFlags(ev.servers || []);
}
