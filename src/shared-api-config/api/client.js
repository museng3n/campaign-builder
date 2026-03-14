// 📝 API Client - axios instance with interceptors
// File: shared-api-config/api/client.js

import axios from 'axios';
import { API_CONFIG } from './config';
import { getToken, removeToken } from '../utils/auth';

// إنشاء axios instance
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - إضافة Token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - معالجة الأخطاء
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // إذا انتهت صلاحية Token
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);