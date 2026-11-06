import jsPDF from 'jspdf';
import { GoalSettings, StudySession, Subject, WeeklyAnalysis } from '../types';
import { formatDurationMinutes } from './analytics';

export interface PdfExportOptions {
  subjects: Subject[];
  sessions: StudySession[];
  goals: GoalSettings;
  analysis: WeeklyAnalysis;
  aiInsightsText?: string;
  reportNotes?: string;
}

export const generateStudyReportPdf = (options: PdfExportOptions): void => {
  const { subjects, sessions, goals, analysis, aiInsightsText, reportNotes } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawPageBorderAndHeader();
    }
  };

  const drawPageBorderAndHeader = () => {
    // Subtle top accent bar
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(margin, 8, contentWidth, 1.2, 'F');
  };

  drawPageBorderAndHeader();

  // Document Title & Organization
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('STUDYFLOW · ACADEMIC PROGRESS REPORT', margin, y + 6);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  const reportDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Generated on ${reportDateStr} · Academic Term: ${goals.academicTerm}`, margin, y);
  y += 6;

  // Student & Goal Info Banner
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Student: ${goals.studentName}`, margin + 4, y + 6);
  doc.text(`Target Goal: ${goals.primaryGoalTitle}`, margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Target Date: ${goals.primaryTargetDate}`, margin + contentWidth - 55, y + 6);
  doc.text(`Weekly Target: ${goals.overallTargetHoursPerWeek} hrs (${goals.overallTargetDaysPerWeek} days/wk)`, margin + contentWidth - 55, y + 12);
  doc.text(`Analysis Range: ${analysis.rangeLabel}`, margin + 4, y + 17);
  y += 24;

  // Key KPI Cards row
  const kpiWidth = (contentWidth - 9) / 4;
  const kpiData = [
    { label: 'Weekly Hours', value: `${analysis.totalHours} hrs`, sub: `${analysis.weeklyGoalAchievedPct}% of ${goals.overallTargetHoursPerWeek}h target` },
    { label: 'Active Study Days', value: `${analysis.activeStudyDays} / ${goals.overallTargetDaysPerWeek} days`, sub: `${analysis.avgHoursPerActiveDay} hrs/day active avg` },
    { label: 'Consistency Index', value: `${analysis.consistencyScore}%`, sub: 'Rhythm & frequency score' },
    { label: 'Peak Study Slot', value: analysis.peakTimeSlot, sub: `Highest focus volume` },
  ];

  kpiData.forEach((kpi, i) => {
    const kpiX = margin + i * (kpiWidth + 3);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kpiX, y, kpiWidth, 18, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label.toUpperCase(), kpiX + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, kpiX + 3, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.sub, kpiX + 3, y + 15.5);
  });

  y += 24;

  // Section 1: Subject Targets & Completion Percentages
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Subject Target Days & Completion Percentages', margin, y);
  y += 6;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const colX = {
    subj: margin + 3,
    targetDays: margin + 60,
    progress: margin + 90,
    hours: margin + 135,
    deadline: margin + 158,
  };

  doc.text('Subject Name', colX.subj, y + 4.8);
  doc.text('Days Target', colX.targetDays, y + 4.8);
  doc.text('Completion Bar', colX.progress, y + 4.8);
  doc.text('Hours Logged', colX.hours, y + 4.8);
  doc.text('Deadline / Pace', colX.deadline, y + 4.8);
  y += 8;

  // Subject rows
  subjects.forEach((subj) => {
    checkPageBreak(12);

    const velocity = analysis.subjectVelocities.find((v) => v.subjectId === subj.id);
    const pct = velocity ? velocity.completionPercentage : Math.round((subj.completedDays / subj.targetDays) * 100);

    // Subject row line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(subj.name, colX.subj, y + 4);

    if (subj.code) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(subj.code, colX.subj, y + 8);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`${subj.completedDays} / ${subj.targetDays} days`, colX.targetDays, y + 4.5);

    // Vector Progress Bar
    const barWidth = 36;
    const barHeight = 4.5;
    doc.setFillColor(226, 232, 240); // slate-200 background
    doc.roundedRect(colX.progress, y + 1.5, barWidth, barHeight, 1, 1, 'F');

    const fillWidth = Math.max(1, (pct / 100) * barWidth);
    doc.setFillColor(37, 99, 235); // Blue fill
    doc.roundedRect(colX.progress, y + 1.5, fillWidth, barHeight, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${pct}%`, colX.progress + barWidth + 3, y + 4.8);

    // Hours
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`${subj.completedHours}h / ${subj.targetHours}h`, colX.hours, y + 4.5);

    // Deadline & Status
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(subj.deadlineDate, colX.deadline, y + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    if (velocity?.status === 'at_risk') {
      doc.setTextColor(220, 38, 38);
    } else if (velocity?.status === 'completed') {
      doc.setTextColor(22, 163, 74);
    } else {
      doc.setTextColor(37, 99, 235);
    }
    doc.text(velocity?.statusText || 'On Track', colX.deadline, y + 7.5);

    // Divider
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 10, margin + contentWidth, y + 10);
    y += 11;
  });

  y += 4;
  checkPageBreak(35);

  // Section 2: Weekly Study Patterns
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Weekly Study Patterns & Time Distribution', margin, y);
  y += 6;

  // Split view: Left = Daily Pattern, Right = Time of Day & Subjects
  const colHalfWidth = (contentWidth - 6) / 2;

  // Box 1: Day of Week Breakdown
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, colHalfWidth, 42, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Daily Study Hours (Past 7 Days)', margin + 4, y + 6);

  let dayRowY = y + 11;
  analysis.dayPatterns.forEach((dp) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(dp.shortDay, margin + 4, dayRowY);

    // Mini bar
    const maxBarW = colHalfWidth - 30;
    const barW = Math.max(0.5, Math.min(maxBarW, (dp.hours / 6) * maxBarW));
    doc.setFillColor(226, 232, 240);
    doc.rect(margin + 14, dayRowY - 2.5, maxBarW, 3, 'F');
    if (dp.hours > 0) {
      doc.setFillColor(16, 185, 129); // emerald
      doc.rect(margin + 14, dayRowY - 2.5, barW, 3, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${dp.hours}h`, margin + 16 + maxBarW, dayRowY);

    dayRowY += 4.3;
  });

  // Box 2: Time of Day Breakdown
  const rightBoxX = margin + colHalfWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightBoxX, y, colHalfWidth, 42, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Time-of-Day Pattern', rightBoxX + 4, y + 6);

  let todRowY = y + 13;
  analysis.timeSlotPatterns.forEach((slot) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(slot.label.split(' ')[0], rightBoxX + 4, todRowY);

    // Mini bar
    const maxBarW = colHalfWidth - 36;
    const barW = Math.max(0.5, Math.min(maxBarW, (slot.percentage / 100) * maxBarW));
    doc.setFillColor(226, 232, 240);
    doc.rect(rightBoxX + 20, todRowY - 2.5, maxBarW, 3, 'F');
    if (slot.percentage > 0) {
      doc.setFillColor(99, 102, 241); // indigo
      doc.rect(rightBoxX + 20, todRowY - 2.5, barW, 3, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${slot.hours}h (${slot.percentage}%)`, rightBoxX + 22 + maxBarW, todRowY);

    todRowY += 6.5;
  });

  y += 48;
  checkPageBreak(35);

  // Section 3: Pattern Insights & Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Weekly Pattern Insights & Action Items', margin, y);
  y += 6;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 1.5, 1.5, 'FD');

  let insightY = y + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Key Observations:', margin + 4, insightY);
  insightY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  analysis.keyInsights.slice(0, 3).forEach((insight) => {
    doc.text(`•  ${insight}`, margin + 4, insightY);
    insightY += 4;
  });

  insightY += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Tactical Action Items for Next Cycle:', margin + 4, insightY);
  insightY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  analysis.recommendations.slice(0, 2).forEach((rec) => {
    doc.text(`•  ${rec}`, margin + 4, insightY);
    insightY += 4;
  });

  y += 40;

  // Optional AI Deep Insights block
  if (aiInsightsText) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Gemini AI Study Pattern Diagnostic', margin, y);
    y += 5;

    doc.setFillColor(240, 249, 255); // sky-50
    doc.setDrawColor(186, 230, 253);
    const splitAi = doc.splitTextToSize(aiInsightsText, contentWidth - 8);
    const boxH = Math.min(60, splitAi.length * 4 + 8);
    doc.roundedRect(margin, y, contentWidth, boxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(12, 74, 110);
    doc.text(splitAi.slice(0, 14), margin + 4, y + 5);
    y += boxH + 6;
  }

  // Optional Report Notes block
  if (reportNotes) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Student Review Notes:', margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(reportNotes, contentWidth - 4);
    doc.text(splitNotes, margin + 2, y);
    y += splitNotes.length * 4 + 4;
  }

  // Section 4: Recent Study Sessions Log
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Recent Study Sessions Log', margin, y);
  y += 6;

  // Session table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const sessCol = {
    date: margin + 3,
    subj: margin + 25,
    tod: margin + 70,
    dur: margin + 92,
    topic: margin + 112,
    rating: margin + contentWidth - 16,
  };

  doc.text('Date', sessCol.date, y + 4.2);
  doc.text('Subject', sessCol.subj, y + 4.2);
  doc.text('Time Slot', sessCol.tod, y + 4.2);
  doc.text('Duration', sessCol.dur, y + 4.2);
  doc.text('Topics Covered', sessCol.topic, y + 4.2);
  doc.text('Rating', sessCol.rating, y + 4.2);
  y += 7.5;

  const recentSessions = sessions.slice(0, 15);
  recentSessions.forEach((sess) => {
    checkPageBreak(8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    doc.text(sess.date, sessCol.date, y + 3.5);
    doc.text(sess.subjectName.substring(0, 24), sessCol.subj, y + 3.5);
    doc.text(sess.timeOfDay, sessCol.tod, y + 3.5);
    doc.text(formatDurationMinutes(sess.durationMinutes), sessCol.dur, y + 3.5);

    const safeTopic = sess.topicsCovered.length > 40 ? `${sess.topicsCovered.substring(0, 38)}...` : sess.topicsCovered;
    doc.text(safeTopic, sessCol.topic, y + 3.5);
    doc.text(`${sess.productivityRating}/5`, sessCol.rating, y + 3.5);

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
    y += 6.5;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `StudyFlow Academic Tracking System · Confidential Study Report · Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `StudyFlow_Report_${goals.studentName.replace(/\s+/g, '_')}_${analysis.endDate}.pdf`;
  doc.save(filename);
};
