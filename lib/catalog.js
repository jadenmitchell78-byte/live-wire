const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

const STREAMED_BASES = [
  'https://streamed.pk',
  'https://streamed.su',
  'https://streamed.st',
];

const ESPN_ENDPOINTS = [
  {
    category: 'NFL',
    league: 'NFL',
    url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  },
  {
    category: 'NBA',
    league: 'NBA',
    url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  },
  {
    category: 'NHL',
    league: 'NHL',
    url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
  },
  {
    category: 'MLB',
    league: 'MLB',
    url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
  },
  {
    category: 'College',
    league: 'NCAAB',
    url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
  },
  {
    category: 'College',
    league: 'NCAAF',
    url: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard',
  },
  {
    category: 'Soccer',
    league: 'EPL',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
  },
  {
    category: 'Soccer',
    league: 'UCL',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard',
  },
  {
    category: 'Soccer',
    league: 'MLS',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard',
  },
  {
    category: 'MMA',
    league: 'UFC / MMA',
    url: 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard',
  },
];

export const CHANNELS_24_7 = [
  {
    id: 'ch-redzone',
    title: 'NFL RedZone & Live Network',
    shortTitle: 'NFL RedZone',
    category: 'Channels',
    league: 'NFL NETWORK',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: {
      name: 'NFL RedZone',
      score: 'LIVE',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png',
    },
    awayTeam: {
      name: 'NFL Network',
      score: '24/7',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png',
    },
    servers: [
      {
        name: 'Server 1 (RedZone Embed HD)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/nfl-redzone/1',
      },
      {
        name: 'Server 2 (NFL Network Embed)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/nfl-network/1',
      },
      {
        name: 'Server 3 (Red Bull Sports HLS)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
      },
    ],
  },
  {
    id: 'ch-espn',
    title: 'ESPN Main Broadcast Desk',
    shortTitle: 'ESPN HD',
    category: 'Channels',
    league: 'ESPN HD',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: {
      name: 'ESPN USA',
      score: 'LIVE',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png',
    },
    awayTeam: {
      name: 'SportsCenter',
      score: '24/7',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png',
    },
    servers: [
      {
        name: 'Server 1 (ESPN HD Embed)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/espn/1',
      },
      {
        name: 'Server 2 (ESPN2 Backup)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/espn-2/1',
      },
      {
        name: 'Server 3 (Direct HLS Sports)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
      },
    ],
  },
  {
    id: 'ch-nbatv',
    title: 'NBA TV Hardwood 24/7',
    shortTitle: 'NBA TV',
    category: 'Channels',
    league: 'NBA TV',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: {
      name: 'NBA TV',
      score: 'LIVE',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png',
    },
    awayTeam: {
      name: 'Hardwood',
      score: '24/7',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png',
    },
    servers: [
      {
        name: 'Server 1 (NBA TV Embed)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/nba-tv/1',
      },
      {
        name: 'Server 2 (TNT Sports Backup)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/tnt/1',
      },
      {
        name: 'Server 3 (Direct HLS Feed)',
        type: 'hls',
        url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
      },
    ],
  },
  {
    id: 'ch-redbull',
    title: 'Red Bull TV Action Sports',
    shortTitle: 'Red Bull TV',
    category: 'Channels',
    league: '24/7 HLS',
    status: 'LIVE 24/7',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80',
    homeTeam: {
      name: 'Red Bull TV',
      score: 'HD',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/ufc.png',
    },
    awayTeam: {
      name: 'Action Sports',
      score: 'LIVE',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/ufc.png',
    },
    servers: [
      {
        name: 'Server 1 (Official HLS)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
      },
    ],
  },
  {
    id: 'ch-nasa',
    title: 'NASA Public TV HD',
    shortTitle: 'NASA TV',
    category: 'Channels',
    league: '24/7 HLS',
    status: 'LIVE 24/7',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
    homeTeam: {
      name: 'NASA TV',
      score: 'HD',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png',
    },
    awayTeam: {
      name: 'Live Earth',
      score: '24/7',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png',
    },
    servers: [
      {
        name: 'Server 1 (NASA HLS)',
        type: 'hls',
        url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
      },
    ],
  },
];

