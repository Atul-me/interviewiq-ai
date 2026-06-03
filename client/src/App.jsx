import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import Navbar from './components/Navbar';

// Page Imports
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import './App.css';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col justify-between overflow-x-hidden relative">
            
            {/* Global Navigation Header */}
            <Navbar />

            {/* Application Views Routing */}
            <div className="flex-grow">
              <Routes>
                {/* Landing Page Route */}
                <Route path="/" element={<Landing />} />

                {/* Public Guest-Only Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />

                {/* Protected Candidate-Only Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            {/* Footer */}
            <footer className="w-full py-6 text-center border-t border-slate-800/40 relative z-10 bg-dark-950">
              <p className="text-xs text-slate-500">
                &copy; {new Date().getFullYear()} InterviewIQ AI. Built from scratch with MERN + Gemini AI.
              </p>
            </footer>

          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
