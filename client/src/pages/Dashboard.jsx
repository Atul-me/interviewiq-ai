import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Play, Clipboard, Award, ShieldAlert, Sparkles, User, Settings, FileText } from 'lucide-react';
import ResumeUpload from '../components/ResumeUpload';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  
  // Custom interview generation config state
  const [role, setRole] = useState(user?.targetRole || '');
  const [difficulty, setDifficulty] = useState('mid-level');
  const [type, setType] = useState('technical');
  const [generating, setGenerating] = useState(false);

  const handleStartInterview = (e) => {
    e.preventDefault();
    if (!role) {
      addToast('Please input a target job role', 'error');
      return;
    }

    setGenerating(true);
    // Simulating API action for Phase 3 UI preview
    setTimeout(() => {
      setGenerating(false);
      addToast('AI interview session creation matches Phase 5 execution roadmap!', 'info');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 relative z-10">
      
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-900/40 p-8 rounded-2xl border border-slate-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="space-y-2">
          <h1 className="font-sans text-3xl font-extrabold text-white">
            Hello, {user?.name || 'Candidate'} 👋
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Ready to prepare? Configure your session below and let Gemini evaluate your skill bounds.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-4 py-2 rounded-xl self-start md:self-center">
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span>Gemini Pro Active</span>
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-xl">
            <Clipboard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Interviews Run</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">0</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Score</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">N/A</h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Weaknesses Tagged</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">N/A</h3>
          </div>
        </div>

      </div>

      {/* Double Column content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Configure Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-2xl glow-border">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <span>Configure AI Interview Session</span>
            </h2>

            <form onSubmit={handleStartInterview} className="space-y-6">
              
              {/* Job role input */}
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
                
                {/* Interview Difficulty */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-dark-950/60 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="entry-level">Entry Level</option>
                    <option value="mid-level">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead-staff">Lead / Staff</option>
                  </select>
                </div>

                {/* Interview Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Interview Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-dark-950/60 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="technical">Technical (Coding & System Design)</option>
                    <option value="behavioral">Behavioral (HR & STAR-based)</option>
                    <option value="hybrid">Hybrid (General Role Assessment)</option>
                  </select>
                </div>

              </div>

              {/* Action trigger */}
              <button
                type="submit"
                disabled={generating}
                className="w-full btn-primary flex items-center justify-center space-x-2 py-3.5"
              >
                {generating ? (
                  <div className="w-5 h-5 rounded-full border-t-2 border-white animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4 text-white fill-white" />
                    <span>Generate AI Interview Questions</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Profile & Helper Widgets */}
        <div className="space-y-6">
          
          {/* Live Resume Uploader */}
          <div className="glass-panel p-6 rounded-2xl">
            <ResumeUpload
              currentResumeUrl={user?.resumeUrl}
              onUploadSuccess={(updatedUser) => {
                setUser(updatedUser);
                if (updatedUser.targetRole && !role) {
                  setRole(updatedUser.targetRole);
                }
              }}
            />
          </div>

          {/* Quick instructions */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white flex items-center space-x-2 text-sm">
              <Settings className="w-4.5 h-4.5 text-brand-400" />
              <span>How it works</span>
            </h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start space-x-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>Initialize interview by choosing role & difficulty.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>Answer generated technical or behavioral questions.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-4 h-4 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span>Get a detailed scorecard with scoring, correct answers, and guidance.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
