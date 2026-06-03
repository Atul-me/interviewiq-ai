import { Link } from 'react-router-dom';
import { Cpu, Terminal, Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col justify-between overflow-x-hidden relative">
      
      {/* Decorative blurred background shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-600/10 blur-[130px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse-slow pointer-events-none" />

      {/* Hero Segment */}
      <main className="max-w-7xl mx-auto px-6 py-20 md:py-32 flex-grow flex flex-col items-center justify-center relative z-10">
        
        {/* Sparkle highlight banner */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-8 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by Gemini AI Engine v1.5</span>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mb-8">
          <h1 className="font-sans text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Master Your Next <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-indigo-400 bg-clip-text text-transparent">
              Technical Interview
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Practice role-specific mock interviews, solve coding questions, and receive detailed scoring breakdowns and improvement guidance instantly.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-20 w-full sm:w-auto">
          <Link
            to="/register"
            className="btn-primary flex items-center justify-center space-x-2 text-base font-semibold group"
          >
            <span>Start Practicing Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="btn-secondary flex items-center justify-center space-x-2 text-base font-semibold"
          >
            <span>Sign In to Your Account</span>
          </Link>
        </div>

        {/* Features Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
          
          {/* Feature 1 */}
          <div className="glass-panel p-8 rounded-2xl glow-border flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI-Generated Questions</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receive customized questions tailored specifically to your target roles, background expertise, and difficulty levels.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400">
              <span>HR, Tech, & Role-based</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel p-8 rounded-2xl glow-border flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Scoring & Feedback</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Get scored instantly based on your answers. Review code correctness, syntax, styling improvements, and conceptual gaps.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-violet-400">
              <span>Detailed Weakness Analysis</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel p-8 rounded-2xl glow-border flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Resume Parsing System</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload your resume to receive highly localized questions matching your historical work experience, projects, and tech stacks.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400">
              <span>PDF Parsing Integration</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

        </div>

      </main>

    </div>
  );
};

export default Landing;
