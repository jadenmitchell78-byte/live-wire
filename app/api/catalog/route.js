import { NextResponse } from 'next/server';

export const revalidate = 30;

const ESPN_FEEDS = [
  {
    id: 'nba',
    category: 'nba',
    label: 'NBA',
    path: 'basketball/nba',
    watch: 'https://www.nba.com/watch/',
  },
  {
    id: 'nfl',
    category: 'nfl',
    label: 'NFL',
    path: 'football/nfl',
    watch: 'https://www.nfl.com/plus/',
  },
  {
    id: 'college-football',
    category: 'college',
    label: 'College Football',
    path: 'football/college-football',
    watch: 'https://www.espn.com/watch/',
  },
  {
    id: 'soccer-epl',
    category: 'soccer',
    label: 'Premier League',
    path: 'soccer/eng.1',
    watch: 'https://www.espn.com/watch/',
  },
  {
    id: 'soccer-ucl',
    category: 'soccer',
    label: 'UEFA Champions League',
    path: 'soccer/uefa.champions',
    watch: 'https://www.espn.com/watch/',
  },
  {
    id: 'ufc',
    category: 'mma',
    label: 'UFC',
    path: 'mma/ufc',
    watch: 'https://www.ufc.com/watch',
  },
];

const OFFICIAL_PROVIDERS = {
  nba: [
    {
      label: 'NBA League Pass',
      provider: 'NBA',
      url: 'https://www.nba.com/watch/',
    },
    {
      label: 'ESPN / ABC',
      provider: 'ESPN',
      url: 'https://www.espn.com/watch/',
    },
    {
      label: 'TNT / Max',
      provider: 'Warner Bros. Discovery',
      url: 'https://www.max.com/sports',
    },
  ],
  nfl: [
    {
      label: 'NFL+',
      provider: 'NFL',
      url: 'https://www.nfl.com/plus/',
    },
    {
      label: 'ESPN / NFL Network',
      provider: 'ESPN',
      url: 'https://www.espn.com/watch/',
    },
    {
      label: 'Prime Video',
      provider: 'Amazon',
      url: 'https://www.amazon.com/gp/video/storefront',
    },
  ],
  college: [
    {
      label: 'ESPN / ESPN+',
      provider: 'ESPN',
      url: 'https://www.espn.com/watch/',
    },
    {
      label: 'CBS Sports',
      provider: 'CBS',
      url: 'https://www.cbssports.com/college-football/',
    },
    {
      label: 'FOX Sports',
      provider: 'FOX',
      url: 'https://www.foxsports.com/college-football',
    },
  ],
  soccer: [
    {
      label: 'ESPN+ / ESPN',
      provider: 'ESPN',
      url: 'https://www.espn.com/watch/',
    },
    {
      label: 'Paramount+ / CBS Sports',
      provider: 'CBS',
      url: 'https://www.paramountplus.com/sports/',
    },
    {
      label: 'Peacock / NBC Sports',
      provider: 'NBC',
      url: 'https://www.peacocktv.com/sports',
    },
  ],
  mma: [
    {
      label: 'UFC Fight Pass',
      provider: 'UFC',
      url: 'https://www.ufc.com/watch',
    },
    {
      label: 'ESPN+ / PPV',
      provider: 'ESPN',
      url: 'https://www.espn.com/watch/',
    },
    {
      label: 'UFC Events',
      provider: 'UFC',
      url: 'https://www.ufc.com/events',
    },
  ],
};

