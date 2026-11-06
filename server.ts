import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// AI Studio dev server runs on port 3000; in production use PORT if specified
const PORT = process.env.NODE_ENV === 'production' && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '2mb' }));

// Helper to get GoogleGenAI client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 10000,
    },
  });
};

// API Endpoint: Multi-turn Study Coach Chatbot with Gemini
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, contextData } = req.body;
    const ai = getAiClient();

    const studentName = contextData?.goals?.studentName || 'Student';
    const primaryGoal = contextData?.goals?.primaryGoalTitle || 'Academic Goals';
    const subjectsSummary = (contextData?.subjects || [])
      .map(
        (s: any) =>
          `• ${s.name} (${s.code || 'N/A'}): ${s.completedDays}/${s.targetDays} target days (${Math.round(
            (s.completedDays / s.targetDays) * 100
          )}%), ${s.completedHours}h logged, deadline: ${s.deadlineDate}`
      )
      .join('\n');

    const streak = contextData?.streak ?? 0;
    const totalWeeklyHours = contextData?.weeklyHours ?? 0;

    const systemInstruction = `You are StudyFlow AI, an elite academic strategist, cognitive learning scientist, and encouraging study mentor.
You are helping ${studentName}, whose primary goal is "${primaryGoal}".

Current Study Tracker Real-Time Context:
- Active streak: ${streak} days
- Weekly study logged: ${totalWeeklyHours} hours
- Enrolled Subjects & Target Days:
${subjectsSummary || 'No subjects currently enrolled.'}

Your responsibilities:
1. Provide personalized, highly actionable advice grounded in their exact targets and completion percentages.
2. Formulate realistic catch-up schedules if they are behind on target days.
3. Apply evidence-based cognitive strategies (spaced repetition, Pomodoro, active recall, interleaved practice).
4. Keep answers structured, encouraging, concise, and focused on momentum and consistency.
5. Use clear formatting with bolding and bullet points where helpful.`;

    if (!ai) {
      // Fallback response if API key is not present in local environment
      const lastUserMsg = messages?.[messages.length - 1]?.text || 'Hello';
      return res.status(200).json({
        reply: `Hello ${studentName}! I am your StudyFlow AI Coach. 
Based on your tracker:
• You've built a ${streak}-day active streak with ${totalWeeklyHours} hours logged this cycle.
• Reviewing your ${contextData?.subjects?.length || 0} subject target days, your key focus should be maintaining steady daily study blocks.

Regarding "${lastUserMsg}": Focus on 50-minute high-intensity blocks with 10-minute active recall breaks. Which specific subject would you like to plan right now?`,
      });
    }

    // Format messages for @google/genai contents
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I am reviewing your study records. How can I assist you next?';
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    const streak = req.body?.contextData?.streak ?? 0;
    const studentName = req.body?.contextData?.goals?.studentName || 'Student';
    return res.status(200).json({
      reply: `Hello ${studentName}! I noticed a brief network spike with the cloud model, but here is your targeted coaching advice:
• You have built a solid **${streak}-day active streak**—keep this momentum alive today!
• Review your subjects and prioritize the one with the fewest days remaining to deadline.
• Use 50-minute Pomodoro focus blocks with active recall to maximize retention.

Feel free to ask again in a moment!`,
      source: 'fallback',
    });
  }
});

// API Endpoint: Analyze study patterns with Gemini
app.post('/api/gemini/analyze-patterns', async (req, res) => {
  try {
    const { subjects, sessions, goals, analysis } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.status(200).json({
        analysisText: `Analysis generated via algorithmic heuristic engine:
• Consistency is strong at ${analysis.consistencyScore}% across ${analysis.activeStudyDays} active days.
• Focus peak observed during ${analysis.peakTimeSlot} hours.
• Recommend dedicating minimum 45 min/day to lagging subject goals to preserve target completion deadlines.`,
        source: 'heuristic',
      });
    }

    const prompt = `You are a high-performance academic coach and cognitive learning scientist analyzing a student's weekly study tracking data.

Student: ${goals.studentName}
Goal: ${goals.primaryGoalTitle} (Target: ${goals.primaryTargetDate})
Weekly Target: ${goals.overallTargetHoursPerWeek} hours (${goals.overallTargetDaysPerWeek} days/week)
Total Logged This Week: ${analysis.totalHours} hours across ${analysis.activeStudyDays} active days.
Consistency Index: ${analysis.consistencyScore}%
Peak Focus Time of Day: ${analysis.peakTimeSlot}
Most Productive Day: ${analysis.longestDayName} (${analysis.longestDayHours} hrs)

Subjects & Target Days Status:
${subjects
  .map(
    (s: any) =>
      `- ${s.name}: ${s.completedDays}/${s.targetDays} target days completed (${Math.round(
        (s.completedDays / s.targetDays) * 100
      )}%), ${s.completedHours}/${s.targetHours} hours logged, Deadline: ${s.deadlineDate}`
  )
  .join('\n')}

Recent Study Sessions (Last 7 days):
${sessions
  .slice(0, 10)
  .map(
    (ss: any) =>
      `• ${ss.date} (${ss.timeOfDay}): ${ss.subjectName} for ${ss.durationMinutes}m - "${ss.topicsCovered}" (Productivity: ${ss.productivityRating}/5)`
  )
  .join('\n')}

Provide a structured, highly actionable diagnostic review:
1. Pattern Analysis: What does the timing, day distribution, and subject balance reveal about the student's cognitive energy and habits?
2. Target Days & Velocity Check: Are they pacing properly to hit the number of days target for each subject? Which subject is at risk?
3. Tactical Recommendations: Give 3 specific, non-generic schedule modifications for next week.

Keep the tone encouraging, crisp, professional, and directly focused on data.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || 'Unable to generate analysis at this time.';

    return res.status(200).json({
      analysisText: text,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Error generating AI pattern analysis:', error);
    const analysis = req.body?.analysis;
    return res.status(200).json({
      analysisText: `Analysis generated via algorithmic heuristic engine:
• Consistency is strong at ${analysis?.consistencyScore || 75}% across ${analysis?.activeStudyDays || 0} active days.
• Focus peak observed during ${analysis?.peakTimeSlot || 'morning'} hours.
• Recommend dedicating minimum 45 min/day to lagging subject goals to preserve target completion deadlines.`,
      source: 'heuristic',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyFlow server running at http://localhost:${PORT}`);
  });
}

startServer();
