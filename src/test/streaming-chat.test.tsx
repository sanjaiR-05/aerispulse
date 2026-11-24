import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StreamingChat } from '@/components/StreamingChat';
import { AtmosphericTelemetry } from '@/domain/types';

const mockTelemetry: AtmosphericTelemetry = {
  cityId: 'delhi_ncr',
  cityName: 'Delhi NCR',
  timestamp: new Date().toISOString(),
  aqiUs: 204,
  aqiCategory: 'Very Unhealthy',
  primaryPollutant: 'PM2.5',
  primaryPollutantConcentration: 96.6,
  europeanCaqi: 83,
  confidenceScore: 90,
  isVerified: true,
  modelSource: 'Open-Meteo CAMS Atmospheric Model (Active Multi-Station Synthesis)',
  coordinates: { latitude: 28.61, longitude: 77.21 },
  pollutants: {
    pm25: 96.6,
    pm10: 99.0,
    no2: 27.7,
    so2: 22.8,
    o3: 62.0,
    co: 880.0,
  },
};

describe('StreamingChat Component Unit Suite', () => {
  it('renders initial assistant greeting message and quick prompt buttons', () => {
    render(<StreamingChat telemetry={mockTelemetry} language="en" />);

    expect(screen.getByText(/Hello! I am your AerisPulse real-time atmospheric health assistant/i)).toBeInTheDocument();
    expect(screen.getByText('Is it safe to jog outside right now?')).toBeInTheDocument();
    expect(screen.getByText('Which mask grade should I wear?')).toBeInTheDocument();
    expect(screen.getByText('Protective tips for children and elderly?')).toBeInTheDocument();
  });

  it('renders Tamil initial greeting when language is set to ta', () => {
    render(<StreamingChat telemetry={mockTelemetry} language="ta" />);
    expect(screen.getByText(/வணக்கம்! நான் உங்கள் AerisPulse நேரலை வளிமண்டல/i)).toBeInTheDocument();
  });

  it('renders Hindi initial greeting when language is set to hi', () => {
    render(<StreamingChat telemetry={mockTelemetry} language="hi" />);
    expect(screen.getByText(/नमस्ते! मैं आपका AerisPulse वास्तविक समय वायुमंडलीय/i)).toBeInTheDocument();
  });

  it('allows clicking quick prompt and appends user message', async () => {
    // Mock SSE response stream
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"text":"Outdoor cardio is discouraged."}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      body: mockStream,
    } as Response);

    render(<StreamingChat telemetry={mockTelemetry} language="en" />);

    const quickPrompt = screen.getByText('Is it safe to jog outside right now?');
    fireEvent.click(quickPrompt);

    await waitFor(() => {
      expect(screen.getAllByText('Is it safe to jog outside right now?').length).toBeGreaterThan(0);
    });
  });

  it('reassembles an SSE event split across network chunks', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"text":"Split '));
        controller.enqueue(encoder.encode('response"}\n\ndata: [DONE]\n\n'));
        controller.close();
      },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: true, body: stream } as Response);

    render(<StreamingChat telemetry={mockTelemetry} language="en" />);
    fireEvent.click(screen.getByText('Is it safe to jog outside right now?'));

    await waitFor(() => {
      expect(screen.getByText('Split response')).toBeInTheDocument();
    });
  });

  it('shows the localized offline notice when the stream cannot be opened', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network down'));

    render(<StreamingChat telemetry={mockTelemetry} language="en" />);
    fireEvent.click(screen.getByText('Which mask grade should I wear?'));

    await waitFor(() => {
      expect(screen.getByText(/Live guidance is temporarily unavailable/i)).toBeInTheDocument();
    });
  });

  it('re-seeds the greeting when the locale changes before any conversation', () => {
    const { rerender } = render(<StreamingChat telemetry={mockTelemetry} language="en" />);
    expect(screen.getByText(/Hello! I am your AerisPulse/i)).toBeInTheDocument();

    rerender(<StreamingChat telemetry={mockTelemetry} language="hi" />);
    expect(screen.getByText(/नमस्ते! मैं आपका AerisPulse/i)).toBeInTheDocument();
  });

  it('allows typing custom message into input field and sending', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"text":"Use N95 mask."}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      body: mockStream,
    } as Response);

    render(<StreamingChat telemetry={mockTelemetry} language="en" />);

    const input = screen.getByLabelText('Ask the atmospheric health assistant');
    fireEvent.change(input, { target: { value: 'Should I wear a mask?' } });
    expect((input as HTMLInputElement).value).toBe('Should I wear a mask?');

    const submitBtn = screen.getByLabelText('Send');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Should I wear a mask?')).toBeInTheDocument();
    });
  });
});
