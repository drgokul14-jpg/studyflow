export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface Milestone {
  id: string;
  title: string;
  targetDay: number;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  color: string; // e.g. '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'
  targetDays: number; // e.g. 30 days target
  completedDays: number; // e.g. 18 days
  targetHours: number; // e.g. 60 hours
  completedHours: number; // e.g. 38.5 hours
  dailyTargetMinutes: number; // e.g. 90 minutes
  deadlineDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  notes?: string;
  milestones?: Milestone[];
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number; // in minutes
  timeOfDay: TimeOfDay;
  topicsCovered: string;
  notes?: string;
  productivityRating: number; // 1 to 5
  countedTowardTargetDay: boolean;
  createdAt: string;
}

export interface GoalSettings {
  studentName: string;
  academicTerm: string;
  primaryGoalTitle: string; // e.g., "Fall Semester Finals Prep"
  primaryTargetDate: string; // YYYY-MM-DD
  dailyTargetHours: number; // e.g. 4.0
  overallTargetDaysPerWeek: number; // e.g. 6
  overallTargetHoursPerWeek: number; // e.g. 24
}

export interface DayPattern {
  dayName: string; // e.g., "Monday"
  shortDay: string; // e.g., "Mon"
  dateStr: string; // YYYY-MM-DD
  hours: number;
  sessionsCount: number;
  subjectsStudied: string[];
}

export interface TimeSlotPattern {
  key: TimeOfDay;
  label: string; // e.g., "Morning (6am-12pm)"
  hours: number;
  percentage: number;
}

export interface SubjectDistribution {
  subjectId: string;
  subjectName: string;
  color: string;
  hours: number;
  percentage: number;
}

export interface SubjectVelocity {
  subjectId: string;
  subjectName: string;
  color: string;
  targetDays: number;
  completedDays: number;
  completionPercentage: number;
  daysRemaining: number;
  calendarDaysUntilDeadline: number;
  recommendedDailyMinutes: number;
  status: 'completed' | 'ahead' | 'on_track' | 'at_risk';
  statusText: string;
}

export interface WeeklyAnalysis {
  rangeLabel: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  activeStudyDays: number;
  avgHoursPerActiveDay: number;
  dailyGoalHours: number;
  weeklyGoalHours: number;
  weeklyGoalAchievedPct: number;
  consistencyScore: number; // 0 - 100%
  longestDayName: string;
  longestDayHours: number;
  peakTimeSlot: string;
  dayPatterns: DayPattern[];
  timeSlotPatterns: TimeSlotPattern[];
  subjectDistribution: SubjectDistribution[];
  subjectVelocities: SubjectVelocity[];
  keyInsights: string[];
  recommendations: string[];
}

export interface CustomReportConfig {
  reportTitle: string;
  includeSubjectProgress: boolean;
  includeWeeklyPatterns: boolean;
  includeTimeOfDay: boolean;
  includeSessionLog: boolean;
  includeVelocityAnalysis: boolean;
  includeAiInsights: boolean;
  notes?: string;
}
