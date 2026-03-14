// 🔐 Authentication Utilities
// وظائف مساعدة للـ Token management

const TOKEN_KEY = 'triggerio_token';
const USER_KEY = 'triggerio_user';
const REFRESH_TOKEN_KEY = 'triggerio_refresh_token';

// ==========================================
// Token Management
// ==========================================

/**
 * حفظ الـ Token في localStorage
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * الحصول على الـ Token من localStorage
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * حذف الـ Token من localStorage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * حفظ الـ Refresh Token
 */
export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

/**
 * الحصول على الـ Refresh Token
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// ==========================================
// User Management
// ==========================================

/**
 * حفظ بيانات المستخدم
 */
export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * الحصول على بيانات المستخدم
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * حذف بيانات المستخدم
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

// ==========================================
// Authentication Status
// ==========================================

/**
 * التحقق من تسجيل الدخول
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

/**
 * التحقق من صلاحية الـ Token
 */
export const isTokenValid = () => {
  const token = getToken();
  
  if (!token) return false;
  
  try {
    // فك تشفير الـ JWT (الجزء الثاني)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // التحقق من انتهاء الصلاحية
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Invalid token format:', error);
    return false;
  }
};

/**
 * Logout - تسجيل الخروج
 */
export const logout = () => {
  removeToken();
  removeUser();
  
  // Redirect to login
  window.location.href = '/login';
};

// ==========================================
// Export all functions
// ==========================================

export default {
  setToken,
  getToken,
  removeToken,
  setRefreshToken,
  getRefreshToken,
  setUser,
  getUser,
  removeUser,
  isAuthenticated,
  isTokenValid,
  logout,
};