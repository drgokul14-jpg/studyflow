import { GoalSettings, Subject, StudySession } from '../types';

const STORAGE_KEYS = {
  SUBJECTS: 'studyflow_subjects_v1',
  SESSIONS: 'studyflow_sessions_v1',
  GOALS: 'studyflow_goals_v1',
};

// Helper to format date offset from today
const getIsoDate = (dayOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_GOAL_SETTINGS: GoalSettings = {
  studentName: 'Alex Rivera',
  academicTerm: 'Fall Academic Term',
  primaryGoalTitle: 'Target Mastery & Semester Finals Preparation',
  primaryTargetDate: getIsoDate(35),
  dailyTargetHours: 4.5,
  overallTargetDaysPerWeek: 6,
  overallTargetHoursPerWeek: 26,
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj-1',
    name: 'Organic Chemistry II',
    code: 'CHEM-302',
    color: '#059669', // Emerald
    targetDays: 40,
    completedDays: 27,
    targetHours: 65,
    completedHours: 44.5,
    dailyTargetMinutes: 75,
    startDate: getIsoDate(-30),
    deadlineDate: getIsoDate(20),
    notes: 'Focus on reaction mechanisms, synthesis pathways, and spectroscopy analysis.',
    milestones: [
      { id: 'm-1', title: 'Carbonyl chemistry and Enolates', targetDay: 15, completed: true },
      { id: 'm-2', title: 'Spectroscopy (NMR, IR, Mass Spec)', targetDay: 28, completed: false },
      { id: 'm-3', title: 'Full Practice Exam 1 & 2', targetDay: 38, completed: false },
    ],
  },
  {
    id: 'subj-2',
    name: 'Data Structures & Algorithms',
    code: 'CS-210',
    color: '#2563eb', // Blue
    targetDays: 30,
    completedDays: 22,
    targetHours: 50,
    completedHours: 37,
    dailyTargetMinutes: 90,
    startDate: getIsoDate(-25),
    deadlineDate: getIsoDate(12),
    notes: 'Graph algorithms, dynamic programming, and amortized complexity analysis.',
    milestones: [
      { id: 'm-4', title: 'Binary Trees & Balanced BSTs', targetDay: 10, completed: true },
      { id: 'm-5', title: 'Dijkstra and Minimum Spanning Trees', targetDay: 20, completed: true },
      { id: 'm-6', title: 'Dynamic Programming Memoization', targetDay: 28, completed: false },
    ],
  },
  {
    id: 'subj-3',
    name: 'Cellular & Molecular Biology',
    code: 'BIO-201',
    color: '#7c3aed', // Purple
    targetDays: 25,
    completedDays: 21,
    targetHours: 40,
    completedHours: 33.5,
    dailyTargetMinutes: 60,
    startDate: getIsoDate(-22),
    deadlineDate: getIsoDate(8),
    notes: 'Signal transduction, gene expression regulation, and protein trafficking.',
    milestones: [
      { id: 'm-7', title: 'Membrane transport & GPCR cascades', targetDay: 12, completed: true },
      { id: 'm-8', title: 'CRISPR and transcription factors', targetDay: 22, completed: false },
    ],
  },
  {
    id: 'subj-4',
    name: 'Macroeconomic Theory',
    code: 'ECON-180',
    color: '#d97706', // Amber
    targetDays: 35,
    completedDays: 14,
    targetHours: 45,
    completedHours: 19,
    dailyTargetMinutes: 60,
    startDate: getIsoDate(-14),
    deadlineDate: getIsoDate(28),
    notes: 'IS-LM model, fiscal and monetary policies, and open-economy exchange rates.',
    milestones: [
      { id: 'm-9', title: 'Classical vs Keynesian equilibrium', targetDay: 12, completed: true },
      { id: 'm-10', title: 'Mundell-Fleming Model', targetDay: 25, completed: false },
    ],
  },
];

