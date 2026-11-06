import React from 'react';
import { Calendar, CheckCircle2, Clock, Flame, Hourglass, Sliders, Sparkles, Target, TrendingUp } from 'lucide-react';
import { GoalSettings, Subject, WeeklyAnalysis } from '../types';
import { InteractiveProgressBar } from './InteractiveProgressBar';
import { getDaysDifference } from '../utils/analytics';

interface GoalOverviewProps {
  goals: GoalSettings;
  subjects: Subject[];
  analysis: WeeklyAnalysis;
  currentStreak: number;
  longestStreak: number;
  onEditGoals: () => void;
}

export const GoalOverview: React.FC<GoalOverviewProps> = ({
  goals,
  subjects,
  analysis,
  currentStreak,
  longestStreak,
  onEditGoals,
}) => {
  const daysUntilGoal = Math.max(0, getDaysDifference(goals.primaryTargetDate));

  // Compute total target days across all subjects
  const totalTargetDays = subjects.reduce((sum, s) => sum + s.targetDays, 0);
  const totalCompletedDays = subjects.reduce((sum, s) => sum + s.completedDays, 0);
  const overallDayCompletionPct = totalTargetDays > 0 ? Math.round((totalCompletedDays / totalTargetDays) * 100) : 0;

  // Compute total target hours across all subjects
  const totalTargetHours = subjects.reduce((sum, s) => sum + s.targetHours, 0);
  const totalCompletedHours = Math.round(subjects.reduce((sum, s) => sum + s.completedHours, 0) * 10) / 10;
  const overallHoursPct = totalTargetHours > 0 ? Math.round((totalCompletedHours / totalTargetHours) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden">
      {/* Subtle top decorative ambient mesh */}
      <div className="absolute top-0 right-0 w-96 h-32 bg-gradient-to-bl from-blue-100/50 via-indigo-50/30 to-transparent pointer-events-none rounded-tr-2xl" />

      {/* Header bar with Goal info and Edit button */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
            <span>{goals.academicTerm}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              <span>Target Milestone</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            {goals.primaryGoalTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1.5">
            <span>Student: <strong className="text-slate-800">{goals.studentName}</strong></span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md font-medium border border-blue-100">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Target Date: <strong>{goals.primaryTargetDate}</strong>
            </span>
            <span className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-medium border border-amber-200/60">
              <Hourglass className="w-3.5 h-3.5 text-amber-600" />
              <strong className="tabular-nums">{daysUntilGoal}</strong> days left
            </span>
          </div>
        </div>

        <button
          onClick={onEditGoals}
          className="inline-flex items-center gap-1.5 self-start sm:self-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all shadow-2xs hover:border-slate-300"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span>Edit Goals</span>
        </button>
      </div>

      {/* KPI Stats Grid with elevated cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5 pb-5 border-b border-slate-100">
        {/* KPI 1: Aggregate Day Targets */}
        <div className="p-4 bg-gradient-to-b from-blue-50/40 to-slate-50/70 border border-blue-100/80 rounded-xl hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Total Day Targets</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {totalCompletedDays} <span className="text-xs font-semibold text-slate-500">/ {totalTargetDays} days</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Overall Progress</span>
            <strong className="text-blue-600 font-bold tabular-nums">{overallDayCompletionPct}%</strong>
          </div>
          <div className="mt-2.5">
            <InteractiveProgressBar
              completed={totalCompletedDays}
              target={totalTargetDays}
              color="#2563eb"
              size="sm"
            />
          </div>
        </div>

        {/* KPI 2: Weekly Hours vs Target */}
        <div className="p-4 bg-gradient-to-b from-emerald-50/40 to-slate-50/70 border border-emerald-100/80 rounded-xl hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Weekly Study Hours</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {analysis.totalHours} <span className="text-xs font-semibold text-slate-500">/ {goals.overallTargetHoursPerWeek} hrs</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Weekly Target Pace</span>
            <strong className="text-emerald-700 font-bold tabular-nums">{analysis.weeklyGoalAchievedPct}%</strong>
          </div>
          <div className="mt-2.5">
            <InteractiveProgressBar
              completed={analysis.totalHours}
              target={goals.overallTargetHoursPerWeek}
              color="#059669"
              size="sm"
            />
          </div>
        </div>

        {/* KPI 3: Weekly Consistency Index */}
        <div className="p-4 bg-gradient-to-b from-indigo-50/40 to-slate-50/70 border border-indigo-100/80 rounded-xl hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Weekly Consistency</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {analysis.consistencyScore}%
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Active Days Logged</span>
            <span className="tabular-nums font-bold text-slate-800">{analysis.activeStudyDays} of {goals.overallTargetDaysPerWeek} days</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {analysis.consistencyScore >= 80 ? '⚡ Peak study momentum' : 'Schedule steady focus blocks'}
          </div>
        </div>

        {/* KPI 4: Study Streak */}
        <div className="p-4 bg-gradient-to-b from-amber-50/40 to-slate-50/70 border border-amber-100/80 rounded-xl hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 tabular-nums flex items-baseline gap-1">
            {currentStreak} <span className="text-xs font-semibold text-slate-500">days active</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Longest Streak</span>
            <span className="tabular-nums font-bold text-slate-800">{longestStreak} days</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700/80 font-medium">
            {currentStreak > 0 ? '🔥 Keep the streak burning today!' : 'Log a session to start your streak'}
          </div>
        </div>
      </div>

      {/* Target Days Summary Banner */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
          <span>Tracking <strong>{subjects.length} subjects</strong> with active day targets</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Cumulative Study: <strong className="tabular-nums text-slate-900">{totalCompletedHours} hrs</strong> logged</span>
        </div>
        <div className="text-slate-500">
          Daily Study Target: <strong className="text-slate-900">{goals.dailyTargetHours} hours/day</strong>
        </div>
      </div>
    </div>
  );
};
