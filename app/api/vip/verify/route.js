import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Validates an AMG VIP access token server-side without exposing secrets to the client.
 * Configure `AMG_VIP_TOKENS` (comma-separated) in `.env.local` for production.
 */
export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const token = String(body?.token || '').trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Access token is required.' }, { status: 400 });
  }

  const configured = process.env.AMG_VIP_TOKENS || '';
  const validTokens = configured
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  // Allow explicit dev/preview token only when AMG_VIP_TOKENS is unset in non-production
  const isDevPreviewAllowed =
    validTokens.length === 0 &&
    process.env.NODE_ENV !== 'production' &&
    token.toUpperCase() === 'AMG-VIP-PREVIEW';

  const matched = validTokens.includes(token) || isDevPreviewAllowed;

  if (!matched) {
    return NextResponse.json(
      { ok: false, error: 'Invalid or expired AMG VIP token.' },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    tier: 'AMG_VIP',
    perks: ['multi_view', 'custom_themes', 'fast_pass', 'slip_maker_ev'],
    verifiedAt: new Date().toISOString(),
  });
}
