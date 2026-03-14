// 🗺️ API Endpoints
// جميع الـ API routes في مكان واحد

import { apiClient } from './client';

const ENDPOINTS = {
  // ==========================================
  // 🔐 Authentication
  // ==========================================
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
  // ==========================================
  // 👤 Users
  // ==========================================
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
  },
  
  // ==========================================
  // 📇 Contacts
  // ==========================================
  CONTACTS: {
    BASE: '/contacts',
    BY_ID: (id) => `/contacts/${id}`,
    IMPORT: '/contacts/import',
    EXPORT: '/contacts/export',
    BULK_DELETE: '/contacts/bulk-delete',
    SEARCH: '/contacts/search',
    TAGS: '/contacts/tags',
    STATS: '/contacts/stats',
  },
  
  // ==========================================
  // 📧 Email Campaigns
  // ==========================================
  CAMPAIGNS: {
    BASE: '/campaigns',
    BY_ID: (id) => `/campaigns/${id}`,
    SEND: (id) => `/campaigns/${id}/send`,
    LAUNCH: (id) => `/campaigns/${id}/launch`,
    PAUSE: (id) => `/campaigns/${id}/pause`,
    RESUME: (id) => `/campaigns/${id}/resume`,
    STATUS: (id) => `/campaigns/${id}/status`,
    STATS: (id) => `/campaigns/${id}/stats`,
    RECIPIENTS: (id) => `/campaigns/${id}/recipients`,
  },

  // ==========================================
  // 📨 Email Accounts (Gmail OAuth)
  // ==========================================
  EMAIL_ACCOUNTS: {
    BASE: '/email-accounts',
    BY_ID: (id) => `/email-accounts/${id}`,
    GOOGLE_AUTH: '/email-accounts/google/auth',
    GOOGLE_CALLBACK: '/email-accounts/google/callback',
    TEST: (id) => `/email-accounts/${id}/test`,
  },
  
  // ==========================================
  // 📝 Email Templates
  // ==========================================
  TEMPLATES: {
    BASE: '/templates',
    BY_ID: (id) => `/templates/${id}`,
    DUPLICATE: (id) => `/templates/${id}/duplicate`,
    TEST: (id) => `/templates/${id}/test`,
  },
  
  // ==========================================
  // 🤖 Automation
  // ==========================================
  AUTOMATION: {
    BASE: '/automation',
    BY_ID: (id) => `/automation/${id}`,
    TOGGLE: (id) => `/automation/${id}/toggle`,
    STATS: (id) => `/automation/${id}/stats`,
    LOGS: (id) => `/automation/${id}/logs`,
  },
  
  // ==========================================
  // 💬 Social Media
  // ==========================================
  SOCIAL: {
    // Instagram
    INSTAGRAM: {
      CONNECT: '/social/instagram/connect',
      DISCONNECT: '/social/instagram/disconnect',
      POSTS: '/social/instagram/posts',
      COMMENTS: '/social/instagram/comments',
      REPLY: '/social/instagram/reply',
    },
    
    // Facebook
    FACEBOOK: {
      CONNECT: '/social/facebook/connect',
      DISCONNECT: '/social/facebook/disconnect',
      POSTS: '/social/facebook/posts',
      COMMENTS: '/social/facebook/comments',
      REPLY: '/social/facebook/reply',
    },
    
    // Inbox
    INBOX: '/social/inbox',
    CONVERSATIONS: '/social/conversations',
  },
  
  // ==========================================
  // 📊 Analytics
  // ==========================================
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    CONTACTS: '/analytics/contacts',
    CAMPAIGNS: '/analytics/campaigns',
    SOCIAL: '/analytics/social',
    ENGAGEMENT: '/analytics/engagement',
    REVENUE: '/analytics/revenue',
  },
  
  // ==========================================
  // ⚙️ Settings
  // ==========================================
  SETTINGS: {
    GENERAL: '/settings/general',
    INTEGRATIONS: '/settings/integrations',
    NOTIFICATIONS: '/settings/notifications',
    BILLING: '/settings/billing',
    TEAM: '/settings/team',
  },
  
  // ==========================================
  // 🔗 Integrations
  // ==========================================
  INTEGRATIONS: {
    GHL: {
      CONNECT: '/integrations/ghl/connect',
      DISCONNECT: '/integrations/ghl/disconnect',
      SYNC: '/integrations/ghl/sync',
      WEBHOOKS: '/integrations/ghl/webhooks',
    },
    BREVO: {
      TEST: '/integrations/brevo/test',
      STATUS: '/integrations/brevo/status',
    },
  },
  
  // ==========================================
  // 🧪 Test Endpoints
  // ==========================================
  TEST: {
    SEND_EMAIL: '/test/send-email',
    HEALTH: '/health',
  },
};

export default ENDPOINTS;

// =====================================================
// 🔌 API Functions - دوال جاهزة للاستخدام مع apiClient
// =====================================================

// ========== CAMPAIGNS API ==========

// الحصول على جميع الحملات
export const getCampaigns = () => apiClient.get(ENDPOINTS.CAMPAIGNS.BASE);

// الحصول على حملة واحدة
export const getCampaign = (id) => apiClient.get(ENDPOINTS.CAMPAIGNS.BY_ID(id));

// إنشاء حملة جديدة (حفظ كمسودة)
export const createCampaign = (data) => apiClient.post(ENDPOINTS.CAMPAIGNS.BASE, data);

// تحديث حملة
export const updateCampaign = (id, data) => apiClient.patch(ENDPOINTS.CAMPAIGNS.BY_ID(id), data);

// إطلاق حملة
export const launchCampaign = (id) => apiClient.post(ENDPOINTS.CAMPAIGNS.LAUNCH(id));

// إيقاف حملة مؤقتاً
export const pauseCampaign = (id) => apiClient.post(ENDPOINTS.CAMPAIGNS.PAUSE(id));

// تغيير حالة الحملة
export const updateCampaignStatus = (id, status) => apiClient.patch(ENDPOINTS.CAMPAIGNS.STATUS(id), { status });

// الحصول على مستلمي الحملة
export const getCampaignRecipients = (id, params) => apiClient.get(ENDPOINTS.CAMPAIGNS.RECIPIENTS(id), { params });

// ========== EMAIL ACCOUNTS API ==========

// الحصول على جميع حسابات البريد المتصلة
export const getEmailAccounts = () => apiClient.get(ENDPOINTS.EMAIL_ACCOUNTS.BASE);

// بدء ربط حساب Gmail (OAuth)
export const connectGmailAccount = () => apiClient.get(ENDPOINTS.EMAIL_ACCOUNTS.GOOGLE_AUTH);

// إرسال بريد تجريبي للتحقق من الحساب
export const sendTestEmail = (accountId) => apiClient.post(ENDPOINTS.EMAIL_ACCOUNTS.TEST(accountId));

// حذف حساب بريد
export const deleteEmailAccount = (id) => apiClient.delete(ENDPOINTS.EMAIL_ACCOUNTS.BY_ID(id));

// تحديث إعدادات حساب بريد (dailyLimit, status)
export const updateEmailAccount = (id, data) => apiClient.patch(ENDPOINTS.EMAIL_ACCOUNTS.BY_ID(id), data);