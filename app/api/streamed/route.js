import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const STREAMED_MIRRORS = ['https://streamed.pk', 'https://streamed.su'];
const PPV_API_URLS = ['https://ppv.st/api/streams', 'https://ppv.to/api/streams', 'https://ppv.land/api/streams'];

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
};

// Active 2026 DLHD / Sports Network Fallbacks (thedaddy.li, dlhd.dad, thedaddy.pk)
const SPORT_NETWORK_FALLBACKS = {
  basketball: [
    'https://thedaddy.li/stream/stream-46.php', // NBA TV HD
    'https://thedaddy.li/stream/stream-45.php', // TNT HD
    'https://thedaddy.li/stream/stream-44.php', // ESPN HD
    'https://dlhd.dad/stream/stream-46.php', // NBA TV Mirror
    'https://thedaddy.pk/watch/stream-45.php', // TNT Mirror
  ],
  'american-football': [
    'https://thedaddy.li/stream/stream-66.php', // NFL Network / RedZone
    'https://thedaddy.li/stream/stream-44.php', // ESPN HD
    'https://dlhd.dad/stream/stream-66.php', // NFL Mirror
  ],
  football: [
    'https://thedaddy.li/stream/stream-38.php', // Sky Sports Premier League
    'https://thedaddy.li/stream/stream-31.php', // TNT Sports 1 UCL
    'https://dlhd.dad/stream/stream-38.php',
  ],
  hockey: [
    'https://thedaddy.li/stream/stream-65.php', // NHL Network
    'https://thedaddy.li/stream/stream-44.php', // ESPN
  ],
  fight: [
    'https://thedaddy.li/stream/stream-31.php', // TNT Sports UFC
    'https://thedaddy.li/stream/stream-44.php', // ESPN+
  ],
  tennis: [
    'https://thedaddy.li/stream/stream-71.php', // Tennis Channel HD
    'https://thedaddy.li/stream/stream-44.php', // ESPN
  ],
};

async function fetchMirrorJson(path) {
  for (const base of STREAMED_MIRRORS) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout(4500),
        next: { revalidate: 20 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data) return data;
    } catch {
      // try next mirror
    }
  }
  return null;
}

async function resolveStreamedStreams(source, id) {
  const cleanSource = encodeURIComponent(String(source || 'alpha').trim());
  const cleanId = encodeURIComponent(String(id || '').trim());
  if (!cleanId) return [];

  const data = await fetchMirrorJson(`/api/stream/${cleanSource}/${cleanId}`);
  if (Array.isArray(data) && data.length > 0) {
    return data.filter((s) => s && typeof s.embedUrl === 'string' && s.embedUrl.startsWith('http'));
  }
  return [];
}

function teamTokens(name = '') {
  const clean = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
  const parts = clean.split(/\s+/).filter((w) => w.length >= 3);
  return parts.length ? parts : [clean];
}

