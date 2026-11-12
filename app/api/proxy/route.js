import { NextResponse } from 'next/server';
import { isSafeUrl } from '../../lib/ssrf.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing ?url= parameter' }, { status: 400 });
  }

  // 1. SSRF Guard
  const safety = isSafeUrl(targetUrl);
  if (!safety.safe) {
    return NextResponse.json(
      { error: 'SSRF Protection Blocked Request', reason: safety.reason },
      { status: 403 }
    );
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const basePath = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

    // Forward Range header if present
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      Referer: `${parsedUrl.protocol}//${parsedUrl.host}/`,
      Origin: `${parsedUrl.protocol}//${parsedUrl.host}`
    };

    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    const response = await fetch(targetUrl, {
      headers,
      cache: 'no-store'
    });

    const contentType = response.headers.get('content-type') || '';
    const isM3u8 =
      targetUrl.includes('.m3u8') ||
      contentType.includes('mpegurl') ||
      contentType.includes('x-mpegURL') ||
      contentType.includes('application/vnd.apple.mpegurl');

    // 2. HLS Playlist Manifest Rewriting
    if (isM3u8) {
      const text = await response.text();
      const rewritten = text
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return line;

          // Rewrite tag URIs (e.g., #EXT-X-MAP:URI="init.mp4", #EXT-X-KEY:URI="...")
          if (trimmed.startsWith('#')) {
            return line.replace(/URI="([^"]+)"/g, (match, uri) => {
              const abs = uri.startsWith('http') ? uri : new URL(uri, basePath).toString();
              return `URI="/api/proxy?url=${encodeURIComponent(abs)}"`;
            });
          }

          // Plain playlist entry or segment URL
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
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      });
    }

    // 3. Binary Video Segments (.ts, .m4s, .mp4) with Range / 206 support
    const arrayBuffer = await response.arrayBuffer();
    const isTs = targetUrl.includes('.ts') || contentType.includes('mp2t');

    const resHeaders = {
      'Content-Type': isTs ? 'video/MP2T' : contentType || 'video/mp2t',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600'
    };

    if (response.headers.get('content-range')) {
      resHeaders['Content-Range'] = response.headers.get('content-range');
    }
    if (response.headers.get('content-length')) {
      resHeaders['Content-Length'] = response.headers.get('content-length');
    }

    return new NextResponse(arrayBuffer, {
      status: response.status,
      headers: resHeaders
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to proxy stream segment', details: error.message },
      { status: 502 }
    );
  }
}
