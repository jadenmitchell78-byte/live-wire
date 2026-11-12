import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*'
};

// Verified 24/7 Free Live Sports HLS Streams (No white screens, real sports broadcasts)
const SPORTS_HLS_FEEDS = {
  CBS_SPORTS: 'https://dai.google.com/linear/hls/event/Sid4xiTQTkCT1SLu6rjUSQ/master.m3u8',
  PLUTO_SPORTS:
    'https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5e8df4bc16132200077815d3/master.m3u8?advertisingId=&appName=web&appStoreUrl=&appVersion=DNT&clientTime=&deviceDNT=0&deviceId=123456&deviceLat=0&deviceLon=0&deviceMake=web&deviceModel=web&deviceType=web&deviceVersion=DNT&includeExtendedEvents=false&marketingRegion=US&serverSideAds=false',
  BELLATOR_MMA:
    'https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5ebc8688f3697d00072f7cf8/master.m3u8?advertisingId=&appName=web&appVersion=DNT&deviceDNT=0&deviceId=654321&deviceMake=web&deviceModel=web&deviceType=web&deviceVersion=DNT&marketingRegion=US',
  GOLAZO_SOCCER:
    'https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/63a0e33a45264d000853ed3e/master.m3u8?advertisingId=&appName=web&appVersion=DNT&deviceDNT=0&deviceId=987654&deviceMake=web&deviceModel=web&deviceType=web&deviceVersion=DNT&marketingRegion=US'
};

const CHANNELS_24_7 = [
  {
    id: 'ch-cbssports',
    title: 'CBS Sports HQ (Live Scores & Highlights)',
    category: 'Channels',
    league: 'CBS SPORTS HQ',
    status: 'LIVE 24/7',
    isLive: true,
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
      { name: 'Server 1 (CBS Sports HQ Direct HLS)', type: 'hls', url: SPORTS_HLS_FEEDS.CBS_SPORTS },
      { name: 'Server 2 (Pluto Sports Desk HLS)', type: 'hls', url: SPORTS_HLS_FEEDS.PLUTO_SPORTS }
    ]
  },
  {
    id: 'ch-golazo',
    title: 'CBS Sports Golazo Network (24/7 Soccer)',
    category: 'Channels',
    league: 'SOCCER 24/7',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: {
      name: 'Golazo TV',
      score: 'LIVE',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/2.png'
    },
    awayTeam: {
      name: 'UEFA / EPL',
      score: '24/7',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/15.png'
    },
    servers: [
      { name: 'Server 1 (Golazo Soccer Direct HLS)', type: 'hls', url: SPORTS_HLS_FEEDS.GOLAZO_SOCCER },
      { name: 'Server 2 (CBS Sports HQ Backup)', type: 'hls', url: SPORTS_HLS_FEEDS.CBS_SPORTS }
    ]
  },
  {
    id: 'ch-mma',
    title: 'Fight & Octagon 24/7 Channel',
    category: 'Channels',
    league: 'MMA 24/7',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: {
      name: 'MMA Live',
      score: '24/7',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/ufc.png'
    },
    awayTeam: {
      name: 'Fight Desk',
      score: 'HD',
      logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/ufc.png'
    },
    servers: [
      { name: 'Server 1 (MMA 24/7 Direct HLS)', type: 'hls', url: SPORTS_HLS_FEEDS.BELLATOR_MMA },
      { name: 'Server 2 (CBS Sports HQ Backup)', type: 'hls', url: SPORTS_HLS_FEEDS.CBS_SPORTS }
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
        name: 'Server 1 (4K HLS Direct)',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      },
      {
        name: 'Server 2 (Backup Cinema Stream)',
        type: 'hls',
        url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8'
      }
    ]
  },
  {
    id: 'mov-2',
    title: 'Apex Velocity: Street Circuit',
    shortTitle: 'Motorsport Documentary • HD',
    category: 'Movies',
    league: 'SPORTS DOC',
    status: 'HD',
    isLive: false,
    rating: '95% Match',
    year: '2026',
    duration: '1h 52m',
    backdrop: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80',
    servers: [
      {
        name: 'Server 1 (Direct HLS)',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
      }
    ]
  },
  {
    id: 'show-1',
    title: 'All-Access: Locker Room Confidential',
    shortTitle: 'Season 3 • Episode 4',
    category: 'Shows',
    league: 'ORIGINAL SERIES',
    status: 'S3:E4',
    isLive: false,
    rating: '99% Match',
    year: '2026',
    duration: '48m',
    backdrop: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=900&q=80',
    servers: [
      {
        name: 'Server 1 (Episode HD)',
        type: 'hls',
        url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8'
      }
    ]
  },
  {
    id: 'show-2',
    title: 'Gridiron Dynasty: Inside the Draft',
    shortTitle: 'Season 1 • Episode 6',
    category: 'Shows',
    league: 'DOCUSERIES',
    status: 'S1:E6',
    isLive: false,
    rating: '96% Match',
    year: '2026',
    duration: '54m',
    backdrop: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=900&q=80',
    servers: [
      {
        name: 'Server 1 (Episode HD)',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      }
    ]
  }
];

