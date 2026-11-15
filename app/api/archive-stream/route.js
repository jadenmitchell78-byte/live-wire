import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = (searchParams.get('id') || '').trim();
  if (!id) {
    return NextResponse.json({ error: 'Missing Archive identifier' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}/files`, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(6500),
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();
      const files = (data?.result || []).filter((f) => !f?.private);
      const mp4 =
        files.find((f) => /512kb\.mp4$/i.test(f?.name || '')) ||
        files.find((f) => /\.mp4$/i.test(f?.name || '') && !/sample|thumb|trailer/i.test(f?.name || '')) ||
        files.find((f) => /\.m3u8$/i.test(f?.name || ''));

      if (mp4?.name) {
        const encodedPath = mp4.name
          .split('/')
          .map((seg) => encodeURIComponent(seg))
          .join('/');
        const streamUrl = `https://archive.org/download/${encodeURIComponent(id)}/${encodedPath}`;
        return NextResponse.redirect(streamUrl, 302);
      }
    }
  } catch {
    // fallback below
  }

  // Fallback to verified public domain Night of the Living Dead MP4 so player never 404s
  return NextResponse.redirect(
    'https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4',
    302,
  );
}
