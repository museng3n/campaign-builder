// 📝 Storage Utilities - localStorage wrapper
// File: shared-api-config/utils/storage.js

// Storage Keys - متطابقة مع auth.js
const TOKEN_KEY = 'triggerio_token';
const USER_KEY = 'triggerio_user';

export const storage = {
  // Token management
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // User management
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  // Clear all
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};