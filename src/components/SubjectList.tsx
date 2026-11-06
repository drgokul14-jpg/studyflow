import React, { useState } from 'react';
import { ArrowUpDown, Filter, Plus, Search } from 'lucide-react';
import { Subject, SubjectVelocity } from '../types';
import { SubjectCard } from './SubjectCard';

interface SubjectListProps {
  subjects: Subject[];
  subjectVelocities: SubjectVelocity[];
  onUpdateCompletedDays: (subjectId: string, newCompletedDays: number) => void;
  onAddNewSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onLogSessionForSubject: (subject: Subject) => void;
  onToggleMilestone: (subjectId: string, milestoneId: string) => void;
}

export const SubjectList: React.FC<SubjectListProps> = ({
  subjects,
  subjectVelocities,
  onUpdateCompletedDays,
  onAddNewSubject,
  onEditSubject,
  onDeleteSubject,
  onLogSessionForSubject,
  onToggleMilestone,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'targetDays' | 'deadline' | 'name'>('progress');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  const filteredSubjects = subjects
    .filter((s) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesCode = s.code?.toLowerCase().includes(query);
        if (!matchesName && !matchesCode) return false;
      }
      if (filterStatus === 'completed') return s.completedDays >= s.targetDays;
      if (filterStatus === 'active') return s.completedDays < s.targetDays;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'progress') {
        const pctA = a.targetDays > 0 ? a.completedDays / a.targetDays : 0;
        const pctB = b.targetDays > 0 ? b.completedDays / b.targetDays : 0;
        return pctB - pctA;
      }
      if (sortBy === 'targetDays') {
        return b.targetDays - a.targetDays;
      }
      if (sortBy === 'deadline') {
        return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-4">
      {/* Controls Bar: Title, Search, Filters, Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Subjects & Number of Days Target
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any progress bar or use the day steppers to update completion status in real-time.
          </p>
        </div>

        <button
          onClick={onAddNewSubject}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by subject name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({subjects.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              filterStatus === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({subjects.filter((s) => s.completedDays < s.targetDays).length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              filterStatus === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Done ({subjects.filter((s) => s.completedDays >= s.targetDays).length})
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="progress">Sort by Completion %</option>
            <option value="targetDays">Sort by Target Days</option>
            <option value="deadline">Sort by Deadline</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-xl p-8 text-center">
          <p className="text-sm text-slate-600 font-medium">No subjects found matching your query.</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or add a new subject.</p>
          <button
            onClick={onAddNewSubject}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Subject Target</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjects.map((subj) => {
            const vel = subjectVelocities.find((v) => v.subjectId === subj.id);
            return (
              <SubjectCard
                key={subj.id}
                subject={subj}
                velocity={vel}
                onUpdateCompletedDays={onUpdateCompletedDays}
                onEditSubject={onEditSubject}
                onDeleteSubject={onDeleteSubject}
                onLogSessionForSubject={onLogSessionForSubject}
                onToggleMilestone={onToggleMilestone}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
