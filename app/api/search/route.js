import { NextResponse } from 'next/server';
import { searchOnDemandCatalog } from '../../../lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q) {
    return NextResponse.json({ query: '', count: 0, results: [] });
  }

  const results = await searchOnDemandCatalog(q);
  return NextResponse.json(
    { query: q, count: results.length, results },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300, max-age=0',
      },
    },
  );
}
