import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateActionPlanWithAI,
  normaliseGeminiStream,
  streamGroundedChat,
} from '@/services/genai-service';
import { SimulatorInputs } from '@/domain/types';

describe('GenAI Service (Gemini API & Fallback)', () => {
  const defaultInputs: SimulatorInputs = {
    commuteMode: 'ice_car',
    commuteDistanceKm: 15,
    maskGrade: 'none',
    indoorHepaActive: false,
    outdoorCardioHours: 1,
  };

  const defaultParams = {
    cityId: 'delhi_ncr',
    cityName: 'Delhi NCR',
    language: 'en' as const,
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
    simulatorInputs: defaultInputs,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it('uses deterministic rules fallback when GEMINI_API_KEY is not set', async () => {
    const plan = await generateActionPlanWithAI(defaultParams);
    expect(plan.engineSource).toBe('AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)');
    expect(plan.directives.length).toBe(4);
  });

  it('successfully invokes Gemini API when GEMINI_API_KEY is set and schema returns valid JSON', async () => {
    process.env.GEMINI_API_KEY = 'test_mock_key';

    const mockGeminiJson = {
      executiveSummary: 'AI generated executive summary',
      directives: [
        {
          category: 'indoor',
          title: 'AI Indoor Directive',
          urgency: 'HIGH',
          description: 'AI description',
          impactMetricLabel: 'Reduction:',
          impactMetricValue: '80%',
        },
      ],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify(mockGeminiJson) }],
            },
          },
        ],
      }),
    } as Response);

    const plan = await generateActionPlanWithAI(defaultParams);
    expect(plan.engineSource).toBe('Google Gemini (Live Model)');
    expect(plan.executiveSummary).toBe('AI generated executive summary');
    expect(plan.directives[0]?.title).toBe('AI Indoor Directive');
  });

  it('fails over to deterministic rules engine when Gemini returns HTTP error', async () => {
    process.env.GEMINI_API_KEY = 'test_mock_key';

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 429,
    } as Response);

    const plan = await generateActionPlanWithAI(defaultParams);
    expect(plan.engineSource).toBe('AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)');
    expect(plan.directives.length).toBe(4);
  });

  it('streams chat using fallback when GEMINI_API_KEY is absent', async () => {
    const stream = await streamGroundedChat('Is it safe to jog?', 'Delhi NCR', 204, 96.6, 'en');
    expect(stream).toBeDefined();

    const reader = stream.getReader();
    let accumulated = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      accumulated += new TextDecoder().decode(value);
    }
    expect(accumulated).toContain('data:');
    expect(accumulated).toContain('[DONE]');
  });

  it('streams chat through Gemini API when GEMINI_API_KEY is set', async () => {
    process.env.GEMINI_API_KEY = 'test_mock_key';

    const mockBody = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"text":"Grounded response"}\n\n'));
        controller.close();
      },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      body: mockBody,
    } as Response);

    const stream = await streamGroundedChat('Which mask?', 'Delhi NCR', 204, 96.6, 'en');
    expect(stream).toBeDefined();
  });

  it('rejects model output that violates the directive schema', async () => {
    process.env.GEMINI_API_KEY = 'test_mock_key';

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: JSON.stringify({ executiveSummary: 'Missing directives' }) }],
            },
          },
        ],
      }),
    } as Response);

    const plan = await generateActionPlanWithAI(defaultParams);
    expect(plan.engineSource).toBe(
      'AerisPulse Deterministic Rules Engine (Zero-Downtime Fallback)'
    );
    expect(plan.directives).toHaveLength(4);
  });

  it('fails over when the model returns an empty candidate payload', async () => {
    process.env.GEMINI_API_KEY = 'test_mock_key';

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [] }),
    } as Response);

    const plan = await generateActionPlanWithAI(defaultParams);
    expect(plan.directives).toHaveLength(4);
  });

  it('normalises Gemini SSE chunks into the client text envelope', async () => {
    const encoder = new TextEncoder();
    const geminiSse =
      'data: {"candidates":[{"content":{"parts":[{"text":"Wear an "}]}}]}\n\n' +
      'data: {"candidates":[{"content":{"parts":[{"text":"N95 mask."}]}}]}\n\n' +
      'data: {"promptFeedback":{}}\n\n';

    const splitAt = 45;
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(geminiSse.slice(0, splitAt)));
        controller.enqueue(encoder.encode(geminiSse.slice(splitAt)));
        controller.close();
      },
    });

    const reader = normaliseGeminiStream(source).getReader();
    let output = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      output += new TextDecoder().decode(value);
    }

    expect(output).toContain('data: {"text":"Wear an "}');
    expect(output).toContain('data: {"text":"N95 mask."}');
    expect(output).toContain('[DONE]');
  });

  it('flushes a trailing partial event that arrives without a blank-line terminator', async () => {
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"candidates":[{"content":{"parts":[{"text":"Tail"}]}}]}'
          )
        );
        controller.close();
      },
    });

    const reader = normaliseGeminiStream(source).getReader();
    let output = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      output += new TextDecoder().decode(value);
    }

    expect(output).toContain('data: {"text":"Tail"}');
  });

  it('fails over to deterministic stream when Gemini streaming throws error', async () => {
    process.env.GEMINI_API_KEY = 'test_mock_key';

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Streaming network timeout'));

    const stream = await streamGroundedChat('Is it safe to jog?', 'Delhi NCR', 204, 96.6, 'en');
    expect(stream).toBeDefined();

    const reader = stream.getReader();
    let accumulated = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      accumulated += new TextDecoder().decode(value);
    }
    expect(accumulated).toContain('Outdoor');
    expect(accumulated).toContain('discouraged');
    expect(accumulated).toContain('[DONE]');
  });
});
