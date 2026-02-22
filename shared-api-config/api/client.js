// 🌐 API Client with Axios
// هذا الملف يحتوي على Axios instance مع JWT authentication

import axios from 'axios';
import API_CONFIG, { HTTP_STATUS, ERROR_MESSAGES } from './config';
import { getToken, removeToken } from '../utils/auth';

// إنشاء Axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  withCredentials: API_CONFIG.withCredentials,
});

// Request Interceptor: إضافة JWT token لكل request
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      data: config.data,
      params: config.params,
    });

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: معالجة الأخطاء تلقائياً
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data, 'Status:', response.status);
    return response;
  },
  (error) => {
    const { response, request, message } = error;

    console.error('❌ API Error:', {
      url: error.config?.url,
      status: response?.status,
      data: response?.data,
      message,
    });

    if (response) {
      const status = response.status;
      const errorData = response.data;

      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          removeToken();
          try {
            window.top.location.href = 'https://triggerio-auth.vercel.app/login';
          } catch(e) {
            window.parent.postMessage({ type: 'AUTH_REQUIRED' }, 'https://triggerio-shell.vercel.app');
          }
          return Promise.reject({
            message: ERROR_MESSAGES.UNAUTHORIZED,
            ...errorData,
          });

        case HTTP_STATUS.FORBIDDEN:
          return Promise.reject({
            message: ERROR_MESSAGES.FORBIDDEN,
            ...errorData,
          });

        case HTTP_STATUS.NOT_FOUND:
          return Promise.reject({
            message: ERROR_MESSAGES.NOT_FOUND,
            ...errorData,
          });

        case HTTP_STATUS.SERVER_ERROR:
          return Promise.reject({
            message: ERROR_MESSAGES.SERVER_ERROR,
            ...errorData,
          });

        default:
          return Promise.reject({
            message: errorData.message || ERROR_MESSAGES.UNKNOWN,
            ...errorData,
          });
      }
    } else if (request) {
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK_ERROR,
      });
    } else {
      return Promise.reject({
        message: message || ERROR_MESSAGES.UNKNOWN,
      });
    }
  }
);

// Helper functions لتسهيل الاستخدام
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};

export { apiClient };

export default apiClient;