const LIVE_CHANNELS = [
  {
    id: 'channel:redbull-tv',
    kind: 'channel',
    category: 'channels',
    title: 'Red Bull TV',
    subtitle: 'Action sports · 24/7',
    description:
      'Official Red Bull TV live HLS channel. Availability can vary by region.',
    poster:
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1400&q=82',
    backdrop:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=82',
    badge: '24/7',
    live: true,
    servers: [
      {
        id: 'redbull-tv-hls',
        label: 'Red Bull TV official HLS',
        type: 'hls',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
        kind: 'live',
        quality: 'Adaptive',
        provider: 'Red Bull TV',
        allowProxy: true,
        note: 'Official free channel. Regional availability may vary.',
      },
    ],
  },
  {
    id: 'channel:nasa-tv',
    kind: 'channel',
    category: 'channels',
    title: 'NASA TV',
    subtitle: 'US public · 24/7',
    description:
      'NASA public television live HLS feed from the U.S. space program.',
    poster:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1400&q=82',
    backdrop:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=82',
    badge: '24/7',
    live: true,
    servers: [
      {
        id: 'nasa-tv-hls',
        label: 'NASA TV official HLS',
        type: 'hls',
        url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
        kind: 'live',
        quality: 'Adaptive',
        provider: 'NASA',
        allowProxy: true,
        note: 'Official U.S. government public feed.',
      },
    ],
  },
  {
    id: 'channel:al-jazeera-english',
    kind: 'channel',
    category: 'channels',
    title: 'Al Jazeera English',
    subtitle: 'World news · 24/7',
    description: 'Official Al Jazeera English live HLS news channel.',
    poster:
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=82',
    backdrop:
      'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1800&q=82',
    badge: '24/7',
    live: true,
    servers: [
      {
        id: 'aje-hls',
        label: 'Al Jazeera English official HLS',
        type: 'hls',
        url: 'https://live-hls-web-aje.getaj.net/AJE/index.m3u8',
        kind: 'live',
        quality: 'Adaptive',
        provider: 'Al Jazeera',
        allowProxy: true,
        note: 'Official free 24/7 news feed.',
      },
    ],
  },
  {
    id: 'channel:france-24-english',
    kind: 'channel',
    category: 'channels',
    title: 'France 24 English',
    subtitle: 'World news · 24/7',
    description: 'Official France 24 English live HLS news channel.',
    poster:
      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1400&q=82',
    backdrop:
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1800&q=82',
    badge: '24/7',
    live: true,
    servers: [
      {
        id: 'france24-hls',
        label: 'France 24 English official HLS',
        type: 'hls',
        url: 'https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8',
        kind: 'live',
        quality: 'Adaptive',
        provider: 'France 24',
        allowProxy: true,
        note: 'Official free 24/7 news feed.',
      },
    ],
  },
];

