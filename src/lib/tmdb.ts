/**
 * TMDB (The Movie Database) API service
 * Free API key required: https://www.themoviedb.org/settings/api
 *
 * Provides: trending, popular, search, details, genres, and video/trailer data.
 * All image URLs come from TMDB's CDN — always correct.
 */

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p';

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error('TMDB_API_KEY environment variable is not set');
  }
  return key;
}

async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', getApiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ── Image helpers ──────────────────────────────────────

export function posterUrl(path: string | null, size = 'w500'): string {
  if (!path) return '/placeholder-poster.png';
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size = 'w1280'): string {
  if (!path) return '';
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

// ── Type definitions ───────────────────────────────────

export type TMDBMedia = {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
};

export type TMDBVideo = {
  id: string;
  key: string;
  name: string;
  site: string; // 'YouTube'
  type: string; // 'Trailer', 'Teaser', 'Clip', etc.
  official: boolean;
};

export type TMDBSearchResult = {
  results: TMDBMedia[];
  total_results: number;
  total_pages: number;
  page: number;
};

// ── Normalized item used across the app ────────────────

export type ContentItem = {
  id: string;
  title: string;
  image: string;
  backdrop: string;
  description: string;
  rating: string;
  releaseDate: string;
  genres: string[];
  mediaType: 'movie' | 'tv';
  totalEpisodes?: number;
};

function normalizeMedia(item: TMDBMedia): ContentItem {
  const title = item.title || item.name || item.original_title || item.original_name || 'Untitled';
  const releaseDate = item.release_date || item.first_air_date || '';
  const year = releaseDate ? releaseDate.split('-')[0] : '';

  return {
    id: `${item.media_type || 'movie'}-${item.id}`,
    tmdbId: item.id,
    title,
    image: posterUrl(item.poster_path),
    backdrop: backdropUrl(item.backdrop_path),
    description: item.overview || '',
    rating: item.vote_average > 0 ? item.vote_average.toFixed(1) : '',
    releaseDate: year,
    genres: item.genres?.map((g) => g.name) || [],
    mediaType: item.media_type || 'movie',
    totalEpisodes: item.number_of_episodes,
  } as ContentItem & { tmdbId: number };
}

function normalizeMediaList(data: { results: TMDBMedia[]; [key: string]: any }) {
  const items = (data.results || []).map((item) => ({
    ...normalizeMedia(item),
    tmdbId: item.id,
  }));
  return {
    results: items,
    totalResults: data.total_results || 0,
    totalPages: data.total_pages || 0,
    page: data.page || 1,
    hasNextPage: data.page < data.total_pages,
  };
}

// ── Genre mapping ──────────────────────────────────────

export const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export const TMDB_GENRE_IDS = Object.keys(TMDB_GENRES)
  .map(Number)
  .filter((id) => id < 1000); // Only movie genres, not TV-specific

export const TMDB_GENRE_NAMES = TMDB_GENRE_IDS.map((id) => TMDB_GENRES[id]).filter(Boolean);

// ── API Functions ──────────────────────────────────────

/** Get trending content (movies + TV) */
export async function getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') {
  const data = await tmdbFetch(`/trending/${mediaType}/${timeWindow}`);
  return normalizeMediaList(data);
}

/** Get popular movies */
export async function getPopularMovies(page = 1) {
  const data = await tmdbFetch('/movie/popular', { page: String(page) });
  return normalizeMediaList({ ...data, results: data.results.map((r: TMDBMedia) => ({ ...r, media_type: 'movie' })) });
}

/** Get popular TV shows */
export async function getPopularTV(page = 1) {
  const data = await tmdbFetch('/tv/popular', { page: String(page) });
  return normalizeMediaList({ ...data, results: data.results.map((r: TMDBMedia) => ({ ...r, media_type: 'tv' })) });
}

