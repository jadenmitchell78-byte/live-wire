// ESPN public NFL scoreboard -> compact "RedZone-style" game list.
// Only uses ESPN's public scoreboard API; no streams are involved.

export const ESPN_NFL_SCOREBOARD =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
export const NFL_PLUS_URL = 'https://www.nfl.com/plus/';

function teamOf(c) {
  const t = c?.team || {};
  return {
    id: String(t.id ?? c?.id ?? ''),
    abbr: t.abbreviation || '',
    name: t.shortDisplayName || t.name || t.displayName || '',
    logo: t.logo || '',
    color: t.color ? `#${t.color}` : '',
    score: c?.score != null && c.score !== '' ? Number(c.score) : null,
    record: (c?.records || []).find((r) => r.type === 'total')?.summary || '',
    homeAway: c?.homeAway || '',
  };
}

// state: 'in' (live) | 'pre' | 'post'
export function normalizeNflScoreboard(json) {
  const events = Array.isArray(json?.events) ? json.events : [];
  const games = events.map((e) => {
    const comp = e?.competitions?.[0] || {};
    const st = e?.status || comp?.status || {};
    const state = st?.type?.state || 'pre';
    const teams = (comp.competitors || []).map(teamOf);
    const home = teams.find((t) => t.homeAway === 'home') || teams[1] || {};
    const away = teams.find((t) => t.homeAway === 'away') || teams[0] || {};
    const sit = comp.situation || null;
    const live = state === 'in';
    const poss = live && sit?.possession ? [home, away].find((t) => t.id === String(sit.possession)) : null;
    // ESPN sets isRedZone itself; it is only meaningful while the game is live.
    const redZone = Boolean(live && sit?.isRedZone);
    return {
      id: String(e.id),
      shortName: e.shortName || `${away.abbr} @ ${home.abbr}`,
      state,
      live,
      detail: st?.type?.shortDetail || st?.type?.detail || '',
      period: st?.period || 0,
      clock: live ? st?.displayClock || '' : '',
      home,
      away,
      possessionAbbr: poss?.abbr || '',
      downDistance: live ? sit?.shortDownDistanceText || sit?.downDistanceText || '' : '',
      spot: live ? sit?.possessionText || '' : '',
      redZone,
      lastPlay: live ? sit?.lastPlay?.text || '' : '',
      network: (comp.broadcasts || []).flatMap((b) => b.names || [])[0] || '',
      startDate: e.date || comp.date || '',
    };
  });
  // RedZone-style ordering: red-zone games first, then other live, then upcoming, then finals.
  const rank = (g) => (g.redZone ? 0 : g.live ? 1 : g.state === 'pre' ? 2 : 3);
  games.sort((a, b) => rank(a) - rank(b) || String(a.startDate).localeCompare(String(b.startDate)));
  return {
    week: json?.week?.number ?? null,
    season: json?.season?.year ?? null,
    liveCount: games.filter((g) => g.live).length,
    redZoneCount: games.filter((g) => g.redZone).length,
    games,
  };
}
