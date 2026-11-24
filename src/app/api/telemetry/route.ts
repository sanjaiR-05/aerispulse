import { NextRequest, NextResponse } from 'next/server';
import { getAtmosphericTelemetry } from '@/services/telemetry-service';
import { TelemetryQuerySchema } from '@/domain/schemas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cityIdParam = searchParams.get('cityId') ?? 'delhi_ncr';

    const parseResult = TelemetryQuerySchema.safeParse({ cityId: cityIdParam });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid cityId query parameter', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const telemetry = await getAtmosphericTelemetry(parseResult.data.cityId);
    return NextResponse.json(telemetry, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (_err) {
    return NextResponse.json(
      { error: 'Failed to synthesize atmospheric telemetry' },
      { status: 500 }
    );
  }
}
