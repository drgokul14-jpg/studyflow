import React from 'react';
import { Calendar, Flame, Sparkles } from 'lucide-react';
import { StudySession } from '../types';

interface StudyHeatmapProps {
  sessions: StudySession[];
  currentStreak: number;
  longestStreak: number;
  daysCount?: number;
}

export const StudyHeatmap: React.FC<StudyHeatmapProps> = ({
  sessions,
  currentStreak,
  longestStreak,
  daysCount = 28, // 4 weeks
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate days array from oldest to newest
  const days: Array<{
    dateStr: string;
    dayName: string;
    shortDay: string;
    dayNum: number;
    hours: number;
    minutes: number;
    sessionsCount: number;
    subjects: string[];
  }> = [];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];

    const daySessions = sessions.filter((s) => s.date === iso);
    const dayMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const dayHours = Math.round((dayMinutes / 60) * 10) / 10;
    const subjects = Array.from(new Set(daySessions.map((s) => s.subjectName)));

    days.push({
      dateStr: iso,
      dayName: dayNames[d.getDay()],
      shortDay: dayNames[d.getDay()][0],
      dayNum: d.getDate(),
      hours: dayHours,
      minutes: dayMinutes,
      sessionsCount: daySessions.length,
      subjects,
    });
  }

  // Get intensity color
  const getCellColor = (minutes: number) => {
    if (minutes === 0) return 'bg-slate-100 hover:bg-slate-200 border-slate-200/80';
    if (minutes < 60) return 'bg-emerald-200 hover:bg-emerald-300 border-emerald-300 text-emerald-900';
    if (minutes < 120) return 'bg-emerald-400 hover:bg-emerald-500 border-emerald-500 text-white';
    if (minutes < 240) return 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white';
    return 'bg-emerald-700 hover:bg-emerald-800 border-emerald-800 text-white shadow-xs';
  };

  const totalStudyMinutes = days.reduce((sum, d) => sum + d.minutes, 0);
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
  const activeDaysCount = days.filter((d) => d.minutes > 0).length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Consistency Habit Grid · Past {daysCount} Days</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Daily Study Intensity Heatmap
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hover over any cell to see study logs, duration, and subjects covered.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0">
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-center gap-1.5 font-semibold">
            <span>🔥</span>
            <span>{currentStreak} Day Current Streak</span>
            <span className="text-amber-600 font-normal text-[11px]">(Best: {longestStreak}d)</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-500 text-[11px]">
            <span>Less</span>
            <span className="w-3 h-3 rounded-xs bg-slate-100 border border-slate-200" />
            <span className="w-3 h-3 rounded-xs bg-emerald-200" />
            <span className="w-3 h-3 rounded-xs bg-emerald-400" />
            <span className="w-3 h-3 rounded-xs bg-emerald-600" />
            <span className="w-3 h-3 rounded-xs bg-emerald-700" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Grid of Days */}
      <div className="pt-2 overflow-x-auto pb-1">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[500px]">
          {days.map((d, i) => (
            <div
              key={d.dateStr}
              className="relative group cursor-pointer"
            >
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md border flex items-center justify-center text-[10px] font-bold transition-all transform group-hover:scale-110 ${getCellColor(
                  d.minutes
                )}`}
              >
                {d.dayNum}
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                <div className="bg-slate-900 text-white text-[11px] rounded-lg py-1.5 px-3 whitespace-nowrap shadow-xl">
                  <div className="font-bold">{d.dateStr} ({d.dayName})</div>
                  <div className="text-emerald-400 font-semibold">{d.hours} hours logged · {d.sessionsCount} session(s)</div>
                  {d.subjects.length > 0 && (
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      {d.subjects.join(', ')}
                    </div>
                  )}
                  {d.minutes === 0 && (
                    <div className="text-[10px] text-slate-400">Rest day / No sessions logged</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Summary Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div>
          Studied <strong className="text-slate-800 tabular-nums">{activeDaysCount}</strong> of the last{' '}
          <strong className="text-slate-800">{daysCount}</strong> days ({Math.round((activeDaysCount / daysCount) * 100)}% active rate).
        </div>
        <div>
          Total 28-day volume: <strong className="text-slate-900 tabular-nums">{totalStudyHours} hours</strong>.
        </div>
      </div>
    </div>
  );
};
