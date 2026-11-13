import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /\.local$/i,
  /\.internal$/i,
];

function isPrivateHost(hostname) {
  const target = String(hostname || '').trim().toLowerCase();
  if (!target) return true;
  return PRIVATE_HOST_PATTERNS.some((re) => re.test(target));
}

function isAllowedHost(hostname) {
  if (isPrivateHost(hostname)) return false;

  const configured = process.env.PROXY_ALLOWED_HOSTS;
  if (!configured || configured.trim() === '*') {
    return true;
  }

  const target = String(hostname || '').toLowerCase();
  const allowed = configured
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

  return allowed.some((host) => target === host || target.endsWith(`.${host}`));
}

function buildProxyUrl(absoluteUrl) {
  return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
}

function proxiedUrl(uri, baseUrl) {
  try {
    const resolved = new URL(uri, baseUrl);
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
      return uri;
    }
    return buildProxyUrl(resolved.toString());
  } catch {
    return uri;
  }
}

function rewritePlaylist(playlist, baseUrl) {
  return playlist
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith('#')) {
        return line.replace(/URI="([^"]+)"/g, (_match, uri) => {
          return `URI="${proxiedUrl(uri, baseUrl)}"`;
        });
      }
      return proxiedUrl(trimmed, baseUrl);
    })
    .join('\n');
}

function inferContentType(pathname) {
  if (/\.m3u8?$/i.test(pathname)) return 'application/vnd.apple.mpegurl';
  if (/\.ts$/i.test(pathname)) return 'video/mp2t';
  if (/\.m4s$/i.test(pathname)) return 'video/iso.segment';
  if (/\.aac$/i.test(pathname)) return 'audio/aac';
  if (/\.mp4$/i.test(pathname)) return 'video/mp4';
  return 'application/octet-stream';
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type',
    'Access-Control-Expose-Headers':
      'Content-Length, Content-Range, Accept-Ranges, Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const rawUrl = requestUrl.searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json(
      { error: 'Missing url query parameter.' },
      { status: 400, headers: corsHeaders() },
    );
  }

  let target;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json(
      { error: 'Invalid upstream URL.' },
      { status: 400, headers: corsHeaders() },
    );
  }

  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return NextResponse.json(
      { error: 'Only http and https URLs are supported.' },
      { status: 400, headers: corsHeaders() },
    );
  }

  if (!isAllowedHost(target.hostname)) {
    return NextResponse.json(
      { error: 'Host blocked by SSRF guard or PROXY_ALLOWED_HOSTS.' },
      { status: 403, headers: corsHeaders() },
    );
  }

  const upstreamHeaders = new Headers();
  upstreamHeaders.set('accept', '*/*');
  upstreamHeaders.set('accept-language', 'en-US,en;q=0.9');
  upstreamHeaders.set(
    'user-agent',
    process.env.PROXY_USER_AGENT ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  );
  upstreamHeaders.set(
    'referer',
    process.env.PROXY_REFERER || `${target.protocol}//${target.hostname}/`,
  );

  const range = request.headers.get('range');
  if (range) {
    upstreamHeaders.set('range', range);
  }

  let upstream;
  try {
    upstream = await fetch(target, {
      method: 'GET',
      headers: upstreamHeaders,
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return NextResponse.json(
      { error: 'Upstream fetch failed or timed out.' },
      { status: 502, headers: corsHeaders() },
    );
  }

  const finalUrl = new URL(upstream.url || target.toString());
  if (!isAllowedHost(finalUrl.hostname)) {
    return NextResponse.json(
      { error: 'Upstream redirected to a blocked host.' },
      { status: 403, headers: corsHeaders() },
    );
  }

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json(
      { error: `Upstream responded with ${upstream.status}.` },
      { status: upstream.status, headers: corsHeaders() },
    );
  }

  const contentType =
    upstream.headers.get('content-type') || inferContentType(finalUrl.pathname);
  const pathAndQuery = `${finalUrl.pathname}${finalUrl.search}`;
  const isPlaylist =
    /mpegurl/i.test(contentType) || /\.m3u8?(?:$|\?)/i.test(pathAndQuery);

  if (isPlaylist) {
    const text = await upstream.text();
    const rewritten = rewritePlaylist(text, finalUrl.toString());
    return new NextResponse(rewritten, {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  if (!upstream.body) {
    return NextResponse.json(
      { error: 'Upstream returned an empty body.' },
      { status: 502, headers: corsHeaders() },
    );
  }

  const responseHeaders = new Headers(corsHeaders());
  for (const header of [
    'content-type',
    'content-length',
    'content-range',
    'accept-ranges',
    'etag',
    'last-modified',
  ]) {
    const value = upstream.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }
  if (!responseHeaders.has('content-type')) {
    responseHeaders.set('content-type', inferContentType(finalUrl.pathname));
  }
  responseHeaders.set(
    'cache-control',
    upstream.headers.get('cache-control') || 'public, max-age=30, stale-while-revalidate=60',
  );

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
