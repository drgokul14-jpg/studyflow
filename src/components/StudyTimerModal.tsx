import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, Clock, Pause, Play, RotateCcw, X } from 'lucide-react';
import { Subject } from '../types';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onCompleteTimerSession: (subjectId: string, durationMinutes: number, topic: string) => void;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onCompleteTimerSession,
}) => {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && isOpen) {
      interval = setInterval(() => {
        if (mode === 'pomodoro') {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              setIsRunning(false);
              try {
                confetti({ particleCount: 100, spread: 80 });
              } catch {}
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchSeconds((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setSecondsLeft(25 * 60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  const handleSetPomodoroMinutes = (minutes: number) => {
    setIsRunning(false);
    setSecondsLeft(minutes * 60);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSession = () => {
    const minutesLogged =
      mode === 'pomodoro'
        ? Math.max(1, Math.round((25 * 60 - secondsLeft) / 60))
        : Math.max(1, Math.round(stopwatchSeconds / 60));

    onCompleteTimerSession(
      selectedSubjectId,
      minutesLogged,
      topic.trim() || `Focus Session (${mode === 'pomodoro' ? 'Pomodoro' : 'Stopwatch'})`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden text-center">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Focus Study Timer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode Switcher */}
          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setMode('pomodoro');
                setIsRunning(false);
                setSecondsLeft(25 * 60);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                mode === 'pomodoro' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pomodoro (25m / 50m)
            </button>
            <button
              onClick={() => {
                setMode('stopwatch');
                setIsRunning(false);
                setStopwatchSeconds(0);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                mode === 'stopwatch' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open Stopwatch
            </button>
          </div>

          {/* Quick presets for Pomodoro */}
          {mode === 'pomodoro' && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleSetPomodoroMinutes(25)}
                className={`px-2.5 py-1 text-xs font-medium rounded border ${
                  secondsLeft === 25 * 60 ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600'
                }`}
              >
                25 min
              </button>
              <button
                onClick={() => handleSetPomodoroMinutes(45)}
                className={`px-2.5 py-1 text-xs font-medium rounded border ${
                  secondsLeft === 45 * 60 ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600'
                }`}
              >
                45 min
              </button>
              <button
                onClick={() => handleSetPomodoroMinutes(50)}
                className={`px-2.5 py-1 text-xs font-medium rounded border ${
                  secondsLeft === 50 * 60 ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600'
                }`}
              >
                50 min
              </button>
            </div>
          )}

          {/* Large Clock Display */}
          <div className="py-2">
            <div className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
              {mode === 'pomodoro' ? formatTime(secondsLeft) : formatTime(stopwatchSeconds)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {isRunning ? 'Session in progress...' : 'Paused'}
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-5 py-2 text-sm font-bold text-white rounded-lg flex items-center gap-2 shadow-sm transition-colors ${
                isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Subject and Topic Selection for Auto-Logging */}
          <div className="pt-4 border-t border-slate-100 text-left space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.completedDays}/{s.targetDays} days)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topic or Focus Goal (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 6 Review, Solving past exam"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Finish & Save Session Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveSession}
              className="w-full py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Finish & Save as Study Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