const OPEN_MOVIES = [
  {
    id: 'movie:big-buck-bunny',
    kind: 'movie',
    category: 'movies',
    title: 'Big Buck Bunny',
    subtitle: 'Blender Open Movie · 2008',
    description:
      'The Blender Foundation open movie. A giant rabbit, three rodents, and a very bad day.',
    poster: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg',
    backdrop: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/maxresdefault.jpg',
    badge: 'OPEN',
    live: false,
    servers: [
      {
        id: 'bbb-hls',
        label: 'Adaptive HLS',
        type: 'hls',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        kind: 'feature',
        quality: '1080p',
        provider: 'Open Movie',
        allowProxy: true,
        note: 'Openly licensed Blender Foundation film.',
      },
    ],
  },
  {
    id: 'movie:sintel',
    kind: 'movie',
    category: 'movies',
    title: 'Sintel',
    subtitle: 'Blender Open Movie · 2010',
    description:
      'A lone warrior searches for her dragon companion in the Blender Foundation open film.',
    poster: 'https://i.ytimg.com/vi/eRsGyueVLvQ/hqdefault.jpg',
    backdrop: 'https://i.ytimg.com/vi/eRsGyueVLvQ/maxresdefault.jpg',
    badge: 'OPEN',
    live: false,
    servers: [
      {
        id: 'sintel-hls',
        label: 'Adaptive HLS',
        type: 'hls',
        url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
        kind: 'feature',
        quality: '1080p',
        provider: 'Open Movie',
        allowProxy: true,
        note: 'Openly licensed Blender Foundation film.',
      },
    ],
  },
  {
    id: 'movie:tears-of-steel',
    kind: 'movie',
    category: 'movies',
    title: 'Tears of Steel',
    subtitle: 'Blender Open Movie · 2012',
    description:
      'A sci-fi open movie from the Blender Foundation with VFX and live-action footage.',
    poster: 'https://i.ytimg.com/vi/R6MlUcmOul8/hqdefault.jpg',
    backdrop: 'https://i.ytimg.com/vi/R6MlUcmOul8/maxresdefault.jpg',
    badge: 'OPEN',
    live: false,
    servers: [
      {
        id: 'tos-hls',
        label: 'Adaptive HLS',
        type: 'hls',
        url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
        kind: 'feature',
        quality: 'Adaptive',
        provider: 'Open Movie',
        allowProxy: true,
        note: 'Openly licensed Blender Foundation film.',
      },
    ],
  },
  {
    id: 'movie:elephants-dream',
    kind: 'movie',
    category: 'movies',
    title: 'Elephants Dream',
    subtitle: 'Blender Open Movie · 2006',
    description:
      'The first Blender Foundation open movie, an experimental animated short.',
    poster: 'https://archive.org/services/img/ElephantsDream',
    backdrop: 'https://archive.org/services/img/ElephantsDream',
    badge: 'OPEN',
    live: false,
    servers: [
      {
        id: 'ed-embed',
        label: 'Internet Archive embed',
        type: 'embed',
        url: 'https://archive.org/embed/ElephantsDream',
        kind: 'feature',
        quality: 'Archive',
        provider: 'Internet Archive',
        allowProxy: false,
        note: 'Openly licensed Blender Foundation film.',
      },
    ],
  },
  {
    id: 'movie:night-of-the-living-dead',
    kind: 'movie',
    category: 'movies',
    title: 'Night of the Living Dead',
    subtitle: 'Public domain · 1968',
    description:
      'George A. Romero’s public-domain horror landmark, hosted by the Internet Archive.',
    poster:
      'https://archive.org/services/img/night_of_the_living_dead',
    backdrop:
      'https://archive.org/services/img/night_of_the_living_dead',
    badge: 'PUBLIC DOMAIN',
    live: false,
    servers: [
      {
        id: 'notld-embed',
        label: 'Internet Archive embed',
        type: 'embed',
        url: 'https://archive.org/embed/night_of_the_living_dead',
        kind: 'feature',
        quality: 'Archive',
        provider: 'Internet Archive',
        allowProxy: false,
        note: 'Public-domain film.',
      },
    ],
  },
  {
    id: 'movie:plan-9',
    kind: 'movie',
    category: 'movies',
    title: 'Plan 9 from Outer Space',
    subtitle: 'Public domain · 1959',
    description:
      'Ed Wood’s cult classic, available from the Internet Archive.',
    poster:
      'https://archive.org/services/img/plan_9_fromouter_space_0',
    backdrop:
      'https://archive.org/services/img/plan_9_fromouter_space_0',
    badge: 'PUBLIC DOMAIN',
    live: false,
    servers: [
      {
        id: 'plan9-embed',
        label: 'Internet Archive embed',
        type: 'embed',
        url: 'https://archive.org/embed/plan_9_fromouter_space_0',
        kind: 'feature',
        quality: 'Archive',
        provider: 'Internet Archive',
        allowProxy: false,
        note: 'Public-domain film.',
      },
    ],
  },
  {
    id: 'movie:nosferatu',
    kind: 'movie',
    category: 'movies',
    title: 'Nosferatu',
    subtitle: 'Public domain · 1922',
    description:
      'F. W. Murnau’s silent vampire classic, available from the Internet Archive.',
    poster: 'https://archive.org/services/img/nosferatu',
    backdrop: 'https://archive.org/services/img/nosferatu',
    badge: 'PUBLIC DOMAIN',
    live: false,
    servers: [
      {
        id: 'nosferatu-embed',
        label: 'Internet Archive embed',
        type: 'embed',
        url: 'https://archive.org/embed/nosferatu',
        kind: 'feature',
        quality: 'Archive',
        provider: 'Internet Archive',
        allowProxy: false,
        note: 'Public-domain film.',
      },
    ],
  },
  {
    id: 'movie:his-girl-friday',
    kind: 'movie',
    category: 'movies',
    title: 'His Girl Friday',
    subtitle: 'Public domain · 1940',
    description:
      'Howard Hawks’ rapid-fire newspaper comedy, available from the Internet Archive.',
    poster: 'https://archive.org/services/img/his_girl_friday',
    backdrop: 'https://archive.org/services/img/his_girl_friday',
    badge: 'PUBLIC DOMAIN',
    live: false,
    servers: [
      {
        id: 'hgf-embed',
        label: 'Internet Archive embed',
        type: 'embed',
        url: 'https://archive.org/embed/his_girl_friday',
        kind: 'feature',
        quality: 'Archive',
        provider: 'Internet Archive',
        allowProxy: false,
        note: 'Public-domain film.',
      },
    ],
  },
];

