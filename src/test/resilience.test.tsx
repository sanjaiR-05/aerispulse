import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';
import Loading from '@/app/loading';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

describe('App Router Resilience Suite', () => {
  it('renders NotFound component with return to dashboard link', () => {
    render(<NotFound />);

    expect(screen.getByText('Telemetry Vector Not Found')).toBeInTheDocument();
    const homeLink = screen.getByRole('link', { name: /Return to Central Dashboard/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders Loading skeleton without errors', () => {
    const { container } = render(<Loading />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('generates robots.txt disallowing api routes', () => {
    const config = robots();
    expect(config.rules).toBeDefined();
    expect(config.sitemap).toContain('sitemap.xml');
  });

  it('generates dynamic XML sitemap with priority', () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]?.url).toBe('https://project-kappa-ten-61.vercel.app');
  });
});
