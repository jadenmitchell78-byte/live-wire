// Shared (client + server safe) stream-source helpers.
// Third-party embed hosts are unlicensed aggregators that may show pop-ups/redirects.
// They are flagged so the UI can keep them opt-in and clearly labeled.

export const THIRD_PARTY_HOSTS = [
  'embedme.top',
  'embedstreams.top',
  'streamed.pk',
  'streamed.su',
  'vidlink.pro',
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
        name: `VidSrc.cc Sub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidsrc.cc/v2/embed/anime/ani-${aniId}/${ep}/sub`,
      },
      {
        name: `VidSrc.cc Dub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidsrc.cc/v2/embed/anime/ani-${aniId}/${ep}/dub`,
      },
    );
  }
  if (malId) {
    servers.push(
      {
        name: `VidSrc MAL Sub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidsrc.cc/v2/embed/anime/mal-${malId}/${ep}/sub`,
      },
      {
        name: `VidSrc MAL Dub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidsrc.cc/v2/embed/anime/mal-${malId}/${ep}/dub`,
      },
      {
        name: `VidLink Sub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidlink.pro/anime/${malId}/${ep}/sub`,
      },
      {
        name: `VidLink Dub · Ep ${ep}`,
        type: 'embed',
        url: `https://vidlink.pro/anime/${malId}/${ep}/dub`,
      },
    );
  }
  return withFlags(servers);
}

export function buildTvServers(imdbId, season = 1, ep = 1) {
  if (!imdbId) return [];
  return withFlags([
    {
      name: `VidSrc.icu · S${season}E${ep}`,
      type: 'embed',
      url: `https://vidsrc.icu/embed/tv/${imdbId}/${season}/${ep}`,
    },
    {
      name: `SuperEmbed VIP · S${season}E${ep}`,
      type: 'embed',
      url: `https://multiembed.mov/directstream.php?video_id=${imdbId}&s=${season}&e=${ep}`,
    },
    {
      name: `VidSrc.net · S${season}E${ep}`,
      type: 'embed',
      url: `https://vidsrc.net/embed/tv?imdb=${imdbId}&season=${season}&episode=${ep}`,
    },
    {
      name: `Embed.su · S${season}E${ep}`,
      type: 'embed',
      url: `https://embed.su/embed/tv/${imdbId}/${season}/${ep}`,
    },
    {
      name: `AutoEmbed · S${season}E${ep}`,
      type: 'embed',
      url: `https://player.autoembed.cc/embed/tv/${imdbId}/${season}/${ep}`,
    },
    {
      name: `VidSrc.xyz · S${season}E${ep}`,
      type: 'embed',
      url: `https://vidsrc.xyz/embed/tv?imdb=${imdbId}&season=${season}&episode=${ep}`,
    },
  ]);
}

export function isSeries(ev) {
  return (
    (ev?.mediaType === 'anime' && Boolean(ev.aniId || ev.malId)) ||
    (ev?.mediaType === 'tv' && Boolean(ev.imdbId))
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
  if (ev.mediaType === 'tv' && ev.imdbId) {
    return buildTvServers(ev.imdbId, season, episode);
  }
  return withFlags(ev.servers || []);
}
