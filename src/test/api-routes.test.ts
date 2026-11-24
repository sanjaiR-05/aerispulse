import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as healthHandler } from '@/app/api/health/route';
import { GET as telemetryHandler } from '@/app/api/telemetry/route';
import { POST as actionPlanHandler } from '@/app/api/action-plan/route';
import { POST as chatHandler } from '@/app/api/chat/route';
import { globalRateLimiter } from '@/services/rate-limiter';
import { globalCache } from '@/services/cache-service';

describe('API Route Handlers Integration Suite', () => {
  beforeEach(() => {
    globalRateLimiter.reset();
    globalCache.clear();
    vi.restoreAllMocks();
  });

  it('GET /api/health returns 200 with system metadata', async () => {
    const res = await healthHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('healthy');
    expect(json.version).toBe('1.0.0');
    expect(json.system).toContain('AerisPulse');
  });

  it('GET /api/telemetry returns 200 with verified atmospheric data for valid city', async () => {
    const req = new NextRequest('http://localhost:3000/api/telemetry?cityId=delhi_ncr');
    const res = await telemetryHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.cityId).toBe('delhi_ncr');
    expect(json.cityName).toBe('Delhi NCR');
    expect(json.aqiUs).toBeGreaterThan(0);
  });

  it('GET /api/telemetry returns 400 for invalid query parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/telemetry?cityId=');
    const res = await telemetryHandler(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('POST /api/action-plan returns 200 with synthesized action directives', async () => {
    const payload = {
      cityId: 'delhi_ncr',
      cityName: 'Delhi NCR',
      language: 'en',
      simulatorInputs: {
        commuteMode: 'ice_car',
        commuteDistanceKm: 15,
        maskGrade: 'none',
        indoorHepaActive: false,
        outdoorCardioHours: 1,
      },
      telemetry: {
        aqiUs: 204,
        primaryPollutant: 'PM2.5',
        primaryPollutantConcentration: 96.6,
        pollutants: {
          pm25: 96.6,
          pm10: 99.0,
          no2: 27.7,
          so2: 22.8,
          co: 880.0,
          o3: 62.0,
        },
      },
    };

    const req = new NextRequest('http://localhost:3000/api/action-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await actionPlanHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.compositeAqi).toBe(204);
    expect(json.directives.length).toBe(4);
  });

  it('POST /api/action-plan returns 400 for invalid schema payload', async () => {
    const req = new NextRequest('http://localhost:3000/api/action-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: true }),
    });

    const res = await actionPlanHandler(req);
    expect(res.status).toBe(400);
  });

  it('POST /api/chat returns SSE event stream', async () => {
    const payload = {
      message: 'Is it safe to jog right now?',
      cityId: 'delhi_ncr',
      cityName: 'Delhi NCR',
      language: 'en',
    };

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const res = await chatHandler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/event-stream');
  });

  it('POST /api/action-plan enforces rate limits (429)', async () => {
    // Fill up rate limiter for a specific test IP
    const testIp = '10.0.0.1';
    for (let i = 0; i < 60; i++) {
      globalRateLimiter.check(testIp);
    }

    const payload = {
      cityId: 'delhi_ncr',
      cityName: 'Delhi NCR',
      language: 'en',
      simulatorInputs: {
        commuteMode: 'ice_car',
        commuteDistanceKm: 15,
        maskGrade: 'none',
        indoorHepaActive: false,
        outdoorCardioHours: 1,
      },
      telemetry: {
        aqiUs: 204,
        primaryPollutant: 'PM2.5',
        primaryPollutantConcentration: 96.6,
        pollutants: {
          pm25: 96.6,
          pm10: 99.0,
          no2: 27.7,
          so2: 22.8,
          co: 880.0,
          o3: 62.0,
        },
      },
    };

    const req = new NextRequest('http://localhost:3000/api/action-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': testIp,
      },
      body: JSON.stringify(payload),
    });

    const res = await actionPlanHandler(req);
    expect(res.status).toBe(429);
  });

  it('POST /api/chat enforces rate limits (429)', async () => {
    const testIp = '10.0.0.99';
    for (let i = 0; i < 60; i++) {
      globalRateLimiter.check(testIp);
    }

    const payload = {
      message: 'Hello',
      cityId: 'delhi_ncr',
      cityName: 'Delhi NCR',
      language: 'en',
    };

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': testIp,
      },
      body: JSON.stringify(payload),
    });

    const res = await chatHandler(req);
    expect(res.status).toBe(429);
  });

  it('POST /api/chat returns 400 for invalid payload', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' }),
    });

    const res = await chatHandler(req);
    expect(res.status).toBe(400);
  });

  it('GET /api/telemetry handles internal errors gracefully with 500', async () => {
    vi.spyOn(globalCache, 'get').mockImplementationOnce(() => {
      throw new Error('Simulated cache crash');
    });

    const req = new NextRequest('http://localhost:3000/api/telemetry?cityId=delhi_ncr');
    const res = await telemetryHandler(req);
    expect(res.status).toBe(500);
  });

  it('POST /api/action-plan handles internal errors gracefully with 500', async () => {
    const req = new NextRequest('http://localhost:3000/api/action-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json-body{{{',
    });

    const res = await actionPlanHandler(req);
    expect(res.status).toBe(500);
  });

  it('GET /api/telemetry enforces rate limits (429)', async () => {
    const testIp = '10.0.0.55';
    for (let i = 0; i < 120; i++) {
      globalRateLimiter.check(testIp);
    }

    const req = new NextRequest('http://localhost:3000/api/telemetry?cityId=delhi_ncr', {
      headers: { 'x-forwarded-for': testIp },
    });
    const res = await telemetryHandler(req);
    expect(res.status).toBe(429);
  });

  it('POST /api/action-plan rejects cross-origin foreign requests with 403', async () => {
    const req = new NextRequest('http://localhost:3000/api/action-plan', {
      method: 'POST',
      headers: {
        origin: 'https://malicious-cross-origin.com',
        host: 'localhost:3000',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const res = await actionPlanHandler(req);
    expect(res.status).toBe(403);
  });

  it('POST /api/chat rejects cross-origin foreign requests with 403', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        origin: 'https://malicious-cross-origin.com',
        host: 'localhost:3000',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const res = await chatHandler(req);
    expect(res.status).toBe(403);
  });

  it('POST /api/chat handles internal errors gracefully with 500', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json-body{{{',
    });

    const res = await chatHandler(req);
    expect(res.status).toBe(500);
  });
});
