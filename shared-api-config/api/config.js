// 🔧 API Configuration
// هذا الملف يحتوي على إعدادات الاتصال بالـ Backend

const API_CONFIG = {
  // Backend URL على Render
  baseURL: 'https://api.triggerio.io/api',

  // مهلة الانتظار (30 ثانية)
  timeout: 90000,

  // Headers افتراضية
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // إعدادات إضافية
  withCredentials: false, // CORS

  // حالة البيئة
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// URLs مهمة
export const URLS = {
  // Frontend URLs
  AUTH: 'https://triggerio-auth.vercel.app',
  DASHBOARD: 'https://triggerio-dashboard.vercel.app',
  MAIN: 'https://triggerio.io',

  // Backend URL
  API: API_CONFIG.baseURL,
};

// Response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// Error messages بالعربي
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الاتصال بالإنترنت',
  TIMEOUT: 'انتهت مهلة الاتصال، يرجى المحاولة مرة أخرى',
  UNAUTHORIZED: 'يجب تسجيل الدخول أولاً',
  FORBIDDEN: 'ليس لديك صلاحية للوصول',
  NOT_FOUND: 'المورد المطلوب غير موجود',
  SERVER_ERROR: 'خطأ في الخادم، يرجى المحاولة لاحقاً',
  UNKNOWN: 'حدث خطأ غير متوقع',
};

export default API_CONFIG;
