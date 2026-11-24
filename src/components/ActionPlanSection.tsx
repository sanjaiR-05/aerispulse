'use client';

import React from 'react';
import { Sparkles, Cpu, Home, Bike, HeartPulse, Users } from 'lucide-react';
import { ActionPlanDirective, ActionPlanResponse, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/translations';

interface ActionPlanSectionProps {
  actionPlan: ActionPlanResponse | null;
  isLoading: boolean;
  onGeneratePlan: () => void;
  language: SupportedLanguage;
}

export const ActionPlanSection: React.FC<ActionPlanSectionProps> = ({
  actionPlan,
  isLoading,
  onGeneratePlan,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const getUrgencyBadge = (urgency: ActionPlanDirective['urgency']) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'HIGH':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'MODERATE':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
    }
  };

  const getCategoryIcon = (category: ActionPlanDirective['category']) => {
    switch (category) {
      case 'indoor':
        return <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />;
      case 'commute':
        return <Bike className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
      case 'health':
        return <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />;
      case 'community':
        return <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />;
    }
  };

  return (
    <section
      aria-labelledby="action-plan-heading"
      className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <h2
              id="action-plan-heading"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
            >
              {t.actionEngineTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.actionEngineSubtitle}
          </p>
        </div>

        <button
          onClick={onGeneratePlan}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50"
          aria-label={isLoading ? t.generatingPlanBtn : t.generatePlanBtn}
        >
          <Cpu className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{isLoading ? t.generatingPlanBtn : t.generatePlanBtn}</span>
        </button>
      </div>

      {!actionPlan ? (
        <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
          {t.planPlaceholder}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Executive Synthesis Banner */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                ACTION PLAN EXECUTIVE SYNTHESIS
              </span>
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 font-mono">
                {actionPlan.engineSource}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              {actionPlan.executiveSummary}
            </p>
          </div>

          {/* 4 Directives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionPlan.directives.map((directive, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 capitalize text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {getCategoryIcon(directive.category)}
                      <span>{directive.category}</span>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${getUrgencyBadge(
                        directive.urgency
                      )}`}
                    >
                      {directive.urgency}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                    {directive.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {directive.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {directive.impactMetricLabel}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-right">
                    {directive.impactMetricValue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
