import { NextResponse } from 'next/server';
import { getCatalogData } from '../../../lib/catalog';

export const revalidate = 30;

export async function GET() {
  const catalog = await getCatalogData();

  return NextResponse.json(catalog, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120, max-age=0',
    },
  });
}
