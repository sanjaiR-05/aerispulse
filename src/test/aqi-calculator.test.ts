import { describe, it, expect } from 'vitest';
import { calculatePm25Aqi, calculateEuropeanCaqi } from '@/services/aqi-calculator';

describe('US EPA PM2.5 AQI Calculator', () => {
  it('calculates Good category correctly at low concentrations', () => {
    const res = calculatePm25Aqi(4.5);
    expect(res.category).toBe('Good');
    expect(res.aqi).toBeGreaterThanOrEqual(0);
    expect(res.aqi).toBeLessThanOrEqual(50);
  });

  it('calculates Good boundary zero', () => {
    const res = calculatePm25Aqi(0);
    expect(res.aqi).toBe(0);
    expect(res.category).toBe('Good');
  });

  it('handles negative concentration by clamping to zero', () => {
    const res = calculatePm25Aqi(-10);
    expect(res.aqi).toBe(0);
    expect(res.category).toBe('Good');
  });

  it('calculates Good upper boundary at 9.0 ug/m3', () => {
    const res = calculatePm25Aqi(9.0);
    expect(res.aqi).toBe(50);
    expect(res.category).toBe('Good');
  });

  it('calculates Moderate category correctly at 9.1 ug/m3', () => {
    const res = calculatePm25Aqi(9.1);
    expect(res.category).toBe('Moderate');
    expect(res.aqi).toBe(51);
  });

  it('calculates Moderate midpoint correctly', () => {
    const res = calculatePm25Aqi(20.0);
    expect(res.category).toBe('Moderate');
    expect(res.aqi).toBeGreaterThan(50);
    expect(res.aqi).toBeLessThanOrEqual(100);
  });

  it('calculates Moderate upper boundary at 35.4 ug/m3', () => {
    const res = calculatePm25Aqi(35.4);
    expect(res.aqi).toBe(100);
    expect(res.category).toBe('Moderate');
  });

  it('calculates Unhealthy for Sensitive Groups lower boundary at 35.5 ug/m3', () => {
    const res = calculatePm25Aqi(35.5);
    expect(res.category).toBe('Unhealthy for Sensitive Groups');
    expect(res.aqi).toBe(101);
  });

  it('calculates Unhealthy for Sensitive Groups upper boundary at 55.4 ug/m3', () => {
    const res = calculatePm25Aqi(55.4);
    expect(res.aqi).toBe(150);
    expect(res.category).toBe('Unhealthy for Sensitive Groups');
  });

  it('calculates Unhealthy lower boundary at 55.5 ug/m3', () => {
    const res = calculatePm25Aqi(55.5);
    expect(res.category).toBe('Unhealthy');
    expect(res.aqi).toBe(151);
  });

  it('calculates Unhealthy upper boundary at 125.4 ug/m3', () => {
    const res = calculatePm25Aqi(125.4);
    expect(res.aqi).toBe(200);
    expect(res.category).toBe('Unhealthy');
  });

  it('calculates Very Unhealthy for Delhi reference level 96.6 ug/m3', () => {
    const res = calculatePm25Aqi(96.6);
    expect(res.category).toBe('Unhealthy');
    expect(res.aqi).toBeGreaterThan(170);
  });

  it('calculates Very Unhealthy lower boundary at 125.5 ug/m3', () => {
    const res = calculatePm25Aqi(125.5);
    expect(res.category).toBe('Very Unhealthy');
    expect(res.aqi).toBe(201);
  });

  it('calculates Very Unhealthy upper boundary at 225.4 ug/m3', () => {
    const res = calculatePm25Aqi(225.4);
    expect(res.aqi).toBe(300);
    expect(res.category).toBe('Very Unhealthy');
  });

  it('calculates Hazardous lower boundary at 225.5 ug/m3', () => {
    const res = calculatePm25Aqi(225.5);
    expect(res.category).toBe('Hazardous');
    expect(res.aqi).toBe(301);
  });

  it('calculates Hazardous upper boundary at 325.4 ug/m3', () => {
    const res = calculatePm25Aqi(325.4);
    expect(res.aqi).toBe(500);
    expect(res.category).toBe('Hazardous');
  });

  it('caps extreme concentrations above 325.4 ug/m3 at 500 Hazardous', () => {
    const res = calculatePm25Aqi(800);
    expect(res.aqi).toBe(500);
    expect(res.category).toBe('Hazardous');
  });

  it('truncates decimal places according to EPA rounding protocol', () => {
    const res = calculatePm25Aqi(9.189);
    // 9.189 truncates to 9.1
    expect(res.aqi).toBe(51);
  });
});

describe('European CAQI Benchmark Calculator', () => {
  it('calculates zero CAQI for zero concentrations', () => {
    const caqi = calculateEuropeanCaqi(0, 0, 0);
    expect(caqi).toBe(0);
  });

  it('computes CAQI driven by PM2.5', () => {
    const caqi = calculateEuropeanCaqi(96.6, 20, 20);
    expect(caqi).toBe(Math.min(100, Math.round((96.6 / 110) * 100)));
  });

  it('computes CAQI driven by PM10 when PM10 is highest ratio', () => {
    const caqi = calculateEuropeanCaqi(10, 160, 20);
    expect(caqi).toBe(Math.min(100, Math.round((160 / 180) * 100)));
  });

  it('computes CAQI driven by NO2 when NO2 is highest ratio', () => {
    const caqi = calculateEuropeanCaqi(10, 10, 360);
    expect(caqi).toBe(Math.min(100, Math.round((360 / 400) * 100)));
  });

  it('caps maximum CAQI at 100', () => {
    const caqi = calculateEuropeanCaqi(500, 500, 500);
    expect(caqi).toBe(100);
  });
});
