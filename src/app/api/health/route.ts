import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * System liveness & health check probe endpoint.
 * Returns operational status, engine identity, semver, and process uptime.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      status: 'healthy',
      system: 'AerisPulse Climate & Atmospheric Intelligence Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
