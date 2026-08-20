import { NextRequest, NextResponse } from 'next/server';

/**
 * TMDB API proxy route.
 * Hides the API key on the server side. Client calls /api/tmdb/...
 */

const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY is not configured. Please add it to .env.local' },
      { status: 500 }
    );
  }

  const { path } = await params;
  const pathString = path.join('/');
  const url = new URL(`${TMDB_BASE}/${pathString}`);

  // Forward all query params from the client
  const searchParams = request.nextUrl.searchParams;
  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  url.searchParams.set('api_key', apiKey);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`TMDB proxy error: ${res.status} - ${text}`);
      return NextResponse.json(
        { error: `TMDB API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('TMDB proxy error:', error?.message);
    return NextResponse.json(
      { error: 'Failed to fetch from TMDB', message: error?.message },
      { status: 500 }
    );
  }
}
