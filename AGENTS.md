# Live Wire Agent Rules & Workspace Guardrails

## 1. Project Commands & Ports
- **Local Dev Server**: `npm run dev` (starts on port 3000, `http://localhost:3000` or `http://127.0.0.1:3000`).
- **Production Build**: `npm run build && npm run start`.
- **Target Deployment**: Vercel production at `https://live-wire-eight.vercel.app`.

## 2. Protected Files (Do Not Overwrite)
- **Environment Variables**: Never overwrite or delete `.env.local` or `.env`.
- **Live Guard & Core Integrations**: Never overwrite `live_guard.py` (SHA-256 `9a7a6c9ea4eb6b9e6f990d800e5cb26d4fb1f2cd0d497d2c9aa68e19e4286e18`) or `bind.conf`.

## 3. UI/UX & Design Standards
- **Dark Mode**: Strict deep obsidian (`#06070a`) and Hulu emerald (`#1ce783`) / crimson live badge (`#ff2d55`) color system.
- **Touch & Accessibility**: Minimum 44×44px tap targets for mobile controls.
- **Zero CLS**: Reserve layout space for video player modals and stream cards to ensure Cumulative Layout Shift < 0.1.
- **3D Card Physics**: Keep hover tilt and sheen effects gated to `@media (hover: hover) and (pointer: fine)` so mobile touch scroll remains performant.

## 4. Performance & Caching
- **Serverless Timeouts**: Enforce `AbortSignal.timeout(3500)` or `4500` on upstream ESPN/media catalog fetches.
- **HLS Proxying**: Maintain SSRF allowlist protection and relative playlist URI rewriting in `app/api/proxy/route.js`.
