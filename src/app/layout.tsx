import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AerisPulse — Urban Air Quality & Climate Health Intelligence System',
  description:
    'Real-time atmospheric telemetry cross-referencing, peer-reviewed physiological dosage modeling, and structured GenAI action synthesis with deterministic zero-downtime resilience.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg font-semibold text-xs"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
