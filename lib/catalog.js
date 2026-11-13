const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

const STREAMED_ENDPOINTS = [
  'https://streamed.pk/api/matches/all-today',
  'https://streamed.su/api/matches/all-today',
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
    category: 'College',
    league: 'NCAAB / NCAAF',
    url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
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
  for (const endpoint of STREAMED_ENDPOINTS) {
    const data = await fetchJsonWithTimeout(endpoint, 3500, 0);
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  }
  return [];
}

export async function getCatalogData() {
  try {
    const [streamedMatches, espnResults] = await Promise.all([
      fetchStreamedMatches(),
      Promise.allSettled(
        ESPN_ENDPOINTS.map(async (ep) => {
          const data = await fetchJsonWithTimeout(ep.url, 4000, 30);
          if (!data) return [];

          return (data.events || []).slice(0, 14).map((ev) => {
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

    if (streamedMatches.length > 0 && liveEvents.length < 10) {
      const catMap = {
        basketball: 'NBA',
        'american-football': 'NFL',
        football: 'Soccer',
        fight: 'MMA',
        mma: 'MMA',
      };
      const extraMatches = streamedMatches.slice(0, 12).map((m) => {
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

    return {
      updatedAt: new Date().toISOString(),
      count: liveEvents.length,
      streamedMatchedCount: streamedMatches.length,
      events: [...liveEvents, ...CHANNELS_24_7],
    };
  } catch (err) {
    return {
      updatedAt: new Date().toISOString(),
      error: err?.message || 'Catalog fetch failed',
      count: CHANNELS_24_7.length,
      events: CHANNELS_24_7,
    };
  }
}
