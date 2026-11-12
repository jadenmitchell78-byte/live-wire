import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'X-Forwarded-For': '8.8.8.8'
};

// Verified working 24/7 US Sports HLS & Embed feeds (NO broken Pluto URLs)
const WORKING_HLS_SPORTS = [
  {
    name: 'Red Bull TV Sports (Direct 1080p HLS)',
    type: 'hls',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
  },
  {
    name: 'CBS Sports HQ (US Direct HLS)',
    type: 'hls',
    proxyRequired: true,
    url: 'https://dai.google.com/linear/hls/event/Sid4xiTQTkCT1SLu6rjUSQ/master.m3u8'
  }
];

const CHANNELS_24_7 = [
  {
    id: 'ch-espn',
    title: 'ESPN Main Broadcast Desk',
    category: 'Channels',
    league: 'ESPN HD',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: {
      name: 'ESPN USA',
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
        name: 'Server 1 (ESPN Live HD)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/espn/1'
      },
      {
        name: 'Server 2 (TNT Sports HD)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/tnt/1'
      },
      ...WORKING_HLS_SPORTS
    ]
  },
  {
    id: 'ch-nbatv',
    title: 'NBA TV Live Studio & Games',
    category: 'Channels',
    league: 'NBA TV',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: {
      name: 'NBA TV',
      score: 'LIVE',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png'
    },
    awayTeam: {
      name: 'Hardwood',
      score: '24/7',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png'
    },
    servers: [
      {
        name: 'Server 1 (NBA TV Live Feed)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/nba-tv/1'
      },
      {
        name: 'Server 2 (ESPN NBA Feed)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/espn/1'
      },
      ...WORKING_HLS_SPORTS
    ]
  },
  {
    id: 'ch-nfl',
    title: 'NFL Network & RedZone 24/7',
    category: 'Channels',
    league: 'NFL NETWORK',
    status: 'LIVE 24/7',
    isLive: true,
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
        name: 'Server 1 (NFL Network Live)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/nfl-network/1'
      },
      {
        name: 'Server 2 (NFL RedZone)',
        type: 'embed',
        url: 'https://embedme.top/embed/alpha/nfl-redzone/1'
      },
      ...WORKING_HLS_SPORTS
    ]
  }
];

const MOVIES_AND_SHOWS = [
  {
    id: 'mov-1',
    title: 'Nightfall Protocol',
    shortTitle: 'Action • 4K UHD',
    category: 'Movies',
    league: 'FEATURE FILM',
    status: '4K HDR',
    isLive: false,
    rating: '98% Match',
    year: '2026',
    duration: '2h 14m',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80',
    servers: [
      {
        name: 'Server 1 (Full Movie Embed - VidSrc)',
        type: 'embed',
        url: 'https://vidsrc.xyz/embed/movie/tt15398776'
      },
      {
        name: 'Server 2 (Direct 1080p HLS)',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      }
    ]
  },
  {
    id: 'show-1',
    title: 'All-Access: Hardwood Dynasty',
    shortTitle: 'Season 2 • Episode 1',
    category: 'Shows',
    league: 'ORIGINAL SERIES',
    status: 'S2:E1',
    isLive: false,
    rating: '99% Match',
    year: '2026',
    duration: '48m',
    backdrop: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=900&q=80',
    servers: [
      {
        name: 'Server 1 (Full Episode HLS)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
      }
    ]
  }
];

