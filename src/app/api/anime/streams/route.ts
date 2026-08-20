import { NextRequest, NextResponse } from 'next/server';

const HIANIME_BASE = 'https://hianime.to';

/**
 * Fetch episode streaming sources from HiAnime.
 * Accepts episodeId as a query parameter.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const episodeId = searchParams.get('episodeId') || '';

  if (!episodeId) {
    return NextResponse.json(
      { error: 'episodeId is required', sources: [] },
      { status: 400 }
    );
  }

  try {
    // Step 1: Get episode servers list
    const serversUrl = `${HIANIME_BASE}/ajax/v2/episode/servers?episodeId=${episodeId}`;
    const serversRes = await fetch(serversUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `${HIANIME_BASE}/watch/${episodeId}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!serversRes.ok) {
      throw new Error(`Servers endpoint returned ${serversRes.status}`);
    }

    const serversJson = await serversRes.json();
    const serversHtml = serversJson.html || '';

    // Extract the first server's data-id
    const serverMatch = serversHtml.match(/data-id="(\d+)"/i);
    const serverId = serverMatch?.[1];

    if (!serverId) {
      throw new Error('No server found for this episode');
    }

    // Step 2: Get streaming sources from the server
    const sourcesUrl = `${HIANIME_BASE}/ajax/v2/episode/sources?id=${serverId}`;
    const sourcesRes = await fetch(sourcesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `${HIANIME_BASE}/watch/${episodeId}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!sourcesRes.ok) {
      throw new Error(`Sources endpoint returned ${sourcesRes.status}`);
    }

    const sourcesJson = await sourcesRes.json();
    const sourceUrl = sourcesJson.source?.url || sourcesJson.source?.backup_url || '';

    if (!sourceUrl) {
      throw new Error('No streaming source found');
    }

    const sources = [
      {
        url: sourceUrl,
        quality: 'default',
        isM3U8: sourceUrl.includes('.m3u8'),
      },
    ];

    return NextResponse.json({ sources });
  } catch (error: any) {
    console.error('HiAnime sources error:', error?.message);
    return NextResponse.json(
      { error: 'Failed to fetch streaming sources', sources: [], message: error?.message },
      { status: 500 }
    );
  }
}
