import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Verified working HLS streams for immediate playback testing + custom replacement
const DEFAULT_STREAMS = [
  {
    name: 'Server 1 (HD Direct HLS)',
    type: 'hls',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
  },
  {
    name: 'Server 2 (60fps High Bitrate)',
    type: 'hls',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8'
  },
  {
    name: 'Server 3 (Low Latency Backup)',
    type: 'hls',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8'
  }
];

const CHANNELS_24_7 = [
  {
    id: 'ch-redzone',
    title: 'NFL RedZone / Sunday Blitz',
    category: 'Channels',
    league: 'NFL NETWORK',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'RedZone', score: 'LIVE', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
    awayTeam: { name: 'Whiparound', score: 'HD', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
    servers: DEFAULT_STREAMS
  },
  {
    id: 'ch-espn',
    title: 'SportsCenter & Live Desk',
    category: 'Channels',
    league: 'ESPN HD',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'ESPN', score: '24/7', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
    awayTeam: { name: 'Main Feed', score: 'HD', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png' },
    servers: DEFAULT_STREAMS
  },
  {
    id: 'ch-nbatv',
    title: 'NBA TV Hardwood Live',
    category: 'Channels',
    league: 'NBA TV',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'NBA TV', score: '24/7', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
    awayTeam: { name: 'Studio', score: 'HD', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png' },
    servers: DEFAULT_STREAMS
  },
  {
    id: 'ch-fight',
    title: 'Octagon & Ring 24/7 Fight Feed',
    category: 'Channels',
    league: 'FIGHT NET',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'MMA / Boxing', score: '24/7', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/ufc.png' },
    awayTeam: { name: 'Main Event', score: 'HD', logo: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/ufc.png' },
    servers: DEFAULT_STREAMS
  }
];

const ENDPOINTS = [
  { category: 'NFL', league: 'NFL', url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard' },
  { category: 'NBA', league: 'NBA', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard' },
  { category: 'College', league: 'NCAAF', url: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard' },
  { category: 'Soccer', league: 'EPL / UCL', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard' },
  { category: 'MMA', league: 'UFC', url: 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard' }
];

export async function GET() {
  try {
    const results = await Promise.allSettled(
      ENDPOINTS.map(async (ep) => {
        const res = await fetch(ep.url, { next: { revalidate: 30 } });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.events || []).slice(0, 10).map((ev) => {
          const comp = ev.competitions?.[0];
          const competitors = comp?.competitors || [];
          const home = competitors.find((c) => c.homeAway === 'home') || competitors[0] || {};
          const away = competitors.find((c) => c.homeAway === 'away') || competitors[1] || {};
          const state = ev.status?.type?.state; // 'in', 'pre', 'post'
          const detail = ev.status?.type?.shortDetail || 'Scheduled';

          return {
            id: `${ep.category}-${ev.id}`,
            title: ev.name || `${away.team?.shortDisplayName || 'Away'} vs ${home.team?.shortDisplayName || 'Home'}`,
            shortTitle: ev.shortName || ev.name,
            category: ep.category,
            league: ep.league,
            status: detail,
            isLive: state === 'in',
            isUpcoming: state === 'pre',
            homeTeam: {
              name: home.team?.shortDisplayName || home.team?.displayName || 'Home',
              abbr: home.team?.abbreviation || 'HOM',
              score: home.score ?? '0',
              logo: home.team?.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png'
            },
            awayTeam: {
              name: away.team?.shortDisplayName || away.team?.displayName || 'Away',
              abbr: away.team?.abbreviation || 'AWY',
              score: away.score ?? '0',
              logo: away.team?.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png'
            },
            broadcast: comp?.broadcasts?.[0]?.names?.[0] || 'LIVE WIRE HD',
            servers: DEFAULT_STREAMS
          };
        });
      })
    );

    const liveEvents = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);

    // Sort: Live games first, then 49ers games prioritized, then upcoming
    liveEvents.sort((a, b) => {
      const aNiners = a.title.toLowerCase().includes('49ers') || a.title.toLowerCase().includes('san francisco');
      const bNiners = b.title.toLowerCase().includes('49ers') || b.title.toLowerCase().includes('san francisco');
      if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
      if (aNiners !== bNiners) return aNiners ? -1 : 1;
      return 0;
    });

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      events: [...liveEvents, ...CHANNELS_24_7]
    });
  } catch (err) {
    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      events: CHANNELS_24_7
    });
  }
}
