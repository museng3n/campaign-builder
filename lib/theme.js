// 📝 نظام الثيم الموحّد لكل مشاريع Triggerio
// File: lib/theme.js
// ⚠️ هذا الملف متطابق حرفياً في كل المشاريع
// ⚠️ الإشارة الوحيدة للوضع الليلي هي class="dark" على <html>

export const THEME_KEY = 'triggerio_theme';

// 📝 تطبيق الوضع على الصفحة فوراً
export function applyTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  if (typeof document === 'undefined') return t;

  const d = document.documentElement;

  // الإشارة الوحيدة — هذا ما تقرأه كل ملفات CSS
  d.classList.toggle('dark', t === 'dark');

  // خاصية متصفح: شريط التمرير والقوائم والحقول
  d.style.colorScheme = t;

  try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
  return t;
}

// 📝 قراءة الوضع الحالي من الصفحة نفسها
export function getCurrentTheme() {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// 📝 قراءة الوضع الابتدائي — نفس أولوية سكربت منع الوميض بالضبط
export function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const q = new URLSearchParams(window.location.search).get('theme');
    if (q === 'dark' || q === 'light') return q;

    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (e) {
    return 'light';
  }
}

// 📝 الاستماع لرسالة تغيير الوضع القادمة من الشيل
// ترجع دالة إلغاء الاستماع
export function listenForThemeChanges(onChange) {
  if (typeof window === 'undefined') return () => {};

  const handler = (event) => {
    const data = event.data;
    if (!data || data.type !== 'THEME_CHANGE') return;
    if (data.theme !== 'dark' && data.theme !== 'light') return;

    applyTheme(data.theme);
    if (typeof onChange === 'function') onChange(data.theme);
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
