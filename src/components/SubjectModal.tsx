import React, { useEffect, useState } from 'react';
import { Calendar, Check, Target, X } from 'lucide-react';
import { Subject } from '../types';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjectData: Partial<Subject>) => void;
  initialSubject?: Subject | null;
}

const PALETTE = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#d97706', // Amber
  '#dc2626', // Red
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#db2777', // Pink
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [targetDays, setTargetDays] = useState(30);
  const [completedDays, setCompletedDays] = useState(0);
  const [targetHours, setTargetHours] = useState(45);
  const [completedHours, setCompletedHours] = useState(0);
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(60);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialSubject) {
      setName(initialSubject.name);
      setCode(initialSubject.code || '');
      setColor(initialSubject.color || PALETTE[0]);
      setTargetDays(initialSubject.targetDays || 30);
      setCompletedDays(initialSubject.completedDays || 0);
      setTargetHours(initialSubject.targetHours || 40);
      setCompletedHours(initialSubject.completedHours || 0);
      setDailyTargetMinutes(initialSubject.dailyTargetMinutes || 60);
      setDeadlineDate(initialSubject.deadlineDate || '');
      setNotes(initialSubject.notes || '');
    } else {
      setName('');
      setCode('');
      setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      setTargetDays(30);
      setCompletedDays(0);
      setTargetHours(45);
      setCompletedHours(0);
      setDailyTargetMinutes(60);
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 30);
      setDeadlineDate(defaultDeadline.toISOString().split('T')[0]);
      setNotes('');
    }
  }, [initialSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      code: code.trim() || undefined,
      color,
      targetDays: Math.max(1, Number(targetDays) || 1),
      completedDays: Math.max(0, Math.min(Number(targetDays), Number(completedDays) || 0)),
      targetHours: Math.max(1, Number(targetHours) || 1),
      completedHours: Math.max(0, Number(completedHours) || 0),
      dailyTargetMinutes: Math.max(10, Number(dailyTargetMinutes) || 60),
      deadlineDate: deadlineDate || new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              {initialSubject ? 'Edit Subject & Target Days' : 'Create New Subject Target'}
            </h2>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Organic Chemistry II, Algorithms"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Code (Optional)
              </label>
              <input
                type="text"
                placeholder="CHEM-302"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Color selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject Color Accent
            </label>
            <div className="flex items-center gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Target Days & Current Completed Days */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">
                Number of Days Target *
              </label>
              <input
                type="number"
                min="1"
                max="365"
                required
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-blue-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              />
              <span className="text-[10px] text-blue-700">Total days goal to complete syllabus</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">
                Days Completed So Far
              </label>
              <input
                type="number"
                min="0"
                max={targetDays}
                value={completedDays}
                onChange={(e) => setCompletedDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-blue-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              />
              <span className="text-[10px] text-blue-700">
                Completion: {targetDays > 0 ? Math.round((completedDays / targetDays) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Target Hours & Target Deadline Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Target Hours
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={targetHours}
                onChange={(e) => setTargetHours(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Deadline Date
              </label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Planned Daily Study Time (Minutes/Day)
            </label>
            <input
              type="number"
              min="15"
              step="15"
              value={dailyTargetMinutes}
              onChange={(e) => setDailyTargetMinutes(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Syllabus Objectives & Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Key topics, exam scope, textbook chapters..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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
              {initialSubject ? 'Save Changes' : 'Create Subject Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
