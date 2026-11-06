import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  Minus,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Subject, SubjectVelocity } from '../types';
import { InteractiveProgressBar } from './InteractiveProgressBar';
import { calculateCompletionPercentage } from '../utils/analytics';

interface SubjectCardProps {
  subject: Subject;
  velocity?: SubjectVelocity;
  onUpdateCompletedDays: (subjectId: string, newCompletedDays: number) => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onLogSessionForSubject: (subject: Subject) => void;
  onToggleMilestone?: (subjectId: string, milestoneId: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  velocity,
  onUpdateCompletedDays,
  onEditSubject,
  onDeleteSubject,
  onLogSessionForSubject,
  onToggleMilestone,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const percentage = calculateCompletionPercentage(subject.completedDays, subject.targetDays);
  const daysRemaining = Math.max(0, subject.targetDays - subject.completedDays);
  const isTargetAchieved = subject.completedDays >= subject.targetDays;

  const handleStepDay = (delta: number) => {
    const nextVal = Math.max(0, Math.min(subject.targetDays, subject.completedDays + delta));
    if (nextVal !== subject.completedDays) {
      onUpdateCompletedDays(subject.id, nextVal);
      if (nextVal >= subject.targetDays && !isTargetAchieved) {
        // Trigger celebratory confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }
  };

  const handleProgressBarClick = (newDays: number) => {
    onUpdateCompletedDays(subject.id, newDays);
    if (newDays >= subject.targetDays && !isTargetAchieved) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  // Status badge styling
  const getStatusBadge = () => {
    if (isTargetAchieved) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Target Achieved
        </span>
      );
    }
    if (velocity?.status === 'at_risk') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
          Behind Pace
        </span>
      );
    }
    if (velocity?.status === 'ahead') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
          Ahead of Schedule
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
        On Track
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all hover:border-slate-300/90 group">
      {/* Top row: Subject Title, Code, Status & Actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div
            className="w-3.5 h-11 rounded-full shrink-0 shadow-2xs"
            style={{ backgroundColor: subject.color }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-900 transition-colors">
                {subject.name}
              </h3>
              {subject.code && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {subject.code}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Target: <strong className="text-slate-800">{subject.targetDays} Days</strong></span>
              <span aria-hidden="true">·</span>
              <span>Total Goal: <strong className="text-slate-800">{subject.targetHours} hrs</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {getStatusBadge()}
          <button
            onClick={() => onEditSubject(subject)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title="Edit Subject"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteSubject(subject.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Subject"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target Days & Interactive Progress Bar Section */}
      <div className="bg-gradient-to-b from-slate-50/90 to-slate-50/40 border border-slate-100 rounded-xl p-4 my-3">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {subject.completedDays}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              / {subject.targetDays} days completed
            </span>
            <span className="text-xs text-slate-400 ml-1">
              ({daysRemaining > 0 ? `${daysRemaining} days left` : 'Goal achieved!'})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="text-sm font-extrabold px-2.5 py-0.5 rounded-md tabular-nums border shadow-2xs"
              style={{
                color: subject.color,
                backgroundColor: `${subject.color}15`,
                borderColor: `${subject.color}35`,
              }}
            >
              {percentage}%
            </span>
          </div>
        </div>

        {/* The interactive Progress Bar */}
        <InteractiveProgressBar
          completed={subject.completedDays}
          target={subject.targetDays}
          color={subject.color}
          size="md"
          interactive={true}
          onUpdateCompleted={handleProgressBarClick}
        />

        {/* Quick Stepper Buttons for Day Targets */}
        <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-200/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-[11px] text-slate-400 font-medium">Scrub Days:</span>
            <button
              onClick={() => handleStepDay(-1)}
              disabled={subject.completedDays <= 0}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs"
              title="Decrement 1 day"
            >
              <Minus className="w-3 h-3" />
              <span>-1d</span>
            </button>
            <button
              onClick={() => handleStepDay(1)}
              disabled={subject.completedDays >= subject.targetDays}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-40 transition-all shadow-xs active:scale-95"
              title="Mark today complete (+1 day)"
            >
              <Plus className="w-3 h-3" />
              <span>+1 Day Target</span>
            </button>
          </div>

          <button
            onClick={() => onLogSessionForSubject(subject)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
          >
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Log Study</span>
          </button>
        </div>
      </div>

      {/* Auxiliary Metrics Bar: Hours & Deadline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 py-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Hours: <strong className="tabular-nums text-slate-900">{subject.completedHours}h</strong> / {subject.targetHours}h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Deadline: <strong className="text-slate-900">{subject.deadlineDate}</strong></span>
        </div>
        <div className="col-span-2 sm:col-span-1 text-left sm:text-right text-slate-500">
          <span>Daily Pace: <strong className="text-slate-800">{subject.dailyTargetMinutes} min/day</strong></span>
        </div>
      </div>

      {/* Collapsible syllabus milestones / notes */}
      {((subject.milestones && subject.milestones.length > 0) || subject.notes) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <span>
              {subject.milestones?.length ? `${subject.milestones.length} Key Milestones & Syllabus Notes` : 'Syllabus Notes'}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="pt-2.5 space-y-2 text-xs">
              {subject.notes && (
                <p className="text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">
                  {subject.notes}
                </p>
              )}

              {subject.milestones && subject.milestones.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Milestone Day Targets
                  </span>
                  {subject.milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onToggleMilestone && onToggleMilestone(subject.id, m.id)}
                      className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                        m.completed ? 'bg-emerald-50 text-emerald-900 line-through opacity-70' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={m.completed}
                          onChange={() => onToggleMilestone && onToggleMilestone(subject.id, m.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{m.title}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                        Day {m.targetDay}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
