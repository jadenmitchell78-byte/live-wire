import { NextResponse } from 'next/server';
import { ESPN_NFL_SCOREBOARD, normalizeNflScoreboard } from '../../../lib/nfl-live';

export const dynamic = 'force-dynamic';

// Live NFL scoreboard (ESPN public API) for the NFL RedZone-style panel.
export async function GET() {
  try {
    const res = await fetch(ESPN_NFL_SCOREBOARD, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) throw new Error(`ESPN ${res.status}`);
    const data = normalizeNflScoreboard(await res.json());
    return NextResponse.json(
      { ok: true, updatedAt: new Date().toISOString(), ...data },
      { headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20, max-age=0' } },
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'scoreboard_unavailable', games: [] },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
