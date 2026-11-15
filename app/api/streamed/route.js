import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const STREAMED_MIRRORS = ['https://streamed.pk', 'https://streamed.su'];

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://streamed.pk/',
};

async function resolveStreamedStreams(source, id) {
  const cleanSource = encodeURIComponent(String(source || 'alpha').trim());
  const cleanId = encodeURIComponent(String(id || '').trim());
  if (!cleanId) return [];

  for (const base of STREAMED_MIRRORS) {
    try {
      const res = await fetch(`${base}/api/stream/${cleanSource}/${cleanId}`, {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout(4000),
        next: { revalidate: 30 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.filter((s) => s && typeof s.embedUrl === 'string' && s.embedUrl.startsWith('http'));
      }
    } catch {
      // try next mirror
    }
  }
  return [];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const source = (searchParams.get('source') || 'alpha').trim();
  const id = (searchParams.get('id') || '').trim();
  const streamNo = Math.max(1, Number(searchParams.get('streamNo')) || 1);
  const mode = (searchParams.get('mode') || 'redirect').toLowerCase();

  const fallbackEmbed = `https://embedme.top/embed/${encodeURIComponent(source)}/${encodeURIComponent(id)}/${streamNo}`;
  if (!id) {
    return NextResponse.json({ error: 'Missing stream id', streams: [] }, { status: 400 });
  }

  const streams = await resolveStreamedStreams(source, id);
  // Prefer matching streamNo, or HD English stream, or first available stream
  const picked =
    streams.find((s) => Number(s.streamNo) === streamNo) ||
    streams.find((s) => s.hd && /eng/i.test(String(s.language || ''))) ||
    streams.find((s) => s.hd) ||
    streams[0];

  const targetUrl = picked?.embedUrl || fallbackEmbed;

  if (mode === 'json') {
    return NextResponse.json(
      {
        source,
        id,
        resolvedUrl: targetUrl,
        streams: streams.map((s, idx) => ({
          name: `${String(s.source || source).toUpperCase()} #${s.streamNo || idx + 1}${s.hd ? ' HD' : ''}${s.language ? ` (${s.language})` : ''}`,
          type: 'embed',
          url: s.embedUrl,
          hd: Boolean(s.hd),
          language: s.language || 'EN',
        })),
      },
      {
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
      },
    );
  }

  return NextResponse.redirect(targetUrl, 302);
}
