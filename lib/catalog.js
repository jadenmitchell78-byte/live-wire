import { unstable_cache } from 'next/cache';
import { buildAnimeServers, buildMovieServers, buildTvServers, withFlags } from './sources';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

const STREAMED_BASES = ['https://streamed.pk', 'https://streamed.su'];

const ESPN_ENDPOINTS = [
  { category: 'NFL', league: 'NFL', url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard' },
  { category: 'NBA', league: 'NBA', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard' },
  { category: 'NHL', league: 'NHL', url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard' },
  { category: 'MLB', league: 'MLB', url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard' },
  { category: 'College', league: 'NCAAB', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard' },
  { category: 'College', league: 'NCAAF', url: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard' },
  { category: 'Soccer', league: 'EPL', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard' },
  { category: 'Soccer', league: 'UCL', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard' },
  { category: 'Soccer', league: 'MLS', url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard' },
  { category: 'MMA', league: 'UFC / MMA', url: 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard' },
  { category: 'Tennis', league: 'ATP', url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard' },
  { category: 'Tennis', league: 'WTA', url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/wta/scoreboard' },
];

const LOGO_NFL = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png';
const LOGO_NBA = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png';
const LOGO_UFC = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/ufc.png';
const REDBULL_HLS = 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8';
const CBS_SPORTS_HQ_HLS = 'https://sportshq-mediapackage-cedexis.cbsaavideo.com/out/v1/be87d7783e5c4270a5830ea5d1164850/desktop.m3u8';
const CBS_GOLAZO_HLS = 'https://dai.google.com/linear/hls/event/7f3Wv6f7QEKfQna22jHqLQ/master.m3u8';
const FIFA_PLUS_HLS = 'https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1_ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8';

const NETWORK_MAP = {
  NFL: 'https://thedaddy.li/stream/stream-66.php',
  NBA: 'https://thedaddy.li/stream/stream-46.php',
  NHL: 'https://thedaddy.li/stream/stream-65.php',
  MLB: 'https://thedaddy.li/stream/stream-44.php',
  College: 'https://thedaddy.li/stream/stream-44.php',
  Soccer: 'https://thedaddy.li/stream/stream-38.php',
  MMA: 'https://thedaddy.li/stream/stream-31.php',
  Tennis: 'https://thedaddy.li/stream/stream-71.php',
};

export const CHANNELS_24_7 = [
  {
    id: 'ch-cbssports-hq',
    title: 'CBS Sports HQ (24/7 Live NBA, NFL & Scores)',
    shortTitle: 'CBS Sports HQ',
    category: 'Channels',
    league: 'OFFICIAL · SPORTS HLS',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'CBS Sports HQ', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: '24/7 Desk', score: '1080p', logo: LOGO_NFL },
    servers: [
      { name: 'CBS Sports HQ Direct HLS (Zero Ads)', type: 'hls', url: CBS_SPORTS_HQ_HLS, thirdParty: false },
      { name: 'CBS Golazo Sports HLS', type: 'hls', url: CBS_GOLAZO_HLS, thirdParty: false },
      { name: 'Red Bull TV Action HLS', type: 'hls', url: REDBULL_HLS, thirdParty: false },
    ],
  },
  {
    id: 'ch-nbatv',
    title: 'NBA TV & TNT Sports Live',
    shortTitle: 'NBA TV',
    category: 'Channels',
    league: 'NBA TV · LIVE',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'NBA TV', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: 'TNT', score: '24/7', logo: LOGO_NBA },
    servers: [
      { name: 'NBA TV HD (DLHD Active)', type: 'embed', url: 'https://thedaddy.li/stream/stream-46.php' },
      { name: 'TNT NBA Live (DLHD Active)', type: 'embed', url: 'https://thedaddy.li/stream/stream-45.php' },
      { name: 'ESPN NBA Live (DLHD Active)', type: 'embed', url: 'https://thedaddy.li/stream/stream-44.php' },
      { name: 'NBA TV Mirror (dlhd.dad)', type: 'embed', url: 'https://dlhd.dad/stream/stream-46.php' },
      { name: 'CBS Sports HQ Direct HLS (Backup)', type: 'hls', url: CBS_SPORTS_HQ_HLS, thirdParty: false },
    ],
  },
  {
    id: 'ch-espn',
    title: 'ESPN & ESPN2 Main Broadcast',
    shortTitle: 'ESPN HD',
    category: 'Channels',
    league: 'ESPN HD',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'ESPN', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: 'SportsCenter', score: '24/7', logo: LOGO_NFL },
    servers: [
      { name: 'ESPN HD (DLHD Active)', type: 'embed', url: 'https://thedaddy.li/stream/stream-44.php' },
      { name: 'ESPN Mirror (dlhd.dad)', type: 'embed', url: 'https://dlhd.dad/stream/stream-44.php' },
      { name: 'CBS Sports HQ Direct HLS (Backup)', type: 'hls', url: CBS_SPORTS_HQ_HLS, thirdParty: false },
    ],
  },
  {
    id: 'ch-redzone',
    title: 'NFL RedZone & NFL Network',
    shortTitle: 'NFL RedZone',
    category: 'Channels',
    league: 'NFL NETWORK',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'NFL RedZone', score: 'LIVE', logo: LOGO_NFL },
    awayTeam: { name: 'NFL Network', score: '24/7', logo: LOGO_NFL },
    servers: [
      { name: 'NFL Network HD (DLHD Active)', type: 'embed', url: 'https://thedaddy.li/stream/stream-66.php' },
      { name: 'NFL Mirror (dlhd.dad)', type: 'embed', url: 'https://dlhd.dad/stream/stream-66.php' },
      { name: 'CBS Sports HQ Direct HLS (Backup)', type: 'hls', url: CBS_SPORTS_HQ_HLS, thirdParty: false },
    ],
  },
  {
    id: 'ch-golazo',
    title: 'CBS Sports Golazo & FIFA+ Soccer',
    shortTitle: 'CBS Golazo',
    category: 'Channels',
    league: 'OFFICIAL · SOCCER HLS',
    status: 'LIVE 24/7',
    isLive: true,
    homeTeam: { name: 'CBS Golazo', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: 'FIFA+', score: '24/7', logo: LOGO_NFL },
    servers: [
      { name: 'CBS Golazo Direct HLS', type: 'hls', url: CBS_GOLAZO_HLS, thirdParty: false },
      { name: 'FIFA+ English Direct HLS', type: 'hls', url: FIFA_PLUS_HLS, thirdParty: false },
      { name: 'Sky Sports PL (DLHD Active)', type: 'embed', url: 'https://thedaddy.li/stream/stream-38.php' },
    ],
  },
  {
    id: 'ch-redbull',
    title: 'Red Bull TV Action Sports',
    shortTitle: 'Red Bull TV',
    category: 'Channels',
    league: 'OFFICIAL · HLS',
    status: 'LIVE 24/7',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Red Bull TV', score: 'HD', logo: LOGO_UFC },
    awayTeam: { name: 'Action Sports', score: 'LIVE', logo: LOGO_UFC },
    servers: [{ name: 'Official HLS', type: 'hls', url: REDBULL_HLS }],
  },
  {
    id: 'ch-nasa',
    title: 'NASA TV Public',
    shortTitle: 'NASA TV',
    category: 'Channels',
    league: 'OFFICIAL · HLS',
    status: 'LIVE 24/7',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'NASA TV', score: 'HD', logo: LOGO_NFL },
    awayTeam: { name: 'Live Earth', score: '24/7', logo: LOGO_NBA },
    servers: [{ name: 'NASA Official HLS', type: 'hls', url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8' }],
  },
  {
    id: 'ch-dw',
    title: 'DW News English',
    shortTitle: 'DW News',
    category: 'Channels',
    league: 'OFFICIAL · NEWS',
    status: 'LIVE 24/7',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'DW', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: 'English', score: 'HD', logo: LOGO_NFL },
    servers: [{ name: 'DW Official HLS', type: 'hls', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8' }],
  },
];

export const OPEN_MOVIES = [
  {
    id: 'mov-big-buck-bunny',
    title: 'Big Buck Bunny',
    shortTitle: 'Big Buck Bunny',
    category: 'Movies',
    league: 'ANIMATION · OPEN MOVIE',
    status: 'HD',
    isLive: false,
    description: 'A giant, gentle rabbit takes on three bullying rodents in the Blender Foundation\'s classic open movie.',
    genres: ['Animation', 'Comedy'],
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Blender Studio', score: '1080p', logo: LOGO_NBA },
    awayTeam: { name: 'Open Movie', score: 'HLS', logo: LOGO_NFL },
    servers: [{ name: 'Mux Adaptive HLS', type: 'hls', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }],
  },
  {
    id: 'mov-sintel',
    title: 'Sintel',
    shortTitle: 'Sintel',
    category: 'Movies',
    league: 'FANTASY · OPEN MOVIE',
    status: 'HD',
    isLive: false,
    description: 'A lonely young woman searches for the baby dragon she once rescued.',
    genres: ['Fantasy', 'Animation'],
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Durian Project', score: '1080p', logo: LOGO_NBA },
    awayTeam: { name: 'Open Movie', score: 'HLS', logo: LOGO_NFL },
    servers: [{ name: 'Bitdash HLS', type: 'hls', url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8' }],
  },
  {
    id: 'mov-tears-of-steel',
    title: 'Tears of Steel',
    shortTitle: 'Tears of Steel',
    category: 'Movies',
    league: 'SCI-FI · OPEN MOVIE',
    status: '4K',
    isLive: false,
    description: 'Warriors and scientists in future Amsterdam try to save the world from destructive robots.',
    genres: ['Sci-Fi'],
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Mango Studio', score: '4K', logo: LOGO_NBA },
    awayTeam: { name: 'Open Movie', score: 'HLS', logo: LOGO_NFL },
    servers: [{ name: 'Unified HLS', type: 'hls', url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8' }],
  },
  {
    id: 'mov-night-living-dead',
    title: 'Night of the Living Dead (1968)',
    shortTitle: 'Night of the Living Dead',
    category: 'Movies',
    league: 'CLASSIC HORROR · PUBLIC DOMAIN',
    status: 'ARCHIVE',
    isLive: false,
    description: 'George A. Romero\'s public-domain horror classic.',
    genres: ['Horror', 'Classic'],
    poster: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Public Domain', score: 'MP4', logo: LOGO_NBA },
    awayTeam: { name: 'Archive.org', score: 'HD', logo: LOGO_NFL },
    servers: [{ name: 'Internet Archive MP4', type: 'hls', url: 'https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4' }],
  },
];

export const OPEN_SHOWS = [
  {
    id: 'show-france24',
    title: 'France 24 English',
    shortTitle: 'France 24',
    category: 'Shows',
    league: 'OFFICIAL · WORLD NEWS',
    status: 'LIVE',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'France 24', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: 'English', score: 'HD', logo: LOGO_NFL },
    servers: [{ name: 'France 24 HLS', type: 'hls', url: 'https://static.france24.com/live/F24_EN_HI_HLS/live_web.m3u8' }],
  },
  {
    id: 'show-aljazeera',
    title: 'Al Jazeera English',
    shortTitle: 'Al Jazeera',
    category: 'Shows',
    league: 'OFFICIAL · NEWS',
    status: 'LIVE',
    isLive: true,
    poster: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=70',
    homeTeam: { name: 'Al Jazeera', score: 'LIVE', logo: LOGO_NBA },
    awayTeam: { name: 'Global', score: 'HD', logo: LOGO_NFL },
    servers: [{ name: 'Al Jazeera HLS', type: 'hls', url: 'https://live-hls-web-aje.getaj.net/AJE/index.m3u8' }],
  },
];

export const FEATURED_TV_SERIES = [
  {
    id: 'tv-breaking-bad',
    title: 'Breaking Bad',
    shortTitle: 'Breaking Bad',
    category: 'Shows',
    league: 'TV · AMC · CRIME DRAMA',
    status: '5 SEASONS · HD',
    rating: '9.5',
    isLive: false,
    mediaType: 'tv',
    imdbId: 'tt0903747',
    tmdbId: 1396,
    tvmazeId: 169,
    totalEpisodes: 62,
    poster: 'https://image.tmdb.org/t/p/w780/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    description: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.',
    genres: ['Crime', 'Drama', 'Thriller'],
    servers: buildTvServers('tt0903747', 1, 1, 1396),
  },
  {
    id: 'tv-the-boys',
    title: 'The Boys',
    shortTitle: 'The Boys',
    category: 'Shows',
    league: 'TV · PRIME · ACTION',
    status: '4 SEASONS · HD',
    rating: '8.7',
    isLive: false,
    mediaType: 'tv',
    imdbId: 'tt1190634',
    tmdbId: 76479,
    tvmazeId: 15299,
    totalEpisodes: 32,
    poster: 'https://image.tmdb.org/t/p/w780/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/mGVrXeIjyecj6TKmwPVpHlscEmw.jpg',
    description: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.',
    genres: ['Action', 'Sci-Fi', 'Crime'],
    servers: buildTvServers('tt1190634', 1, 1, 76479),
  },
  {
    id: 'tv-stranger-things',
    title: 'Stranger Things',
    shortTitle: 'Stranger Things',
    category: 'Shows',
    league: 'TV · NETFLIX · SCI-FI',
    status: '4 SEASONS · HD',
    rating: '8.7',
    isLive: false,
    mediaType: 'tv',
    imdbId: 'tt4574334',
    tmdbId: 66732,
    tvmazeId: 2993,
    totalEpisodes: 34,
    poster: 'https://image.tmdb.org/t/p/w780/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and terrifying supernatural forces.',
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    servers: buildTvServers('tt4574334', 1, 1, 66732),
  },
  {
    id: 'tv-the-last-of-us',
    title: 'The Last of Us',
    shortTitle: 'The Last of Us',
    category: 'Shows',
    league: 'TV · HBO · DRAMA',
    status: 'SERIES · HD',
    rating: '8.8',
    isLive: false,
    mediaType: 'tv',
    imdbId: 'tt3581920',
    tmdbId: 100088,
    tvmazeId: 46562,
    totalEpisodes: 9,
    poster: 'https://image.tmdb.org/t/p/w780/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    description: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity\'s last hope.',
    genres: ['Drama', 'Action', 'Sci-Fi'],
    servers: buildTvServers('tt3581920', 1, 1, 100088),
  },
  {
    id: 'tv-game-of-thrones',
    title: 'Game of Thrones',
    shortTitle: 'Game of Thrones',
    category: 'Shows',
    league: 'TV · HBO · FANTASY',
    status: '8 SEASONS · HD',
    rating: '9.2',
    isLive: false,
    mediaType: 'tv',
    imdbId: 'tt0944947',
    tmdbId: 1399,
    tvmazeId: 82,
    totalEpisodes: 73,
    poster: 'https://image.tmdb.org/t/p/w780/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    genres: ['Fantasy', 'Drama', 'Action'],
    servers: buildTvServers('tt0944947', 1, 1, 1399),
  },
  {
    id: 'tv-severance',
    title: 'Severance',
    shortTitle: 'Severance',
    category: 'Shows',
    league: 'TV · APPLE TV+ · THRILLER',
    status: '2 SEASONS · HD',
    rating: '8.7',
    isLive: false,
    mediaType: 'tv',
    imdbId: 'tt11280740',
    tmdbId: 95396,
    tvmazeId: 44933,
    totalEpisodes: 19,
    poster: 'https://image.tmdb.org/t/p/w780/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/rY9k4k2zX8bU2F1jG0n8b0c7x5M.jpg',
    description: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.',
    genres: ['Sci-Fi', 'Mystery', 'Thriller'],
    servers: buildTvServers('tt11280740', 1, 1, 95396),
  },
  {
    id: 'tv-rick-and-morty',
    title: 'Rick and Morty',
    shortTitle: 'Rick and Morty',
    category: 'Shows',
    league: 'TV · ADULT SWIM · ANIMATION',
    status: '7 SEASONS · HD',
    rating: '9.1',
    isLive: false,
    mediaType: 'tv',
    imdbId: 'tt2861424',
    tmdbId: 60625,
    tvmazeId: 216,
    totalEpisodes: 71,
    poster: 'https://image.tmdb.org/t/p/w780/gdIrmf2DdY5mgN6ycVP0XlzKzbE.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/uGy4DCmM33I7l86W7iCskNkvmLD.jpg',
    description: 'An animated series that follows the exploits of a super scientist and his not-so-bright grandson.',
    genres: ['Animation', 'Comedy', 'Sci-Fi'],
    servers: buildTvServers('tt2861424', 1, 1, 60625),
  },
  {
    id: 'tv-arcane',
    title: 'Arcane',
    shortTitle: 'Arcane',
    category: 'Shows',
    league: 'TV · NETFLIX · ANIMATION',
    status: '2 SEASONS · HD',
    rating: '9.0',
    isLive: false,
    mediaType: 'tv',
    imdbId: 'tt11126994',
    tmdbId: 94605,
    tvmazeId: 44755,
    totalEpisodes: 18,
    poster: 'https://image.tmdb.org/t/p/w780/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/rkB4LyZHo1NHXFEDHl9vSD9r1lI.jpg',
    description: 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    servers: buildTvServers('tt11126994', 1, 1, 94605),
  },
];

export const FEATURED_MOVIES = [
  {
    id: 'mov-dune-part-two',
    title: 'Dune: Part Two (2024)',
    shortTitle: 'Dune: Part Two',
    category: 'Movies',
    league: 'BLOCKBUSTER · 4K HDR',
    status: '1080P · MULTI-SERVER',
    rating: '8.5',
    isLive: false,
    mediaType: 'movie',
    imdbId: 'tt15239678',
    tmdbId: 693134,
    poster: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    servers: buildMovieServers('tt15239678', 693134),
  },
  {
    id: 'mov-oppenheimer',
    title: 'Oppenheimer (2023)',
    shortTitle: 'Oppenheimer',
    category: 'Movies',
    league: 'BLOCKBUSTER · IMAX HD',
    status: '1080P · MULTI-SERVER',
    rating: '8.9',
    isLive: false,
    mediaType: 'movie',
    imdbId: 'tt15398776',
    tmdbId: 872585,
    poster: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    genres: ['Biography', 'Drama', 'History'],
    servers: buildMovieServers('tt15398776', 872585),
  },
  {
    id: 'mov-the-batman',
    title: 'The Batman (2022)',
    shortTitle: 'The Batman',
    category: 'Movies',
    league: 'DC · ACTION CRIME',
    status: '1080P · MULTI-SERVER',
    rating: '7.8',
    isLive: false,
    mediaType: 'movie',
    imdbId: 'tt1877830',
    tmdbId: 414906,
    poster: 'https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
    description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption.',
    genres: ['Action', 'Crime', 'Drama'],
    servers: buildMovieServers('tt1877830', 414906),
  },
  {
    id: 'mov-spiderverse',
    title: 'Spider-Man: Across the Spider-Verse (2023)',
    shortTitle: 'Across the Spider-Verse',
    category: 'Movies',
    league: 'MARVEL · ANIMATION',
    status: '1080P · MULTI-SERVER',
    rating: '8.6',
    isLive: false,
    mediaType: 'movie',
    imdbId: 'tt9362722',
    tmdbId: 569094,
    poster: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    servers: buildMovieServers('tt9362722', 569094),
  },
  {
    id: 'mov-john-wick-4',
    title: 'John Wick: Chapter 4 (2023)',
    shortTitle: 'John Wick: Chapter 4',
    category: 'Movies',
    league: 'ACTION · THRILLER',
    status: '1080P · MULTI-SERVER',
    rating: '7.7',
    isLive: false,
    mediaType: 'movie',
    imdbId: 'tt10366206',
    tmdbId: 603692,
    poster: 'https://image.tmdb.org/t/p/w780/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    bannerImage: 'https://image.tmdb.org/t/p/original/h8gHn0OzBoaefsYseUByqsmEDMY.jpg',
    description: 'John Wick uncovers a path to defeating The High Table, facing off against a new enemy with powerful alliances across the globe.',
    genres: ['Action', 'Thriller', 'Crime'],
    servers: buildMovieServers('tt10366206', 603692),
  },
];

const flag = (ev) => ({ ...ev, servers: withFlags(ev.servers) });

function stripHtml(text = '') {
  return String(text || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 450);
}

async function fetchJson(url, timeoutMs = 4000, revalidateSec = 60) {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: revalidateSec },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchAniList(query, variables, timeoutMs = 4500) {
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

const ANILIST_FIELDS = `
  id
  idMal
  isAdult
  title { english romaji }
  coverImage { extraLarge large }
  bannerImage
  episodes
  averageScore
  seasonYear
  format
  genres
  description(asHtml: false)
`;

const ANILIST_SEARCH_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 10) {
    media(search: $search, type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${ANILIST_FIELDS} }
  }
}`;

const ANILIST_HOME_QUERY = `
query ($from: Int, $to: Int) {
  trending: Page(page: 1, perPage: 35) {
    media(type: ANIME, status: RELEASING, sort: TRENDING_DESC, isAdult: false) { ${ANILIST_FIELDS} }
  }
  top: Page(page: 1, perPage: 35) {
    media(type: ANIME, sort: SCORE_DESC, isAdult: false) { ${ANILIST_FIELDS} }
  }
  airing: Page(page: 1, perPage: 40) {
    airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
      episode
      airingAt
      media { ${ANILIST_FIELDS} }
    }
  }
}`;

function mapAniListMedia(a, extra = {}) {
  const title = a.title?.english || a.title?.romaji || 'Anime';
  const poster = a.coverImage?.extraLarge || a.coverImage?.large || '';
  const score = a.averageScore ? (a.averageScore / 10).toFixed(1) : null;
  return {
    id: `ani-${a.id}`,
    title,
    shortTitle: title,
    category: 'Anime',
    league: `ANIME · ${a.seasonYear || a.format || 'SUB/DUB'}`,
    status: a.episodes ? `${a.episodes} EPS` : 'AIRING',
    rating: score,
    isLive: false,
    poster,
    bannerImage: a.bannerImage || poster,
    description: stripHtml(a.description),
    genres: (a.genres || []).slice(0, 5),
    mediaType: 'anime',
    aniId: a.id,
    malId: a.idMal || null,
    totalEpisodes: Math.min(Number(a.episodes) || 24, 500),
    homeTeam: { name: 'AniList', score: score ? `★${score}` : 'HD', logo: poster },
    awayTeam: { name: a.format || 'Anime', score: `${a.episodes || '?'} EP`, logo: poster },
    servers: buildAnimeServers(a.id, a.idMal, 1),
    ...extra,
  };
}

async function fetchJikanAnimeFallback() {
  const data = await fetchJson('https://api.jikan.moe/v4/top/anime?filter=airing&limit=14', 4000, 900);
  const list = data?.data || [];
  return list.map((j) => {
    const title = j.title_english || j.title || 'Anime';
    const poster = j.images?.webp?.large_image_url || j.images?.jpg?.large_image_url || '';
    const score = j.score ? Number(j.score).toFixed(1) : null;
    return {
      id: `mal-${j.mal_id}`,
      title,
      shortTitle: title,
      category: 'Anime',
      league: `ANIME · ${j.year || j.type || 'SUB/DUB'}`,
      status: j.episodes ? `${j.episodes} EPS` : 'AIRING',
      rating: score,
      isLive: false,
      poster,
      bannerImage: j.trailer?.images?.maximum_image_url || poster,
      description: stripHtml(j.synopsis),
      genres: (j.genres || []).map((g) => g.name).slice(0, 5),
      mediaType: 'anime',
      aniId: null,
      malId: j.mal_id,
      totalEpisodes: Math.min(Number(j.episodes) || 24, 500),
      homeTeam: { name: 'MAL', score: score ? `★${score}` : 'HD', logo: poster },
      awayTeam: { name: j.type || 'Anime', score: `${j.episodes || '?'} EP`, logo: poster },
      servers: buildAnimeServers(null, j.mal_id, 1),
    };
  });
}

function mapTvmazeShow(s, extra = {}) {
  const poster = s.image?.original || s.image?.medium || '';
  const imdbId = s.externals?.imdb || '';
  const year = s.premiered ? s.premiered.slice(0, 4) : '';
  return {
    id: `tvm-${s.id}`,
    title: s.name || 'TV Show',
    shortTitle: s.name || 'TV Show',
    category: 'Shows',
    league: `TV · ${year || 'SERIES'}${s.network?.name ? ` · ${s.network.name}` : s.webChannel?.name ? ` · ${s.webChannel.name}` : ''}`,
    status: s.status || 'SERIES',
    rating: s.rating?.average ? String(s.rating.average) : null,
    isLive: false,
    poster,
    bannerImage: poster,
    description: stripHtml(s.summary),
    genres: (s.genres || []).slice(0, 5),
    mediaType: 'tv',
    imdbId,
    tvmazeId: s.id,
    totalEpisodes: 24,
    homeTeam: { name: 'TVmaze', score: s.rating?.average || 'HD', logo: poster },
    awayTeam: { name: s.genres?.[0] || 'Series', score: year || 'TV', logo: poster },
    servers: buildTvServers(imdbId, 1, 1),
    ...extra,
  };
}

const CAT_TO_SPORT_SLUG = {
  NBA: 'basketball',
  College: 'basketball',
  NFL: 'american-football',
  NHL: 'hockey',
  MLB: 'baseball',
  Soccer: 'football',
  MMA: 'fight',
  Tennis: 'tennis',
};

const OFFICIAL_WATCH_MAP = {
  NBA: { label: 'NBA League Pass / ESPN', url: 'https://www.nba.com/watch/' },
  NFL: { label: 'NFL+ / ESPN', url: 'https://www.nfl.com/plus/' },
  College: { label: 'ESPN+ College Sports', url: 'https://www.espn.com/watch/' },
  Soccer: { label: 'Paramount+ / ESPN+ Soccer', url: 'https://www.paramountplus.com/sports/' },
  MMA: { label: 'UFC Fight Pass / ESPN+', url: 'https://www.ufc.com/watch' },
  Tennis: { label: 'ESPN+ / Tennis Channel', url: 'https://www.espn.com/watch/' },
  NHL: { label: 'ESPN+ / NHL Power Play', url: 'https://www.espn.com/watch/' },
  MLB: { label: 'MLB.TV / ESPN', url: 'https://www.mlb.com/live-stream-games' },
};

function buildGameServers(category, streamedMatch, homeName = '', awayName = '', broadcast = '') {
  const servers = [];

  // 1. Working Direct Ad-Free Sports HLS Channels First
  if (category === 'Soccer') {
    servers.push(
      {
        name: 'CBS Sports Golazo (Direct HLS · Zero Ads)',
        type: 'hls',
        url: CBS_GOLAZO_HLS,
        thirdParty: false,
      },
      {
        name: 'FIFA+ Live Soccer (Direct HLS · Zero Ads)',
        type: 'hls',
        url: FIFA_PLUS_HLS,
        thirdParty: false,
      },
      {
        name: 'CBS Sports HQ Live Desk (Direct HLS · Zero Ads)',
        type: 'hls',
        url: CBS_SPORTS_HQ_HLS,
        thirdParty: false,
      },
    );
  } else {
    servers.push(
      {
        name: 'CBS Sports HQ Live Desk (Direct HLS · Zero Ads)',
        type: 'hls',
        url: CBS_SPORTS_HQ_HLS,
        thirdParty: false,
      },
      {
        name: 'Red Bull TV Action Sports (Direct HLS)',
        type: 'hls',
        url: REDBULL_HLS,
        thirdParty: false,
      },
    );
  }

  // 2. Official League / Broadcaster Destination
  const official = OFFICIAL_WATCH_MAP[category] || OFFICIAL_WATCH_MAP.NBA;
  servers.push({
    name: `${broadcast ? `${broadcast} · ` : ''}${official.label} (Official)`,
    type: 'link',
    url: official.url,
    thirdParty: false,
  });

  return withFlags(servers);
}

async function fetchStreamedMatches() {
  const endpoints = [
    'live',
    'all-today',
    'basketball',
    'american-football',
    'football',
    'hockey',
    'baseball',
    'fight',
    'tennis',
  ];

  const baseResults = await Promise.all(
    STREAMED_BASES.map(async (base) => {
      const lists = await Promise.all(
        endpoints.map((ep) => fetchJson(`${base}/api/matches/${ep}`, 4000, 60)),
      );
      const liveIds = new Set();
      const map = new Map();
      const live = lists[0];
      if (Array.isArray(live)) {
        for (const m of live) {
          if (m?.id) {
            liveIds.add(m.id);
            map.set(m.id, m);
          }
        }
      }
      for (const list of lists.slice(1)) {
        if (Array.isArray(list)) {
          for (const m of list) {
            if (m?.id && !map.has(m.id)) map.set(m.id, m);
          }
        }
      }
      return { base, matches: Array.from(map.values()), liveIds };
    }),
  );

  for (const res of baseResults) {
    if (res.matches.length > 0) return res;
  }
  return { base: STREAMED_BASES[0], matches: [], liveIds: new Set() };
}

async function fetchArchiveCatalog(query, category, label, page = 1, rows = 18) {
  try {
    const searchUrl =
      `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}` +
      `&fl[]=identifier,title,year,description&sort[]=downloads+desc&rows=${rows}&page=${page}&output=json`;
    const searchData = await fetchJson(searchUrl, 4500, 900);
    const docs = searchData?.response?.docs || [];
    if (!docs.length) return [];

    return docs
      .filter((doc) => doc?.identifier)
      .map((doc) => {
        const id = doc.identifier;
        const cleanTitle = String(doc.title || id).slice(0, 70);
        const desc = Array.isArray(doc.description) ? doc.description[0] : doc.description;
        return {
          id: `ia-${category.toLowerCase()}-${id}`,
          title: `${cleanTitle}${doc.year ? ` (${doc.year})` : ''}`,
          shortTitle: cleanTitle,
          category,
          league: `${label} · AD-FREE${doc.year ? ` · ${doc.year}` : ''}`,
          status: 'AD-FREE DIRECT',
          isLive: false,
          poster: `https://archive.org/services/img/${encodeURIComponent(id)}`,
          description: stripHtml(desc),
          genres: [label, 'Ad-Free'],
          homeTeam: { name: 'Archive.org', score: 'MP4', logo: LOGO_NBA },
          awayTeam: { name: label, score: 'AD-FREE', logo: LOGO_NFL },
          servers: withFlags([
            {
              name: 'Ad-Free Direct MP4 (Archive.org)',
              type: 'mp4',
              url: `/api/archive-stream?id=${encodeURIComponent(id)}`,
              thirdParty: false,
            },
          ]),
        };
      });
  } catch {
    return [];
  }
}

async function fetchTvAiringToday() {
  const [page0, page1, schedule] = await Promise.all([
    fetchJson('https://api.tvmaze.com/shows?page=0', 4500, 3600),
    fetchJson('https://api.tvmaze.com/shows?page=1', 4500, 3600),
    fetchJson('https://api.tvmaze.com/schedule?country=US', 4500, 1800),
  ]);
  const seen = new Set(FEATURED_TV_SERIES.map((s) => s.imdbId));
  const out = [...FEATURED_TV_SERIES.map(flag)];

  const scheduleShows = Array.isArray(schedule)
    ? schedule.map((ep) => ep?.show).filter(Boolean)
    : [];
  const pool = [
    ...scheduleShows,
    ...(Array.isArray(page0) ? page0 : []),
    ...(Array.isArray(page1) ? page1 : []),
  ];

  const topShows = pool
    .filter(
      (s) =>
        s?.id &&
        s.externals?.imdb &&
        !seen.has(s.externals.imdb) &&
        s.image &&
        ((s.rating?.average || 0) >= 6.5 || scheduleShows.includes(s)),
    )
    .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));

  for (const s of topShows) {
    if (out.length >= 60) break;
    if (seen.has(s.externals.imdb)) continue;
    seen.add(s.externals.imdb);
    out.push(mapTvmazeShow(s));
  }
  return out;
}

async function fetchEspnEvents(streamedMatches) {
  const results = await Promise.allSettled(
    ESPN_ENDPOINTS.map(async (ep) => {
      const data = await fetchJson(ep.url, 4000, 30);
      if (!data) return [];

      return (data.events || []).slice(0, 30).map((ev) => {
        const comp = ev.competitions?.[0];
        const competitors = comp?.competitors || [];
        const home = competitors.find((c) => c.homeAway === 'home') || competitors[0] || {};
        const away = competitors.find((c) => c.homeAway === 'away') || competitors[1] || {};
        const state = ev.status?.type?.state;
        const homeName = home.team?.shortDisplayName || home.team?.displayName || home.athlete?.displayName || 'Home';
        const awayName = away.team?.shortDisplayName || away.team?.displayName || away.athlete?.displayName || 'Away';
        const homeL = homeName.toLowerCase();
        const awayL = awayName.toLowerCase();
        const homeLast = homeL.split(/\s+/).pop() || homeL;
        const awayLast = awayL.split(/\s+/).pop() || awayL;

        const matched = streamedMatches.find((m) => {
          const t = `${m.title || ''} ${m.teams?.home?.name || ''} ${m.teams?.away?.name || ''}`.toLowerCase();
          return (t.includes(homeL) && t.includes(awayL)) || (homeLast.length >= 3 && awayLast.length >= 3 && t.includes(homeLast) && t.includes(awayLast));
        });

        return {
          id: `${ep.category}-${ep.league}-${ev.id}`,
          title: ev.name || `${awayName} vs ${homeName}`,
          shortTitle: ev.shortName || `${awayName} @ ${homeName}`,
          category: ep.category,
          league: ep.league,
          status: ev.status?.type?.shortDetail || 'Scheduled',
          isLive: state === 'in',
          isUpcoming: state === 'pre',
          isFinal: state === 'post',
          startTime: ev.date ? Date.parse(ev.date) : null,
          streamedId: matched?.id || null,
          homeTeam: {
            name: homeName,
            abbr: home.team?.abbreviation || 'HOM',
            score: home.score ?? '0',
            logo: home.team?.logo || LOGO_NFL,
          },
          awayTeam: {
            name: awayName,
            abbr: away.team?.abbreviation || 'AWY',
            score: away.score ?? '0',
            logo: away.team?.logo || LOGO_NFL,
          },
          broadcast: comp?.broadcasts?.[0]?.names?.[0] || '',
          servers: buildGameServers(ep.category, matched, homeName, awayName, comp?.broadcasts?.[0]?.names?.[0] || ''),
        };
      });
    }),
  );
  return results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);
}

const STREAMED_CAT_MAP = {
  basketball: 'NBA',
  'american-football': 'NFL',
  hockey: 'NHL',
  baseball: 'MLB',
  football: 'Soccer',
  fight: 'MMA',
  mma: 'MMA',
  tennis: 'Tennis',
};

function mapStreamedExtras(streamed, usedIds) {
  const now = Date.now();
  const out = [];
  for (const m of streamed.matches) {
    if (usedIds.has(m.id)) continue;
    const start = Number(m.date) || 0;
    const forcedLive = streamed.liveIds.has(m.id);
    if (!forcedLive && start && now - start > 5 * 3600e3) continue;
    const isLive = forcedLive || (start ? start <= now && now - start < 4 * 3600e3 : false);
    const cat = STREAMED_CAT_MAP[m.category] || 'Sports';
    const awayName = m.teams?.away?.name || m.title?.split(' vs ')[0] || 'Away';
    const homeName = m.teams?.home?.name || m.title?.split(' vs ')[1] || 'Home';
    const badge = (b) => (b ? `${streamed.base}/api/images/badge/${b}.webp` : LOGO_NBA);
    out.push({
      id: `st-${m.id}`,
      title: m.title || `${awayName} vs ${homeName}`,
      shortTitle: m.title || `${awayName} @ ${homeName}`,
      category: cat,
      league: String(m.category || 'LIVE').toUpperCase(),
      status: isLive ? 'LIVE STREAM' : 'UPCOMING',
      isLive,
      isUpcoming: !isLive && start > now,
      startTime: start || null,
      poster: m.poster
        ? m.poster.startsWith('http')
          ? m.poster
          : `${streamed.base}${m.poster.startsWith('/') ? '' : '/'}${m.poster}`
        : '',
      homeTeam: { name: homeName, score: isLive ? 'LIVE' : '', logo: badge(m.teams?.home?.badge) },
      awayTeam: { name: awayName, score: '', logo: badge(m.teams?.away?.badge) },
      servers: buildGameServers(cat, m),
    });
  }
  return out;
}

export async function searchOnDemandCatalog(query) {
  const clean = (query || '').trim().slice(0, 80);
  if (!clean) return [];

  const [ani, tvmaze, archive] = await Promise.all([
    fetchAniList(ANILIST_SEARCH_QUERY, { search: clean }, 4500),
    fetchJson(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(clean)}`, 4000, 300),
    fetchArchiveCatalog(
      `title:(${clean.replace(/["():\[\]]/g, ' ')}) AND mediatype:movies AND format:MPEG4`,
      'Movies',
      'ARCHIVE',
      1,
      8,
    ),
  ]);

  const animeItems = (ani?.Page?.media || []).filter((a) => !a.isAdult).map((a) => mapAniListMedia(a));
  const tvItems = (Array.isArray(tvmaze) ? tvmaze : [])
    .map((e) => e.show)
    .filter((s) => s?.externals?.imdb)
    .slice(0, 12)
    .map((s) => mapTvmazeShow(s));

  return [...animeItems, ...tvItems, ...archive];
}

export async function getCatalogData(rotationSeed = null) {
  const page =
    rotationSeed !== null && rotationSeed !== undefined
      ? (Math.abs(Number(rotationSeed) || 0) % 8) + 1
      : (Math.floor(Date.now() / 900000) % 8) + 1;
  const nowSec = Math.floor(Date.now() / 1000);

  try {
    const [streamed, archiveMovies, archiveShows, aniHome, tvToday] = await Promise.all([
      fetchStreamedMatches(),
      fetchArchiveCatalog('collection:feature_films AND mediatype:movies AND format:MPEG4', 'Movies', 'FEATURE FILM', page, 18),
      fetchArchiveCatalog(
        '(collection:classic_tv OR collection:television) AND mediatype:movies AND format:MPEG4',
        'Shows',
        'CLASSIC TV',
        page,
        12,
      ),
      fetchAniList(ANILIST_HOME_QUERY, { from: nowSec - 3 * 3600, to: nowSec + 21 * 3600 }, 4500),
      fetchTvAiringToday(),
    ]);

    const espnEvents = await fetchEspnEvents(streamed.matches);
    const usedIds = new Set(espnEvents.map((e) => e.streamedId).filter(Boolean));
    const sportsEvents = [...espnEvents, ...mapStreamedExtras(streamed, usedIds)];

    sportsEvents.sort((a, b) => {
      const niners = (e) => /49ers|san francisco/i.test(e.title);
      if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
      if (niners(a) !== niners(b)) return niners(a) ? -1 : 1;
      return (a.startTime || 0) - (b.startTime || 0);
    });

    const airingAnime = [];
    const airingSeen = new Set();
    for (const s of aniHome?.airing?.airingSchedules || []) {
      if (!s?.media || s.media.isAdult || airingSeen.has(s.media.id)) continue;
      airingSeen.add(s.media.id);
      airingAnime.push(
        mapAniListMedia(s.media, { status: `EP ${s.episode}`, startTime: s.airingAt * 1000, airingEpisode: s.episode }),
      );
    }
    let trendingAnime = (aniHome?.trending?.media || []).filter((a) => !a.isAdult).map((a) => mapAniListMedia(a));
    const topAnime = (aniHome?.top?.media || []).filter((a) => !a.isAdult).map((a) => mapAniListMedia(a));
    if (trendingAnime.length < 20) {
      const jikanExtra = await fetchJikanAnimeFallback();
      trendingAnime = [...trendingAnime, ...jikanExtra];
    }

    const events = [];
    const seen = new Set();
    const add = (list) => {
      for (const e of list) {
        if (e && !seen.has(e.id)) {
          seen.add(e.id);
          events.push(e);
        }
      }
    };
    add(sportsEvents);
    add(CHANNELS_24_7.map(flag));
    add(FEATURED_TV_SERIES.map(flag));
    add(FEATURED_MOVIES.map(flag));
    add(OPEN_SHOWS.map(flag));
    add(airingAnime);
    add(trendingAnime);
    add(topAnime);
    add(tvToday);
    add(archiveShows);
    add(OPEN_MOVIES.map(flag));
    add(archiveMovies);

    return {
      updatedAt: new Date().toISOString(),
      rotationPage: page,
      count: events.length,
      events,
      rows: {
        airingToday: [...airingAnime, ...FEATURED_TV_SERIES].map((e) => e.id),
        trendingAnime: trendingAnime.map((e) => e.id),
        topRated: [...FEATURED_MOVIES, ...topAnime].map((e) => e.id),
      },
    };
  } catch (err) {
    const fallback = [...CHANNELS_24_7, ...FEATURED_TV_SERIES, ...FEATURED_MOVIES, ...OPEN_SHOWS, ...OPEN_MOVIES].map(flag);
    return {
      updatedAt: new Date().toISOString(),
      error: err?.message || 'Catalog fetch failed',
      rotationPage: page,
      count: fallback.length,
      events: fallback,
      rows: { airingToday: [], trendingAnime: [], topRated: [] },
    };
  }
}

// Cached for 60s so page loads and API calls don't refetch ~50 upstream URLs each time.
export const getCachedCatalog = unstable_cache(
  async (rotationSeed = null) => getCatalogData(rotationSeed),
  ['live-wire-catalog-v6'],
  { revalidate: 60 },
);
