import { NextRequest, NextResponse } from 'next/server';
import { getAtmosphericTelemetry } from '@/services/telemetry-service';
import { TelemetryQuerySchema } from '@/domain/schemas';
import { globalRateLimiter } from '@/services/rate-limiter';
import { getClientIp, createRateLimitHeaders } from '@/services/security';

export const dynamic = 'force-dynamic';

/**
 * GET /api/telemetry
 * Returns real-time multi-pollutant telemetry, AQI, European CAQI, and confidence metrics.
 * Multi-tier caching with S-MaxAge and stale-while-revalidate directives.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rateLimit = globalRateLimiter.check(ip);
  const rateLimitHeaders = createRateLimitHeaders(120, rateLimit.remaining, rateLimit.resetTime);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too Many Requests', message: 'Rate limit exceeded.' },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const cityIdParam = searchParams.get('cityId') ?? 'delhi_ncr';

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
  } catch (_err) {
    return NextResponse.json(
      { error: 'Failed to synthesize atmospheric telemetry' },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
