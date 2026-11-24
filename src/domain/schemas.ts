import { z } from 'zod';

/**
 * Zod validation schema for supported commute modes.
 */
export const CommuteModeSchema = z.enum([
  'ice_car',
  'two_wheeler',
  'metro_electric_bus',
  'bicycle_walk',
]);

/**
 * Zod validation schema for mask filtration grades.
 */
export const MaskGradeSchema = z.enum(['none', 'surgical_cloth', 'n95_ffp2']);

/**
 * Zod validation schema for supported interface locales.
 */
export const SupportedLanguageSchema = z.enum(['en', 'ta', 'hi']);

/**
 * Zod validation schema for user lifestyle simulator input parameters.
 */
export const SimulatorInputsSchema = z.object({
  commuteMode: CommuteModeSchema,
  commuteDistanceKm: z.number().min(0).max(100),
  maskGrade: MaskGradeSchema,
  indoorHepaActive: z.boolean(),
  outdoorCardioHours: z.number().min(0).max(12),
});

/**
 * Zod validation schema for POST /api/action-plan request payloads.
 */
export const ActionPlanRequestSchema = z.object({
  cityId: z.string().min(1).max(50),
  cityName: z.string().min(1).max(100),
  language: SupportedLanguageSchema.default('en'),
  simulatorInputs: SimulatorInputsSchema,
  telemetry: z.object({
    aqiUs: z.number(),
    primaryPollutant: z.string(),
    primaryPollutantConcentration: z.number(),
    pollutants: z.object({
      pm25: z.number(),
      pm10: z.number(),
      no2: z.number(),
      so2: z.number(),
      co: z.number(),
      o3: z.number(),
    }),
  }),
});

/**
 * Zod validation schema for POST /api/chat inbound messages.
 * Includes sanitization to neutralize prompt injection delimiters.
 */
export const ChatRequestSchema = z.object({
  message: z
    .string()
    .transform((val) => {
      // Strip XML delimiters and dangerous injection boundaries
      return val
        .replace(/<[^>]*>/g, '')
        .replace(/\[\/?(?:SYSTEM|PROMPT|INSTRUCTION)\]/gi, '')
        .trim();
    })
    .pipe(z.string().min(1).max(1000)),
  cityId: z.string().min(1).max(50),
  cityName: z.string().min(1).max(100),
  language: SupportedLanguageSchema.default('en'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      })
    )
    .max(20)
    .default([]),
});

/**
 * Zod validation schema for a single AI-produced mitigation directive.
 * Applied to every GenAI response before it reaches the client.
 */
export const ActionPlanDirectiveSchema = z.object({
  category: z.enum(['indoor', 'commute', 'health', 'community']),
  title: z.string().min(1).max(200),
  urgency: z.enum(['CRITICAL', 'HIGH', 'MODERATE', 'LOW']),
  description: z.string().min(1).max(1200),
  impactMetricLabel: z.string().min(1).max(120),
  impactMetricValue: z.string().min(1).max(240),
});

/**
 * Zod validation schema for the structured JSON returned by the GenAI model.
 * A response that fails this schema is rejected in favour of the deterministic engine.
 */
export const ActionPlanAiResponseSchema = z.object({
  executiveSummary: z.string().min(1).max(1200),
  directives: z.array(ActionPlanDirectiveSchema).min(1).max(8),
});

/**
 * Zod validation schema for one Gemini streaming SSE chunk.
 */
export const GeminiStreamChunkSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z
          .object({
            parts: z.array(z.object({ text: z.string().optional() })).optional(),
          })
          .optional(),
      })
    )
    .optional(),
});

/**
 * Zod validation schema for GET /api/telemetry query parameters.
 */
export const TelemetryQuerySchema = z.object({
  cityId: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_]+$/i, 'cityId must only contain alphanumeric characters and underscores'),
});