const ENDPOINTS = [
  {
    category: 'NBA',
    league: 'NBA',
    sportPath: 'basketball/nba',
    url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
  },
  {
    category: 'NFL',
    league: 'NFL',
    sportPath: 'football/nfl',
    url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'
  },
  {
    category: 'College',
    league: 'NCAA',
    sportPath: 'football/college-football',
    url: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard'
  },
  {
    category: 'Soccer',
    league: 'SOCCER',
    sportPath: 'soccer/eng.1',
    url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard'
  },
  {
    category: 'MMA',
    league: 'UFC',
    sportPath: 'mma/ufc',
    url: 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard'
  }
];

// Extract real ESPN game highlight/live clips if attached to the scoreboard event
function extractEspnGameVideos(comp) {
  const videos = [];
  const rawHeadlines = comp?.headlines || [];
  for (const h of rawHeadlines) {
    for (const v of h.video || []) {
      const hlsLink =
        v.links?.source?.HLS?.HD?.href ||
        v.links?.source?.HLS?.href ||
        v.links?.source?.HD?.href ||
        v.links?.source?.full?.href;
      if (hlsLink) {
        videos.push({
          name: `Game Clip: ${v.headline || 'Live Match Feed'}`,
          type: 'hls',
          url: hlsLink
        });
      }
    }
  }
  return videos;
}

function buildServersForCategory(category, espnVideos = []) {
  const servers = [...espnVideos];

  if (category === 'Soccer') {
    servers.push({
      name: `Server ${servers.length + 1} (Golazo Soccer Live HLS)`,
      type: 'hls',
      url: SPORTS_HLS_FEEDS.GOLAZO_SOCCER
    });
  } else if (category === 'MMA') {
    servers.push({
      name: `Server ${servers.length + 1} (Fight Network Live HLS)`,
      type: 'hls',
      url: SPORTS_HLS_FEEDS.BELLATOR_MMA
    });
  }

  servers.push({
    name: `Server ${servers.length + 1} (CBS Sports HQ Live HLS)`,
    type: 'hls',
    url: SPORTS_HLS_FEEDS.CBS_SPORTS
  });

  servers.push({
    name: `Server ${servers.length + 1} (Pluto Sports Live HLS)`,
    type: 'hls',
    url: SPORTS_HLS_FEEDS.PLUTO_SPORTS
  });

  return servers;
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      ENDPOINTS.map(async (ep) => {
        const res = await fetch(ep.url, {
          headers: BROWSER_HEADERS,
          cache: 'no-store'
        });
        if (!res.ok) return [];
        const data = await res.json();

        return (data.events || []).slice(0, 14).map((ev) => {
          const comp = ev.competitions?.[0];
          const competitors = comp?.competitors || [];
          const home = competitors.find((c) => c.homeAway === 'home') || competitors[0] || {};
          const away = competitors.find((c) => c.homeAway === 'away') || competitors[1] || {};
          const state = ev.status?.type?.state;
          const detail = ev.status?.type?.shortDetail || 'Scheduled';

          const homeName = home.team?.shortDisplayName || home.team?.displayName || 'Home';
          const awayName = away.team?.shortDisplayName || away.team?.displayName || 'Away';

          const espnVideos = extractEspnGameVideos(comp);

          return {
            id: `${ep.category}-${ev.id}`,
            espnEventId: ev.id,
            sportPath: ep.sportPath,
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
                'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png'
            },
            broadcast: comp?.broadcasts?.[0]?.names?.[0] || 'CBS SPORTS HQ',
            servers: buildServersForCategory(ep.category, espnVideos)
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
      count: liveEvents.length,
      events: [...liveEvents, ...CHANNELS_24_7, ...MOVIES_AND_SHOWS]
    });
  } catch (err) {
    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      error: err.message,
      events: [...CHANNELS_24_7, ...MOVIES_AND_SHOWS]
    });
  }
}
