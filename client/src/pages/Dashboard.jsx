import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Play, Clipboard, Award, ShieldAlert, Sparkles, Settings,
  ChevronRight, CheckCircle, Loader2, RotateCcw, Mic, SendHorizonal
} from 'lucide-react';
import ResumeUpload from '../components/ResumeUpload';
import axiosClient from '../api/axiosClient';

// ---------- Interview Phases ----------
// 'config'   -> form to set role/difficulty
// 'active'   -> answering questions one by one
// 'results'  -> completed scorecard view

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  // Config state
  const [role, setRole] = useState(user?.targetRole || '');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);

  // Session state
  const [phase, setPhase] = useState('config');     // 'config' | 'active' | 'results'
  const [session, setSession] = useState(null);     // full session object
  const [currentIdx, setCurrentIdx] = useState(0); // which question user is on

  // Answer state
  const [textAnswer, setTextAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);

  // Per-question grading results (accumulated locally after each submit)
  const [gradedQuestions, setGradedQuestions] = useState([]);

  // Analytics
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (phase === 'config') fetchAnalytics();
  }, [phase]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await axiosClient.get('/analytics/dashboard');
      setAnalytics(data.data);
    } catch (_) {
      // silently fail — user may have no history yet
    }
  };

  // ---------- Start Session ----------
  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!role.trim()) {
      addToast('Please enter a target job role', 'error');
      return;
    }
    setStarting(true);
    try {
      const { data } = await axiosClient.post('/interviews/start', {
        targetRole: role.trim(),
        difficulty,
        count,
      });
      setSession(data.data.session);
      setGradedQuestions([]);
      setCurrentIdx(0);
      setTextAnswer('');
      setPhase('active');
    } catch (err) {
      addToast(
        err?.response?.data?.message || 'Failed to start interview. Check your Gemini API key.',
        'error'
      );
    } finally {
      setStarting(false);
    }
  };

  // ---------- Submit Answer ----------
  const handleSubmitAnswer = async () => {
    if (!textAnswer.trim()) {
      addToast('Please type your answer before submitting', 'error');
      return;
    }
    const currentQuestion = session.questions[currentIdx];
    setSubmitting(true);
    try {
      const { data } = await axiosClient.post(`/interviews/${session.id}/submit-answer`, {
        questionId: currentQuestion.id,
        userAnswer: textAnswer.trim(),
      });

      const graded = {
        ...currentQuestion,
        userAnswer: textAnswer.trim(),
        evaluation: data.data.evaluation,
      };
      const updatedGraded = [...gradedQuestions, graded];
      setGradedQuestions(updatedGraded);
      setTextAnswer('');

      // Last question → complete session
      if (currentIdx >= session.questions.length - 1) {
        await handleCompleteSession(updatedGraded);
      } else {
        setCurrentIdx((prev) => prev + 1);
      }
    } catch (err) {
      addToast(
        err?.response?.data?.message || 'Failed to submit answer. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Complete Session ----------
  const handleCompleteSession = async (finalGraded) => {
    try {
      const { data } = await axiosClient.post(`/interviews/${session.id}/complete`);
      setSession(data.data.session);
      setGradedQuestions(finalGraded);
      setPhase('results');
    } catch (err) {
      addToast(
        err?.response?.data?.message || 'Failed to complete session.',
        'error'
      );
    }
  };

  // ---------- Reset to config ----------
  const handleReset = () => {
    setPhase('config');
    setSession(null);
    setGradedQuestions([]);
    setCurrentIdx(0);
    setTextAnswer('');
  };

  // ========================
  // RENDER: CONFIG PHASE
  // ========================
  if (phase === 'config') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 relative z-10">

        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-900/40 p-8 rounded-2xl border border-slate-800/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="space-y-2">
            <h1 className="font-sans text-3xl font-extrabold text-white">
              Hello, {user?.name || 'Candidate'} 👋
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Configure your session below and let Gemini evaluate your skill bounds.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-2 rounded-xl self-start md:self-center">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>Gemini Pro Active</span>
          </div>
        </div>

        {/* Analytics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-xl">
              <Clipboard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Interviews Run</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {analytics?.overview?.totalInterviews ?? 0}
              </h3>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Score</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {analytics?.overview?.avgScore != null ? `${analytics.overview.avgScore}/10` : 'N/A'}
              </h3>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Weak Areas</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {analytics?.recommendations?.weaknesses?.length ?? 'N/A'}
              </h3>
            </div>
          </div>
        </div>

        {/* Config Form + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8 rounded-2xl glow-border">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <span>Configure AI Interview Session</span>
              </h2>

              <form onSubmit={handleStartInterview} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Job Role</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer, Fullstack React Developer"
                    className="w-full bg-dark-950/60 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Difficulty Level</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-dark-950/60 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Number of Questions</label>
                    <select
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full bg-dark-950/60 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
                    >
                      {[3, 5, 7, 10].map((n) => (
                        <option key={n} value={n}>{n} Questions</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={starting}
                  className="w-full btn-primary flex items-center justify-center space-x-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {starting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Generating Questions…</span></>
                  ) : (
                    <><Play className="w-4 h-4 text-white fill-white" /><span>Generate AI Interview Questions</span></>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <ResumeUpload
                currentResumeUrl={user?.resumeUrl}
                onUploadSuccess={(updatedUser) => {
                  setUser(updatedUser);
                  if (updatedUser.targetRole && !role) setRole(updatedUser.targetRole);
                }}
              />
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
                <Settings className="w-4 h-4 text-brand-400" />
                <span>How it works</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-400">
                {['Configure role & difficulty.', 'Answer AI-generated questions.', 'Get your AI scorecard.'].map((step, i) => (
                  <li key={i} className="flex items-start space-x-2.5">
                    <span className="w-4 h-4 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // RENDER: ACTIVE PHASE
  // ========================
  if (phase === 'active' && session) {
    const question = session.questions[currentIdx];
    const progress = Math.round((currentIdx / session.questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{session.targetRole} · {session.difficulty}</p>
            <h1 className="text-2xl font-extrabold text-white mt-1">Question {currentIdx + 1} of {session.questions.length}</h1>
          </div>
          <button onClick={handleReset} className="text-slate-500 hover:text-slate-300 transition-colors text-xs flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Card */}
        <div className="glass-panel p-8 rounded-2xl glow-border space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">{question.category}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{question.difficulty}</span>
          </div>
          <p className="text-white text-lg font-semibold leading-relaxed">{question.question}</p>
        </div>

        {/* Answer Textarea */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-brand-400" /> Your Answer
          </label>
          <textarea
            rows={8}
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Type your detailed answer here…"
            className="w-full bg-dark-950/60 border border-slate-800 rounded-xl py-4 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors resize-none"
          />
        </div>

        <button
          onClick={handleSubmitAnswer}
          disabled={submitting || !textAnswer.trim()}
          className="w-full btn-primary flex items-center justify-center space-x-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /><span>Grading your answer…</span></>
          ) : (
            <><SendHorizonal className="w-4 h-4" /><span>{currentIdx >= session.questions.length - 1 ? 'Submit & Finish' : 'Submit Answer'}</span></>
          )}
        </button>
      </div>
    );
  }

  // ========================
  // RENDER: RESULTS PHASE
  // ========================
  if (phase === 'results' && session) {
    const scoreColor = session.overallScore >= 8 ? 'text-emerald-400' : session.overallScore >= 6 ? 'text-amber-400' : 'text-rose-400';

    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 relative z-10">

        {/* Result header */}
        <div className="glass-panel p-8 rounded-2xl glow-border text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h1 className="text-2xl font-extrabold text-white">Interview Completed!</h1>
          <p className="text-slate-400 text-sm">{session.targetRole} · {session.difficulty}</p>
          <div className={`text-6xl font-black mt-4 ${scoreColor}`}>
            {session.overallScore}<span className="text-2xl text-slate-500">/10</span>
          </div>
          <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">{session.overallFeedback}</p>
        </div>

        {/* Per-question results */}
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-white">Detailed Scorecard</h2>
          {gradedQuestions.map((q, i) => {
            const qScore = q.evaluation?.score ?? 0;
            const qColor = qScore >= 8 ? 'text-emerald-400' : qScore >= 6 ? 'text-amber-400' : 'text-rose-400';
            return (
              <div key={i} className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-white font-semibold text-sm leading-relaxed flex-1">{q.question}</p>
                  <span className={`text-2xl font-black shrink-0 ${qColor}`}>{qScore}<span className="text-xs text-slate-500">/10</span></span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Answer</p>
                  <p className="text-sm text-slate-300 bg-dark-950/40 rounded-lg p-3">{q.userAnswer}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Feedback</p>
                  <p className="text-sm text-slate-300">{q.evaluation?.feedback}</p>
                </div>

                {q.evaluation?.exemplaryAnswer && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Model Answer</p>
                    <p className="text-sm text-slate-300 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">{q.evaluation.exemplaryAnswer}</p>
                  </div>
                )}

                {q.evaluation?.improvementSuggestions?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Improvement Tips</p>
                    <ul className="space-y-1">
                      {q.evaluation.improvementSuggestions.map((tip, j) => (
                        <li key={j} className="text-xs text-slate-400 flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={handleReset} className="w-full btn-primary flex items-center justify-center space-x-2 py-3.5">
          <RotateCcw className="w-4 h-4" />
          <span>Start New Interview</span>
        </button>

      </div>
    );
  }

  return null;
};

export default Dashboard;