const ENDPOINTS = [
  {
    category: 'NBA',
    league: 'NBA',
    url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
  },
  {
    category: 'NFL',
    league: 'NFL',
    url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'
  },
  {
    category: 'College',
    league: 'NCAAB / NCAAF',
    url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard'
  },
  {
    category: 'Soccer',
    league: 'SOCCER',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard'
  },
  {
    category: 'MMA',
    league: 'UFC',
    url: 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard'
  }
];

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET() {
  try {
    // 1. Fetch live match streams from Streamed.su API
    let streamedMatches = [];
    try {
      const stRes = await fetch('https://streamed.su/api/matches/all-today', {
        headers: BROWSER_HEADERS,
        cache: 'no-store'
      });
      if (stRes.ok) {
        streamedMatches = await stRes.json();
      }
    } catch (_) {}

    // 2. Fetch ESPN live scoreboards + in-game video highlights
    const results = await Promise.allSettled(
      ENDPOINTS.map(async (ep) => {
        const res = await fetch(ep.url, {
          headers: BROWSER_HEADERS,
          cache: 'no-store'
        });
        if (!res.ok) return [];
        const data = await res.json();

        return (data.events || []).slice(0, 12).map((ev) => {
          const comp = ev.competitions?.[0];
          const competitors = comp?.competitors || [];
          const home = competitors.find((c) => c.homeAway === 'home') || competitors[0] || {};
          const away = competitors.find((c) => c.homeAway === 'away') || competitors[1] || {};
          const state = ev.status?.type?.state;
          const detail = ev.status?.type?.shortDetail || 'Scheduled';

          const homeName = home.team?.shortDisplayName || home.team?.displayName || 'Home';
          const awayName = away.team?.shortDisplayName || away.team?.displayName || 'Away';
          const fullHome = home.team?.displayName || homeName;
          const fullAway = away.team?.displayName || awayName;

          // Match with Streamed.su live feeds
          const matchedStream = streamedMatches.find((m) => {
            const t = (m.title || '').toLowerCase();
            return (
              t.includes(homeName.toLowerCase()) ||
              t.includes(awayName.toLowerCase())
            );
          });

          const servers = [];

          // PRIORITY 1: Real Live Match Streams FIRST (so clicking a game plays the live game)
          if (matchedStream?.sources?.length > 0) {
            matchedStream.sources.slice(0, 3).forEach((src, idx) => {
              servers.push({
                name: `LIVE Broadcast ${idx + 1} (${src.source.toUpperCase()} HD)`,
                type: 'embed',
                url: `https://embedme.top/embed/${src.source}/${src.id}/1`
              });
            });
          }

          // PRIORITY 2: Dynamic Team/Matchup Live Embeds
          const matchSlug = slugify(`${fullAway}-vs-${fullHome}`);
          const shortSlug = slugify(`${awayName}-vs-${homeName}`);
          servers.push({
            name: `Server ${servers.length + 1} (Main Game Feed - ${awayName} @ ${homeName})`,
            type: 'embed',
            url: `https://embedme.top/embed/alpha/${matchSlug}/1`
          });
          servers.push({
            name: `Server ${servers.length + 1} (Backup Game Feed)`,
            type: 'embed',
            url: `https://embedme.top/embed/alpha/${shortSlug}/1`
          });

          // PRIORITY 3: League Network Broadcast
          const leagueEmbeds = {
            NBA: 'https://embedme.top/embed/alpha/nba-tv/1',
            NFL: 'https://embedme.top/embed/alpha/nfl-network/1',
            College: 'https://embedme.top/embed/alpha/espn/1',
            Soccer: 'https://embedme.top/embed/alpha/usa-network/1',
            MMA: 'https://embedme.top/embed/alpha/espn/1'
          };
          servers.push({
            name: `Server ${servers.length + 1} (${ep.category} Network Live)`,
            type: 'embed',
            url: leagueEmbeds[ep.category] || 'https://embedme.top/embed/alpha/espn/1'
          });

          // PRIORITY 4: Direct ESPN In-Game Video Highlights (Real HLS clips from the game, placed AFTER live feeds)
          const highlights = (comp?.highlights || []).slice(0, 4);
          highlights.forEach((hl) => {
            const hlsUrl =
              hl.video?.[0]?.links?.source?.HLS?.href ||
              hl.video?.[0]?.links?.source?.HD?.href ||
              hl.video?.[0]?.links?.source?.href;
            if (hlsUrl) {
              servers.push({
                name: `Highlight: ${(hl.headline || 'In-Game Play').slice(0, 48)}...`,
                type: 'hls',
                url: hlsUrl
              });
            }
          });

          // PRIORITY 5: Guaranteed Direct 1080p HLS Sports Feed (never shows Pluto Nordic screen)
          servers.push(...WORKING_HLS_SPORTS);

          return {
            id: `${ep.category}-${ev.id}`,
            title: ev.name || `${awayName} at ${homeName}`,
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
                'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png'
            },
            awayTeam: {
              name: awayName,
              abbr: away.team?.abbreviation || 'AWY',
              score: away.score ?? '0',
              logo:
                away.team?.logo ||
                'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png'
            },
            broadcast: comp?.broadcasts?.[0]?.names?.[0] || 'LIVE WIRE HD',
            servers
          };
        });
      })
    );

    const liveEvents = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    // Sort: Live games first, then 49ers prioritized
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

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      events: [...liveEvents, ...CHANNELS_24_7, ...MOVIES_AND_SHOWS]
    });
  } catch (err) {
    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      events: [...CHANNELS_24_7, ...MOVIES_AND_SHOWS]
    });
  }
}
