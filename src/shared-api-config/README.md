# 🔧 Shared API Configuration

هذا المجلد يحتوي على ملفات مشتركة لجميع Frontend Projects

## 📁 البنية
```
shared-api-config/
├── api/
│   ├── config.js      → إعدادات الـ API
│   ├── client.js      → Axios instance
│   └── endpoints.js   → جميع الـ endpoints
├── utils/
│   ├── auth.js        → Token management
│   └── storage.js     → LocalStorage helpers
└── README.md
```

## 🚀 كيفية الاستخدام

### 1. انسخ المجلد إلى كل مشروع
```bash
# مثال: نسخ إلى triggerio-auth
cp -r shared-api-config ../triggerio-auth/src/
```

### 2. استخدم في الكود
```javascript
// في أي component
import { api } from './shared-api-config/api/client';
import ENDPOINTS from './shared-api-config/api/endpoints';

// مثال: Login
const login = async (email, password) => {
  const response = await api.post(ENDPOINTS.AUTH.LOGIN, {
    email,
    password
  });
  return response.data;
};
```

## ✅ الميزات

- ✅ JWT authentication تلقائي
- ✅ Error handling موحد
- ✅ رسائل خطأ بالعربي
- ✅ Token management
- ✅ Request/Response interceptors
- ✅ Timeout handling

## 🔐 Security

- Tokens محفوظة في localStorage
- Auto redirect عند انتهاء الـ token
- HTTPS only in production