import { NextRequest, NextResponse } from 'next/server';
import { getAtmosphericTelemetry } from '@/services/telemetry-service';
import { TelemetryQuerySchema } from '@/domain/schemas';
import { guardApiRequest } from '@/services/api-guard';
import { DEFAULT_METRO_PRESET_ID } from '@/domain/constants';

export const dynamic = 'force-dynamic';

/**
 * GET /api/telemetry
 * Returns real-time multi-pollutant telemetry, AQI, European CAQI, and confidence metrics.
 * Multi-tier caching with s-maxage and stale-while-revalidate directives.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const guard = guardApiRequest(request);
  if (!guard.allowed) {
    return guard.response;
  }

  const { rateLimitHeaders } = guard;

  try {
    const cityIdParam = request.nextUrl.searchParams.get('cityId') ?? DEFAULT_METRO_PRESET_ID;

    const parseResult = TelemetryQuerySchema.safeParse({ cityId: cityIdParam });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid cityId query parameter', details: parseResult.error.flatten() },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const telemetry = await getAtmosphericTelemetry(parseResult.data.cityId);
    return NextResponse.json(telemetry, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        ...rateLimitHeaders,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to synthesize atmospheric telemetry' },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
