import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Validate session on load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.success && response.data.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        // Clear broken session credentials
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        addToast('Logged in successfully', 'success');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      addToast(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Registration handler
  const register = useCallback(async (name, email, password, targetRole) => {
    setLoading(true);
    try {
      const response = await authService.register({ name, email, password, targetRole });
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        addToast('Account created successfully', 'success');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      addToast(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    addToast('Logged out successfully', 'info');
  }, [addToast]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