async function findPpvStream(sport, home, away) {
  const homeToks = teamTokens(home);
  const awayToks = teamTokens(away);
  for (const apiUrl of PPV_API_URLS) {
    try {
      const res = await fetch(apiUrl, {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout(4000),
        next: { revalidate: 30 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const categories = data?.streams || (Array.isArray(data) ? data : []);
      const allStreams = [];
      for (const cat of categories) {
        if (Array.isArray(cat?.streams)) {
          allStreams.push(...cat.streams);
        } else if (cat?.iframe || cat?.uri_name) {
          allStreams.push(cat);
        }
      }
      if (!allStreams.length) continue;

      const hit =
        allStreams.find((s) => {
          const hay = `${s.name || ''} ${s.tag || ''} ${s.category_name || ''}`.toLowerCase();
          return homeToks.some((t) => t && hay.includes(t)) && awayToks.some((t) => t && hay.includes(t));
        }) ||
        allStreams.find((s) => {
          const hay = `${s.name || ''} ${s.tag || ''} ${s.category_name || ''}`.toLowerCase();
          return homeToks.some((t) => t && hay.includes(t)) || awayToks.some((t) => t && hay.includes(t));
        });

      if (hit?.iframe && String(hit.iframe).startsWith('http')) {
        return hit.iframe;
      }
    } catch {
      // try next PPV mirror
    }
  }
  return null;
}

async function findMatchAndResolveStream(sport, home, away, feedIndex = 0) {
  // 1. Check active PPV.st / PPV.to live event streams first
  const ppvIframe = await findPpvStream(sport, home, away);
  if (ppvIframe && feedIndex === 0) return ppvIframe;

  const endpoints = [
    `/api/matches/${encodeURIComponent(sport || 'basketball')}`,
    '/api/matches/live',
    '/api/matches/all-today',
  ];

  const homeToks = teamTokens(home);
  const awayToks = teamTokens(away);

  for (const ep of endpoints) {
    const matches = await fetchMirrorJson(ep);
    if (!Array.isArray(matches) || matches.length === 0) continue;

    // 1. Exact or mascot token match for both teams, or either team in the same sport
    let matched = matches.find((m) => {
      const hay = `${m.title || ''} ${m.teams?.home?.name || ''} ${m.teams?.away?.name || ''}`.toLowerCase();
      const hitHome = homeToks.some((t) => t && hay.includes(t));
      const hitAway = awayToks.some((t) => t && hay.includes(t));
      return hitHome && hitAway;
    });

    if (!matched) {
      matched = matches.find((m) => {
        const hay = `${m.title || ''} ${m.teams?.home?.name || ''} ${m.teams?.away?.name || ''}`.toLowerCase();
        const hitHome = homeToks.some((t) => t && hay.includes(t));
        const hitAway = awayToks.some((t) => t && hay.includes(t));
        return hitHome || hitAway;
      });
    }

    // If looking at sport-specific endpoint (e.g. /api/matches/basketball) and no team match, pick top live basketball match
    if (!matched && ep.includes(sport) && matches.length > 0) {
      matched = matches.find((m) => Array.isArray(m.sources) && m.sources.length > 0) || matches[0];
    }

    if (matched && Array.isArray(matched.sources) && matched.sources.length > 0) {
      const orderedSources = [...matched.sources];
      const startIdx = feedIndex % orderedSources.length;
      const rotated = [...orderedSources.slice(startIdx), ...orderedSources.slice(0, startIdx)];

      for (const src of rotated) {
        if (!src?.source || !src?.id) continue;
        const streams = await resolveStreamedStreams(src.source, src.id);
        if (streams.length > 0) {
          const picked =
            streams[feedIndex % streams.length] ||
            streams.find((s) => s.hd && /eng/i.test(String(s.language || ''))) ||
            streams.find((s) => s.hd) ||
            streams[0];
          if (picked?.embedUrl) return picked.embedUrl;
        }
      }
    }
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const source = (searchParams.get('source') || '').trim();
  const id = (searchParams.get('id') || '').trim();
  const sport = (searchParams.get('sport') || 'basketball').trim().toLowerCase();
  const home = (searchParams.get('home') || '').trim();
  const away = (searchParams.get('away') || '').trim();
  const feed = Math.max(1, Number(searchParams.get('feed') || searchParams.get('streamNo')) || 1);
  const mode = (searchParams.get('mode') || 'redirect').toLowerCase();

  // Case 1: Direct source + id lookup from streamed.pk
  if (source && id) {
    const streams = await resolveStreamedStreams(source, id);
    const picked =
      streams.find((s) => Number(s.streamNo) === feed) ||
      streams.find((s) => s.hd && /eng/i.test(String(s.language || ''))) ||
      streams.find((s) => s.hd) ||
      streams[0];

    if (picked?.embedUrl) {
      if (mode === 'json') {
        return NextResponse.json({ source, id, resolvedUrl: picked.embedUrl, streams });
      }
      return NextResponse.redirect(picked.embedUrl, 302);
    }
  }

  // Case 2: Dynamic Sport + Team Name Plugin (e.g., NBA Lakers vs Warriors)
  const dynamicUrl = await findMatchAndResolveStream(sport, home, away, feed - 1);
  if (dynamicUrl) {
    if (mode === 'json') {
      return NextResponse.json({ sport, home, away, resolvedUrl: dynamicUrl });
    }
    return NextResponse.redirect(dynamicUrl, 302);
  }

  // Case 3: Fallback to live 24/7 Sport Network feed (NBA TV / TNT / ESPN)
  const fallbacks = SPORT_NETWORK_FALLBACKS[sport] || SPORT_NETWORK_FALLBACKS.basketball;
  const fallbackTarget = fallbacks[(feed - 1) % fallbacks.length];
  if (mode === 'json') {
    return NextResponse.json({ sport, home, away, resolvedUrl: fallbackTarget, fallback: true });
  }
  return NextResponse.redirect(fallbackTarget, 302);
}
