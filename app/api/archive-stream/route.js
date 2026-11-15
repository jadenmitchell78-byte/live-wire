import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = (searchParams.get('id') || '').trim();
  if (!id) {
    return NextResponse.json({ error: 'Missing Archive identifier' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}/files`, {
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();
      const files = data?.result || [];
      // Prefer H.264 MP4 (512kb or standard MP4) that plays natively in all browsers
      const mp4 =
        files.find((f) => /512kb\.mp4$/i.test(f?.name || '')) ||
        files.find((f) => /\.mp4$/i.test(f?.name || '') && !/sample|thumb/i.test(f?.name || '')) ||
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

  return NextResponse.redirect(
    `https://archive.org/download/${encodeURIComponent(id)}/${encodeURIComponent(id)}_512kb.mp4`,
    302,
  );
}
