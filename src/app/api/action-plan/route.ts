import { NextRequest, NextResponse } from 'next/server';
import { ActionPlanRequestSchema } from '@/domain/schemas';
import { generateActionPlanWithAI } from '@/services/genai-service';
import { guardApiRequest } from '@/services/api-guard';

export const dynamic = 'force-dynamic';

/**
 * POST /api/action-plan
 * Synthesizes personalized air quality action directives via GenAI with zero-downtime deterministic fallback.
 * Protected by sliding-window rate limiting, CSRF origin verification, and schema validation.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const guard = guardApiRequest(request, { enforceSameOrigin: true });
  if (!guard.allowed) {
    return guard.response;
  }

  const { rateLimitHeaders } = guard;

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
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error during action plan synthesis' },
      {
        status: 500,
        headers: rateLimitHeaders,
      }
    );
  }
}
