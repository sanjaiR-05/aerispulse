import { NextRequest, NextResponse } from 'next/server';
import { ChatRequestSchema } from '@/domain/schemas';
import { streamGroundedChat } from '@/services/genai-service';
import { getAtmosphericTelemetry } from '@/services/telemetry-service';
import { globalRateLimiter } from '@/services/rate-limiter';
import {
  getClientIp,
  validateRequestOrigin,
  createRateLimitHeaders,
} from '@/services/security';

export const dynamic = 'force-dynamic';

/**
 * POST /api/chat
 * Streams grounded conversational responses contextualized with real-time atmospheric telemetry.
 * Protected by sliding-window rate limiting, CSRF origin verification, and schema validation.
 */
export async function POST(request: NextRequest): Promise<Response> {
  // 1. CSRF Origin Validation
  if (!validateRequestOrigin(request)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Cross-origin request rejected' },
      { status: 403 }
    );
  }

  // 2. Sliding-Window Rate Limiter (60 req/min)
  const ip = getClientIp(request);
  const rateLimit = globalRateLimiter.check(ip);
  const rateLimitHeaders = createRateLimitHeaders(60, rateLimit.remaining, rateLimit.resetTime);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please wait a moment before sending more messages.',
      },
      {
        status: 429,
        headers: rateLimitHeaders,
      }
    );
  }

  // 3. Request Body Parsing & Schema Validation
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

    // 4. Grounded AI Streaming with Fallback
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
  } catch (_err) {
    return NextResponse.json(
      { error: 'Failed to stream chat response' },
      {
        status: 500,
        headers: rateLimitHeaders,
      }
    );
  }
}
