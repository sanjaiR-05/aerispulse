'use client';

import { useState, useCallback } from 'react';
import { AtmosphericTelemetry, MetroPreset } from '@/domain/types';
import { METRO_PRESETS } from '@/domain/constants';
import { buildFallbackTelemetry } from '@/services/fallback-telemetry';

/**
 * Calibrated initial atmospheric telemetry state (Delhi NCR), derived through the same
 * deterministic calculators used by the offline fallback so no figure is hand-authored.
 */
export const INITIAL_DELHI_TELEMETRY: AtmosphericTelemetry = buildFallbackTelemetry('delhi_ncr');

/**
 * Return interface for the `useTelemetry` custom hook.
 */
export interface UseTelemetryResult {
  /** Currently selected metro preset */
  selectedPreset: MetroPreset;
  /** Active atmospheric telemetry data */
  telemetry: AtmosphericTelemetry;
  /** Whether a background telemetry refresh is currently executing */
  isRefreshing: boolean;
  /** Accessibility live region message for screen readers */
  a11yMessage: string;
  /** Setter for custom screen reader announcements */
  setA11yMessage: (msg: string) => void;
  /** Handler to switch active metro preset and fetch live telemetry */
  handleSelectPreset: (preset: MetroPreset) => Promise<void>;
  /** Handler to re-fetch telemetry for the currently selected preset */
  handleRefresh: () => Promise<void>;
}

/**
 * Custom hook encapsulating atmospheric telemetry fetching, caching, and state management.
 *
 * @param initialData - Optional initial telemetry data (defaults to the derived Delhi snapshot)
 * @returns {UseTelemetryResult} Telemetry state and handler functions
 *
 * @example
 * ```tsx
 * const { telemetry, selectedPreset, isRefreshing, handleSelectPreset, handleRefresh } = useTelemetry();
 * ```
 */
export function useTelemetry(
  initialData: AtmosphericTelemetry = INITIAL_DELHI_TELEMETRY
): UseTelemetryResult {
  const [selectedPreset, setSelectedPreset] = useState<MetroPreset>(METRO_PRESETS[0]!);
  const [telemetry, setTelemetry] = useState<AtmosphericTelemetry>(initialData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [a11yMessage, setA11yMessage] = useState<string>(
    'AerisPulse intelligence dashboard loaded.'
  );

  const fetchTelemetry = useCallback(async (cityId: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/telemetry?cityId=${cityId}`);
      if (res.ok) {
        const data: AtmosphericTelemetry = await res.json();
        setTelemetry(data);
        setA11yMessage(`Updated atmospheric telemetry for ${data.cityName}. AQI is ${data.aqiUs}.`);
      }
    } catch {
      // Retain existing cached telemetry state on network interruption
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleSelectPreset = useCallback(
    async (preset: MetroPreset) => {
      setSelectedPreset(preset);
      await fetchTelemetry(preset.id);
    },
    [fetchTelemetry]
  );

  const handleRefresh = useCallback(async () => {
    await fetchTelemetry(selectedPreset.id);
  }, [fetchTelemetry, selectedPreset.id]);

  return {
    selectedPreset,
    telemetry,
    isRefreshing,
    a11yMessage,
    setA11yMessage,
    handleSelectPreset,
    handleRefresh,
  };
}
