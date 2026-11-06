import React from 'react';
import { GoalSettings, StudySession, Subject, WeeklyAnalysis } from '../types';
import { formatDurationMinutes } from '../utils/analytics';
import { InteractiveProgressBar } from './InteractiveProgressBar';

interface PrintReportViewProps {
  subjects: Subject[];
  sessions: StudySession[];
  goals: GoalSettings;
  analysis: WeeklyAnalysis;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  subjects,
  sessions,
  goals,
  analysis,
}) => {
  return (
    <div className="hidden print:block p-8 bg-white text-slate-900 font-sans">
      {/* Print Document Header */}
      <div className="border-b-2 border-blue-600 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              STUDYFLOW · ACADEMIC PROGRESS & PATTERN REPORT
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Student: <strong className="text-slate-800">{goals.studentName}</strong> · Term: {goals.academicTerm}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Generated: {new Date().toLocaleDateString()}</div>
            <div>Primary Goal: <strong className="text-slate-800">{goals.primaryGoalTitle}</strong></div>
            <div>Target Date: {goals.primaryTargetDate}</div>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="border border-slate-200 p-3 rounded">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Weekly Study Volume</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{analysis.totalHours} hrs</div>
          <div className="text-[10px] text-slate-500">{analysis.weeklyGoalAchievedPct}% of weekly target</div>
        </div>
        <div className="border border-slate-200 p-3 rounded">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Study Days</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{analysis.activeStudyDays} / {goals.overallTargetDaysPerWeek} days</div>
          <div className="text-[10px] text-slate-500">{analysis.avgHoursPerActiveDay} hrs/day avg</div>
        </div>
        <div className="border border-slate-200 p-3 rounded">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Consistency Score</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{analysis.consistencyScore}%</div>
          <div className="text-[10px] text-slate-500">Rhythm index</div>
        </div>
        <div className="border border-slate-200 p-3 rounded">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Peak Study Window</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{analysis.peakTimeSlot}</div>
          <div className="text-[10px] text-slate-500">Highest focus volume</div>
        </div>
      </div>

      {/* Subject Targets & Completion Percentages */}
      <div className="mb-6 print-break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">
          1. Subject Targets & Completion Percentages
        </h2>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-2">Subject</th>
              <th className="py-2">Target Days</th>
              <th className="py-2">Completion Bar & %</th>
              <th className="py-2">Hours Logged</th>
              <th className="py-2">Deadline</th>
              <th className="py-2 text-right">Pace Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map((s) => {
              const pct = Math.round((s.completedDays / s.targetDays) * 100);
              const vel = analysis.subjectVelocities.find((v) => v.subjectId === s.id);
              return (
                <tr key={s.id} className="py-2">
                  <td className="py-2.5 font-bold text-slate-900">{s.name}</td>
                  <td className="py-2.5">{s.completedDays} / {s.targetDays} days</td>
                  <td className="py-2.5 w-48">
                    <div className="flex items-center gap-2">
                      <div className="w-28 h-2.5 bg-slate-100 rounded border border-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-bold tabular-nums">{pct}%</span>
                    </div>
                  </td>
                  <td className="py-2.5">{s.completedHours}h / {s.targetHours}h</td>
                  <td className="py-2.5 text-slate-600">{s.deadlineDate}</td>
                  <td className="py-2.5 text-right font-semibold text-slate-800">
                    {vel?.statusText || 'On Track'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Weekly Patterns Breakdown */}
      <div className="mb-6 grid grid-cols-2 gap-4 print-break-inside-avoid">
        <div className="border border-slate-200 p-3 rounded">
          <h3 className="text-xs font-bold text-slate-800 uppercase mb-2">Daily Study Hours (Past 7 Days)</h3>
          <div className="space-y-1.5 text-xs">
            {analysis.dayPatterns.map((dp) => (
              <div key={dp.dateStr} className="flex justify-between items-center">
                <span className="text-slate-600">{dp.dayName} ({dp.shortDay})</span>
                <span className="font-bold tabular-nums">{dp.hours} hrs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-slate-200 p-3 rounded">
          <h3 className="text-xs font-bold text-slate-800 uppercase mb-2">Time-of-Day Pattern</h3>
          <div className="space-y-1.5 text-xs">
            {analysis.timeSlotPatterns.map((slot) => (
              <div key={slot.key} className="flex justify-between items-center">
                <span className="text-slate-600">{slot.label}</span>
                <span className="font-bold tabular-nums">{slot.hours} hrs ({slot.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Insights & Recommendations */}
      <div className="border border-slate-200 p-4 rounded mb-6 print-break-inside-avoid">
        <h3 className="text-xs font-bold uppercase text-slate-800 mb-2">Pattern Observations & Recommendations</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Key Insights:</h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              {analysis.keyInsights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Recommendations:</h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="print-break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">
          Recent Study Sessions Log
        </h2>
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-1.5">Date</th>
              <th className="py-1.5">Subject</th>
              <th className="py-1.5">Window</th>
              <th className="py-1.5">Duration</th>
              <th className="py-1.5">Topics Covered</th>
              <th className="py-1.5 text-right">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.slice(0, 10).map((sess) => (
              <tr key={sess.id}>
                <td className="py-1.5">{sess.date}</td>
                <td className="py-1.5 font-semibold text-slate-900">{sess.subjectName}</td>
                <td className="py-1.5 capitalize text-slate-600">{sess.timeOfDay}</td>
                <td className="py-1.5 font-bold tabular-nums">{formatDurationMinutes(sess.durationMinutes)}</td>
                <td className="py-1.5 text-slate-700">{sess.topicsCovered}</td>
                <td className="py-1.5 text-right tabular-nums">{sess.productivityRating}/5</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
