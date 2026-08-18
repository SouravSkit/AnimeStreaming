import http from './api';

export async function getTopAiring() {
  const response = await http.get('anime/gogoanime/top-airing');
  return response.data;
}

export async function getGenreData(genre: string) {
  const response = await http.get(`anime/gogoanime/genre/${genre}`);
  return response.data;
}

export async function searchAnime(query: string, page: number = 1) {
  const response = await http.get(`anime/gogoanime/${query}?page=${page}`);
  return response.data;
}

export async function getAnimeInfo(id: string) {
  const response = await http.get(`anime/gogoanime/info/${id}`);
  return response.data;
}

export async function getAnimeServers(episodeId: string) {
  const response = await http.get(`anime/gogoanime/servers/${episodeId}`);
  return response.data;
}

export async function getEpisodeStream(episodeId: string, server: string = 'streamtape') {
  const response = await http.get(`anime/gogoanime/watch/${episodeId}?server=${server}`);
  return response.data;
}

export async function getPopularAnime(page: number = 1) {
  const response = await http.get(`anime/gogoanime/popular?page=${page}`);
  return response.data;
}

export async function getRecentNews() {
  const response = await http.get('news/ann/recent-feeds');
  return response.data;
}

export const GENRES = [
  'action', 'adventure', 'comedy', 'crime', 'drama', 'family',
  'fantasy', 'kids', 'music', 'mystery', 'romance', 'school',
  'sports', 'survival', 'thriller', 'workplace',
];