const OPEN_SHOWS = [
  {
    id: 'show:caminandes-llama-drama',
    kind: 'show',
    category: 'shows',
    title: 'Caminandes: Llama Drama',
    subtitle: 'Open animated series · Episode 1',
    description:
      'Koro the llama stars in this Blender Foundation open animated short series.',
    poster: 'https://i.ytimg.com/vi/Z4C82eyhwgU/hqdefault.jpg',
    backdrop: 'https://i.ytimg.com/vi/Z4C82eyhwgU/maxresdefault.jpg',
    badge: 'OPEN',
    live: false,
    servers: [
      {
        id: 'caminandes-1-embed',
        label: 'Official open-movie embed',
        type: 'embed',
        url: 'https://www.youtube-nocookie.com/embed/Z4C82eyhwgU?rel=0&modestbranding=1',
        kind: 'feature',
        quality: 'Embed',
        provider: 'Blender Foundation',
        allowProxy: false,
        note: 'Openly licensed Blender Foundation short.',
      },
    ],
  },
  {
    id: 'show:caminandes-gran-dillama',
    kind: 'show',
    category: 'shows',
    title: 'Caminandes 2: Gran Dillama',
    subtitle: 'Open animated series · Episode 2',
    description:
      'Koro ventures into the snowy wild in the second Caminandes short.',
    poster: 'https://i.ytimg.com/vi/7fE5L8j1XQ0/hqdefault.jpg',
    backdrop: 'https://i.ytimg.com/vi/7fE5L8j1XQ0/maxresdefault.jpg',
    badge: 'OPEN',
    live: false,
    servers: [
      {
        id: 'caminandes-2-embed',
        label: 'Official open-movie embed',
        type: 'embed',
        url: 'https://www.youtube-nocookie.com/embed/7fE5L8j1XQ0?rel=0&modestbranding=1',
        kind: 'feature',
        quality: 'Embed',
        provider: 'Blender Foundation',
        allowProxy: false,
        note: 'Openly licensed Blender Foundation short.',
      },
    ],
  },
  {
    id: 'show:caminandes-llamigos',
    kind: 'show',
    category: 'shows',
    title: 'Caminandes 3: Llamigos',
    subtitle: 'Open animated series · Episode 3',
    description:
      'Koro and Pico meet in the third Caminandes open animated short.',
    poster: 'https://i.ytimg.com/vi/SkVqJ1SGeL0/hqdefault.jpg',
    backdrop: 'https://i.ytimg.com/vi/SkVqJ1SGeL0/maxresdefault.jpg',
    badge: 'OPEN',
    live: false,
    servers: [
      {
        id: 'caminandes-3-embed',
        label: 'Official open-movie embed',
        type: 'embed',
        url: 'https://www.youtube-nocookie.com/embed/SkVqJ1SGeL0?rel=0&modestbranding=1',
        kind: 'feature',
        quality: 'Embed',
        provider: 'Blender Foundation',
        allowProxy: false,
        note: 'Openly licensed Blender Foundation short.',
      },
    ],
  },
  {
    id: 'show:cosmos-laundromat',
    kind: 'show',
    category: 'shows',
    title: 'Cosmos Laundromat',
    subtitle: 'Open animated pilot · 2015',
    description:
      'The Blender Institute’s open animated pilot about a suicidal sheep and a mysterious salesman.',
    poster: 'https://i.ytimg.com/vi/Y-rmzh0PI3c/hqdefault.jpg',
    backdrop: 'https://i.ytimg.com/vi/Y-rmzh0PI3c/maxresdefault.jpg',
    badge: 'OPEN',
    live: false,
    servers: [
      {
        id: 'cosmos-embed',
        label: 'Official open-movie embed',
        type: 'embed',
        url: 'https://www.youtube-nocookie.com/embed/Y-rmzh0PI3c?rel=0&modestbranding=1',
        kind: 'feature',
        quality: 'Embed',
        provider: 'Blender Foundation',
        allowProxy: false,
        note: 'Openly licensed Blender Institute pilot.',
      },
    ],
  },
  {
    id: 'show:agent-327',
    kind: 'show',
    category: 'shows',
    title: 'Agent 327: Operation Barbershop',
    subtitle: 'Open animated short · 2017',
    description:
      'A Blender Institute open animated short featuring the Dutch comic character Agent 327.',
    poster: 'https://i.ytimg.com/vi/mN0zPOpADL4/hqdefault.jpg',
    backdrop: 'https://i.ytimg.com/vi/mN0zPOpADL4/maxresdefault.jpg',
    badge: 'OPEN',
    live: false,
    servers: [
      {
        id: 'agent327-embed',
        label: 'Official open-movie embed',
        type: 'embed',
        url: 'https://www.youtube-nocookie.com/embed/mN0zPOpADL4?rel=0&modestbranding=1',
        kind: 'feature',
        quality: 'Embed',
        provider: 'Blender Foundation',
        allowProxy: false,
        note: 'Openly licensed Blender Institute short.',
      },
    ],
  },
  {
    id: 'show:spring',
    kind: 'show',
    category: 'shows',
    title: 'Spring',
    subtitle: 'Open animated short · 2019',
    description:
      'A shepherd girl and her dog face the ancient spirits of nature in this Blender open movie.',
    poster: 'https://i.ytimg.com/vi/WhWc3b3KhnY/hqdefault.jpg',
    backdrop: 'https://i.ytimg.com/vi/WhWc3b3KhnY/maxresdefault.jpg',
    badge: 'OPEN',
    live: false,
    servers: [
      {
        id: 'spring-embed',
        label: 'Official open-movie embed',
        type: 'embed',
        url: 'https://www.youtube-nocookie.com/embed/WhWc3b3KhnY?rel=0&modestbranding=1',
        kind: 'feature',
        quality: 'Embed',
        provider: 'Blender Foundation',
        allowProxy: false,
        note: 'Openly licensed Blender Foundation short.',
      },
    ],
  },
];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeColor(value, fallback) {
  if (!value || typeof value !== 'string') return fallback;
  return value.startsWith('#') ? value : `#${value}`;
}

