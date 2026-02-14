import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4014/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/** Returns a user-friendly message for API errors (network, 4xx/5xx). */
export function getApiErrorMessage(error) {
  if (!error) return 'Something went wrong';
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Cannot reach the server. Make sure the backend is running (e.g. run "npm run dev" in the backend folder, port 4014).';
  }
  const status = error.response?.status;
  const msg = error.response?.data?.error || error.response?.data?.message;
  if (status === 401) return 'Session expired. Please log in again.';
  if (msg && typeof msg === 'string') return msg;
  if (status >= 500) return 'Server error. Try again later.';
  if (status >= 400) return 'Request failed. Please try again.';
  return 'Something went wrong.';
}

export default api;
