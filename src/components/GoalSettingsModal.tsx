import React, { useState } from 'react';
import { Sliders, X } from 'lucide-react';
import { GoalSettings } from '../types';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: GoalSettings;
  onSaveGoals: (updated: GoalSettings) => void;
}

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({
  isOpen,
  onClose,
  goals,
  onSaveGoals,
}) => {
  const [studentName, setStudentName] = useState(goals.studentName);
  const [academicTerm, setAcademicTerm] = useState(goals.academicTerm);
  const [primaryGoalTitle, setPrimaryGoalTitle] = useState(goals.primaryGoalTitle);
  const [primaryTargetDate, setPrimaryTargetDate] = useState(goals.primaryTargetDate);
  const [dailyTargetHours, setDailyTargetHours] = useState(goals.dailyTargetHours);
  const [overallTargetDaysPerWeek, setOverallTargetDaysPerWeek] = useState(goals.overallTargetDaysPerWeek);
  const [overallTargetHoursPerWeek, setOverallTargetHoursPerWeek] = useState(goals.overallTargetHoursPerWeek);

  // Sync state when modal is opened or goals change
  React.useEffect(() => {
    if (isOpen) {
      setStudentName(goals.studentName);
      setAcademicTerm(goals.academicTerm);
      setPrimaryGoalTitle(goals.primaryGoalTitle);
      setPrimaryTargetDate(goals.primaryTargetDate);
      setDailyTargetHours(goals.dailyTargetHours);
      setOverallTargetDaysPerWeek(goals.overallTargetDaysPerWeek);
      setOverallTargetHoursPerWeek(goals.overallTargetHoursPerWeek);
    }
  }, [isOpen, goals]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoals({
      studentName: studentName.trim() || 'Student',
      academicTerm: academicTerm.trim() || 'Academic Term',
      primaryGoalTitle: primaryGoalTitle.trim() || 'Study Milestone',
      primaryTargetDate: primaryTargetDate || new Date().toISOString().split('T')[0],
      dailyTargetHours: Math.max(0.5, Number(dailyTargetHours) || 4),
      overallTargetDaysPerWeek: Math.min(7, Math.max(1, Number(overallTargetDaysPerWeek) || 6)),
      overallTargetHoursPerWeek: Math.max(1, Number(overallTargetHoursPerWeek) || 24),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Custom Study Goals Configuration</h2>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Name
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Term / Season
              </label>
              <input
                type="text"
                value={academicTerm}
                onChange={(e) => setAcademicTerm(e.target.value)}
                placeholder="e.g. Fall 2026, MCAT Prep"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Academic Goal Title
            </label>
            <input
              type="text"
              required
              value={primaryGoalTitle}
              onChange={(e) => setPrimaryGoalTitle(e.target.value)}
              placeholder="e.g. Target Mastery & Semester Finals Preparation"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Completion / Exam Date
            </label>
            <input
              type="date"
              required
              value={primaryTargetDate}
              onChange={(e) => setPrimaryTargetDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Daily Hours Target
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                max="16"
                value={dailyTargetHours}
                onChange={(e) => setDailyTargetHours(Number(e.target.value))}
                className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Days / Week Goal
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={overallTargetDaysPerWeek}
                onChange={(e) => setOverallTargetDaysPerWeek(Number(e.target.value))}
                className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Weekly Hours Goal
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={overallTargetHoursPerWeek}
                onChange={(e) => setOverallTargetHoursPerWeek(Number(e.target.value))}
                className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded font-semibold text-slate-900"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
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
              Save Custom Goals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