export const INITIAL_SESSIONS: StudySession[] = [
  // Today & recent days
  {
    id: 'sess-1',
    subjectId: 'subj-1',
    subjectName: 'Organic Chemistry II',
    date: getIsoDate(0),
    durationMinutes: 90,
    timeOfDay: 'morning',
    topicsCovered: 'Aldol condensation mechanisms and retro-synthesis puzzles',
    productivityRating: 5,
    countedTowardTargetDay: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sess-2',
    subjectId: 'subj-2',
    subjectName: 'Data Structures & Algorithms',
    date: getIsoDate(0),
    durationMinutes: 120,
    timeOfDay: 'afternoon',
    topicsCovered: 'Trie structures and Topological sort implementations',
    productivityRating: 4,
    countedTowardTargetDay: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sess-3',
    subjectId: 'subj-3',
    subjectName: 'Cellular & Molecular Biology',
    date: getIsoDate(-1),
    durationMinutes: 75,
    timeOfDay: 'evening',
    topicsCovered: 'Receptor tyrosine kinase cascades and second messengers',
    productivityRating: 5,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sess-4',
    subjectId: 'subj-1',
    subjectName: 'Organic Chemistry II',
    date: getIsoDate(-1),
    durationMinutes: 60,
    timeOfDay: 'morning',
    topicsCovered: 'Carboxylic acid derivatives reactivities ranking',
    productivityRating: 4,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sess-5',
    subjectId: 'subj-4',
    subjectName: 'Macroeconomic Theory',
    date: getIsoDate(-2),
    durationMinutes: 90,
    timeOfDay: 'afternoon',
    topicsCovered: 'Phillips curve analysis and inflation expectations',
    productivityRating: 4,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'sess-6',
    subjectId: 'subj-2',
    subjectName: 'Data Structures & Algorithms',
    date: getIsoDate(-2),
    durationMinutes: 105,
    timeOfDay: 'evening',
    topicsCovered: 'Dynamic Programming knapsack 0/1 variant problems',
    productivityRating: 5,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'sess-7',
    subjectId: 'subj-3',
    subjectName: 'Cellular & Molecular Biology',
    date: getIsoDate(-3),
    durationMinutes: 60,
    timeOfDay: 'morning',
    topicsCovered: 'DNA mismatch repair and cell cycle checkpoints',
    productivityRating: 4,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'sess-8',
    subjectId: 'subj-1',
    subjectName: 'Organic Chemistry II',
    date: getIsoDate(-3),
    durationMinutes: 90,
    timeOfDay: 'afternoon',
    topicsCovered: 'Diels-Alder stereochemistry and orbital symmetry rules',
    productivityRating: 4,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'sess-9',
    subjectId: 'subj-2',
    subjectName: 'Data Structures & Algorithms',
    date: getIsoDate(-4),
    durationMinutes: 120,
    timeOfDay: 'night',
    topicsCovered: 'Graph coloring and bipartite matching',
    productivityRating: 3,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 'sess-10',
    subjectId: 'subj-4',
    subjectName: 'Macroeconomic Theory',
    date: getIsoDate(-5),
    durationMinutes: 80,
    timeOfDay: 'morning',
    topicsCovered: 'Solow-Swan economic growth model with technological progress',
    productivityRating: 5,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 'sess-11',
    subjectId: 'subj-1',
    subjectName: 'Organic Chemistry II',
    date: getIsoDate(-5),
    durationMinutes: 90,
    timeOfDay: 'afternoon',
    topicsCovered: 'Proton NMR splitting patterns and 13C chemical shifts',
    productivityRating: 4,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 'sess-12',
    subjectId: 'subj-3',
    subjectName: 'Cellular & Molecular Biology',
    date: getIsoDate(-6),
    durationMinutes: 90,
    timeOfDay: 'afternoon',
    topicsCovered: 'G-protein coupled receptors and intracellular cAMP pathways',
    productivityRating: 5,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: 'sess-13',
    subjectId: 'subj-2',
    subjectName: 'Data Structures & Algorithms',
    date: getIsoDate(-7),
    durationMinutes: 90,
    timeOfDay: 'morning',
    topicsCovered: 'Segment Trees and Fenwick Binary Indexed Trees',
    productivityRating: 4,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'sess-14',
    subjectId: 'subj-4',
    subjectName: 'Macroeconomic Theory',
    date: getIsoDate(-8),
    durationMinutes: 60,
    timeOfDay: 'evening',
    topicsCovered: 'Central Bank balance sheet policies and quantitative easing',
    productivityRating: 4,
    countedTowardTargetDay: true,
    createdAt: new Date(Date.now() - 691200000).toISOString(),
  },
];

export const loadStoredSubjects = (): Subject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) {
      saveStoredSubjects(INITIAL_SUBJECTS);
      return INITIAL_SUBJECTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBJECTS;
  }
};

export const saveStoredSubjects = (subjects: Subject[]): void => {
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
};

export const loadStoredSessions = (): StudySession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      saveStoredSessions(INITIAL_SESSIONS);
      return INITIAL_SESSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SESSIONS;
  }
};

export const saveStoredSessions = (sessions: StudySession[]): void => {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

export const loadStoredGoals = (): GoalSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!raw) {
      saveStoredGoals(INITIAL_GOAL_SETTINGS);
      return INITIAL_GOAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_GOAL_SETTINGS;
  }
};

export const saveStoredGoals = (goals: GoalSettings): void => {
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};

export const resetToInitialDemoData = (): { subjects: Subject[]; sessions: StudySession[]; goals: GoalSettings } => {
  saveStoredSubjects(INITIAL_SUBJECTS);
  saveStoredSessions(INITIAL_SESSIONS);
  saveStoredGoals(INITIAL_GOAL_SETTINGS);
  return {
    subjects: INITIAL_SUBJECTS,
    sessions: INITIAL_SESSIONS,
    goals: INITIAL_GOAL_SETTINGS,
  };
};
