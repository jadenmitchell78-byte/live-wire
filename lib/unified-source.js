/**
 * Unified rate-limited, cached, retrying upstream data client for Live Wire.
 */

export const SOURCE_CONFIG = {
  espn: {
    baseUrl: 'https://site.api.espn.com/apis/site/v2/sports',
    rateLimit: { requests: 12, perSeconds: 60 },
    cacheTTL: 30,
    retries: 2,
  },
  anilist: {
    baseUrl: 'https://graphql.anilist.co',
    rateLimit: { requests: 90, perSeconds: 60 },
    cacheTTL: 3600,
    retries: 2,
  },
  tvmaze: {
    baseUrl: 'https://api.tvmaze.com',
    rateLimit: { requests: 20, perSeconds: 10 },
    cacheTTL: 3600,
    retries: 2,
  },
  archive: {
    baseUrl: 'https://archive.org',
    rateLimit: { requests: 8, perSeconds: 60 },
    cacheTTL: 86400,
    retries: 1,
  },
};

export class UnifiedSource {
  constructor(sourceName) {
    this.config = SOURCE_CONFIG[sourceName];
    if (!this.config) {
      throw new Error(`Unknown source: ${sourceName}`);
    }
    this.cache = new Map();
    this.requestTimes = [];
  }

  async fetchJson(path, options = {}) {
    const cacheKey = `${path}:${JSON.stringify(options.body || '')}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.time < this.config.cacheTTL * 1000) {
      return cached.data;
    }

    await this._waitForRateLimit();

    let lastError;
    for (let attempt = 0; attempt <= this.config.retries; attempt += 1) {
      try {
        const res = await fetch(`${this.config.baseUrl}${path}`, {
          ...options,
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        this.cache.set(cacheKey, { data, time: Date.now() });
        return data;
      } catch (err) {
        lastError = err;
        if (attempt < this.config.retries) {
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        }
      }
    }
    throw lastError;
  }

  async _waitForRateLimit() {
    const { requests, perSeconds } = this.config.rateLimit;
    const windowMs = perSeconds * 1000;
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter((t) => now - t < windowMs);
    if (this.requestTimes.length >= requests) {
      const waitMs = Math.max(50, this.requestTimes[0] + windowMs - now);
      await new Promise((r) => setTimeout(r, waitMs));
    }
    this.requestTimes.push(Date.now());
  }
}
