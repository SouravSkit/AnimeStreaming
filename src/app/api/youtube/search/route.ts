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
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
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

  // Try JSON data extraction first
  const dataMatch = html.match(/var ytInitialData\s*=\s*({.+?})\s*;\s*<\/script>/);
  if (dataMatch) {
    try {
      const data = JSON.parse(dataMatch[1]);
      const contents =
        data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
          ?.itemSectionRenderer?.contents || [];

      for (const item of contents) {
        if (results.length >= maxResults) break;

        const video = item.videoRenderer;
        if (!video) continue;

        const id = video.videoId;
        const title = video.title?.runs?.[0]?.text || '';
        const thumbnail =
          video.thumbnail?.thumbnails?.[video.thumbnail.thumbnails.length - 1]?.url || '';
        const channel = video.ownerText?.runs?.[0]?.text || '';
        const duration = video.lengthText?.simpleText || '';
        const views = video.viewCountText?.simpleText || '';

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
      }
    } catch {
      // Fall through to regex parsing
    }
  }

  // Fallback: regex-based extraction
  if (results.length === 0) {
    const videoIdRegex = /"videoId"\s*:\s*"([^"]+)"/g;
    const titleRegex = /"title"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"/g;

    const ids: string[] = [];
    const titles: string[] = [];
    let match;

    while ((match = videoIdRegex.exec(html)) !== null) ids.push(match[1]);
    while ((match = titleRegex.exec(html)) !== null) titles.push(match[1]);

    for (let i = 0; i < Math.min(ids.length, titles.length, maxResults); i++) {
      if (ids[i] && titles[i]) {
        results.push({
          id: ids[i],
          title: titles[i],
          thumbnail: `https://img.youtube.com/vi/${ids[i]}/mqdefault.jpg`,
          channel: '',
          duration: '',
          views: '',
          embedUrl: `https://www.youtube.com/embed/${ids[i]}?autoplay=1&rel=0`,
        });
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return results.filter((v: any) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}
