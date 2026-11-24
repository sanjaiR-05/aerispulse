import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/app/error';

describe('Root Error Boundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('announces the interruption and retries the session on demand', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.fn();

    render(<ErrorBoundary error={new Error('Telemetry crash')} reset={reset} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Atmospheric Engine Interruption/i)).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Recover & Retry Session/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
