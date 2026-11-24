import { NextRequest, NextResponse } from 'next/server';
import { ChatRequestSchema } from '@/domain/schemas';
import { streamGroundedChat } from '@/services/genai-service';
import { getAtmosphericTelemetry } from '@/services/telemetry-service';
import { globalRateLimiter } from '@/services/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rateLimit = globalRateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please wait a moment before sending more messages.',
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parseResult = ChatRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid message payload', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { message, cityId, cityName, language } = parseResult.data;
    const telemetry = await getAtmosphericTelemetry(cityId);

    const stream = await streamGroundedChat(
      message,
      cityName,
      telemetry.aqiUs,
      telemetry.pollutants.pm25,
      language
    );

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (_err) {
    return NextResponse.json(
      { error: 'Failed to stream chat response' },
      { status: 500 }
    );
  }
}
