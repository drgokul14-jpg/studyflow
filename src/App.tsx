import React, { useEffect, useState } from 'react';
import {
  ActiveTab,
  Header,
} from './components/Header';
import { GoalOverview } from './components/GoalOverview';
import { SubjectList } from './components/SubjectList';
import { SubjectCard } from './components/SubjectCard';
import { WeeklyPatternsView } from './components/WeeklyPatternsView';
import { SessionHistoryView } from './components/SessionHistoryView';
import { SubjectModal } from './components/SubjectModal';
import { StudySessionModal } from './components/StudySessionModal';
import { StudyTimerModal } from './components/StudyTimerModal';
import { ReportBuilderModal } from './components/ReportBuilderModal';
import { GoalSettingsModal } from './components/GoalSettingsModal';
import { PrintReportView } from './components/PrintReportView';
import { StudyHeatmap } from './components/StudyHeatmap';
import { GeminiChatbot } from './components/GeminiChatbot';
import { GoalSettings, StudySession, Subject } from './types';
import {
  computeStreak,
  computeSubjectVelocities,
  computeWeeklyAnalysis,
  formatDurationMinutes,
} from './utils/analytics';
import {
  loadStoredGoals,
  loadStoredSessions,
  loadStoredSubjects,
  resetToInitialDemoData,
  saveStoredGoals,
  saveStoredSessions,
  saveStoredSubjects,
} from './utils/storage';
import { ArrowRight, BarChart3, Clock, Plus, RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>(loadStoredSubjects);
  const [sessions, setSessions] = useState<StudySession[]>(loadStoredSessions);
  const [goals, setGoals] = useState<GoalSettings>(loadStoredGoals);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [defaultLogSubjectId, setDefaultLogSubjectId] = useState<string | undefined>();

  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveStoredSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveStoredSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveStoredGoals(goals);
  }, [goals]);

  // Derived metrics
  const streakInfo = computeStreak(sessions);
  const velocities = computeSubjectVelocities(subjects, sessions);
  const analysis = computeWeeklyAnalysis(subjects, sessions, goals, 7);

  // Handlers
  const handleUpdateCompletedDays = (subjectId: string, newCompletedDays: number) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjectId) {
          return {
            ...s,
            completedDays: Math.max(0, Math.min(s.targetDays, newCompletedDays)),
          };
        }
        return s;
      })
    );
  };

  const handleSaveSubject = (data: Partial<Subject>) => {
    if (editingSubject) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === editingSubject.id ? ({ ...s, ...data } as Subject) : s))
      );
    } else {
      const newSubject: Subject = {
        id: `subj-${Date.now()}`,
        name: data.name || 'New Subject',
        code: data.code,
        color: data.color || '#2563eb',
        targetDays: data.targetDays || 30,
        completedDays: data.completedDays || 0,
        targetHours: data.targetHours || 40,
        completedHours: data.completedHours || 0,
        dailyTargetMinutes: data.dailyTargetMinutes || 60,
        startDate: new Date().toISOString().split('T')[0],
        deadlineDate: data.deadlineDate || new Date().toISOString().split('T')[0],
        notes: data.notes,
        milestones: [],
      };
      setSubjects((prev) => [newSubject, ...prev]);
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject target?')) {
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    }
  };

  const handleSaveSession = (sessionData: Omit<StudySession, 'id' | 'createdAt'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);

    // Update subject hours and increment target day if requested
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === sessionData.subjectId) {
          const addedHours = Math.round((sessionData.durationMinutes / 60) * 10) / 10;
          const nextCompletedDays = sessionData.countedTowardTargetDay
            ? Math.min(s.targetDays, s.completedDays + 1)
            : s.completedDays;

          return {
            ...s,
            completedHours: Math.round((s.completedHours + addedHours) * 10) / 10,
            completedDays: nextCompletedDays,
          };
        }
        return s;
      })
    );
  };

  const handleCompleteTimerSession = (
    subjectId: string,
    durationMinutes: number,
    topic: string
  ) => {
    const subj = subjects.find((s) => s.id === subjectId);
    if (!subj) return;

    handleSaveSession({
      subjectId,
      subjectName: subj.name,
      date: new Date().toISOString().split('T')[0],
      durationMinutes,
      timeOfDay: 'afternoon',
      topicsCovered: topic,
      productivityRating: 5,
      countedTowardTargetDay: true,
    });
  };

  const handleToggleMilestone = (subjectId: string, milestoneId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjectId && s.milestones) {
          return {
            ...s,
            milestones: s.milestones.map((m) =>
              m.id === milestoneId ? { ...m, completed: !m.completed } : m
            ),
          };
        }
        return s;
      })
    );
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleResetData = () => {
    if (window.confirm('Reset all subjects, sessions, and goals back to default demo state?')) {
      const reset = resetToInitialDemoData();
      setSubjects(reset.subjects);
      setSessions(reset.sessions);
      setGoals(reset.goals);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLogModal={() => {
          setDefaultLogSubjectId(subjects[0]?.id);
          setIsLogModalOpen(true);
        }}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        currentStreak={streakInfo.currentStreak}
      />

      {/* Main Content Viewport */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Custom Goals Overview & KPI Bar */}
            <GoalOverview
              goals={goals}
              subjects={subjects}
              analysis={analysis}
              currentStreak={streakInfo.currentStreak}
              longestStreak={streakInfo.longestStreak}
              onEditGoals={() => setIsGoalModalOpen(true)}
            />

            {/* Daily Study Intensity Heatmap Grid */}
            <StudyHeatmap
              sessions={sessions}
              currentStreak={streakInfo.currentStreak}
              longestStreak={streakInfo.longestStreak}
              daysCount={28}
            />

            {/* Subject Target Days & Interactive Progress Bars Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Subject Number of Days Targets
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track completion percentages and interactively adjust daily milestones.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingSubject(null);
                      setIsSubjectModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Subject</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('subjects')}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>View all ({subjects.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.slice(0, 4).map((subj) => {
                  const vel = velocities.find((v) => v.subjectId === subj.id);
                  return (
                    <SubjectCard
                      key={subj.id}
                      subject={subj}
                      velocity={vel}
                      onUpdateCompletedDays={handleUpdateCompletedDays}
                      onEditSubject={(s) => {
                        setEditingSubject(s);
                        setIsSubjectModalOpen(true);
                      }}
                      onDeleteSubject={handleDeleteSubject}
                      onLogSessionForSubject={(s) => {
                        setDefaultLogSubjectId(s.id);
                        setIsLogModalOpen(true);
                      }}
                      onToggleMilestone={handleToggleMilestone}
                    />
                  );
                })}
              </div>
            </div>

            {/* Weekly Study Pattern Snapshot & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Volume Bar Chart Snapshot */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Weekly Study Rhythm (Past 7 Days)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Total: <strong className="text-slate-800 tabular-nums">{analysis.totalHours} hrs</strong> across{' '}
                      <strong className="text-slate-800">{analysis.activeStudyDays} active days</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('patterns')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Full Pattern Diagnostics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2">
                  <div className="h-36 flex items-end justify-between gap-3 px-2 border-b border-slate-100">
                    {analysis.dayPatterns.map((dp, idx) => {
                      const maxH = Math.max(4, ...analysis.dayPatterns.map((d) => d.hours));
                      const heightPct = Math.max(6, Math.min(100, (dp.hours / maxH) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                          {dp.hours > 0 && (
                            <span className="text-[10px] font-semibold text-slate-500 mb-1 tabular-nums">
                              {dp.hours}h
                            </span>
                          )}
                          <div
                            className={`w-full max-w-[36px] rounded-t-md transition-all ${
                              dp.hours > 0 ? 'bg-blue-600' : 'bg-slate-100'
                            }`}
                            style={{ height: `${heightPct}%` }}
                            title={`${dp.dayName}: ${dp.hours} hours`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between gap-3 px-2 pt-2 text-xs text-slate-500 font-medium">
                    {analysis.dayPatterns.map((dp, idx) => (
                      <span key={idx} className="flex-1 text-center truncate">
                        {dp.shortDay}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time of Day Snapshot & Report Generation Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Study Pattern Summary
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Peak energy slot: <strong className="text-blue-600">{analysis.peakTimeSlot}</strong>
                  </p>

                  <div className="space-y-2.5 pt-3">
                    {analysis.timeSlotPatterns.map((ts) => (
                      <div key={ts.key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600 font-medium">{ts.label.split(' ')[0]}</span>
                          <span className="tabular-nums text-slate-700 font-bold">{ts.hours}h ({ts.percentage}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${ts.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Create Custom PDF Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Sessions Quick View */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Recent Study Sessions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Latest logged learning activities with topics and productivity ratings.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>All sessions ({sessions.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Window</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Topics Covered</th>
                      <th className="py-2.5 px-3">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessions.slice(0, 5).map((sess) => (
                      <tr key={sess.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                          {sess.date}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {sess.subjectName}
                        </td>
                        <td className="py-2.5 px-3 capitalize text-slate-600 whitespace-nowrap">
                          {sess.timeOfDay}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatDurationMinutes(sess.durationMinutes)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-sm truncate">
                          {sess.topicsCovered}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums font-semibold text-amber-600 whitespace-nowrap">
                          {sess.productivityRating} / 5 ★
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Subjects & Day Targets */}
        {activeTab === 'subjects' && (
          <SubjectList
            subjects={subjects}
            subjectVelocities={velocities}
            onUpdateCompletedDays={handleUpdateCompletedDays}
            onAddNewSubject={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
            onEditSubject={(subj) => {
              setEditingSubject(subj);
              setIsSubjectModalOpen(true);
            }}
            onDeleteSubject={handleDeleteSubject}
            onLogSessionForSubject={(subj) => {
              setDefaultLogSubjectId(subj.id);
              setIsLogModalOpen(true);
            }}
            onToggleMilestone={handleToggleMilestone}
          />
        )}

        {/* Tab: Weekly Patterns */}
        {activeTab === 'patterns' && (
          <WeeklyPatternsView
            subjects={subjects}
            sessions={sessions}
            goals={goals}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {/* Tab: Session History */}
        {activeTab === 'sessions' && (
          <SessionHistoryView
            sessions={sessions}
            subjects={subjects}
            onOpenLogModal={() => {
              setDefaultLogSubjectId(subjects[0]?.id);
              setIsLogModalOpen(true);
            }}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {/* Bottom Utility Bar: Demo Reset */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <div>
            StudyFlow · Custom Goals & Study Pattern Tracking Platform
          </div>
          <button
            onClick={handleResetData}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Reset to default initial demo data"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </main>

      {/* Clean Native Print Report Layout (active during window.print()) */}
      <PrintReportView
        subjects={subjects}
        sessions={sessions}
        goals={goals}
        analysis={analysis}
      />

      {/* Modals */}
      {isSubjectModalOpen && (
        <SubjectModal
          isOpen={isSubjectModalOpen}
          onClose={() => {
            setIsSubjectModalOpen(false);
            setEditingSubject(null);
          }}
          onSave={handleSaveSubject}
          initialSubject={editingSubject}
        />
      )}

      {isLogModalOpen && (
        <StudySessionModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          onSaveSession={handleSaveSession}
          subjects={subjects}
          defaultSubjectId={defaultLogSubjectId}
        />
      )}

      {isTimerModalOpen && (
        <StudyTimerModal
          isOpen={isTimerModalOpen}
          onClose={() => setIsTimerModalOpen(false)}
          subjects={subjects}
          onCompleteTimerSession={handleCompleteTimerSession}
        />
      )}

      {isReportModalOpen && (
        <ReportBuilderModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          subjects={subjects}
          sessions={sessions}
          goals={goals}
        />
      )}

      {isGoalModalOpen && (
        <GoalSettingsModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          goals={goals}
          onSaveGoals={(updated) => setGoals(updated)}
        />
      )}

      {/* Floating AI Study Coach Button */}
      {!isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="no-print fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl flex items-center gap-2 font-bold text-xs transition-all hover:scale-105 active:scale-95 border border-white/25 group"
          title="Open StudyFlow AI Mentor"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
          </div>
          <span>AI Study Coach</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* Multi-turn Gemini AI Chatbot */}
      {isChatbotOpen && (
        <GeminiChatbot
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
          subjects={subjects}
          sessions={sessions}
          goals={goals}
          analysis={analysis}
          currentStreak={streakInfo.currentStreak}
        />
      )}
    </div>
  );
}
