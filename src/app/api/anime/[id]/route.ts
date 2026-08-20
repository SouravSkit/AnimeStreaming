import { NextRequest, NextResponse } from 'next/server';

const HIANIME_BASE = 'https://hianime.to';

/**
 * Fetch anime info + episodes from HiAnime via AJAX endpoint.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const url = `${HIANIME_BASE}/ajax/v2/episode/list/${id}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `${HIANIME_BASE}/anime/${id}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!res.ok) {
      throw new Error(`HiAnime returned ${res.status}`);
    }

    const json = await res.json();
    const html = json.html || '';

    // Parse episode list from HTML
    const episodes = parseEpisodes(html);

    // Extract basic info from the anime page
    const infoUrl = `${HIANIME_BASE}/anime/${id}`;
    const infoRes = await fetch(infoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': HIANIME_BASE,
      },
    });

    let info: any = { id, episodes };
    if (infoRes.ok) {
      const infoHtml = await infoRes.text();
      info = parseAnimeInfo(infoHtml, id, episodes);
    }

    return NextResponse.json(info);
  } catch (error: any) {
    console.error('HiAnime info error:', error?.message);
    return NextResponse.json(
      { error: 'Failed to fetch anime info', message: error?.message },
      { status: 500 }
    );
  }
}

/**
 * Parse episode list HTML from HiAnime.
 */
function parseEpisodes(html: string) {
  const episodes: any[] = [];

  // Match each episode block
  const epRegex = /data-id="(\d+)"[^>]*data-number="(\d+)"[^>]*data-title="([^"]*)"[^>]*data-sub="[^"]*"[^>]*data-dub="[^"]*"/gi;
  let match;

  while ((match = epRegex.exec(html)) !== null) {
    episodes.push({
      id: match[1],
      number: parseInt(match[2], 10),
      title: match[3] || `Episode ${match[2]}`,
    });
  }

  // Fallback: try simpler pattern
  if (episodes.length === 0) {
    const simpleRegex = /data-id="(\d+)"[\s\S]*?data-number="(\d+)"/gi;
    while ((match = simpleRegex.exec(html)) !== null) {
      episodes.push({
        id: match[1],
        number: parseInt(match[2], 10),
        title: `Episode ${match[2]}`,
      });
    }
  }

  return episodes;
}

/**
 * Parse anime info from the full anime page HTML.
 */
function parseAnimeInfo(html: string, id: string, episodes: any[]) {
  // Title
  const titleMatch = html.match(/<h2[^>]*class="anime-title"[^>]*>([^<]*)<\/h2>/i)
    || html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  const title = titleMatch?.[1]?.trim() || id;

  // Image
  const imgMatch = html.match(/src="(https?:\/\/[^"]*\.(jpg|jpeg|png|webp)[^"]*)"/i);
  const image = imgMatch?.[1] || '';

  // Description
  const descMatch = html.match(/class="description"[^>]*>([\s\S]*?)<\/div>/i)
    || html.match(/itemprop="description"[^>]*>([\s\S]*?)<\/p>/i);
  const description = descMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '';

  // Genres
  const genreMatches = html.match(/class="item-title"[^>]*>Genre<\/span>[\s\S]*?<\/div>/i);
  const genres: string[] = [];
  const genreRegex = /class="name"[^>]*>([^<]*)<\/a>/gi;
  const genreSection = html.match(/Genre[\s\S]*?<\/div>/i)?.[0] || '';
  let gm;
  while ((gm = genreRegex.exec(genreSection)) !== null) {
    genres.push(gm[1].trim());
  }

  // Rating
  const ratingMatch = html.match(/class="mal-rating"[^>]*>([^<]*)</i)
    || html.match(/(\d+\.?\d*)\s*\/?\s*10/i);
  const rating = ratingMatch?.[1]?.trim() || undefined;

  // Status
  const statusMatch = html.match(/class="item-title"[^>]*>Status<\/span>[\s\S]*?<span[^>]*>([^<]*)<\/span>/i);
  const status = statusMatch?.[1]?.trim() || '';

  // Type
  const typeMatch = html.match(/class="item-title"[^>]*>Tags<\/span>[\s\S]*?<span[^>]*>([^<]*)<\/span>/i);
  const type = typeMatch?.[1]?.trim() || '';

  // Release date
  const releaseMatch = html.match(/(\d{4})/);
  const releaseDate = releaseMatch?.[1] || '';

  return {
    id,
    title,
    image,
    description,
    genres,
    rating,
    releaseDate,
    totalEpisodes: episodes.length,
    status,
    type,
    episodes,
  };
}
