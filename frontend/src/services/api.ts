import axios from 'axios';
import type { HealthCheckResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for attaching auth tokens (prepared for future phases)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Interceptor hook prepared for refresh token / 401 handling
    return Promise.reject(error);
  }
);

export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response = await api.get<HealthCheckResponse>('/api/health');
  return response.data;
};

export default api;
