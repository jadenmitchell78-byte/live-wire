import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing ?url= parameter' }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const basePath = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        Referer: `${parsedUrl.protocol}//${parsedUrl.host}/`,
        Origin: `${parsedUrl.protocol}//${parsedUrl.host}`
      },
      cache: 'no-store'
    });

    const contentType = response.headers.get('content-type') || '';
    const isM3u8 =
      targetUrl.includes('.m3u8') ||
      contentType.includes('mpegurl') ||
      contentType.includes('x-mpegURL');

    // If it's an HLS playlist (.m3u8), rewrite relative chunk/sub-playlist URLs
    if (isM3u8) {
      const text = await response.text();
      const rewritten = text
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return line;
          const absoluteUrl = trimmed.startsWith('http')
            ? trimmed
            : new URL(trimmed, basePath).toString();
          return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        })
        .join('\n');

      return new NextResponse(rewritten, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store'
        }
      });
    }

    // Binary video segments (.ts / .m4s) pass straight through
    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: response.status,
      headers: {
        'Content-Type': contentType || 'video/mp2t',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to proxy stream', details: error.message },
      { status: 502 }
    );
  }
}