function scoreValue(competitor) {
  const score = competitor?.score;

  if (typeof score === 'string' || typeof score === 'number') {
    return String(score);
  }

  if (score?.displayValue !== undefined) {
    return String(score.displayValue);
  }

  if (score?.value !== undefined) {
    return String(score.value);
  }

  return '—';
}

function normalizeTeam(competitor = {}) {
  const team = competitor.team || {};
  const logos = safeArray(team.logos);

  return {
    id: team.id || competitor.id || '',
    name: team.displayName || team.name || 'TBD',
    shortName:
      team.abbreviation ||
      team.shortDisplayName ||
      team.name ||
      'TBD',
    logo: team.logo || logos[0]?.href || '',
    color: normalizeColor(team.color, '#64748b'),
    score: scoreValue(competitor),
    record:
      competitor.records?.[0]?.summary ||
      competitor.record?.[0]?.summary ||
      '',
    winner: Boolean(competitor.winner),
  };
}

function extractHighlights(feed, event, eventUrl) {
  const candidates = [];

  const push = (url, label) => {
    if (!url) return;
    if (!url.startsWith('http')) return;
    if (candidates.some((candidate) => candidate.url === url)) return;

    candidates.push({
      url,
      label: label || 'ESPN highlight',
    });
  };

  const inspectVideo = (video) => {
    if (!video) return;

    const web =
      video.links?.web?.href ||
      video.links?.mobile?.href ||
      video.href ||
      video.url;

    push(
      web,
      video.headline || video.title || video.description || 'ESPN highlight',
    );
  };

  safeArray(event.videos).forEach(inspectVideo);

  safeArray(event.competitions).forEach((competition) => {
    safeArray(competition.videos).forEach(inspectVideo);

    safeArray(competition.links).forEach((link) => {
      const text = `${link.text || ''} ${link.shortText || ''}`;
      if (/highlight|clip/i.test(text) || /\/video\//i.test(link.href || '')) {
        push(link.href, link.shortText || link.text || 'ESPN highlight');
      }
    });
  });

  safeArray(event.links).forEach((link) => {
    const text = `${link.text || ''} ${link.shortText || ''}`;
    if (/highlight|clip/i.test(text) || /\/video\//i.test(link.href || '')) {
      push(link.href, link.shortText || link.text || 'ESPN highlight');
    }
  });

  return candidates.slice(0, 3).map((candidate, index) => ({
    id: `${event.id}-highlight-${index}`,
    label: candidate.label,
    type: 'link',
    url: candidate.url,
    kind: 'highlight',
    quality: 'Short clip',
    provider: 'ESPN',
    note: 'Short highlight clip — not a full game broadcast.',
  }));
}

function buildOfficialServers(feed, event, eventUrl) {
  const providers = safeArray(OFFICIAL_PROVIDERS[feed.category]);

  const primary = [
    {
      id: `${event.id}-official-primary`,
      label: `${feed.label} official broadcast`,
      type: 'link',
      url: feed.watch,
      kind: 'live',
      quality: 'Full broadcast',
      provider: 'Official',
      note: 'League-authorized destination. A subscription or login may be required.',
    },
    ...providers.map((provider, index) => ({
      id: `${event.id}-official-${index + 1}`,
      label: provider.label,
      type: 'link',
      url: provider.url,
      kind: 'live',
      quality: 'Full broadcast',
      provider: provider.provider,
      note: 'Official broadcaster or league destination. A subscription or login may be required.',
    })),
  ].slice(0, 3);

  const gamecast = {
    id: `${event.id}-gamecast`,
    label: 'ESPN gamecast',
    type: 'link',
    url: eventUrl,
    kind: 'live',
    quality: 'Official data',
    provider: 'ESPN',
    note: 'Official ESPN game page with scores, stats, and broadcaster links.',
  };

  return [...primary, gamecast];
}

