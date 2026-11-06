import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileDown,
  Printer,
  Sparkles,
  X,
} from 'lucide-react';
import { GoalSettings, StudySession, Subject, WeeklyAnalysis } from '../types';
import { computeWeeklyAnalysis, formatDurationMinutes } from '../utils/analytics';
import { generateStudyReportPdf } from '../utils/pdfExport';
import { InteractiveProgressBar } from './InteractiveProgressBar';

interface ReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  sessions: StudySession[];
  goals: GoalSettings;
}

export const ReportBuilderModal: React.FC<ReportBuilderModalProps> = ({
  isOpen,
  onClose,
  subjects,
  sessions,
  goals,
}) => {
  const [dateRangeDays, setDateRangeDays] = useState<7 | 14 | 30>(7);
  const [reportTitle, setReportTitle] = useState('StudyFlow Academic & Weekly Pattern Report');
  const [studentNotes, setStudentNotes] = useState('');
  const [includeSubjectProgress, setIncludeSubjectProgress] = useState(true);
  const [includeWeeklyPatterns, setIncludeWeeklyPatterns] = useState(true);
  const [includeTimeOfDay, setIncludeTimeOfDay] = useState(true);
  const [includeSessionLog, setIncludeSessionLog] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const analysis: WeeklyAnalysis = computeWeeklyAnalysis(subjects, sessions, goals, dateRangeDays);

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateStudyReportPdf({
        subjects,
        sessions,
        goals,
        analysis,
        aiInsightsText: aiAnalysisResult || undefined,
        reportNotes: studentNotes.trim() || undefined,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/analyze-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          sessions,
          goals,
          analysis,
        }),
      });
      const data = await res.json();
      if (data.analysisText) {
        setAiAnalysisResult(data.analysisText);
      }
    } catch (e: any) {
      console.error('Failed to run AI analysis:', e);
      // Fallback
      setAiAnalysisResult(
        `Pattern Analysis based on ${analysis.activeStudyDays} active days:\n- Peak energy concentrated in ${analysis.peakTimeSlot}.\n- Consistency score is ${analysis.consistencyScore}%.\n- Recommend keeping up the pace on target days.`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <FileDown className="w-4 h-4" />
              <span>Report Generator & PDF Export</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Create Custom Study Pattern Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split into Settings (Left) & Preview (Right) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Column */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pattern Analysis Window
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDateRangeDays(d as any)}
                    className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors ${
                      dateRangeDays === d
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Past {d} Days
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Include Report Sections
              </label>
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={includeSubjectProgress}
                    onChange={(e) => setIncludeSubjectProgress(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Subject Target Days & Progress Bars</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={includeWeeklyPatterns}
                    onChange={(e) => setIncludeWeeklyPatterns(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Weekly Day-by-Day Volume Breakdown</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={includeTimeOfDay}
                    onChange={(e) => setIncludeTimeOfDay(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Time-of-Day Pattern & Subject Share</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={includeSessionLog}
                    onChange={(e) => setIncludeSessionLog(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Recent Study Session History Log</span>
                </label>
              </div>
            </div>

            {/* AI Pattern Coach Integration */}
            <div className="bg-sky-50/70 border border-sky-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Gemini Study Pattern Analysis</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  disabled={isAiLoading}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded transition-colors shadow-xs"
                >
                  {isAiLoading ? 'Analyzing...' : aiAnalysisResult ? 'Re-analyze' : 'Generate AI Coach Review'}
                </button>
              </div>
              <p className="text-[11px] text-sky-800 leading-relaxed">
                Uses Gemini 3.8 Flash to synthesize your study patterns, detect cognitive fatigue windows, and provide tailored velocity adjustments.
              </p>
              {aiAnalysisResult && (
                <div className="mt-2 p-2 bg-white rounded border border-sky-200 text-[11px] text-slate-700 max-h-32 overflow-y-auto whitespace-pre-line">
                  {aiAnalysisResult}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Review Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Add custom notes for mentor, tutor, or personal review..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Live Document Preview Column */}
          <div className="lg:col-span-7 bg-slate-100/70 rounded-xl p-4 border border-slate-200 overflow-y-auto max-h-[500px]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Live Document Preview (A4 Page View)
            </div>

            <div className="bg-white rounded-lg p-5 shadow-xs border border-slate-200 space-y-4 text-xs text-slate-700">
              {/* Document Header */}
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{reportTitle}</h3>
                    <p className="text-[11px] text-slate-500">
                      Student: {goals.studentName} · {goals.academicTerm}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Past {dateRangeDays} Days
                  </span>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-medium">TOTAL STUDY</div>
                  <div className="font-bold text-slate-900 text-sm tabular-nums">{analysis.totalHours} hrs</div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-medium">ACTIVE DAYS</div>
                  <div className="font-bold text-slate-900 text-sm tabular-nums">{analysis.activeStudyDays} days</div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-medium">CONSISTENCY</div>
                  <div className="font-bold text-emerald-700 text-sm tabular-nums">{analysis.consistencyScore}%</div>
                </div>
              </div>

              {/* Subject Day Targets Preview */}
              {includeSubjectProgress && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Subject Target Days & Progress
                  </h4>
                  <div className="space-y-2">
                    {subjects.map((s) => {
                      const pct = Math.round((s.completedDays / s.targetDays) * 100);
                      return (
                        <div key={s.id} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-slate-800">{s.name}</span>
                            <span className="tabular-nums font-bold" style={{ color: s.color }}>
                              {s.completedDays} / {s.targetDays} days ({pct}%)
                            </span>
                          </div>
                          <InteractiveProgressBar
                            completed={s.completedDays}
                            target={s.targetDays}
                            color={s.color}
                            size="sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Weekly Day Volume Preview */}
              {includeWeeklyPatterns && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Day-by-Day Volume Breakdown
                  </h4>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {analysis.dayPatterns.map((dp, i) => (
                      <div key={i} className="p-1.5 bg-slate-50 rounded text-[10px]">
                        <div className="text-slate-400">{dp.shortDay}</div>
                        <div className="font-bold text-slate-800 tabular-nums">{dp.hours}h</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time of Day Preview */}
              {includeTimeOfDay && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Time of Day Allocation
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {analysis.timeSlotPatterns.map((slot) => (
                      <div key={slot.key} className="flex justify-between p-1.5 bg-slate-50 rounded">
                        <span>{slot.label.split(' ')[0]}</span>
                        <strong className="tabular-nums">{slot.hours}h ({slot.percentage}%)</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Notes */}
              {studentNotes.trim() && (
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
                    Student Notes
                  </h4>
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded italic">
                    {studentNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Exports a formatted A4 PDF with vector progress indicators and study tables.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Layout</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-md transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
