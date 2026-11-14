import { NextResponse } from 'next/server';
import { getCachedCatalog } from '../../../lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rotateParam = searchParams.get('rotate');
  const seed = rotateParam !== null && /^\d+$/.test(rotateParam) ? Number(rotateParam) % 8 : null;
  const catalog = await getCachedCatalog(seed);

  return NextResponse.json(catalog, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120, max-age=0',
    },
  });
}
