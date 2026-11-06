import {
  DayPattern,
  GoalSettings,
  StudySession,
  Subject,
  SubjectDistribution,
  SubjectVelocity,
  TimeOfDay,
  TimeSlotPattern,
  WeeklyAnalysis,
} from '../types';

export const calculateCompletionPercentage = (completed: number, target: number): number => {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((completed / target) * 100));
};

export const formatDurationMinutes = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

export const formatHoursDecimal = (hours: number): string => {
  return (Math.round(hours * 10) / 10).toFixed(1);
};

export const getDaysDifference = (targetDateStr: string, fromDateStr?: string): number => {
  const from = fromDateStr ? new Date(fromDateStr) : new Date();
  const to = new Date(targetDateStr);
  const diffTime = to.getTime() - from.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const computeSubjectVelocities = (
  subjects: Subject[],
  sessions: StudySession[]
): SubjectVelocity[] => {
  const todayStr = new Date().toISOString().split('T')[0];

  return subjects.map((subj) => {
    const completionPct = calculateCompletionPercentage(subj.completedDays, subj.targetDays);
    const daysRemaining = Math.max(0, subj.targetDays - subj.completedDays);
    const calendarDaysUntilDeadline = Math.max(0, getDaysDifference(subj.deadlineDate, todayStr));

    // Sessions logged in past 14 days for this subject
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const recentSubjSessions = sessions.filter(
      (s) => s.subjectId === subj.id && new Date(s.date) >= twoWeeksAgo
    );
    const recentDaysStudied = new Set(recentSubjSessions.map((s) => s.date)).size;

    let status: SubjectVelocity['status'] = 'on_track';
    let statusText = 'On Track';

    if (subj.completedDays >= subj.targetDays) {
      status = 'completed';
      statusText = 'Target Achieved!';
    } else if (calendarDaysUntilDeadline < daysRemaining) {
      status = 'at_risk';
      statusText = `Behind: Needs ${daysRemaining} days in ${calendarDaysUntilDeadline} cal days`;
    } else {
      const paceRatio = calendarDaysUntilDeadline > 0 ? (calendarDaysUntilDeadline - daysRemaining) / calendarDaysUntilDeadline : 0;
      if (paceRatio > 0.3) {
        status = 'ahead';
        statusText = 'Ahead of Pace';
      } else {
        status = 'on_track';
        statusText = 'On Target';
      }
    }

    // Recommended daily minutes:
    // If deadline is valid, distribute remaining target hours across remaining calendar days
    const hoursLeft = Math.max(0, subj.targetHours - subj.completedHours);
    let recommendedDailyMinutes = subj.dailyTargetMinutes;
    if (calendarDaysUntilDeadline > 0 && hoursLeft > 0) {
      recommendedDailyMinutes = Math.min(240, Math.round((hoursLeft * 60) / calendarDaysUntilDeadline));
    }

    return {
      subjectId: subj.id,
      subjectName: subj.name,
      color: subj.color,
      targetDays: subj.targetDays,
      completedDays: subj.completedDays,
      completionPercentage: completionPct,
      daysRemaining,
      calendarDaysUntilDeadline,
      recommendedDailyMinutes,
      status,
      statusText,
    };
  });
};

export const computeWeeklyAnalysis = (
  subjects: Subject[],
  sessions: StudySession[],
  goals: GoalSettings,
  daysBack: number = 7
): WeeklyAnalysis => {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - (daysBack - 1));
  startDate.setHours(0, 0, 0, 0);

  const startIso = startDate.toISOString().split('T')[0];
  const endIso = now.toISOString().split('T')[0];

  // Filter sessions in this period
  const periodSessions = sessions.filter((s) => s.date >= startIso && s.date <= endIso);

  // 1. Day patterns for past `daysBack` days (ordered from oldest to newest)
  const dayPatterns: DayPattern[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = daysBack - 1; i >= 0; i--) {
    const curDate = new Date();
    curDate.setDate(now.getDate() - i);
    const curIso = curDate.toISOString().split('T')[0];
    const dayOfWeek = curDate.getDay();

    const daySessions = periodSessions.filter((s) => s.date === curIso);
    const dayMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const dayHours = Math.round((dayMinutes / 60) * 10) / 10;
    const subjectsStudied = Array.from(new Set(daySessions.map((s) => s.subjectName)));

    dayPatterns.push({
      dayName: dayNames[dayOfWeek],
      shortDay: shortNames[dayOfWeek],
      dateStr: curIso,
      hours: dayHours,
      sessionsCount: daySessions.length,
      subjectsStudied,
    });
  }

  // 2. Time slot patterns
  const timeSlots: Record<TimeOfDay, { label: string; minutes: number }> = {
    morning: { label: 'Morning (6am - 12pm)', minutes: 0 },
    afternoon: { label: 'Afternoon (12pm - 5pm)', minutes: 0 },
    evening: { label: 'Evening (5pm - 9pm)', minutes: 0 },
    night: { label: 'Night (9pm - 2am)', minutes: 0 },
  };

  periodSessions.forEach((s) => {
    const slotKey: TimeOfDay = s.timeOfDay || 'morning';
    if (timeSlots[slotKey]) {
      timeSlots[slotKey].minutes += s.durationMinutes;
    }
  });

  const totalPeriodMinutes = periodSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalPeriodHours = Math.round((totalPeriodMinutes / 60) * 10) / 10;

  const timeSlotPatterns: TimeSlotPattern[] = (Object.keys(timeSlots) as TimeOfDay[]).map((key) => {
    const slot = timeSlots[key];
    const hours = Math.round((slot.minutes / 60) * 10) / 10;
    const percentage = totalPeriodMinutes > 0 ? Math.round((slot.minutes / totalPeriodMinutes) * 100) : 0;
    return {
      key,
      label: slot.label,
      hours,
      percentage,
    };
  });

  // 3. Subject distribution
  const subjectMap = new Map<string, { name: string; color: string; minutes: number }>();
  subjects.forEach((subj) => {
    subjectMap.set(subj.id, { name: subj.name, color: subj.color, minutes: 0 });
  });

  periodSessions.forEach((s) => {
    if (subjectMap.has(s.subjectId)) {
      const entry = subjectMap.get(s.subjectId)!;
      entry.minutes += s.durationMinutes;
    } else {
      subjectMap.set(s.subjectId, { name: s.subjectName, color: '#64748b', minutes: s.durationMinutes });
    }
  });

  const subjectDistribution: SubjectDistribution[] = Array.from(subjectMap.entries())
    .map(([id, data]) => {
      const hours = Math.round((data.minutes / 60) * 10) / 10;
      const percentage = totalPeriodMinutes > 0 ? Math.round((data.minutes / totalPeriodMinutes) * 100) : 0;
      return {
        subjectId: id,
        subjectName: data.name,
        color: data.color,
        hours,
        percentage,
      };
    })
    .sort((a, b) => b.hours - a.hours);

  // 4. Metrics & Statistics
  const activeDays = dayPatterns.filter((d) => d.hours > 0).length;
  const avgHoursPerActiveDay = activeDays > 0 ? Math.round((totalPeriodHours / activeDays) * 10) / 10 : 0;

  // Find longest day
  const sortedDays = [...dayPatterns].sort((a, b) => b.hours - a.hours);
  const longestDay = sortedDays[0] || { dayName: 'None', hours: 0 };

  // Find peak time slot
  const sortedSlots = [...timeSlotPatterns].sort((a, b) => b.hours - a.hours);
  const peakSlot = sortedSlots[0] ? sortedSlots[0].label.split(' ')[0] : 'Morning';

  // Consistency score: combination of active days vs target and standard deviation
  const targetDaysWeekly = goals.overallTargetDaysPerWeek || 6;
  const daysRatio = Math.min(1, activeDays / targetDaysWeekly);
  const hoursRatio = goals.overallTargetHoursPerWeek > 0 ? Math.min(1, totalPeriodHours / goals.overallTargetHoursPerWeek) : 1;
  const consistencyScore = Math.round((daysRatio * 0.6 + hoursRatio * 0.4) * 100);

  const weeklyGoalAchievedPct = goals.overallTargetHoursPerWeek > 0
    ? Math.round((totalPeriodHours / goals.overallTargetHoursPerWeek) * 100)
    : 0;

  // 5. Subject velocities
  const subjectVelocities = computeSubjectVelocities(subjects, sessions);

  // 6. Generate Rule-Based Key Insights
  const keyInsights: string[] = [];
  const recommendations: string[] = [];

  // Insight: Peak productivity & pattern
  if (totalPeriodHours > 0) {
    keyInsights.push(
      `Your highest study volume occurs in the ${peakSlot} slot (${sortedSlots[0]?.percentage}% of total weekly study time).`
    );
    keyInsights.push(
      `Most productive study day was ${longestDay.dayName} with ${longestDay.hours} hours logged across ${longestDay.sessionsCount} sessions.`
    );
  }

  // Insight: Top Subject Concentration
  if (subjectDistribution.length > 0 && subjectDistribution[0].hours > 0) {
    const topSubj = subjectDistribution[0];
    keyInsights.push(
      `Primary focus was on "${topSubj.subjectName}", commanding ${topSubj.hours} hrs (${topSubj.percentage}% of weekly allocation).`
    );
  }

  // Insight: Consistency
  if (activeDays >= targetDaysWeekly) {
    keyInsights.push(
      `Consistency target achieved: Studied on ${activeDays} out of planned ${targetDaysWeekly} days with ${consistencyScore}% index.`
    );
  } else {
    keyInsights.push(
      `Active study days: ${activeDays}/${targetDaysWeekly} days. You missed ${targetDaysWeekly - activeDays} target days this cycle.`
    );
  }

  // Recommendations
  const atRiskSubjects = subjectVelocities.filter((v) => v.status === 'at_risk');
  if (atRiskSubjects.length > 0) {
    recommendations.push(
      `Increase daily allocation for ${atRiskSubjects.map((s) => `"${s.subjectName}"`).join(', ')} by at least 45 minutes to meet the target completion deadline.`
    );
  } else {
    recommendations.push(
      `All subject target timelines are well-paced. Continue the current daily rhythm to complete the target days ahead of schedule.`
    );
  }

  if (activeDays < targetDaysWeekly) {
    recommendations.push(
      `Schedule a fixed 45-minute morning review block on lower-volume days to improve weekly consistency score.`
    );
  }

  const lowestSlot = [...timeSlotPatterns].sort((a, b) => a.hours - b.hours)[0];
  if (lowestSlot && lowestSlot.percentage < 10) {
    recommendations.push(
      `Leverage the underutilized ${lowestSlot.label.split(' ')[0]} window for rapid flashcards or active recall review.`
    );
  }

  return {
    rangeLabel: `${startIso} to ${endIso}`,
    startDate: startIso,
    endDate: endIso,
    totalHours: totalPeriodHours,
    activeStudyDays: activeDays,
    avgHoursPerActiveDay,
    dailyGoalHours: goals.dailyTargetHours,
    weeklyGoalHours: goals.overallTargetHoursPerWeek,
    weeklyGoalAchievedPct,
    consistencyScore,
    longestDayName: longestDay.dayName,
    longestDayHours: longestDay.hours,
    peakTimeSlot: peakSlot,
    dayPatterns,
    timeSlotPatterns,
    subjectDistribution,
    subjectVelocities,
    keyInsights,
    recommendations,
  };
};

export const computeStreak = (sessions: StudySession[]): { currentStreak: number; longestStreak: number } => {
  if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const uniqueDates = Array.from(new Set(sessions.map((s) => s.date))).sort();
  if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const dateSet = new Set(uniqueDates);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let checkDate = new Date();

  // If haven't studied today yet, check if studied yesterday
  if (!dateSet.has(todayStr)) {
    if (dateSet.has(yesterdayStr)) {
      checkDate = yesterday;
    } else {
      checkDate = new Date(0); // broken
    }
  }

  if (checkDate.getTime() > 0) {
    while (true) {
      const iso = checkDate.toISOString().split('T')[0];
      if (dateSet.has(iso)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const dStr of uniqueDates) {
    const cur = new Date(dStr);
    if (!prevDate) {
      running = 1;
    } else {
      const diffDays = Math.round((cur.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    if (running > longestStreak) longestStreak = running;
    prevDate = cur;
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
};
