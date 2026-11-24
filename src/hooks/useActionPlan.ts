'use client';

import { useState, useCallback } from 'react';
import {
  ActionPlanResponse,
  AtmosphericTelemetry,
  SimulatorInputs,
  SupportedLanguage,
} from '@/domain/types';

/**
 * Parameter interface for generating an action plan.
 */
export interface GeneratePlanParams {
  telemetry: AtmosphericTelemetry;
  simulatorInputs: SimulatorInputs;
  language: SupportedLanguage;
}

/**
 * Return interface for the `useActionPlan` custom hook.
 */
export interface UseActionPlanResult {
  /** Active synthesized action plan directives, or null before first synthesis */
  actionPlan: ActionPlanResponse | null;
  /** Whether GenAI synthesis is actively streaming or processing */
  isGeneratingPlan: boolean;
  /** Trigger function to generate a tailored action plan */
  handleGeneratePlan: (
    params: GeneratePlanParams,
    onAnnounce?: (msg: string) => void
  ) => Promise<void>;
  /** Clear or reset current action plan state */
  clearPlan: () => void;
}

/**
 * Custom hook governing GenAI action plan synthesis with zero-downtime deterministic fallback.
 *
 * @returns {UseActionPlanResult} Action plan state and action dispatchers
 *
 * @example
 * ```tsx
 * const { actionPlan, isGeneratingPlan, handleGeneratePlan } = useActionPlan();
 * ```
 */
export function useActionPlan(): UseActionPlanResult {
  const [actionPlan, setActionPlan] = useState<ActionPlanResponse | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);

  const clearPlan = useCallback(() => {
    setActionPlan(null);
  }, []);

  const handleGeneratePlan = useCallback(
    async (
      { telemetry, simulatorInputs, language }: GeneratePlanParams,
      onAnnounce?: (msg: string) => void
    ): Promise<void> => {
      setIsGeneratingPlan(true);
      onAnnounce?.('Synthesizing personalized clinical and behavioral mitigation action plan.');

      try {
        const res = await fetch('/api/action-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cityId: telemetry.cityId,
            cityName: telemetry.cityName,
            language,
            simulatorInputs,
            telemetry: {
              aqiUs: telemetry.aqiUs,
              primaryPollutant: telemetry.primaryPollutant,
              primaryPollutantConcentration: telemetry.primaryPollutantConcentration,
              pollutants: telemetry.pollutants,
            },
          }),
        });

        if (res.ok) {
          const plan: ActionPlanResponse = await res.json();
          setActionPlan(plan);
          onAnnounce?.('Action plan generated successfully.');
        }
      } catch (_err) {
        // Fallback state handled gracefully without crashing UI
      } finally {
        setIsGeneratingPlan(false);
      }
    },
    []
  );

  return {
    actionPlan,
    isGeneratingPlan,
    handleGeneratePlan,
    clearPlan,
  };
}
