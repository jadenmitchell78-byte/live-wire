import { unstable_cache } from 'next/cache';
import { buildAnimeServers, buildTvServers, withFlags } from './sources';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

const STREAMED_BASES = ['https://streamed.pk', 'https://streamed.su'];

const ESPN_ENDPOINTS = [
  { category: 'NFL', league: 'NFL', url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard' },
  { category: 'NBA', league: 'NBA', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard' },
  { category: 'NHL', league: 'NHL', url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard' },
  { category: 'MLB', league: 'MLB', url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard' },
  { category: 'College', league: 'NCAAB', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard' },
  { category: 'College', league: 'NCAAF', url: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard' },
  { category: 'Soccer', league: 'EPL', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard' },
  { category: 'Soccer', league: 'UCL', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard' },
  { category: 'Soccer', league: 'MLS', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard' },
  { category: 'MMA', league: 'UFC / MMA', url: 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard' },
];

const LOGO_NFL = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png';
const LOGO_NBA = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';
const LOGO_UFC = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/ufc.png';
const REDBULL_HLS = 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8';

const NETWORK_MAP = {
  NFL: 'https://embedme.top/embed/alpha/nfl-network/1',
  NBA: 'https://embedme.top/embed/alpha/nba-tv/1',
  NHL: 'https://embedme.top/embed/alpha/nhl-network/1',
  MLB: 'https://embedme.top/embed/alpha/mlb-network/1',
  College: 'https://embedme.top/embed/alpha/espn/1',
  Soccer: 'https://embedme.top/embed/alpha/sky-sports-premier-league/1',
  MMA: 'https://embedme.top/embed/alpha/tnt-sports-1/1',
};

export const CHANNELS_24_7 = [
  {
    id: 'ch-redzone',
    title: 'NFL RedZone & NFL Network',
    shortTitle: 'NFL RedZone',
    category: 'Channels',
    league: 'NFL NETWORK',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'NFL RedZone', score: 'LIVE', logo: LOGO_NFL },
    awayTeam: { name: 'NFL Network', score: '24/7', logo: LOGO_NFL },
    servers: [
      { name: 'RedZone Embed', type: 'embed', url: 'https://embedme.top/embed/alpha/nfl-redzone/1' },
      { name: 'NFL Network Embed', type: 'embed', url: 'https://embedme.top/embed/alpha/nfl-network/1' },
      { name: 'Red Bull TV (backup channel, not NFL)', type: 'hls', url: REDBULL_HLS },
    ],
  },
  {
    id: 'ch-espn',
    title: 'ESPN Main Broadcast',
    shortTitle: 'ESPN HD',
    category: 'Channels',
    league: 'ESPN HD',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'ESPN', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: 'SportsCenter', score: '24/7', logo: LOGO_NFL },
    servers: [
      { name: 'ESPN Embed', type: 'embed', url: 'https://embedme.top/embed/alpha/espn/1' },
      { name: 'ESPN2 Embed', type: 'embed', url: 'https://embedme.top/embed/alpha/espn-2/1' },
    ],
  },
  {
    id: 'ch-nbatv',
    title: 'NBA TV',
    shortTitle: 'NBA TV',
    category: 'Channels',
    league: 'NBA TV',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'NBA TV', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: 'TNT', score: '24/7', logo: LOGO_NBA },
    servers: [
      { name: 'NBA TV Embed', type: 'embed', url: 'https://embedme.top/embed/alpha/nba-tv/1' },
      { name: 'TNT Embed', type: 'embed', url: 'https://embedme.top/embed/alpha/tnt/1' },
    ],
  },
  {
    id: 'ch-redbull',
    title: 'Red Bull TV Action Sports',
    shortTitle: 'Red Bull TV',
    category: 'Channels',
    league: 'OFFICIAL · HLS',
    status: 'LIVE 24/7',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Red Bull TV', score: 'HD', logo: LOGO_UFC },
    awayTeam: { name: 'Action Sports', score: 'LIVE', logo: LOGO_UFC },
    servers: [{ name: 'Official HLS', type: 'hls', url: REDBULL_HLS }],
  },
  {
    id: 'ch-nasa',
    title: 'NASA TV Public',
    shortTitle: 'NASA TV',
    category: 'Channels',
    league: 'OFFICIAL · HLS',
    status: 'LIVE 24/7',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'NASA TV', score: 'HD', logo: LOGO_NFL },
    awayTeam: { name: 'Live Earth', score: '24/7', logo: LOGO_NBA },
    servers: [{ name: 'NASA Official HLS', type: 'hls', url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8' }],
  },
  {
    id: 'ch-dw',
    title: 'DW News English',
    shortTitle: 'DW News',
    category: 'Channels',
    league: 'OFFICIAL · NEWS',
    status: 'LIVE 24/7',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'DW', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: 'English', score: 'HD', logo: LOGO_NFL },
    servers: [{ name: 'DW Official HLS', type: 'hls', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8' }],
  },
];

export const OPEN_MOVIES = [
  {
    id: 'mov-big-buck-bunny',
    title: 'Big Buck Bunny',
    shortTitle: 'Big Buck Bunny',
    category: 'Movies',
    league: 'ANIMATION · OPEN MOVIE',
    status: 'HD',
    isLive: false,
    description: 'A giant, gentle rabbit takes on three bullying rodents in the Blender Foundation\'s classic open movie.',
    genres: ['Animation', 'Comedy'],
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Blender Studio', score: '1080p', logo: LOGO_NBA },
    awayTeam: { name: 'Open Movie', score: 'HLS', logo: LOGO_NFL },
    servers: [{ name: 'Mux Adaptive HLS', type: 'hls', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }],
  },
  {
    id: 'mov-sintel',
    title: 'Sintel',
    shortTitle: 'Sintel',
    category: 'Movies',
    league: 'FANTASY · OPEN MOVIE',
    status: 'HD',
    isLive: false,
    description: 'A lonely young woman searches for the baby dragon she once rescued.',
    genres: ['Fantasy', 'Animation'],
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Durian Project', score: '1080p', logo: LOGO_NBA },
    awayTeam: { name: 'Open Movie', score: 'HLS', logo: LOGO_NFL },
    servers: [{ name: 'Bitdash HLS', type: 'hls', url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8' }],
  },
  {
    id: 'mov-tears-of-steel',
    title: 'Tears of Steel',
    shortTitle: 'Tears of Steel',
    category: 'Movies',
    league: 'SCI-FI · OPEN MOVIE',
    status: '4K',
    isLive: false,
    description: 'Warriors and scientists in future Amsterdam try to save the world from destructive robots.',
    genres: ['Sci-Fi'],
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Mango Studio', score: '4K', logo: LOGO_NBA },
    awayTeam: { name: 'Open Movie', score: 'HLS', logo: LOGO_NFL },
    servers: [{ name: 'Unified HLS', type: 'hls', url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8' }],
  },
  {
    id: 'mov-night-living-dead',
    title: 'Night of the Living Dead (1968)',
    shortTitle: 'Night of the Living Dead',
    category: 'Movies',
    league: 'CLASSIC HORROR · PUBLIC DOMAIN',
    status: 'ARCHIVE',
    isLive: false,
    description: 'George A. Romero\'s public-domain horror classic.',
    genres: ['Horror', 'Classic'],
    poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Public Domain', score: 'MP4', logo: LOGO_NBA },
    awayTeam: { name: 'Archive.org', score: 'HD', logo: LOGO_NFL },
    servers: [{ name: 'Internet Archive MP4', type: 'hls', url: 'https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4' }],
  },
];

export const OPEN_SHOWS = [
  {
    id: 'show-france24',
    title: 'France 24 English',
    shortTitle: 'France 24',
    category: 'Shows',
    league: 'OFFICIAL · WORLD NEWS',
    status: 'LIVE',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'France 24', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: 'English', score: 'HD', logo: LOGO_NFL },
    servers: [{ name: 'France 24 HLS', type: 'hls', url: 'https://static.france24.com/live/F24_EN_HI_HLS/live_web.m3u8' }],
  },
  {
    id: 'show-aljazeera',
    title: 'Al Jazeera English',
    shortTitle: 'Al Jazeera',
    category: 'Shows',
    league: 'OFFICIAL · NEWS',
    status: 'LIVE',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Al Jazeera', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: 'Global', score: 'HD', logo: LOGO_NFL },
    servers: [{ name: 'Al Jazeera HLS', type: 'hls', url: 'https://live-hls-web-aje.getaj.net/AJE/index.m3u8' }],
  },
];

const flag = (ev) => ({ ...ev, servers: withFlags(ev.servers) });

function stripHtml(text = '') {
  return String(text || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 450);
}

async function fetchJson(url, timeoutMs = 4000, revalidateSec = 60) {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: revalidateSec },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchAniList(query, variables, timeoutMs = 4500) {
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

const ANILIST_FIELDS = `
  id
  idMal
  isAdult
  title { english romaji }
  coverImage { extraLarge large }
  bannerImage
  episodes
  averageScore
  seasonYear
  format
  genres
  description(asHtml: false)
`;

const ANILIST_SEARCH_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 10) {
    media(search: $search, type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${ANILIST_FIELDS} }
  }
}`;

const ANILIST_HOME_QUERY = `
query ($from: Int, $to: Int) {
  trending: Page(page: 1, perPage: 14) {
    media(type: ANIME, status: RELEASING, sort: TRENDING_DESC, isAdult: false) { ${ANILIST_FIELDS} }
  }
  top: Page(page: 1, perPage: 14) {
    media(type: ANIME, sort: SCORE_DESC, isAdult: false) { ${ANILIST_FIELDS} }
  }
  airing: Page(page: 1, perPage: 30) {
    airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
      episode
      airingAt
      media { ${ANILIST_FIELDS} }
    }
  }
}`;

function mapAniListMedia(a, extra = {}) {
  const title = a.title?.english || a.title?.romaji || 'Anime';
  const poster = a.coverImage?.extraLarge || a.coverImage?.large || '';
  const score = a.averageScore ? (a.averageScore / 10).toFixed(1) : null;
  return {
    id: `ani-${a.id}`,
    title,
    shortTitle: title,
    category: 'Shows',
    league: `ANIME · ${a.seasonYear || a.format || 'SERIES'}`,
    status: a.episodes ? `${a.episodes} EPS` : 'AIRING',
    rating: score,
    isLive: false,
    poster,
    bannerImage: a.bannerImage || poster,
    description: stripHtml(a.description),
    genres: (a.genres || []).slice(0, 5),
    mediaType: 'anime',
    aniId: a.id,
    malId: a.idMal || null,
    totalEpisodes: Math.min(Number(a.episodes) || 24, 500),
    homeTeam: { name: 'AniList', score: score ? `★${score}` : 'HD', logo: poster },
    awayTeam: { name: a.format || 'Anime', score: `${a.episodes || '?'} EP`, logo: poster },
    servers: buildAnimeServers(a.id, a.idMal, 1),
    ...extra,
  };
}

function mapTvmazeShow(s, extra = {}) {
  const poster = s.image?.original || s.image?.medium || '';
  const imdbId = s.externals?.imdb || '';
  const year = s.premiered ? s.premiered.slice(0, 4) : '';
  return {
    id: `tvm-${s.id}`,
    title: s.name || 'TV Show',
    shortTitle: s.name || 'TV Show',
    category: 'Shows',
    league: `TV · ${year || 'SERIES'}${s.network?.name ? ` · ${s.network.name}` : s.webChannel?.name ? ` · ${s.webChannel.name}` : ''}`,
    status: s.status || 'SERIES',
    rating: s.rating?.average ? String(s.rating.average) : null,
    isLive: false,
    poster,
    bannerImage: poster,
    description: stripHtml(s.summary),
    genres: (s.genres || []).slice(0, 5),
    mediaType: 'tv',
    imdbId,
    tvmazeId: s.id,
    totalEpisodes: 24,
    homeTeam: { name: 'TVmaze', score: s.rating?.average || 'HD', logo: poster },
    awayTeam: { name: s.genres?.[0] || 'Series', score: year || 'TV', logo: poster },
    servers: buildTvServers(imdbId, 1, 1),
    ...extra,
  };
}

function buildGameServers(category, streamedMatch) {
  const servers = [];
  (streamedMatch?.sources || []).slice(0, 4).forEach((src, i) => {
    if (src?.source && src?.id) {
      servers.push({
        name: `${String(src.source).toUpperCase()} Feed ${i + 1}`,
        type: 'embed',
        url: `https://embedme.top/embed/${src.source}/${src.id}/1`,
      });
    }
  });
  servers.push({
    name: `${category} Network (not game-specific)`,
    type: 'embed',
    url: NETWORK_MAP[category] || NETWORK_MAP.College,
  });
  return withFlags(servers);
}

async function fetchStreamedMatches() {
  for (const base of STREAMED_BASES) {
    const [live, today] = await Promise.all([
      fetchJson(`${base}/api/matches/live`, 4000, 60),
      fetchJson(`${base}/api/matches/all-today`, 4000, 60),
    ]);
    const liveIds = new Set();
    const map = new Map();
    if (Array.isArray(live)) {
      for (const m of live) {
        if (m?.id) {
          liveIds.add(m.id);
          map.set(m.id, m);
        }
      }
    }
    if (Array.isArray(today)) {
      for (const m of today) {
        if (m?.id && !map.has(m.id)) map.set(m.id, m);
      }
    }
    if (map.size > 0) {
      return { base, matches: Array.from(map.values()), liveIds };
    }
  }
  return { base: STREAMED_BASES[0], matches: [], liveIds: new Set() };
}

async function fetchArchiveCatalog(query, category, label, page = 1, rows = 18) {
  try {
    const searchUrl =
      `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}` +
      `&fl[]=identifier,title,year,description&sort[]=downloads+desc&rows=${rows}&page=${page}&output=json`;
    const searchData = await fetchJson(searchUrl, 4000, 900);
    const docs = searchData?.response?.docs || [];
    if (!docs.length) return [];

    const resolved = await Promise.allSettled(
      docs.map(async (doc) => {
        const id = doc.identifier;
        if (!id) return null;
        const meta = await fetchJson(`https://archive.org/metadata/${encodeURIComponent(id)}/files`, 3500, 3600);
        const files = meta?.result || [];
        const file =
          files.find((f) => /\.mp4$/i.test(f?.name || '') && !/sample/i.test(f?.name || '')) ||
          files.find((f) => /\.m3u8$/i.test(f?.name || ''));
        if (!file?.name) return null;

        const streamUrl = `https://archive.org/download/${encodeURIComponent(id)}/${file.name
          .split('/')
          .map(encodeURIComponent)
          .join('/')}`;
        const cleanTitle = String(doc.title || id).slice(0, 70);
        const desc = Array.isArray(doc.description) ? doc.description[0] : doc.description;

        return {
          id: `ia-${category.toLowerCase()}-${id}`,
          title: `${cleanTitle}${doc.year ? ` (${doc.year})` : ''}`,
          shortTitle: cleanTitle,
          category,
          league: `${label}${doc.year ? ` · ${doc.year}` : ''}`,
          status: 'PUBLIC DOMAIN',
          isLive: false,
          poster: `https://archive.org/services/img/${encodeURIComponent(id)}`,
          description: stripHtml(desc),
          genres: [label],
          homeTeam: { name: 'Archive.org', score: 'MP4', logo: LOGO_NBA },
          awayTeam: { name: label, score: 'HD', logo: LOGO_NFL },
          servers: withFlags([{ name: 'Internet Archive', type: 'hls', url: streamUrl }]),
        };
      }),
    );

    return resolved.filter((r) => r.status === 'fulfilled' && r.value).map((r) => r.value);
  } catch {
    return [];
  }
}

async function fetchTvAiringToday() {
  const data = await fetchJson('https://api.tvmaze.com/schedule?country=US', 4000, 900);
  if (!Array.isArray(data)) return [];
  const seen = new Set();
  const out = [];
  for (const ep of data) {
    const s = ep.show;
    if (!s?.id || seen.has(s.id) || !s.externals?.imdb || !s.image) continue;
    seen.add(s.id);
    out.push(
      mapTvmazeShow(s, {
        status: `S${ep.season}E${ep.number} TODAY`,
        startTime: ep.airstamp ? Date.parse(ep.airstamp) : null,
      }),
    );
    if (out.length >= 20) break;
  }
  return out;
}

async function fetchEspnEvents(streamedMatches) {
  const results = await Promise.allSettled(
    ESPN_ENDPOINTS.map(async (ep) => {
      const data = await fetchJson(ep.url, 4000, 30);
      if (!data) return [];

      return (data.events || []).slice(0, 30).map((ev) => {
        const comp = ev.competitions?.[0];
        const competitors = comp?.competitors || [];
        const home = competitors.find((c) => c.homeAway === 'home') || competitors[0] || {};
        const away = competitors.find((c) => c.homeAway === 'away') || competitors[1] || {};
        const state = ev.status?.type?.state;
        const homeName = home.team?.shortDisplayName || home.team?.displayName || home.athlete?.displayName || 'Home';
        const awayName = away.team?.shortDisplayName || away.team?.displayName || away.athlete?.displayName || 'Away';
        const homeL = homeName.toLowerCase();
        const awayL = awayName.toLowerCase();

        const matched = streamedMatches.find((m) => {
          const t = (m.title || '').toLowerCase();
          return t.includes(homeL) && t.includes(awayL);
        });

        return {
          id: `${ep.category}-${ep.league}-${ev.id}`,
          title: ev.name || `${awayName} vs ${homeName}`,
          shortTitle: ev.shortName || `${awayName} @ ${homeName}`,
          category: ep.category,
          league: ep.league,
          status: ev.status?.type?.shortDetail || 'Scheduled',
          isLive: state === 'in',
          isUpcoming: state === 'pre',
          isFinal: state === 'post',
          startTime: ev.date ? Date.parse(ev.date) : null,
          streamedId: matched?.id || null,
          homeTeam: {
            name: homeName,
            abbr: home.team?.abbreviation || 'HOM',
            score: home.score ?? '0',
            logo: home.team?.logo || LOGO_NFL,
          },
          awayTeam: {
            name: awayName,
            abbr: away.team?.abbreviation || 'AWY',
            score: away.score ?? '0',
            logo: away.team?.logo || LOGO_NFL,
          },
          broadcast: comp?.broadcasts?.[0]?.names?.[0] || '',
          servers: buildGameServers(ep.category, matched),
        };
      });
    }),
  );
  return results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);
}

const STREAMED_CAT_MAP = {
  basketball: 'NBA',
  'american-football': 'NFL',
  hockey: 'NHL',
  baseball: 'MLB',
  football: 'Soccer',
  fight: 'MMA',
  mma: 'MMA',
};

function mapStreamedExtras(streamed, usedIds) {
  const now = Date.now();
  const out = [];
  for (const m of streamed.matches) {
    if (usedIds.has(m.id)) continue;
    const start = Number(m.date) || 0;
    const forcedLive = streamed.liveIds.has(m.id);
    if (!forcedLive && start && now - start > 5 * 3600e3) continue;
    const isLive = forcedLive || (start ? start <= now && now - start < 4 * 3600e3 : false);
    const cat = STREAMED_CAT_MAP[m.category] || 'Sports';
    const awayName = m.teams?.away?.name || m.title?.split(' vs ')[0] || 'Away';
    const homeName = m.teams?.home?.name || m.title?.split(' vs ')[1] || 'Home';
    const badge = (b) => (b ? `${streamed.base}/api/images/badge/${b}.webp` : LOGO_NBA);
    out.push({
      id: `st-${m.id}`,
      title: m.title || `${awayName} vs ${homeName}`,
      shortTitle: m.title || `${awayName} @ ${homeName}`,
      category: cat,
      league: String(m.category || 'LIVE').toUpperCase(),
      status: isLive ? 'LIVE STREAM' : 'UPCOMING',
      isLive,
      isUpcoming: !isLive && start > now,
      startTime: start || null,
      poster: m.poster
        ? m.poster.startsWith('http')
          ? m.poster
          : `${streamed.base}${m.poster.startsWith('/') ? '' : '/'}${m.poster}`
        : '',
      homeTeam: { name: homeName, score: isLive ? 'LIVE' : '', logo: badge(m.teams?.home?.badge) },
      awayTeam: { name: awayName, score: '', logo: badge(m.teams?.away?.badge) },
      servers: buildGameServers(cat, m),
    });
  }
  return out;
}

export async function searchOnDemandCatalog(query) {
  const clean = (query || '').trim().slice(0, 80);
  if (!clean) return [];

  const [ani, tvmaze, archive] = await Promise.all([
    fetchAniList(ANILIST_SEARCH_QUERY, { search: clean }, 4500),
    fetchJson(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(clean)}`, 4000, 300),
    fetchArchiveCatalog(
      `title:(${clean.replace(/["():\[\]]/g, ' ')}) AND mediatype:movies AND format:MPEG4`,
      'Movies',
      'ARCHIVE',
      1,
      8,
    ),
  ]);

  const animeItems = (ani?.Page?.media || []).filter((a) => !a.isAdult).map((a) => mapAniListMedia(a));
  const tvItems = (Array.isArray(tvmaze) ? tvmaze : [])
    .map((e) => e.show)
    .filter((s) => s?.externals?.imdb)
    .slice(0, 12)
    .map((s) => mapTvmazeShow(s));

  return [...animeItems, ...tvItems, ...archive];
}

export async function getCatalogData(rotationSeed = null) {
  const page =
    rotationSeed !== null && rotationSeed !== undefined
      ? (Math.abs(Number(rotationSeed) || 0) % 8) + 1
      : (Math.floor(Date.now() / 900000) % 8) + 1;
  const nowSec = Math.floor(Date.now() / 1000);

  try {
    const [streamed, archiveMovies, archiveShows, aniHome, tvToday] = await Promise.all([
      fetchStreamedMatches(),
      fetchArchiveCatalog('collection:feature_films AND mediatype:movies AND format:MPEG4', 'Movies', 'FEATURE FILM', page, 18),
      fetchArchiveCatalog(
        '(collection:classic_tv OR collection:television) AND mediatype:movies AND format:MPEG4',
        'Shows',
        'CLASSIC TV',
        page,
        12,
      ),
      fetchAniList(ANILIST_HOME_QUERY, { from: nowSec - 3 * 3600, to: nowSec + 21 * 3600 }, 4500),
      fetchTvAiringToday(),
    ]);

    const espnEvents = await fetchEspnEvents(streamed.matches);
    const usedIds = new Set(espnEvents.map((e) => e.streamedId).filter(Boolean));
    const sportsEvents = [...espnEvents, ...mapStreamedExtras(streamed, usedIds)];

    sportsEvents.sort((a, b) => {
      const niners = (e) => /49ers|san francisco/i.test(e.title);
      if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
      if (niners(a) !== niners(b)) return niners(a) ? -1 : 1;
      return (a.startTime || 0) - (b.startTime || 0);
    });

    const airingAnime = [];
    const airingSeen = new Set();
    for (const s of aniHome?.airing?.airingSchedules || []) {
      if (!s?.media || s.media.isAdult || airingSeen.has(s.media.id)) continue;
      airingSeen.add(s.media.id);
      airingAnime.push(
        mapAniListMedia(s.media, { status: `EP ${s.episode}`, startTime: s.airingAt * 1000, airingEpisode: s.episode }),
      );
    }
    const trendingAnime = (aniHome?.trending?.media || []).filter((a) => !a.isAdult).map((a) => mapAniListMedia(a));
    const topAnime = (aniHome?.top?.media || []).filter((a) => !a.isAdult).map((a) => mapAniListMedia(a));

    const events = [];
    const seen = new Set();
    const add = (list) => {
      for (const e of list) {
        if (e && !seen.has(e.id)) {
          seen.add(e.id);
          events.push(e);
        }
      }
    };
    add(sportsEvents);
    add(CHANNELS_24_7.map(flag));
    add(OPEN_SHOWS.map(flag));
    add(airingAnime);
    add(trendingAnime);
    add(topAnime);
    add(tvToday);
    add(archiveShows);
    add(archiveMovies);
    add(OPEN_MOVIES.map(flag));

    return {
      updatedAt: new Date().toISOString(),
      rotationPage: page,
      count: events.length,
      events,
      rows: {
        airingToday: [...airingAnime, ...tvToday].map((e) => e.id),
        trendingAnime: trendingAnime.map((e) => e.id),
        topRated: topAnime.map((e) => e.id),
      },
    };
  } catch (err) {
    const fallback = [...CHANNELS_24_7, ...OPEN_SHOWS, ...OPEN_MOVIES].map(flag);
    return {
      updatedAt: new Date().toISOString(),
      error: err?.message || 'Catalog fetch failed',
      rotationPage: page,
      count: fallback.length,
      events: fallback,
      rows: { airingToday: [], trendingAnime: [], topRated: [] },
    };
  }
}

// Cached for 60s so page loads and API calls don't refetch ~50 upstream URLs each time.
export const getCachedCatalog = unstable_cache(
  async (rotationSeed = null) => getCatalogData(rotationSeed),
  ['live-wire-catalog-v3'],
  { revalidate: 60 },
);
