/**
 * YouTube search + embed service.
 *
 * Search is done server-side by fetching YouTube's search page.
 * Playback uses standard YouTube embeds (no API key needed).
 */

export type YouTubeVideo = {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
  views: string;
};

/**
 * Search YouTube for videos matching a query.
 * Uses YouTube's internal search page HTML — no API key required.
 */
export async function searchYouTube(query: string, maxResults = 10): Promise<YouTubeVideo[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%3D%3D`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!res.ok) {
    throw new Error(`YouTube search failed: ${res.status}`);
  }

  const html = await res.text();
  return parseYouTubeSearch(html, maxResults);
}

/**
 * Parse YouTube search results HTML to extract video data.
 */
function parseYouTubeSearch(html: string, maxResults: number): YouTubeVideo[] {
  const results: YouTubeVideo[] = [];

  // YouTube embeds video data in a JSON blob inside the page
  const dataMatch = html.match(/var ytInitialData\s*=\s*({.+?})\s*;\s*<\/script>/);
  if (dataMatch) {
    try {
      const data = JSON.parse(dataMatch[1]);
      const contents =
        data.contents?.twoColumnSearchResultsRenderer?.primaryContents
          ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

      for (const item of contents) {
        if (results.length >= maxResults) break;

        const video = item.videoRenderer;
        if (!video) continue;

        const id = video.videoId;
        const title = video.title?.runs?.[0]?.text || '';
        const thumbnail = video.thumbnail?.thumbnails?.pop()?.url || '';
        const channel = video.ownerText?.runs?.[0]?.text || '';
        const duration = video.lengthText?.simpleText || '';
        const views = video.viewCountText?.simpleText || '';

        if (id && title) {
          results.push({ id, title, thumbnail, channel, duration, views });
        }
      }
    } catch {
      // Fall through to regex parsing
    }
  }

  // Fallback: regex-based parsing
  if (results.length === 0) {
    const videoIdRegex = /"videoId"\s*:\s*"([^"]+)"/g;
    const titleRegex = /"title"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"/g;

    const ids: string[] = [];
    const titles: string[] = [];
    let match;

    while ((match = videoIdRegex.exec(html)) !== null) {
      ids.push(match[1]);
    }
    while ((match = titleRegex.exec(html)) !== null) {
      titles.push(match[1]);
    }

    for (let i = 0; i < Math.min(ids.length, titles.length, maxResults); i++) {
      if (ids[i] && titles[i]) {
        results.push({
          id: ids[i],
          title: titles[i],
          thumbnail: `https://img.youtube.com/vi/${ids[i]}/mqdefault.jpg`,
          channel: '',
          duration: '',
          views: '',
        });
      }
    }
  }

  // Deduplicate by video ID
  const seen = new Set<string>();
  return results.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}

/**
 * Build a YouTube embed URL from a video ID.
 */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}

/**
 * Build a YouTube thumbnail URL from a video ID.
 */
export function youtubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' = 'high'): string {
  const suffix = quality === 'high' ? 'hqdefault' : quality === 'medium' ? 'mqdefault' : 'default';
  return `https://img.youtube.com/vi/${videoId}/${suffix}.jpg`;
}
