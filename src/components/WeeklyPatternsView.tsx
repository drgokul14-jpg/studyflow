import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  FileDown,
  Flame,
  Info,
  PieChart,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { GoalSettings, StudySession, Subject, WeeklyAnalysis } from '../types';
import { computeWeeklyAnalysis, formatDurationMinutes } from '../utils/analytics';
import { InteractiveProgressBar } from './InteractiveProgressBar';

interface WeeklyPatternsViewProps {
  subjects: Subject[];
  sessions: StudySession[];
  goals: GoalSettings;
  onOpenReportModal: () => void;
}

export const WeeklyPatternsView: React.FC<WeeklyPatternsViewProps> = ({
  subjects,
  sessions,
  goals,
  onOpenReportModal,
}) => {
  const [daysRange, setDaysRange] = useState<7 | 14 | 30>(7);

  const analysis: WeeklyAnalysis = computeWeeklyAnalysis(subjects, sessions, goals, daysRange);

  // Determine highest daily hours for scaling chart
  const maxDayHours = Math.max(5, ...analysis.dayPatterns.map((d) => d.hours));

  return (
    <div className="space-y-6">
      {/* Top Banner with Cycle Selector and Export PDF CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 border border-slate-200 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Weekly Study Pattern Diagnostics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Study Patterns & Habit Velocity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analyzing rhythm, peak focus windows, and subject allocation from{' '}
            <strong className="text-slate-700">{analysis.startDate}</strong> to{' '}
            <strong className="text-slate-700">{analysis.endDate}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {/* Period range selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setDaysRange(7)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                daysRange === 7 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setDaysRange(14)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                daysRange === 14 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past 14 Days
            </button>
            <button
              onClick={() => setDaysRange(30)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                daysRange === 30 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past 30 Days
            </button>
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Generate Custom Report</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Volume</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {analysis.totalHours} <span className="text-sm font-normal text-slate-500">hours</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Goal pace: <strong className="text-blue-600 tabular-nums">{analysis.weeklyGoalAchievedPct}%</strong>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Study Days</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {analysis.activeStudyDays} <span className="text-sm font-normal text-slate-500">/ {daysRange} days</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Daily avg: <strong className="text-slate-800 tabular-nums">{analysis.avgHoursPerActiveDay} hrs/day</strong>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Consistency Score</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {analysis.consistencyScore}%
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            {analysis.consistencyScore >= 75 ? 'Steady rhythm sustained' : 'Room to stabilize schedule'}
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Peak Energy Slot</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {analysis.peakTimeSlot}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Longest day: <strong className="text-slate-800">{analysis.longestDayName} ({analysis.longestDayHours}h)</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Day of Week Chart, Right = Time of Day & Subject Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 span): Daily Volume Distribution Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Daily Study Distribution ({analysis.dayPatterns.length} Days)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bar heights represent daily logged hours. Hover for subject details.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-3 h-3 rounded-xs bg-blue-600" />
              <span>Studied Hours</span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-6 pb-2">
            <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200">
              {analysis.dayPatterns.map((dp, i) => {
                const heightPct = Math.max(4, Math.min(100, (dp.hours / maxDayHours) * 100));
                const isPeak = dp.hours > 0 && dp.hours === analysis.longestDayHours;

                return (
                  <div key={dp.dateStr + i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-slate-900 text-white text-[11px] rounded py-1 px-2.5 whitespace-nowrap shadow-md">
                      <div className="font-bold">{dp.dayName} ({dp.dateStr})</div>
                      <div>{dp.hours} hrs · {dp.sessionsCount} session(s)</div>
                      {dp.subjectsStudied.length > 0 && (
                        <div className="text-[10px] text-slate-300">
                          {dp.subjectsStudied.join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Numeric value atop bar */}
                    {dp.hours > 0 && (
                      <span className="text-[10px] font-semibold text-slate-600 mb-1 tabular-nums">
                        {dp.hours}h
                      </span>
                    )}

                    {/* The bar element */}
                    <div
                      className={`w-full max-w-[42px] rounded-t-md transition-all duration-300 ${
                        isPeak
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : dp.hours > 0
                          ? 'bg-blue-500/85 hover:bg-blue-600'
                          : 'bg-slate-100'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X Axis Labels */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 pt-2 text-xs text-slate-500 font-medium">
              {analysis.dayPatterns.map((dp, i) => (
                <div key={dp.dateStr + i} className="flex-1 text-center truncate">
                  <span>{dp.shortDay}</span>
                  <span className="block text-[10px] text-slate-400">
                    {dp.dateStr.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Time of Day Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Time-of-Day Pattern
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies your prime cognitive study window.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {analysis.timeSlotPatterns.map((slot) => (
              <div key={slot.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{slot.label}</span>
                  <span className="text-slate-500 tabular-nums">
                    <strong>{slot.hours}h</strong> ({slot.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${slot.percentage}%`,
                      backgroundColor:
                        slot.key === 'morning'
                          ? '#0284c7'
                          : slot.key === 'afternoon'
                          ? '#2563eb'
                          : slot.key === 'evening'
                          ? '#7c3aed'
                          : '#475569',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Subject Distribution mini table */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
              Subject Time Share
            </h4>
            <div className="space-y-2">
              {analysis.subjectDistribution.map((sd) => (
                <div key={sd.subjectId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate max-w-[180px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sd.color }} />
                    <span className="truncate text-slate-800 font-medium">{sd.subjectName}</span>
                  </div>
                  <span className="tabular-nums text-slate-600 font-semibold">
                    {sd.hours}h ({sd.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Target Days & Velocity Check Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Target Days vs Calendar Velocity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculates pace required to complete each subject's day targets before its deadline date.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analysis.subjectVelocities.map((vel) => {
            const isCompleted = vel.status === 'completed';
            const isAtRisk = vel.status === 'at_risk';

            return (
              <div
                key={vel.subjectId}
                className={`p-4 rounded-lg border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : isAtRisk
                    ? 'bg-red-50/40 border-red-200'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {vel.subjectName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isAtRisk
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {vel.completionPercentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="my-2">
                  <InteractiveProgressBar
                    completed={vel.completedDays}
                    target={vel.targetDays}
                    color={vel.color}
                    size="sm"
                  />
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span>Target Days:</span>
                    <strong className="text-slate-900 tabular-nums">
                      {vel.completedDays} / {vel.targetDays}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Days Left to Goal:</span>
                    <strong className="text-slate-900 tabular-nums">
                      {vel.daysRemaining} days
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Calendar Window:</span>
                    <strong className="text-slate-900 tabular-nums">
                      {vel.calendarDaysUntilDeadline} days left
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span>Suggested Pace:</span>
                    <strong className="text-blue-700 tabular-nums">
                      {vel.recommendedDailyMinutes} min/day
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pattern Insights & Action Items Box */}
      <div className="bg-slate-900 text-white rounded-xl p-5 md:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Automated Weekly Pattern Diagnostic & Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 text-xs leading-relaxed">
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Key Pattern Observations:</h4>
            <ul className="space-y-2 text-slate-300">
              {analysis.keyInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold shrink-0">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Actionable Adjustments for Next Cycle:</h4>
            <ul className="space-y-2 text-slate-300">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>
            Need this in an official document format? Generate a custom report to download or print.
          </span>
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 font-semibold text-xs text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors shrink-0"
          >
            Create Custom PDF Report →
          </button>
        </div>
      </div>
    </div>
  );
};
