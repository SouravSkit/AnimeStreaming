import axios from 'axios';

// ── Jikan v4 (free, no API key) ───────────────────────
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4/';

const http = axios.create({
  baseURL: JIKAN_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

// Retry interceptor — Jikan rate-limits at 3 req/s.
// On 429, wait and retry up to 3 times with exponential backoff.
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    config.__retryCount = config.__retryCount || 0;
    const maxRetries = 3;

    if (error.response?.status === 429 && config.__retryCount < maxRetries) {
      config.__retryCount += 1;
      // Exponential backoff: 1s, 2s, 4s
      const delay = 1000 * Math.pow(2, config.__retryCount - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return http(config);
    }

    return Promise.reject(error);
  }
);

// ── Consumet News endpoint (separate, still free) ─────
const NEWS_BASE_URL = 'https://consumet-api-2i1w.onrender.com/';

const newsHttp = axios.create({
  baseURL: NEWS_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
});

export { http, newsHttp };
export default http;
