/**
 * lib/idMapper.js
 * Cross-database ID mapping between AniList, MyAnimeList, Kitsu, TMDB, and IMDb
 * using Fribb/anime-lists (cached 24h via Next.js fetch revalidate).
 */

const FRIBB_ANIME_LIST_URL =
  'https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json';

let cachedIndex = null;
let cachedAt = 0;
const INDEX_TTL_MS = 24 * 60 * 60 * 1000;

async function loadMappingIndex() {
  const now = Date.now();
  if (cachedIndex && now - cachedAt < INDEX_TTL_MS) {
    return cachedIndex;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(FRIBB_ANIME_LIST_URL, {
      signal: controller.signal,
      next: { revalidate: 86400 },
    });
    if (!res.ok) return cachedIndex;

    const list = await res.json();
    if (!Array.isArray(list)) return cachedIndex;

    const byAnilist = new Map();
    const byMal = new Map();
    const byTmdb = new Map();
    const byImdb = new Map();

    for (const entry of list) {
      if (!entry || typeof entry !== 'object') continue;
      if (entry.anilist_id) byAnilist.set(String(entry.anilist_id), entry);
      if (entry.mal_id) byMal.set(String(entry.mal_id), entry);
      if (entry.themoviedb_id) byTmdb.set(String(entry.themoviedb_id), entry);
      if (entry.imdb_id) byImdb.set(String(entry.imdb_id).toLowerCase(), entry);
    }

    cachedIndex = { byAnilist, byMal, byTmdb, byImdb, count: list.length };
    cachedAt = now;
    return cachedIndex;
  } catch {
    return cachedIndex;
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveCrossIds({ anilistId, malId, tmdbId, imdbId } = {}) {
  const idx = await loadMappingIndex();
  if (!idx) return null;

  let match = null;
  if (anilistId) match = idx.byAnilist.get(String(anilistId)) || null;
  if (!match && malId) match = idx.byMal.get(String(malId)) || null;
  if (!match && tmdbId) match = idx.byTmdb.get(String(tmdbId)) || null;
  if (!match && imdbId) match = idx.byImdb.get(String(imdbId).toLowerCase()) || null;

  if (!match) return null;

  return {
    anilist_id: match.anilist_id ?? null,
    mal_id: match.mal_id ?? null,
    kitsu_id: match.kitsu_id ?? null,
    themoviedb_id: match.themoviedb_id ?? null,
    imdb_id: match.imdb_id ?? null,
    type: match.type ?? null,
  };
}
