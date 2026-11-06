import React, { useState } from 'react';
import { Calendar, Clock, Filter, Plus, Search, Star, Trash2 } from 'lucide-react';
import { StudySession, Subject } from '../types';
import { formatDurationMinutes } from '../utils/analytics';

interface SessionHistoryViewProps {
  sessions: StudySession[];
  subjects: Subject[];
  onOpenLogModal: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionHistoryView: React.FC<SessionHistoryViewProps> = ({
  sessions,
  subjects,
  onOpenLogModal,
  onDeleteSession,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  const filtered = sessions.filter((s) => {
    if (selectedSubjectId !== 'all' && s.subjectId !== selectedSubjectId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesTopic = s.topicsCovered.toLowerCase().includes(q);
      const matchesSubject = s.subjectName.toLowerCase().includes(q);
      if (!matchesTopic && !matchesSubject) return false;
    }
    return true;
  });

  const totalMinutes = filtered.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Study Session History & Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing <strong className="text-slate-700">{filtered.length}</strong> logged sessions totaling{' '}
            <strong className="text-slate-700">{formatDurationMinutes(totalMinutes)}</strong> of focused study.
          </p>
        </div>

        <button
          onClick={onOpenLogModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log New Session</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topics or subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Topics Covered</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No study sessions match your current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((sess) => {
                  const subj = subjects.find((s) => s.id === sess.subjectId);

                  return (
                    <tr key={sess.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {sess.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: subj?.color || '#2563eb' }}
                          />
                          <span className="font-semibold text-slate-900">{sess.subjectName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-600 whitespace-nowrap">
                        {sess.timeOfDay}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatDurationMinutes(sess.durationMinutes)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={sess.topicsCovered}>
                        {sess.topicsCovered}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < sess.productivityRating
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onDeleteSession(sess.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
