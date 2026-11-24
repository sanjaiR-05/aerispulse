import { NextRequest, NextResponse } from 'next/server';
import { ActionPlanRequestSchema } from '@/domain/schemas';
import { generateActionPlanWithAI } from '@/services/genai-service';
import { globalRateLimiter } from '@/services/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Security: In-memory sliding-window IP rate limiter
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rateLimit = globalRateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please wait before synthesizing another action plan.',
        resetTime: rateLimit.resetTime,
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const parseResult = ActionPlanRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid Request Payload',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { cityId, cityName, language, simulatorInputs, telemetry } = parseResult.data;

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

    return NextResponse.json(actionPlan);
  } catch (_err) {
    return NextResponse.json(
      { error: 'Internal Server Error during action plan synthesis' },
      { status: 500 }
    );
  }
}
