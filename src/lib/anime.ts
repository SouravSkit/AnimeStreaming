import http, { newsHttp } from './api';

// ─────────────────────────────────────────────
// Genre ID mapping (Jikan uses MAL genre IDs)
// ─────────────────────────────────────────────
export const GENRE_MAP: Record<string, number> = {
  action: 1,
  adventure: 2,
  comedy: 4,
  crime: 39,    // Detective (closest to "crime")
  drama: 8,
  family: 36,   // Slice of Life (closest to "family")
  fantasy: 10,
  kids: 53,     // Childcare (closest to "kids")
  music: 19,
  mystery: 7,
  romance: 22,
  school: 23,
  sports: 30,
  survival: 76,
  thriller: 41, // Suspense (closest to "thriller")
  workplace: 50, // Adult Cast (closest to "workplace")
};

// The genre list exposed to the app (order preserved)
export const GENRES = [
  'action', 'adventure', 'comedy', 'crime', 'drama', 'family',
  'fantasy', 'kids', 'music', 'mystery', 'romance', 'school',
  'sports', 'survival', 'thriller', 'workplace',
];

// ─────────────────────────────────────────────
// Response adapter helpers
// ─────────────────────────────────────────────

/** Normalise a single Jikan anime object into the shape the UI expects. */
function adaptAnime(item: Record<string, any>) {
  const title =
    item.title_english || item.title || '';

  // Image: prefer large jpg, fall back to regular
  const image =
    item.images?.jpg?.large_image_url ||
    item.images?.jpg?.image_url ||
    '';

  // Rating — Jikan returns a number; UI expects a string
  const rating = item.score != null ? String(item.score) : undefined;

  // Genres — Jikan returns [{name:"Action"},…]; UI expects ["Action",…]
  const genres: string[] = (item.genres || []).map((g: any) => g.name);

  // Release year
  const releaseDate = item.year ? String(item.year) : undefined;

  return {
    id: String(item.mal_id),
    image,
    title,
    description: item.synopsis || '',
    genres,
    rating,
    releaseDate,
    totalEpisodes: item.episodes || 0,
    status: item.status || '',
    type: item.type || '',
    episodes: [] as { id: string; number: number; title?: string }[],
  };
}

/** Wrap a Jikan paginated response into the { results:[], … } shape the UI expects. */
function adaptListResponse(jikanRes: Record<string, any>) {
  const data = jikanRes.data || [];
  const results = data.map(adaptAnime);
  const pagination = jikanRes.pagination || {};

  return {
    results,
    currentPage: pagination.current_page ?? 1,
    hasNextPage: pagination.has_next_page ?? false,
    totalPages: pagination.last_visible_page ?? 1,
  };
}

/** Wrap a single Jikan anime detail into the shape the detail page expects. */
function adaptAnimeDetail(jikanRes: Record<string, any>) {
  return adaptAnime(jikanRes.data || {});
}

/** Adapt a Jikan episodes response into the shape the detail page expects. */
function adaptEpisodes(jikanRes: Record<string, any>) {
  const data = jikanRes.data || [];
  return data.map((ep: any) => ({
    id: String(ep.mal_id),
    number: ep.mal_id,
    title: ep.title || '',
  }));
}

/** Small delay helper for rate-limit-friendly sequential fetches. */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch ALL episode pages for an anime.
 * Jikan returns 25 per page. We cap at 400 episodes
 * to avoid excessive API calls for very long series.
 */
async function fetchAllEpisodes(animeId: string): Promise<{ id: string; number: number; title?: string }[]> {
  const MAX_EPISODES = 400;
  const allEpisodes: { id: string; number: number; title?: string }[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && allEpisodes.length < MAX_EPISODES) {
    // Rate-limit friendly: small pause between pages
    if (page > 1) await delay(400);

    const res = await http.get(`anime/${animeId}/episodes?page=${page}`);
    const eps = adaptEpisodes(res.data);
    allEpisodes.push(...eps);

    const pagination = res.data.pagination || {};
    hasNext = pagination.has_next_page === true;
    page++;
  }

  return allEpisodes;
}

// ─────────────────────────────────────────────
// Public API functions (same names as before)
// ─────────────────────────────────────────────

/** Get top-airing / top-ranked anime. */
export async function getTopAiring() {
  const response = await http.get('top/anime?filter=airing&limit=25');
  return adaptListResponse(response.data);
}

/** Get anime by genre name (mapped to Jikan genre ID). */
export async function getGenreData(genre: string) {
  const genreId = GENRE_MAP[genre] ?? 1;
  const response = await http.get(
    `anime?genres=${genreId}&order_by=score&sort=desc&limit=15&sfw=true`
  );
  return adaptListResponse(response.data);
}

/** Search anime by query string with pagination. */
export async function searchAnime(query: string, page: number = 1) {
  const response = await http.get(
    `anime?q=${encodeURIComponent(query)}&page=${page}&limit=15&sfw=true`
  );
  return adaptListResponse(response.data);
}

/** Get full anime details + episodes list by MAL id. */
export async function getAnimeInfo(id: string) {
  const infoRes = await http.get(`anime/${id}`);
  const anime = adaptAnimeDetail(infoRes.data);
  const episodes = await fetchAllEpisodes(id);

  return { ...anime, episodes };
}

/** Get popular anime ordered by member count (fallback for browse page). */
export async function getPopularAnime(page: number = 1) {
  const response = await http.get(
    `anime?order_by=members&sort=desc&page=${page}&limit=25&sfw=true`
  );
  return adaptListResponse(response.data);
}

/**
 * getAnimeServers and getEpisodeStream have been removed.
 * Jikan is a metadata-only API and does not provide video streaming URLs.
 */

// ─────────────────────────────────────────────
// News (still uses consumet – not GogoAnime)
// ─────────────────────────────────────────────

export async function getRecentNews() {
  const response = await newsHttp.get('news/ann/recent-feeds');
  return response.data;
}