/** Get top rated movies */
export async function getTopRatedMovies(page = 1) {
  const data = await tmdbFetch('/movie/top_rated', { page: String(page) });
  return normalizeMediaList({ ...data, results: data.results.map((r: TMDBMedia) => ({ ...r, media_type: 'movie' })) });
}

/** Get top rated TV shows */
export async function getTopRatedTV(page = 1) {
  const data = await tmdbFetch('/tv/top_rated', { page: String(page) });
  return normalizeMediaList({ ...data, results: data.results.map((r: TMDBMedia) => ({ ...r, media_type: 'tv' })) });
}

/** Get upcoming movies */
export async function getUpcomingMovies(page = 1) {
  const data = await tmdbFetch('/movie/upcoming', { page: String(page) });
  return normalizeMediaList({ ...data, results: data.results.map((r: TMDBMedia) => ({ ...r, media_type: 'movie' })) });
}

/** Get content by genre */
export async function getByGenre(genreId: number, mediaType: 'movie' | 'tv' = 'movie', page = 1) {
  const endpoint = mediaType === 'movie' ? '/discover/movie' : '/discover/tv';
  const data = await tmdbFetch(endpoint, {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    page: String(page),
  });
  return normalizeMediaList({ ...data, results: data.results.map((r: TMDBMedia) => ({ ...r, media_type: mediaType })) });
}

/** Get animation/anime content (genre 16 = Animation) */
export async function getAnimationContent(page = 1) {
  const data = await tmdbFetch('/discover/tv', {
    with_genres: '16',
    sort_by: 'popularity.desc',
    page: String(page),
    'vote_count.gte': '100',
  });
  return normalizeMediaList({ ...data, results: data.results.map((r: TMDBMedia) => ({ ...r, media_type: 'tv' })) });
}

/** Search across movies and TV */
export async function searchTMDB(query: string, page = 1) {
  const data = await tmdbFetch('/search/multi', {
    query,
    page: String(page),
    include_adult: 'false',
  });

  // Filter out person results, only keep movie/tv
  const filtered = {
    ...data,
    results: data.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv'),
  };

  return normalizeMediaList(filtered);
}

/** Get movie/TV details with genres */
export async function getDetails(id: number, mediaType: 'movie' | 'tv') {
  const data = await tmdbFetch(`/${mediaType}/${id}`, {
    append_to_response: 'videos,credits,similar',
  });

  const item: ContentItem & { tmdbId: number } = {
    ...normalizeMedia({ ...data, media_type: mediaType } as TMDBMedia),
    tmdbId: data.id,
  };

  // Add videos (trailers, clips)
  const videos = (data.videos?.results || [])
    .filter((v: TMDBVideo) => v.site === 'YouTube')
    .map((v: TMDBVideo) => ({
      key: v.key,
      name: v.name,
      type: v.type,
      official: v.official,
    }));

  // Add similar content
  const similar = (data.similar?.results || [])
    .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv' || mediaType)
    .slice(0, 12)
    .map((r: any) => normalizeMedia({ ...r, media_type: mediaType } as TMDBMedia));

  return {
    ...item,
    videos,
    similar,
    runtime: data.runtime || data.episode_run_time?.[0],
    seasons: data.number_of_seasons,
    episodes: data.number_of_episodes,
    status: data.status,
    tagline: data.tagline,
  };
}

/** Get season details for TV shows */
export async function getSeasonDetails(tvId: number, seasonNumber: number) {
  const data = await tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);
  return {
    name: data.name || `Season ${seasonNumber}`,
    overview: data.overview || '',
    episodes: (data.episodes || []).map((ep: any) => ({
      id: ep.id,
      episode_number: ep.episode_number,
      name: ep.name || `Episode ${ep.episode_number}`,
      overview: ep.overview || '',
      still_path: ep.still_path ? posterUrl(ep.still_path, 'w300') : null,
      air_date: ep.air_date || '',
      runtime: ep.runtime,
      vote_average: ep.vote_average,
    })),
  };
}
