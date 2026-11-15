import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ANILIST_EPISODES_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    episodes
    nextAiringEpisode { episode }
    streamingEpisodes { title thumbnail }
  }
}`;

function respond(episodes, status = 200) {
  return NextResponse.json(
    { episodes },
    {
      status,
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400, max-age=0' },
    },
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  const id = searchParams.get('id') || '';
  if (!/^\d{1,9}$/.test(id)) return respond([], 400);

  try {
    if (source === 'tvmaze') {
      const res = await fetch(`https://api.tvmaze.com/shows/${id}/episodes`, {
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 3600 },
      });
      const data = res.ok ? await res.json() : [];
      const episodes = (Array.isArray(data) ? data : [])
        .filter((e) => e.season && e.number)
        .map((e) => ({
          season: e.season,
          number: e.number,
          name: e.name || `Episode ${e.number}`,
          image: e.image?.medium || '',
          airdate: e.airdate || '',
        }));
      return respond(episodes);
    }

    if (source === 'anilist') {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: ANILIST_EPISODES_QUERY, variables: { id: Number(id) } }),
        signal: AbortSignal.timeout(5000),
      });
      const json = res.ok ? await res.json() : null;
      const media = json?.data?.Media;
      if (!media) return respond([]);

      const thumbs = {};
      (media.streamingEpisodes || []).forEach((se, i) => {
        const m = /episode\s*(\d+)/i.exec(se.title || '');
        const n = m ? Number(m[1]) : i + 1;
        if (!thumbs[n]) thumbs[n] = se;
      });

      const aired = media.nextAiringEpisode?.episode ? media.nextAiringEpisode.episode - 1 : 0;
      const total = Math.min(
        aired || media.episodes || (media.streamingEpisodes || []).length || 12,
        500,
      );
      const episodes = Array.from({ length: Math.max(total, 1) }, (_, i) => ({
        season: 1,
        number: i + 1,
        name: thumbs[i + 1]?.title || `Episode ${i + 1}`,
        image: thumbs[i + 1]?.thumbnail || '',
      }));
      return respond(episodes);
    }

    if (source === 'jikan') {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`, {
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 3600 },
      });
      const json = res.ok ? await res.json() : null;
      const list = Array.isArray(json?.data) ? json.data : [];
      const episodes = list.map((ep, i) => ({
        season: 1,
        number: Number(ep.mal_id) || i + 1,
        name: ep.title || `Episode ${i + 1}`,
        image: '',
      }));
      return respond(episodes);
    }
  } catch {
    return respond([]);
  }

  return respond([], 400);
}
