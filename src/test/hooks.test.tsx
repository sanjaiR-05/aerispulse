import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useThemeLanguage,
  useTelemetry,
  useSimulator,
  useActionPlan,
  INITIAL_DELHI_TELEMETRY,
} from '@/hooks';
import { METRO_PRESETS } from '@/domain/constants';

describe('Custom Hooks Architecture Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('useThemeLanguage', () => {
    it('manages language switching and dark mode state', () => {
      const { result } = renderHook(() => useThemeLanguage());

      expect(result.current.language).toBe('en');
      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.setLanguage('ta');
        result.current.toggleDark();
      });

      expect(result.current.language).toBe('ta');
      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      act(() => {
        result.current.setIsDark(false);
      });
      expect(result.current.isDark).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('useTelemetry', () => {
    it('initializes with Delhi baseline telemetry', () => {
      const { result } = renderHook(() => useTelemetry());

      expect(result.current.selectedPreset.id).toBe('delhi_ncr');
      expect(result.current.telemetry.aqiUs).toBe(204);
      expect(result.current.isRefreshing).toBe(false);
    });

    it('updates telemetry and live announcer upon selecting a new preset', async () => {
      const mockMumbaiData = {
        ...INITIAL_DELHI_TELEMETRY,
        cityId: 'mumbai_coastal',
        cityName: 'Mumbai Coastal',
        aqiUs: 142,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockMumbaiData,
      } as Response);

      const { result } = renderHook(() => useTelemetry());

      await act(async () => {
        await result.current.handleSelectPreset(METRO_PRESETS[1]!);
      });

      expect(result.current.selectedPreset.id).toBe('mumbai_coastal');
      expect(result.current.telemetry.cityName).toBe('Mumbai Coastal');
      expect(result.current.a11yMessage).toContain('Mumbai Coastal');
    });

    it('refreshes telemetry for active preset when handleRefresh is called', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => INITIAL_DELHI_TELEMETRY,
      } as Response);

      const { result } = renderHook(() => useTelemetry());

      await act(async () => {
        await result.current.handleRefresh();
      });

      expect(fetchSpy).toHaveBeenCalledWith('/api/telemetry?cityId=delhi_ncr');
    });
  });

  describe('useSimulator', () => {
    it('calculates deterministic outputs based on telemetry and inputs', () => {
      const { result } = renderHook(() => useSimulator(INITIAL_DELHI_TELEMETRY));

      expect(result.current.inputs.commuteMode).toBe('ice_car');
      expect(result.current.outputs.dailyInhaledPm25Dosage).toBeGreaterThan(0);
      expect(result.current.outputs.baselineDosage).toBeGreaterThan(0);

      // Mutate inputs to greener profile
      act(() => {
        result.current.setInputs((prev) => ({
          ...prev,
          commuteMode: 'metro_electric_bus',
          maskGrade: 'n95_ffp2',
          indoorHepaActive: true,
        }));
      });

      expect(result.current.outputs.dosageReductionPercentage).toBeGreaterThan(50);
      expect(result.current.outputs.dailyCarbonAbatedKg).toBeGreaterThan(0);
      expect(result.current.outputs.personalHealthShieldScore).toBeGreaterThan(90);
    });
  });

  describe('useActionPlan', () => {
    it('initializes in idle state and triggers plan synthesis', async () => {
      const mockPlan = {
        cityId: 'delhi_ncr',
        cityName: 'Delhi NCR',
        compositeAqi: 204,
        primaryPollutant: 'PM2.5',
        executiveSummary: 'Synthesized Advisory',
        engineSource: 'Gemini 1.5 Pro',
        generatedAt: new Date().toISOString(),
        directives: [],
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlan,
      } as Response);

      const { result } = renderHook(() => useActionPlan());

      expect(result.current.actionPlan).toBeNull();
      expect(result.current.isGeneratingPlan).toBe(false);

      const announceMock = vi.fn();

      await act(async () => {
        await result.current.handleGeneratePlan(
          {
            telemetry: INITIAL_DELHI_TELEMETRY,
            simulatorInputs: {
              commuteMode: 'ice_car',
              commuteDistanceKm: 15,
              maskGrade: 'none',
              indoorHepaActive: false,
              outdoorCardioHours: 1,
            },
            language: 'en',
          },
          announceMock
        );
      });

      expect(result.current.actionPlan).toEqual(mockPlan);
      expect(announceMock).toHaveBeenCalledWith('Action plan generated successfully.');

      act(() => {
        result.current.clearPlan();
      });
      expect(result.current.actionPlan).toBeNull();
    });
  });
});
