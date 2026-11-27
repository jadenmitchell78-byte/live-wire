// node scripts/test-nfl-live.mjs  -- offline checks for the NFL scoreboard normalizer + live ESPN smoke check
import assert from 'node:assert/strict';
import { normalizeNflScoreboard, ESPN_NFL_SCOREBOARD } from '../lib/nfl-live.js';

const mk = (id, state, extra = {}, sit) => ({
  id, shortName: `A${id} @ H${id}`, date: `2026-11-26T2${id}:00Z`,
  status: { period: 2, displayClock: '7:31', type: { state, shortDetail: state === 'post' ? 'Final' : '7:31 - 2nd' } },
  competitions: [{
    competitors: [
      { id: '1', homeAway: 'home', score: '10', team: { id: '1', abbreviation: 'HHH', shortDisplayName: 'Home' }, records: [{ type: 'total', summary: '5-1' }] },
      { id: '2', homeAway: 'away', score: '7', team: { id: '2', abbreviation: 'AAA', shortDisplayName: 'Away' } },
    ],
    situation: sit, broadcasts: [{ names: ['NBC'] }], ...extra,
  }],
});
const out = normalizeNflScoreboard({ week: { number: 12 }, events: [
  mk('1', 'post'), mk('2', 'pre'),
  mk('3', 'in', {}, { possession: '2', isRedZone: false, shortDownDistanceText: '1st & 10', possessionText: 'AAA 40' }),
  mk('4', 'in', {}, { possession: '1', isRedZone: true, shortDownDistanceText: '2nd & Goal', possessionText: 'AAA 1' }),
  mk('5', 'post', {}, { isRedZone: true }),   // stale situation on a finished game must NOT badge
] });
assert.equal(out.week, 12);
assert.equal(out.games[0].id, '4'); assert.equal(out.games[0].redZone, true); assert.equal(out.games[0].possessionAbbr, 'HHH');
assert.equal(out.games[1].id, '3'); assert.equal(out.games[1].redZone, false); assert.equal(out.games[1].possessionAbbr, 'AAA');
assert.equal(out.games[1].downDistance, '1st & 10');
assert.equal(out.games.find((g) => g.id === '5').redZone, false);
assert.equal(out.liveCount, 2); assert.equal(out.redZoneCount, 1);
assert.equal(out.games.find((g) => g.id === '2').clock, '');
console.log('offline OK');

const res = await fetch(ESPN_NFL_SCOREBOARD, { signal: AbortSignal.timeout(8000) });
const live = normalizeNflScoreboard(await res.json());
console.log(`live ESPN: week ${live.week}, ${live.games.length} games, ${live.liveCount} live, ${live.redZoneCount} red zone`);
for (const g of live.games.filter((x) => x.live)) console.log(' ', g.shortName, `${g.away.score}-${g.home.score}`, `Q${g.period} ${g.clock}`, g.downDistance, g.redZone ? 'RED ZONE' : '');
assert.ok(live.games.length > 0);
console.log('live OK');
