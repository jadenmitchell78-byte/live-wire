import { NextResponse } from 'next/server';
import { resolveCrossIds } from '../../../lib/idMapper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anilistId = searchParams.get('anilistId');
  const malId = searchParams.get('malId');
  const tmdbId = searchParams.get('tmdbId');
  const imdbId = searchParams.get('imdbId');

  if (!anilistId && !malId && !tmdbId && !imdbId) {
    return NextResponse.json(
      { ok: false, error: 'Provide one of anilistId, malId, tmdbId, or imdbId.' },
      { status: 400 },
    );
  }

  const mapping = await resolveCrossIds({ anilistId, malId, tmdbId, imdbId });
  if (!mapping) {
    return NextResponse.json({ ok: false, mapping: null }, { status: 404 });
  }

  return NextResponse.json(
    { ok: true, mapping },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
      },
    },
  );
}
