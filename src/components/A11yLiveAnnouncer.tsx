'use client';

import React from 'react';

interface A11yLiveAnnouncerProps {
  message: string;
}

/**
 * Visually hidden screen-reader live region complying with WCAG 2.2 AA.
 * Announces dynamic updates (telemetry changes, calculation recalculations, action plans).
 */
export const A11yLiveAnnouncer: React.FC<A11yLiveAnnouncerProps> = ({ message }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};
