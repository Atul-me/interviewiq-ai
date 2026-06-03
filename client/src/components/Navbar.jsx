import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-dark-950/80 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Branding Logo */}
        <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/10">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="font-sans font-bold text-lg tracking-tight text-white">
            InterviewIQ <span className="text-brand-500">AI</span>
          </span>
        </Link>

        {/* Dynamic Nav Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Authenticated Links */}
              <Link
                to="/dashboard"
                className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <span className="h-4 w-px bg-slate-800" />

              {/* User Profile Badge */}
              <div className="flex items-center space-x-2 bg-dark-900/60 border border-slate-800 px-3 py-1.5 rounded-lg">
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs font-semibold text-slate-300 max-w-[100px] truncate">
                  {user.name}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center space-x-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 px-3 py-1.5 rounded-lg transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Anonymous Links */}
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-brand-600/10"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
