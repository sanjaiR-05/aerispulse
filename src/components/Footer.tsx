'use client';

import React from 'react';
import { ShieldCheck, BookOpen, Shield } from 'lucide-react';
import { SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/translations';

/**
 * Properties for the Footer component.
 */
export interface FooterProps {
  /** Active internationalization locale */
  language: SupportedLanguage;
}

/**
 * System footer presenting peer-reviewed epidemiological citations (WHO AQG 2021, EPA 454/B-18-007,
 * GEMM PNAS 2018), link to clinical methodology documentation, and WCAG 2.1 AA accessibility verification badge.
 *
 * @param props - FooterProps configuration
 * @returns {JSX.Element} Rendered footer element
 */
export const Footer: React.FC<FooterProps> = ({ language }): React.JSX.Element => {
  const t = TRANSLATIONS[language];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur py-6 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-start sm:items-center gap-2.5 text-slate-600 dark:text-slate-400">
          <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block sm:inline">
              AerisPulse — Peer-Reviewed Climate & Atmospheric Health System
            </span>
            <span className="hidden sm:inline"> • </span>
            <span className="text-slate-500 dark:text-slate-400 block sm:inline">
              Deterministic calculations benchmarked against EPA 454/B-18-007, WHO AQG 2021 & GEMM PNAS 2018.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/sanjaiR-05/aerispulse/blob/main/docs/METHODOLOGY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.footerMethodology}</span>
          </a>

          <div className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.footerA11y}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
