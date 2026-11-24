'use client';

import React from 'react';

/**
 * Properties for the A11yLiveAnnouncer component.
 */
export interface A11yLiveAnnouncerProps {
  /** Screen reader notification message string */
  message: string;
}

/**
 * Visually hidden screen-reader live region complying with WCAG 2.1 AA and Section 508.
 * Dynamically announces updates (telemetry changes, calculation recalculations, action plans)
 * to assistive screen reader technologies with `polite` priority.
 *
 * @param props - A11yLiveAnnouncerProps configuration
 * @returns {JSX.Element} Invisible live aria region
 */
export const A11yLiveAnnouncer: React.FC<A11yLiveAnnouncerProps> = ({
  message,
}): React.JSX.Element => {
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
