import { NextRequest, NextResponse } from 'next/server';

/**
 * YouTube search API route.
 * Server-side search to avoid CORS issues. No API key needed.
 */

const YOUTUBE_BASE = 'https://www.youtube.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const maxResults = Math.min(parseInt(searchParams.get('limit') || '10', 10), 25);

  if (!query) {
    return NextResponse.json({ error: 'q parameter is required', results: [] }, { status: 400 });
  }

  try {
    const results = await searchYouTubeVideos(query, maxResults);
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('YouTube search error:', error?.message);
    return NextResponse.json(
      { error: 'Failed to search YouTube', results: [], message: error?.message },
      { status: 500 }
    );
  }
}

async function searchYouTubeVideos(query: string, maxResults: number) {
  const searchUrl = `${YOUTUBE_BASE}/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%3D%3D`;
  const res = await fetch(searchUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) {
    throw new Error(`YouTube returned ${res.status}`);
  }

  const html = await res.text();
  return parseYouTubeResults(html, maxResults);
}

function parseYouTubeResults(html: string, maxResults: number) {
  const results: any[] = [];

  // Strategy 1: Extract ytInitialData JSON (multiple possible formats)
  const ytData = extractYtInitialData(html);
  if (ytData) {
    extractVideosFromYtData(ytData, results, maxResults);
  }

  // Strategy 2: Extract from ytInitialPlayerResponse (less common but works)
  if (results.length === 0) {
    const playerMatch = html.match(/var\s+ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/);
    if (playerMatch) {
      try {
        const data = JSON.parse(playerMatch[1]);
        // Player response doesn't have search results, skip
        void data;
      } catch { /* ignore */ }
    }
  }

  // Strategy 3: Regex-based extraction — find videoIds and associated titles
  if (results.length === 0) {
    extractVideosFromRegex(html, results, maxResults);
  }

  // Deduplicate
  const seen = new Set<string>();
  return results.filter((v: any) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}

/**
 * Extract ytInitialData from HTML using multiple regex patterns
 * to handle YouTube's evolving page structure.
 */
function extractYtInitialData(html: string): any | null {
  const patterns = [
    // Standard: var ytInitialData = {...};
    /var\s+ytInitialData\s*=\s*(\{.+?\})\s*;\s*<\/script>/,
    // Without closing script tag
    /var\s+ytInitialData\s*=\s*(\{.+?\})\s*;/,
    // window["ytInitialData"]
    /window\["ytInitialData"\]\s*=\s*(\{.+?\})\s*;/,
    // window.ytInitialData
    /window\.ytInitialData\s*=\s*(\{.+?\})\s*;/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        continue;
      }
    }
  }

  // Last resort: find the largest JSON blob containing "videoRenderer"
  try {
    const jsonStart = html.indexOf('"videoRenderer"');
    if (jsonStart > -1) {
      // Walk backwards to find the enclosing object start
      let depth = 0;
      let i = jsonStart;
      while (i > 0 && depth === 0) {
        i--;
        if (html[i] === '}') depth++;
        if (html[i] === '{') {
          if (depth === 0) break;
          depth--;
        }
      }
      // Walk forward to find the end
      depth = 0;
      let j = i;
      while (j < html.length) {
        if (html[j] === '{') depth++;
        if (html[j] === '}') {
          depth--;
          if (depth === 0) {
            const blob = html.substring(i, j + 1);
            return JSON.parse(blob);
          }
        }
        j++;
      }
    }
  } catch { /* ignore */ }

  return null;
}

/**
 * Walk the ytInitialData structure to find video renderers.
 */
function extractVideosFromYtData(data: any, results: any[], maxResults: number) {
  // Recursively search for videoRenderer objects
  const findVideos = (obj: any, depth = 0): void => {
    if (!obj || typeof obj !== 'object' || depth > 15 || results.length >= maxResults) return;

    if (obj.videoRenderer) {
      const v = obj.videoRenderer;
      const id = v.videoId;
      const title = v.title?.runs?.[0]?.text || v.title?.accessibility?.accessibilityData?.label || '';
      const thumbnails = v.thumbnail?.thumbnails || [];
      const thumbnail = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : '';
      const channel = v.ownerText?.runs?.[0]?.text || v.channelName?.simpleText || '';
      const duration = v.lengthText?.simpleText || '';
      const views = v.viewCountText?.simpleText || v.shortViewCountText?.simpleText || '';

      if (id && title) {
        results.push({
          id,
          title,
          thumbnail: thumbnail || `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
          channel,
          duration,
          views,
          embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`,
        });
      }
      return; // Don't recurse into videoRenderer children
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        findVideos(item, depth + 1);
        if (results.length >= maxResults) return;
      }
    } else {
      for (const key of Object.keys(obj)) {
        findVideos(obj[key], depth + 1);
        if (results.length >= maxResults) return;
      }
    }
  };

  findVideos(data);
}

/**
 * Fallback: regex extraction of videoIds and titles from raw HTML.
 */
function extractVideosFromRegex(html: string, results: any[], maxResults: number) {
  // Extract all videoIds
  const videoIds = new Set<string>();
  const idRegex = /"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g;
  let match;
  while ((match = idRegex.exec(html)) !== null) {
    videoIds.add(match[1]);
  }

  // Extract titles using multiple patterns
  const titles: string[] = [];
  const titlePatterns = [
    /"title"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"/g,
    /"title"\s*:\s*\{\s*"accessibility"\s*:\s*\{\s*"accessibilityData"\s*:\s*\{\s*"label"\s*:\s*"([^"]+)"/g,
    /"videoRenderer".*?"title".*?"text"\s*:\s*"([^"]+)"/g,
  ];

  for (const pattern of titlePatterns) {
    while ((match = pattern.exec(html)) !== null) {
      titles.push(match[1]);
    }
    if (titles.length > 0) break;
  }

  // Pair IDs with titles
  const idArray = Array.from(videoIds);
  const count = Math.min(idArray.length, titles.length, maxResults);
  for (let i = 0; i < count; i++) {
    if (idArray[i] && titles[i]) {
      results.push({
        id: idArray[i],
        title: titles[i],
        thumbnail: `https://img.youtube.com/vi/${idArray[i]}/mqdefault.jpg`,
        channel: '',
        duration: '',
        views: '',
        embedUrl: `https://www.youtube.com/embed/${idArray[i]}?autoplay=1&rel=0`,
      });
    }
  }

  // If we have IDs but no titles, still return them with a generic title
  if (results.length === 0 && idArray.length > 0) {
    const count = Math.min(idArray.length, maxResults);
    for (let i = 0; i < count; i++) {
      results.push({
        id: idArray[i],
        title: `Video ${i + 1}`,
        thumbnail: `https://img.youtube.com/vi/${idArray[i]}/mqdefault.jpg`,
        channel: '',
        duration: '',
        views: '',
        embedUrl: `https://www.youtube.com/embed/${idArray[i]}?autoplay=1&rel=0`,
      });
    }
  }
}
