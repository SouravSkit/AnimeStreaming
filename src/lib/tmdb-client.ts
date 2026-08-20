/**
 * Client-side TMDB service.
 * Calls the server-side proxy at /api/tmdb to keep the API key hidden.
 */

const PROXY_BASE = '/api/tmdb';

async function tmdbProxy(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${PROXY_BASE}/${path}`, window.location.origin);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB proxy error: ${res.status}`);
  }
  return res.json();
}

// ── Image helpers ──────────────────────────────────────

const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p';

export function posterUrl(path: string | null, size = 'w500'): string {
  if (!path) return '';
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size = 'w1280'): string {
  if (!path) return '';
  return `${TMDB_IMG_BASE}/${size}${path}`;
}

// ── Types ──────────────────────────────────────────────

export type ContentItem = {
  id: string;
  tmdbId: number;
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

export type ContentDetail = ContentItem & {
  videos: { key: string; name: string; type: string; official: boolean }[];
  similar: ContentItem[];
  runtime?: number;
  seasons?: number;
  episodes?: number;
  status?: string;
  tagline?: string;
};

// ── Normalize raw TMDB media ───────────────────────────

function normalizeMedia(item: any): ContentItem {
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
    genres: item.genres?.map((g: any) => g.name) || item.genre_ids?.map((id: number) => GENRE_MAP[id] || '') || [],
    mediaType: item.media_type || 'movie',
    totalEpisodes: item.number_of_episodes,
  };
}

function normalizeList(data: any) {
  const items = (data.results || [])
    .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
    .map(normalizeMedia);

  return {
    results: items,
    totalResults: data.total_results || 0,
    totalPages: data.total_pages || 0,
    page: data.page || 1,
    hasNextPage: data.page < data.total_pages,
  };
}

// ── Genre ID map ───────────────────────────────────────

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 27: 'Horror', 10402: 'Music', 9648: 'Mystery',
  10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller', 10752: 'War',
  37: 'Western', 10759: 'Action & Adventure', 10762: 'Kids',
  10765: 'Sci-Fi & Fantasy', 10768: 'War & Politics',
};

// ── API functions (client-side) ────────────────────────

export async function getTrending() {
  const data = await tmdbProxy('trending/all/week');
  return normalizeList(data);
}

export async function getPopularMovies(page = 1) {
  const data = await tmdbProxy('movie/popular', { page: String(page) });
  return normalizeList({ ...data, results: data.results.map((r: any) => ({ ...r, media_type: 'movie' })) });
}

export async function getPopularTV(page = 1) {
  const data = await tmdbProxy('tv/popular', { page: String(page) });
  return normalizeList({ ...data, results: data.results.map((r: any) => ({ ...r, media_type: 'tv' })) });
}

export async function getTopRatedMovies(page = 1) {
  const data = await tmdbProxy('movie/top_rated', { page: String(page) });
  return normalizeList({ ...data, results: data.results.map((r: any) => ({ ...r, media_type: 'movie' })) });
}

export async function getTopRatedTV(page = 1) {
  const data = await tmdbProxy('tv/top_rated', { page: String(page) });
  return normalizeList({ ...data, results: data.results.map((r: any) => ({ ...r, media_type: 'tv' })) });
}

export async function getByGenre(genreId: number, mediaType: 'movie' | 'tv' = 'movie', page = 1) {
  const endpoint = mediaType === 'movie' ? 'discover/movie' : 'discover/tv';
  const data = await tmdbProxy(endpoint, {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    page: String(page),
  });
  return normalizeList({ ...data, results: data.results.map((r: any) => ({ ...r, media_type: mediaType })) });
}

export async function getAnimation(page = 1) {
  const data = await tmdbProxy('discover/tv', {
    with_genres: '16',
    sort_by: 'popularity.desc',
    page: String(page),
    'vote_count.gte': '100',
  });
  return normalizeList({ ...data, results: data.results.map((r: any) => ({ ...r, media_type: 'tv' })) });
}

export async function searchTMDB(query: string, page = 1) {
  const data = await tmdbProxy('search/multi', {
    query,
    page: String(page),
    include_adult: 'false',
  });
  return normalizeList(data);
}

export async function getDetails(id: number, mediaType: 'movie' | 'tv'): Promise<ContentDetail> {
  const data = await tmdbProxy(`${mediaType}/${id}`, {
    append_to_response: 'videos,credits,similar',
  });

  const item = normalizeMedia({ ...data, media_type: mediaType });

  const videos = (data.videos?.results || [])
    .filter((v: any) => v.site === 'YouTube')
    .map((v: any) => ({
      key: v.key,
      name: v.name,
      type: v.type,
      official: v.official,
    }));

  const similar = (data.similar?.results || [])
    .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
    .slice(0, 12)
    .map((r: any) => normalizeMedia({ ...r, media_type: mediaType }));

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

export async function getSeasonDetails(tvId: number, seasonNumber: number) {
  const data = await tmdbProxy(`tv/${tvId}/season/${seasonNumber}`);
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

/** Search YouTube via our server-side proxy */
export async function searchYouTube(query: string, limit = 10) {
  const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) throw new Error('YouTube search failed');
  return res.json();
}

// ── Genre helpers ──────────────────────────────────────

export const TMDB_GENRES: Record<number, string> = GENRE_MAP;

export const GENRE_IDS: { id: number; name: string }[] = Object.entries(GENRE_MAP)
  .filter(([id]) => Number(id) < 1000) // Movie genres only
  .map(([id, name]) => ({ id: Number(id), name }));
