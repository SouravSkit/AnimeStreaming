import http, { newsHttp } from './api';

// ─────────────────────────────────────────────
// Genre ID mapping (Jikan uses MAL genre IDs)
// ─────────────────────────────────────────────
export const GENRE_MAP: Record<string, number> = {
  action: 1,
  adventure: 2,
  comedy: 4,
  crime: 39,
  drama: 8,
  family: 36,
  fantasy: 10,
  kids: 53,
  music: 19,
  mystery: 7,
  romance: 22,
  school: 23,
  sports: 30,
  survival: 76,
  thriller: 41,
  workplace: 50,
};

export const GENRES = [
  'action', 'adventure', 'comedy', 'crime', 'drama', 'family',
  'fantasy', 'kids', 'music', 'mystery', 'romance', 'school',
  'sports', 'survival', 'thriller', 'workplace',
];

// ─────────────────────────────────────────────
// Jikan response adapter helpers
// ─────────────────────────────────────────────

function adaptAnime(item: Record<string, any>) {
  const title = item.title_english || item.title || '';
  const image =
    item.images?.jpg?.large_image_url ||
    item.images?.jpg?.image_url ||
    '';
  const rating = item.score != null ? String(item.score) : undefined;
  const genres: string[] = (item.genres || []).map((g: any) => g.name);
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

function adaptAnimeDetail(jikanRes: Record<string, any>) {
  return adaptAnime(jikanRes.data || {});
}

function adaptEpisodes(jikanRes: Record<string, any>) {
  const data = jikanRes.data || [];
  return data.map((ep: any) => ({
    id: String(ep.mal_id),
    number: ep.mal_id,
    title: ep.title || '',
  }));
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchAllEpisodes(animeId: string) {
  const MAX_EPISODES = 400;
  const allEpisodes: { id: string; number: number; title?: string }[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && allEpisodes.length < MAX_EPISODES) {
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
// Jikan-powered functions (browsing metadata)
// ─────────────────────────────────────────────

export async function getTopAiring() {
  const response = await http.get('top/anime?filter=airing&limit=25');
  return adaptListResponse(response.data);
}

export async function getGenreData(genre: string) {
  const genreId = GENRE_MAP[genre] ?? 1;
  const response = await http.get(
    `anime?genres=${genreId}&order_by=score&sort=desc&limit=15&sfw=true`
  );
  return adaptListResponse(response.data);
}

export async function getPopularAnime(page: number = 1) {
  const response = await http.get(
    `anime?order_by=members&sort=desc&page=${page}&limit=25&sfw=true`
  );
  return adaptListResponse(response.data);
}

// ─────────────────────────────────────────────
// Consumet/Hianime-powered functions (search + streaming)
// ─────────────────────────────────────────────

/** Search anime via local HiAnime scraper. */
export async function searchAnime(query: string, page: number = 1) {
  const response = await fetch(
    `/api/anime/search?q=${encodeURIComponent(query)}&page=${page}`
  );
  const data = await response.json();
  return {
    results: data.results || [],
    currentPage: data.currentPage ?? 1,
    hasNextPage: data.hasNextPage ?? false,
    totalPages: data.totalPages ?? 1,
  };
}

/** Get anime info + episodes via local HiAnime scraper. */
export async function getAnimeInfo(id: string) {
  const response = await fetch(`/api/anime/${id}`);
  const data = await response.json();
  return data;
}

/** Get episode streaming sources via local HiAnime scraper. */
export async function getEpisodeStream(episodeId: string) {
  // The episode streaming route needs the episode ID
  // We pass it through a simple query param approach
  const response = await fetch(
    `/api/anime/streams?episodeId=${episodeId}`
  );
  const data = await response.json();
  return data;
}

// ─────────────────────────────────────────────
// News (consumet endpoint)
// ─────────────────────────────────────────────

export async function getRecentNews() {
  const response = await newsHttp.get('news/ann/recent-feeds');
  return response.data;
}
