import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  ChevronDown,
  Copy,
  Maximize2,
  Minimize2,
  RotateCcw,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { GoalSettings, StudySession, Subject, WeeklyAnalysis } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  sessions: StudySession[];
  goals: GoalSettings;
  analysis: WeeklyAnalysis;
  currentStreak: number;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isOpen,
  onClose,
  subjects,
  sessions,
  goals,
  analysis,
  currentStreak,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: `Hello ${goals.studentName}! I am your **StudyFlow AI Academic Mentor**, powered by Gemini.

I have real-time access to your study targets:
• **${subjects.length} Subjects** currently tracked
• **${currentStreak}-day** active streak
• **${analysis.totalHours} hours** logged this week with **${analysis.consistencyScore}%** consistency

How can I help optimize your study strategy today? Choose a quick prompt below or ask anything!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const quickPrompts = [
    'How should I pace my target days this week?',
    'Create a 5-day catch-up schedule for my lagging subject',
    'What does my peak focus window reveal about my study habits?',
    'Give me an active recall routine for tonight',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn chat
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const contextData = {
        goals,
        subjects,
        streak: currentStreak,
        weeklyHours: analysis.totalHours,
        consistencyScore: analysis.consistencyScore,
      };

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          contextData,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'I could not process that request. Please try again.';

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'Sorry, I encountered an issue connecting to the Gemini server. Please check your network and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Conversation reset. I am ready to help you plan your next study milestone, ${goals.studentName}. What would you like to tackle?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const renderFormattedText = (text: string) => {
    // Basic markdown formatting for bold and lists
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Check for bullet
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('*') || line.trim().startsWith('-');
      const cleanLine = isBullet ? line.replace(/^[\s•*-]+/, '').trim() : line;

      // Replace **bold**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

      return (
        <div key={idx} className={`${isBullet ? 'flex items-start gap-1.5 ml-2 my-0.5' : 'my-1'}`}>
          {isBullet && <span className="text-blue-500 font-bold shrink-0">•</span>}
          <span>
            {parts.map((p, i) => {
              if (p.startsWith('**') && p.endsWith('**')) {
                return <strong key={i} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>;
              }
              return p;
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div
      className={`no-print fixed z-50 transition-all duration-300 ease-in-out ${
        isExpanded
          ? 'inset-4 sm:inset-10'
          : 'bottom-4 right-4 sm:right-6 w-full max-w-[420px] h-[580px] max-h-[85vh]'
      }`}
    >
      <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight">StudyFlow AI Coach</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-medium text-white/90">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-blue-100">
                Context-aware learning mentor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors hidden sm:block"
              title={isExpanded ? 'Collapse' : 'Expand window'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title="Close chatbot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {isUser ? msg.text : renderFormattedText(msg.text)}
                  </div>
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      isUser ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 w-fit">
              <Bot className="w-4 h-4 text-blue-600 animate-spin" />
              <span>StudyFlow AI is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (horizontal scroll) */}
        <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Suggested:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full border border-slate-200/80 transition-colors shrink-0 shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for advice, schedule tweaks, or revision plans..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-xs shrink-0"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="text-[10px] text-center text-slate-400 mt-1">
            Grounded in your real study targets, session history, and velocity data.
          </div>
        </div>
      </div>
    </div>
  );
};
