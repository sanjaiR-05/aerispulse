import { NextRequest, NextResponse } from 'next/server';
import { ActionPlanRequestSchema } from '@/domain/schemas';
import { generateActionPlanWithAI } from '@/services/genai-service';
import { globalRateLimiter } from '@/services/rate-limiter';
import {
  getClientIp,
  validateRequestOrigin,
  createRateLimitHeaders,
} from '@/services/security';

export const dynamic = 'force-dynamic';

/**
 * POST /api/action-plan
 * Synthesizes personalized air quality action directives via GenAI with zero-downtime deterministic fallback.
 * Protected by sliding-window rate limiting, CSRF origin verification, and schema validation.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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
        message: 'Rate limit exceeded. Please wait before synthesizing another action plan.',
        resetTime: rateLimit.resetTime,
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
    const parseResult = ActionPlanRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid Request Payload',
          details: parseResult.error.flatten(),
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    const { cityId, cityName, language, simulatorInputs, telemetry } = parseResult.data;

    // 4. Synthesis via AI / Deterministic Engine
    const actionPlan = await generateActionPlanWithAI({
      cityId,
      cityName,
      language,
      aqiUs: telemetry.aqiUs,
      primaryPollutant: telemetry.primaryPollutant,
      primaryPollutantConcentration: telemetry.primaryPollutantConcentration,
      pollutants: telemetry.pollutants,
      simulatorInputs,
    });

    return NextResponse.json(actionPlan, {
      status: 200,
      headers: rateLimitHeaders,
    });
  } catch (_err) {
    return NextResponse.json(
      { error: 'Internal Server Error during action plan synthesis' },
      {
        status: 500,
        headers: rateLimitHeaders,
      }
    );
  }
}