function sortSports(a, b) {
  const rank = (item) => {
    if (item.live) return 0;
    if (item.game?.status?.state === 'pre') return 1;
    return 2;
  };

  const rankDifference = rank(a) - rank(b);
  if (rankDifference !== 0) return rankDifference;

  return (
    new Date(a.startTime || 0).getTime() -
    new Date(b.startTime || 0).getTime()
  );
}

function normalizeEvent(feed, event) {
  const competition = safeArray(event.competitions)[0] || {};
  const competitors = safeArray(competition.competitors);
  const home =
    competitors.find((competitor) => competitor.homeAway === 'home') ||
    competitors[0] ||
    {};
  const away =
    competitors.find((competitor) => competitor.homeAway === 'away') ||
    competitors[1] ||
    {};

  const status = competition.status || event.status || {};
  const state = status.type?.state || 'pre';
  const isLive = state === 'in';
  const isFinal = state === 'post';

  const eventUrl =
    safeArray(event.links).find((link) => link.href)?.href ||
    'https://www.espn.com/';

  const broadcasts = safeArray(competition.broadcasts)
    .flatMap((broadcast) => safeArray(broadcast.names))
    .join(', ');

  const highlights = extractHighlights(feed, event, eventUrl);
  const servers = [
    ...buildOfficialServers(feed, event, eventUrl),
    ...highlights,
  ];

  const awayTeam = normalizeTeam(away);
  const homeTeam = normalizeTeam(home);

  return {
    id: `sports:${feed.id}:${event.id}`,
    kind: 'sports',
    category: feed.category,
    league: feed.label,
    title: `${awayTeam.shortName} vs ${homeTeam.shortName}`,
    subtitle: `${feed.label} · ${
      isLive ? 'LIVE' : isFinal ? 'FINAL' : 'UPCOMING'
    }`,
    description:
      event.name ||
      status.type?.detail ||
      `${awayTeam.name} at ${homeTeam.name}`,
    poster: '',
    backdrop: '',
    badge: isLive ? 'LIVE' : isFinal ? 'FINAL' : 'UPCOMING',
    live: isLive,
    startTime: event.date || competition.date || null,
    game: {
      away: awayTeam,
      home: homeTeam,
      status: {
        state,
        clock: status.displayClock || '',
        period: status.period || '',
        detail: status.type?.detail || '',
        shortDetail: status.type?.shortDetail || '',
      },
      venue: competition.venue?.fullName || '',
      broadcast:
        broadcasts ||
        safeArray(competition.broadcast).join(', ') ||
        '',
      link: eventUrl,
    },
    servers,
    links: {
      official: eventUrl,
      watch: feed.watch,
    },
  };
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json',
      },
      next: {
        revalidate: 30,
      },
    });

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function loadFeed(feed) {
  const data = await fetchJson(
    `https://site.api.espn.com/apis/site/v2/sports/${feed.path}/scoreboard`,
  );

  if (!data) return [];

  return safeArray(data.events)
    .map((event) => normalizeEvent(feed, event))
    .filter(Boolean);
}

export async function GET() {
  const feedResults = await Promise.all(ESPN_FEEDS.map(loadFeed));
  const sports = feedResults.flat().sort(sortSports).slice(0, 80);

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      sports,
      movies: OPEN_MOVIES,
      shows: OPEN_SHOWS,
      channels: LIVE_CHANNELS,
      meta: {
        sources: [
          'ESPN public scoreboard API',
          'Official league / broadcaster watch destinations',
          'Openly licensed media',
          'Public-domain Internet Archive media',
          'Public 24/7 HLS channels',
        ],
        noPlutoTv: true,
        highlightsAreSeparated: true,
        note:
          'Live sports buttons open official rights-holder destinations. Highlights are sorted after full-broadcast options and labels.',
      },
    },
    {
      headers: {
        'Cache-Control':
          'public, s-maxage=30, stale-while-revalidate=120, max-age=0',
      },
    },
  );
}
