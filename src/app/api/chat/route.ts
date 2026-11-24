import { NextRequest, NextResponse } from 'next/server';
import { ChatRequestSchema } from '@/domain/schemas';
import { streamGroundedChat } from '@/services/genai-service';
import { getAtmosphericTelemetry } from '@/services/telemetry-service';
import { guardApiRequest } from '@/services/api-guard';

export const dynamic = 'force-dynamic';

/**
 * POST /api/chat
 * Streams grounded conversational responses contextualized with real-time atmospheric telemetry.
 * Protected by sliding-window rate limiting, CSRF origin verification, and schema validation.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const guard = guardApiRequest(request, { enforceSameOrigin: true });
  if (!guard.allowed) {
    return guard.response;
  }

  const { rateLimitHeaders } = guard;

  try {
    const body = await request.json();
    const parseResult = ChatRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid message payload', details: parseResult.error.flatten() },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
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
        ...rateLimitHeaders,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to stream chat response' },
      {
        status: 500,
        headers: rateLimitHeaders,
      }
    );
  }
}
