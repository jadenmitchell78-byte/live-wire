# LIVE WIRE // Sports & Media Hub (v2.0 PRO)

Production-ready Next.js App Router live sports scoreboard, multi-view stream player, and 24/7 channel hub built specifically for Vercel.

## Features
- **Never-Blank Catalog Engine (`/api/catalog`)**: Real-time ESPN scoreboards (NFL, NBA, College, Soccer, UFC) with resilient 24/7 channels and verified HLS fallback streams.
- **Serverless CORS Stream Proxy (`/api/proxy`)**: Transparently proxies external `.m3u8` manifests and `.ts`/`.m4s` segments with proper headers and spoofed origins to prevent CORS / mixed-content errors.
- **Dual-Engine Media Player**: Seamlessly toggles between `hls.js` video streaming, Safari native HLS, and iframe embeds with automated error recovery (`hls.recoverMediaError()`).
- **Multi-View Dual Screen**: Picture-in-Picture, theater mode, and dual side-by-side stream playback.
- **Custom Stream Loader**: Paste any custom `.m3u8` or embed link directly in the app.

## Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deploying to Vercel
Push this repository directly to GitHub/GitLab:
```bash
git init
git add .
git commit -m "Deploy Live Wire v2 to Vercel"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
Import the repository into Vercel and it will automatically deploy the Next.js App Router project.
