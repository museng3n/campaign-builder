// 📝 API Endpoints - كل الـ APIs
// File: shared-api-config/api/endpoints.js

import { apiClient } from './client';

// ==================== Auth APIs ====================
export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};

// ==================== Contact APIs ====================
export const contactAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/contacts', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/contacts/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/contacts', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/contacts/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/contacts/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await apiClient.get('/contacts/search', { params: { q: query } });
    return response.data;
  },

  import: async (data) => {
    const response = await apiClient.post('/contacts/import', data);
    return response.data;
  },

  export: async (params) => {
    const response = await apiClient.get('/contacts/export', { params });
    return response.data;
  },

  bulkDelete: async (ids) => {
    const response = await apiClient.post('/contacts/bulk-delete', { ids });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/contacts/stats');
    return response.data;
  },
};

// ==================== Analytics APIs ====================
export const analyticsAPI = {
  getDashboard: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  getContacts: async (params) => {
    const response = await apiClient.get('/analytics/contacts', { params });
    return response.data;
  },

  getCampaigns: async (params) => {
    const response = await apiClient.get('/analytics/campaigns', { params });
    return response.data;
  },
};

// ===================================================================
// Campaigns API
// ===================================================================
export const campaignsAPI = {
  getAll: (params = {}) => apiClient.get('/api/campaigns', { params }),
  getById: (id) => apiClient.get('/api/campaigns/' + id),
  create: (data) => apiClient.post('/api/campaigns', data),
  update: (id, data) => apiClient.patch('/api/campaigns/' + id, data),
  updateFull: (id, data) => apiClient.put('/api/campaigns/' + id, data),
  launch: (id) => apiClient.post('/api/campaigns/' + id + '/launch'),
  pause: (id) => apiClient.post('/api/campaigns/' + id + '/pause'),
  changeStatus: (id, status) => apiClient.patch('/api/campaigns/' + id + '/status', { status }),
  delete: (id) => apiClient.delete('/api/campaigns/' + id),
  getRecipients: (id, params = {}) => apiClient.get('/api/campaigns/' + id + '/recipients', { params }),
};

// ===================================================================
// Email Accounts API
// ===================================================================
export const emailAccountsAPI = {
  getAll: () => apiClient.get('/api/email-accounts'),
  startGoogleAuth: () => apiClient.get('/api/email-accounts/google/auth'),
  sendTest: (id) => apiClient.post('/api/email-accounts/' + id + '/test'),
  delete: (id) => apiClient.delete('/api/email-accounts/' + id),
  update: (id, data) => apiClient.patch('/api/email-accounts/' + id, data),
};
