import React, { useState } from 'react';
import { Clock, Star, X } from 'lucide-react';
import { StudySession, Subject, TimeOfDay } from '../types';

interface StudySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (sessionData: Omit<StudySession, 'id' | 'createdAt'>) => void;
  subjects: Subject[];
  defaultSubjectId?: string;
}

const PRESET_DURATIONS = [25, 45, 60, 90, 120];

export const StudySessionModal: React.FC<StudySessionModalProps> = ({
  isOpen,
  onClose,
  onSaveSession,
  subjects,
  defaultSubjectId,
}) => {
  const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('afternoon');
  const [topicsCovered, setTopicsCovered] = useState('');
  const [notes, setNotes] = useState('');
  const [productivityRating, setProductivityRating] = useState(4);
  const [countedTowardTargetDay, setCountedTowardTargetDay] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSubj = subjects.find((s) => s.id === subjectId);
    if (!selectedSubj || durationMinutes <= 0) return;

    onSaveSession({
      subjectId,
      subjectName: selectedSubj.name,
      date,
      durationMinutes: Number(durationMinutes),
      timeOfDay,
      topicsCovered: topicsCovered.trim() || 'General syllabus review and problem sets',
      notes: notes.trim() || undefined,
      productivityRating,
      countedTowardTargetDay,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Log Study Session</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Subject *
            </label>
            <select
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.completedDays}/{s.targetDays} days completed)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Study Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time of Day
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="morning">Morning (6am - 12pm)</option>
                <option value="afternoon">Afternoon (12pm - 5pm)</option>
                <option value="evening">Evening (5pm - 9pm)</option>
                <option value="night">Night (9pm - 2am)</option>
              </select>
            </div>
          </div>

          {/* Duration with quick presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Duration (Minutes)
              </label>
              <span className="text-xs font-bold text-blue-600 tabular-nums">
                {durationMinutes} min ({Math.round((durationMinutes / 60) * 10) / 10} hrs)
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-2">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDurationMinutes(preset)}
                  className={`flex-1 py-1 text-xs font-medium rounded border transition-colors ${
                    durationMinutes === preset
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset}m
                </button>
              ))}
            </div>

            <input
              type="number"
              min="5"
              step="5"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Topics Covered *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 4 Practice questions, Dynamic programming memoization"
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Productivity rating 1-5 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Focus & Productivity Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setProductivityRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= productivityRating
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-slate-500 ml-2">
                {productivityRating === 5
                  ? 'Deep Flow'
                  : productivityRating === 4
                  ? 'High Focus'
                  : productivityRating === 3
                  ? 'Moderate Focus'
                  : 'Distracted'}
              </span>
            </div>
          </div>

          {/* Target Day Increment Checkbox */}
          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={countedTowardTargetDay}
                onChange={(e) => setCountedTowardTargetDay(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-blue-900 block">
                  Increment Target Day (+1 Day Completed)
                </span>
                <span className="text-[11px] text-blue-700 block">
                  Automatically progresses this subject's number of days target and updates the interactive completion percentage.
                </span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
            >
              Save Study Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
