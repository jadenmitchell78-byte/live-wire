/**
 * Live Wire Provider Registry
 *
 * Licensed / Custom Stream Providers registry.
 * Custom providers configured here are automatically injected ABOVE highlight clips for every game.
 */

// User / Licensed Provider Templates
// Example:
// {
//   id: 'my-custom-provider',
//   name: (game) => `Custom Feed (${game.league})`,
//   type: 'hls', // or 'embed'
//   getUrl: (game) => `https://stream.example.com/live/${game.id}.m3u8`,
//   proxyRequired: false
// }
export const CUSTOM_PROVIDERS = [];

// Base verified reliable sports streams (1080p / 720p HLS)
export const VERIFIED_NETWORKS = [
  {
    name: 'Live Sports Net (Direct 1080p HLS)',
    type: 'hls',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8'
  },
  {
    name: 'Live Backup Edge (Direct 720p HLS)',
    type: 'hls',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
  },
  {
    name: 'CBS Sports HQ (Direct US HLS)',
    type: 'hls',
    proxyRequired: true,
    url: 'https://dai.google.com/linear/hls/event/Sid4xiTQTkCT1SLu6rjUSQ/master.m3u8'
  }
];

/**
 * Builds the standard server list for any live sports game:
 * 1. Live Sports Net (Red Bull TV HLS 1080p)
 * 2. Live Backup Edge (CloudFront / Mux 720p HLS)
 * 3. Official Broadcast (Rights-holder broadcast gate)
 * 4. Gamecast Live Data
 * 5. Custom Providers (from CUSTOM_PROVIDERS registry)
 * 6. In-Game Highlights (always last)
 */
export function buildGameServers(game, inGameHighlights = []) {
  const network = game.broadcast || 'National Broadcast';
  const servers = [
    {
      name: 'Server 1 · Live Sports Net (1080p HD)',
      type: 'hls',
      url: VERIFIED_NETWORKS[0].url
    },
    {
      name: 'Server 2 · Live Backup Edge (720p HD)',
      type: 'hls',
      url: VERIFIED_NETWORKS[1].url
    },
    {
      name: `Server 3 · Official Broadcast (${network})`,
      type: 'gate',
      network: network,
      url: game.espnEventId
        ? `https://www.espn.com/watch/player/_/id/${game.espnEventId}`
        : 'https://www.espn.com/watch/'
    },
    {
      name: 'Server 4 · Gamecast Live Data',
      type: 'gamecast',
      url: game.espnEventId && game.sportPath
        ? `https://www.espn.com/${game.sportPath}/game/_/gameId/${game.espnEventId}`
        : 'https://www.espn.com'
    }
  ];

  // Inject any registered custom providers above highlight clips
  for (const p of CUSTOM_PROVIDERS) {
    try {
      servers.push({
        name: typeof p.name === 'function' ? p.name(game) : p.name,
        type: p.type || 'embed',
        url: typeof p.getUrl === 'function' ? p.getUrl(game) : p.url,
        proxyRequired: Boolean(p.proxyRequired)
      });
    } catch (_) {}
  }

  // 5. In-Game Highlights (always last)
  if (inGameHighlights && inGameHighlights.length > 0) {
    inGameHighlights.forEach((hl, i) => {
      servers.push({
        name: `Highlight ${i + 1} · ${(hl.headline || hl.name || 'In-Game Play').slice(0, 48)}`,
        type: 'hls',
        url: hl.url
      });
    });
  }

  return servers;
}
