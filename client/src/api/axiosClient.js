import axios from 'axios';

// Create specialized Axios instance
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject Bearer Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch globally defined statuses (e.g. 401 logout triggers)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Check if error status is 401 (Unauthorized) and has not already been retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Clear invalid credentials from storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // If we are not on public pages, redirect user to login
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login?expired=true';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
