import React from 'react';
import { BookOpen, Calendar, Clock, FileDown, Plus, Sparkles } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'subjects' | 'patterns' | 'sessions';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  onOpenTimerModal: () => void;
  onOpenReportModal: () => void;
  onOpenChatbot: () => void;
  currentStreak: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenLogModal,
  onOpenTimerModal,
  onOpenReportModal,
  onOpenChatbot,
  currentStreak,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                StudyFlow
              </span>
            </div>
          </button>

          {/* Quick Streak indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/70 rounded-md text-xs font-semibold text-amber-800 tabular-nums">
            <span className="text-amber-600">⚡</span>
            <span>{currentStreak} Day Streak</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('subjects')}
            className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'subjects'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Subjects & Day Targets
          </button>
          <button
            onClick={() => onSelectTab('patterns')}
            className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'patterns'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Weekly Patterns
          </button>
          <button
            onClick={() => onSelectTab('sessions')}
            className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'sessions'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Session History
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenChatbot}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            title="Ask AI Study Mentor"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Coach</span>
          </button>

          <button
            onClick={onOpenTimerModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            title="Focus Timer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Focus Timer</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={onOpenLogModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Study</span>
          </button>
        </div>
      </div>

      {/* Mobile subnavigation bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-1.5 border-t border-slate-100 bg-slate-50/50 text-xs">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`py-1 px-2.5 rounded ${
            activeTab === 'dashboard' ? 'font-bold text-blue-600' : 'text-slate-600'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('subjects')}
          className={`py-1 px-2.5 rounded ${
            activeTab === 'subjects' ? 'font-bold text-blue-600' : 'text-slate-600'
          }`}
        >
          Subjects
        </button>
        <button
          onClick={() => onSelectTab('patterns')}
          className={`py-1 px-2.5 rounded ${
            activeTab === 'patterns' ? 'font-bold text-blue-600' : 'text-slate-600'
          }`}
        >
          Patterns
        </button>
        <button
          onClick={() => onSelectTab('sessions')}
          className={`py-1 px-2.5 rounded ${
            activeTab === 'sessions' ? 'font-bold text-blue-600' : 'text-slate-600'
          }`}
        >
          Sessions
        </button>
      </div>
    </header>
  );
};
