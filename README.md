# LIVE WIRE // Sports & Broadcast Platform (v2.2 HULU EDITION)

Production-ready Next.js 14 App Router live sports scoreboard, 2-tile multi-view player, and broadcast platform with a Hulu-inspired broadcast design.

## Features & Architecture

### 1. Provider Registry (`lib/providers.js`)
Documented stream registry. Injects verified playable streams above highlight clips for every game:
- **Server 1 · Live Sports Net** — Red Bull TV HLS (1080p, `Access-Control-Allow-Origin: *`)
- **Server 2 · Live Backup Edge** — 720p CloudFront / Mux HLS
- **Server 3 · Official Broadcast · {Network}** — Rights-holder broadcast portal gate (ESPN, TNT, CBS, NBC, etc.)
- **Server 4 · Gamecast · Live Data** — Real-time ESPN Gamecast match tracker
- **In-Game Highlights (Always Last)** — Extracted directly from ESPN summary feeds on demand
- **`CUSTOM_PROVIDERS`** — Simple hook to plug in licensed stream templates

### 2. SSRF-Guarded CORS Proxy (`app/api/proxy/route.js` & `lib/ssrf.js`)
- **SSRF Guard**: Strict validation against `127.0.0.1`, `localhost`, `0.0.0.0`, private RFC1918 IPs (`10.x`, `172.16-31.x`, `192.168.x`), and link-local addresses.
- **Manifest Rewriting**: Master playlists, variant playlists, and `.ts`/`.m4s` segments rewritten to absolute URLs.
- **Range & 206 Support**: Full byte-range seeking for HLS chunks and MP4 feeds with `Content-Type: video/MP2T`.

### 3. Watchdog-Protected Dual-Engine Player (`StreamPlayer`)
- Automatically detects native HLS, HLS.js, direct MP4 clips, broadcast gates, and iframe embeds.
- `MANIFEST_PARSED` / `onPlaying` / iframe `onLoad` + 2s embed fallback + 22s watchdog timer → **Zero infinite spinner**.
- Automatic one-click server failover.

### 4. Multi-View Dual Screen & Audio Routing
- 2-tile side-by-side mode (Screen 1 & Screen 2).
- One-click swap and audio routing (`Tile 1 Audio` / `Tile 2 Audio`).
- Tile labels sit cleanly above player controls to prevent overlay blocking.

### 5. Hulu Broadcast UI
- Deep obsidian background (`#06080b`), signature Hulu emerald accents (`#1ce783`), and broadcast crimson live beacons (`#ef4444`).
- Mouse-tracked 3D tilt + dynamic radial spotlight (`--mouse-x`, `--mouse-y`) + diagonal sheen sweep + Ken Burns backdrop effects.
- Split-arena Home-vs-Away graphics with live score badges.
- 49ers and marquee teams prioritized.
- Public-domain & verified playable films (Metropolis, Nosferatu, Charade) and TV series (Dragnet, The Rifleman).

### 6. Mobile Experience & Import Stream Modal
- Sticky glass header with swipeable category pills.
- Mobile bottom-sheet Match Center with floating score trigger button.
- **Import Stream Modal**: Add custom `.m3u8`, `.mp4`, or embed URLs at runtime with a one-click proxy toggle and automatic `localStorage` persistence.