export const OPEN_MOVIES = [
  {
    id: 'mov-big-buck-bunny',
    title: 'Big Buck Bunny',
    shortTitle: 'Big Buck Bunny',
    category: 'Movies',
    league: '4K HLS · ANIMATION',
    status: 'HD',
    isLive: false,
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80',
    homeTeam: { name: 'Blender Studio', score: '1080p', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
    awayTeam: { name: 'Open Cinema', score: 'HLS', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
    servers: [
      { name: 'Mux Adaptive HLS', type: 'hls', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    ],
  },
  {
    id: 'mov-sintel',
    title: 'Sintel',
    shortTitle: 'Sintel',
    category: 'Movies',
    league: 'FANTASY · HLS',
    status: 'HD',
    isLive: false,
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    homeTeam: { name: 'Durian Project', score: '1080p', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
    awayTeam: { name: 'Open Cinema', score: 'HLS', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
    servers: [
      { name: 'Bitdash HLS', type: 'hls', url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8' },
    ],
  },
  {
    id: 'mov-tears-of-steel',
    title: 'Tears of Steel',
    shortTitle: 'Tears of Steel',
    category: 'Movies',
    league: 'SCI-FI · HLS',
    status: '4K',
    isLive: false,
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
    homeTeam: { name: 'Mango Studio', score: '4K', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
    awayTeam: { name: 'Open Cinema', score: 'HLS', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
    servers: [
      { name: 'Unified HLS', type: 'hls', url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8' },
    ],
  },
  {
    id: 'mov-night-living-dead',
    title: 'Night of the Living Dead (1968)',
    shortTitle: 'Night of the Living Dead',
    category: 'Movies',
    league: 'CLASSIC HORROR',
    status: 'ARCHIVE',
    isLive: false,
    poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=900&q=80',
    homeTeam: { name: 'Public Domain', score: 'MP4', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
    awayTeam: { name: 'Archive.org', score: 'HD', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
    servers: [
      { name: 'Internet Archive MP4', type: 'hls', url: 'https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4' },
    ],
  },
];

export const OPEN_SHOWS = [
  {
    id: 'show-cosmos',
    title: 'Cosmos & Deep Space Live',
    shortTitle: 'Deep Space',
    category: 'Shows',
    league: 'DOCUMENTARY · HLS',
    status: 'SERIES',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
    homeTeam: { name: 'NASA Science', score: 'HD', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
    awayTeam: { name: 'Series Feed', score: '24/7', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
    servers: [
      { name: 'NASA TV HLS', type: 'hls', url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8' },
    ],
  },
  {
    id: 'show-france24',
    title: 'France 24 World Desk',
    shortTitle: 'France 24',
    category: 'Shows',
    league: 'WORLD NEWS · HLS',
    status: 'LIVE',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80',
    homeTeam: { name: 'France 24', score: 'LIVE', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
    awayTeam: { name: 'English', score: 'HD', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
    servers: [
      { name: 'France 24 HLS', type: 'hls', url: 'https://static.france24.com/live/F24_EN_HI_HLS/live_web.m3u8' },
    ],
  },
  {
    id: 'show-aljazeera',
    title: 'Al Jazeera English Live',
    shortTitle: 'Al Jazeera',
    category: 'Shows',
    league: 'NEWS · HLS',
    status: 'LIVE',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80',
    homeTeam: { name: 'Al Jazeera', score: 'LIVE', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
    awayTeam: { name: 'Global', score: 'HD', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
    servers: [
      { name: 'Al Jazeera HLS', type: 'hls', url: 'https://live-hls-web-aje.getaj.net/AJE/index.m3u8' },
    ],
  },
];

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildGameServers(awayName, homeName, category, streamedMatch) {
  const matchSlug = slugify(`${awayName}-vs-${homeName}`);
  const homeSlug = slugify(homeName);
  const servers = [];

  if (streamedMatch?.sources?.length > 0) {
    streamedMatch.sources.slice(0, 3).forEach((src, i) => {
      if (src?.source && src?.id) {
        servers.push({
          name: `Server ${i + 1} (${String(src.source).toUpperCase()} Live HD)`,
          type: 'embed',
          url: `https://embedme.top/embed/${src.source}/${src.id}/1`,
        });
      }
    });
  }

  if (servers.length === 0) {
    servers.push({
      name: 'Server 1 (Alpha Sports HD)',
      type: 'embed',
      url: `https://embedme.top/embed/alpha/${matchSlug}/1`,
    });
    servers.push({
      name: 'Server 2 (Team Feed Backup)',
      type: 'embed',
      url: `https://embedme.top/embed/alpha/${homeSlug}/1`,
    });
  }

  const networkMap = {
    NFL: 'https://embedme.top/embed/alpha/nfl-network/1',
    NBA: 'https://embedme.top/embed/alpha/nba-tv/1',
    College: 'https://embedme.top/embed/alpha/espn/1',
    Soccer: 'https://embedme.top/embed/alpha/sky-sports-premier-league/1',
    MMA: 'https://embedme.top/embed/alpha/tnt-sports-1/1',
  };

  servers.push({
    name: `Server ${servers.length + 1} (${category} Network Feed)`,
    type: 'embed',
    url: networkMap[category] || 'https://embedme.top/embed/alpha/espn/1',
  });

  servers.push({
    name: `Server ${servers.length + 1} (Direct HLS Sports Stream)`,
    type: 'hls',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
  });

  return servers;
}

async function fetchJsonWithTimeout(url, timeoutMs = 4000, revalidateSec = 30) {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(timeoutMs),
      ...(revalidateSec > 0 ? { next: { revalidate: revalidateSec } } : { cache: 'no-store' }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchStreamedMatches() {
  const seen = new Map();
  for (const base of STREAMED_BASES) {
    const [liveData, allData] = await Promise.all([
      fetchJsonWithTimeout(`${base}/api/matches/live`, 4000, 0),
      fetchJsonWithTimeout(`${base}/api/matches/all`, 4000, 0),
    ]);
    for (const list of [liveData, allData]) {
      if (Array.isArray(list)) {
        for (const m of list) {
          if (m?.id && !seen.has(m.id)) {
            seen.set(m.id, m);
          }
        }
      }
    }
    if (seen.size > 0) {
      return Array.from(seen.values());
    }
  }
  return [];
}

async function fetchArchiveCatalog(query, category, label, page = 1, rows = 24) {
  try {
    const searchUrl =
      `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}` +
      `&fl[]=identifier,title,year,downloads&sort[]=downloads+desc&rows=${rows}&page=${page}&output=json`;
    const searchData = await fetchJsonWithTimeout(searchUrl, 4000, 300);
    const docs = searchData?.response?.docs || [];
    if (!docs.length) return [];

    const resolved = await Promise.allSettled(
      docs.map(async (doc) => {
        const id = doc.identifier;
        if (!id) return null;
        const meta = await fetchJsonWithTimeout(
          `https://archive.org/metadata/${encodeURIComponent(id)}/files`,
          3500,
          600,
        );
        const files = meta?.result || [];
        const mp4 =
          files.find((f) => /\.mp4$/i.test(f?.name || '') && !/sample/i.test(f?.name || '')) ||
          files.find((f) => /\.m3u8$/i.test(f?.name || ''));
        if (!mp4?.name) return null;

        const streamUrl = `https://archive.org/download/${encodeURIComponent(id)}/${mp4.name
          .split('/')
          .map(encodeURIComponent)
          .join('/')}`;
        const cleanTitle = String(doc.title || id).slice(0, 70);
        const year = doc.year ? ` (${doc.year})` : '';

        return {
          id: `ia-${category.toLowerCase()}-${id}`,
          title: `${cleanTitle}${year}`,
          shortTitle: cleanTitle,
          category,
          league: `${label}${doc.year ? ` · ${doc.year}` : ''}`,
          status: 'HD MP4',
          isLive: false,
          poster: `https://archive.org/services/img/${encodeURIComponent(id)}`,
          homeTeam: {
            name: 'Archive.org',
            score: 'MP4',
            logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png',
          },
          awayTeam: {
            name: label,
            score: 'HD',
            logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png',
          },
          servers: [
            {
              name: 'Archive Direct HD',
              type: 'hls',
              url: streamUrl,
            },
          ],
        };
      }),
    );

    return resolved
      .filter((r) => r.status === 'fulfilled' && r.value)
      .map((r) => r.value);
  } catch {
    return [];
  }
}

export async function getCatalogData(rotationSeed = null) {
  try {
    const page =
      rotationSeed !== null
        ? (Math.abs(Number(rotationSeed)) % 8) + 1
        : (Math.floor(Date.now() / 900000) % 8) + 1;

    const [streamedMatches, archiveMovies, archiveShows, espnResults] = await Promise.all([
      fetchStreamedMatches(),
      fetchArchiveCatalog(
        'collection:feature_films AND mediatype:movies AND format:MPEG4',
        'Movies',
        'FEATURE FILM',
        page,
        24,
      ),
      fetchArchiveCatalog(
        '(collection:classic_tv OR collection:television) AND mediatype:movies AND format:MPEG4',
        'Shows',
        'CLASSIC TV',
        page,
        24,
      ),
      Promise.allSettled(
        ESPN_ENDPOINTS.map(async (ep) => {
          const data = await fetchJsonWithTimeout(ep.url, 4000, 30);
          if (!data) return [];

          return (data.events || []).slice(0, 30).map((ev) => {
            const comp = ev.competitions?.[0];
            const competitors = comp?.competitors || [];
            const home = competitors.find((c) => c.homeAway === 'home') || competitors[0] || {};
            const away = competitors.find((c) => c.homeAway === 'away') || competitors[1] || {};
            const state = ev.status?.type?.state;
            const detail = ev.status?.type?.shortDetail || 'Live / Scheduled';

            const homeName = home.team?.shortDisplayName || home.team?.displayName || 'Home';
            const awayName = away.team?.shortDisplayName || away.team?.displayName || 'Away';

            const matchedStream = streamedMatches.find((m) => {
              const t = (m.title || '').toLowerCase();
              return t.includes(homeName.toLowerCase()) || t.includes(awayName.toLowerCase());
            });

            return {
              id: `${ep.category}-${ep.league}-${ev.id}`,
              title: ev.name || `${awayName} vs ${homeName}`,
              shortTitle: ev.shortName || `${awayName} @ ${homeName}`,
              category: ep.category,
              league: ep.league,
              status: detail,
              isLive: state === 'in',
              isUpcoming: state === 'pre',
              homeTeam: {
                name: homeName,
                abbr: home.team?.abbreviation || 'HOM',
                score: home.score ?? '0',
                logo:
                  home.team?.logo ||
                  'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png',
              },
              awayTeam: {
                name: awayName,
                abbr: away.team?.abbreviation || 'AWY',
                score: away.score ?? '0',
                logo:
                  away.team?.logo ||
                  'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png',
              },
              broadcast: comp?.broadcasts?.[0]?.names?.[0] || 'LIVE WIRE SPORTS',
              servers: buildGameServers(awayName, homeName, ep.category, matchedStream),
            };
          });
        }),
      ),
    ]);

    let liveEvents = espnResults
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    // Append ALL remaining streams from streamed.pk / streamed.su that weren't already matched to an ESPN event
    if (streamedMatches.length > 0) {
      const matchedIds = new Set();
      for (const ev of liveEvents) {
        const homeL = (ev.homeTeam?.name || '').toLowerCase();
        const awayL = (ev.awayTeam?.name || '').toLowerCase();
        for (const m of streamedMatches) {
          const t = (m.title || '').toLowerCase();
          if ((homeL && t.includes(homeL)) || (awayL && t.includes(awayL))) {
            matchedIds.add(m.id);
          }
        }
      }

      const catMap = {
        basketball: 'NBA',
        'american-football': 'NFL',
        hockey: 'NHL',
        baseball: 'MLB',
        football: 'Soccer',
        fight: 'MMA',
        mma: 'MMA',
      };
      const extraMatches = streamedMatches
        .filter((m) => !matchedIds.has(m.id))
        .map((m) => {
          const mappedCat = catMap[m.category] || 'Sports';
          const awayName = m.teams?.away?.name || m.title?.split(' vs ')[0] || 'Away';
          const homeName = m.teams?.home?.name || m.title?.split(' vs ')[1] || 'Home';
          return {
            id: `st-${m.id}`,
            title: m.title || `${awayName} vs ${homeName}`,
            shortTitle: m.title || `${awayName} @ ${homeName}`,
            category: mappedCat,
            league: (m.category || 'LIVE').toUpperCase(),
            status: 'LIVE STREAM',
            isLive: true,
            poster: m.poster ? `https://streamed.pk${m.poster}` : '',
            homeTeam: {
              name: homeName,
              score: 'LIVE',
              logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png',
            },
            awayTeam: {
              name: awayName,
              score: 'HD',
              logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png',
            },
            servers: buildGameServers(awayName, homeName, mappedCat, m),
          };
        });
      liveEvents = [...liveEvents, ...extraMatches];
    }

    liveEvents.sort((a, b) => {
      const aNiners =
        a.title.toLowerCase().includes('49ers') ||
        a.title.toLowerCase().includes('san francisco');
      const bNiners =
        b.title.toLowerCase().includes('49ers') ||
        b.title.toLowerCase().includes('san francisco');
      if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
      if (aNiners !== bNiners) return aNiners ? -1 : 1;
      return 0;
    });

    const allMovies = [...archiveMovies, ...OPEN_MOVIES];
    const allShows = [...archiveShows, ...OPEN_SHOWS];

    return {
      updatedAt: new Date().toISOString(),
      rotationPage: page,
      count: liveEvents.length,
      streamedMatchedCount: streamedMatches.length,
      events: [...liveEvents, ...CHANNELS_24_7, ...allMovies, ...allShows],
    };
  } catch (err) {
    return {
      updatedAt: new Date().toISOString(),
      error: err?.message || 'Catalog fetch failed',
      count: CHANNELS_24_7.length + OPEN_MOVIES.length + OPEN_SHOWS.length,
      events: [...CHANNELS_24_7, ...OPEN_MOVIES, ...OPEN_SHOWS],
    };
  }
}
