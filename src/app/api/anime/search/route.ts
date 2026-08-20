import { NextRequest, NextResponse } from 'next/server';

const HIANIME_BASE = 'https://hianime.to';

/**
 * Search anime on HiAnime via their public AJAX endpoint.
 * Uses server-side fetch to avoid CORS issues.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  if (!query) {
    return NextResponse.json({ results: [], currentPage: 1, hasNextPage: false, totalPages: 1 });
  }

  try {
    const url = `${HIANIME_BASE}/ajax/search?keyword=${encodeURIComponent(query)}&page=${page}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': HIANIME_BASE,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!res.ok) {
      throw new Error(`HiAnime returned ${res.status}`);
    }

    const json = await res.json();

    // Parse the HTML response to extract anime data
    const html = json.html || '';
    const results = parseSearchResults(html);

    return NextResponse.json({
      results,
      currentPage: page,
      hasNextPage: results.length >= 25,
      totalPages: 1,
    });
  } catch (error: any) {
    console.error('HiAnime search error:', error?.message);
    return NextResponse.json(
      { error: 'Search failed', results: [], message: error?.message },
      { status: 500 }
    );
  }
}

/**
 * Parse HiAnime search HTML response to extract anime data.
 * HiAnime returns HTML fragments from AJAX endpoints.
 */
function parseSearchResults(html: string) {
  const results: any[] = [];

  // Match each anime item block
  const itemRegex = /<a[^>]*href="([^"]*)"[^>]*class="[^"]*film-name[^"]*"[^>]*>[\s\S]*?<\/a>/gi;
  const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/i;
  const titleRegex = /<h3[^>]*class="film-name"[^>]*>\s*<a[^>]*>([^<]*)<\/a>/i;

  // Split by film poster blocks
  const blocks = html.split(/class="flw-item"/i).slice(1);

  for (const block of blocks) {
    try {
      // Extract link
      const linkMatch = block.match(/href="([^"]*\/anime\/[^"]*)"/i);
      const href = linkMatch?.[1] || '';

      // Extract image
      const imgMatch = block.match(/src="(https?:\/\/[^"]*\.(jpg|jpeg|png|webp)[^"]*)"/i);
      const image = imgMatch?.[1] || '';

      // Extract title
      const titleMatch = block.match(/class="film-name"[^>]*>\s*<a[^>]*>([^<]*)<\/a>/i);
      const title = titleMatch?.[1]?.trim() || '';

      // Extract year
      const yearMatch = block.match(/class="fd-infor"[^>]*>[\s\S]*?(\d{4})/i);
      const releaseDate = yearMatch?.[1] || '';

      if (title && href) {
        // Extract the slug ID from the URL (e.g., "/anime/naruto-6" -> "naruto-6")
        const slugMatch = href.match(/\/anime\/([^\/\?]+)/i);
        const id = slugMatch?.[1] || href.split('/').pop() || '';

        results.push({
          id,
          title,
          image,
          releaseDate,
          url: href.startsWith('http') ? href : `${HIANIME_BASE}${href}`,
        });
      }
    } catch (e) {
      continue;
    }
  }

  return results;
}
