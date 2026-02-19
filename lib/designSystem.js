/**
 * 🎨 Triggerio Design System
 * مستخرج من صفحة Campaign Performance
 * 
 * الهوية البصرية الجديدة لـ Triggerio
 * بناءً على التصميم المعتمد في v0.dev
 * 
 * آخر تحديث: فبراير 2026 - v2
 */

// 🎨 الألوان الأساسية
export const COLORS = {
  // Primary
  primary: '#7C3AED',
  primaryHover: '#6D28D9',
  primaryLight: '#A78BFA',
  
  // Success
  success: '#10B981',
  successLight: '#D1FAE5',
  
  // Warning
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  
  // Danger
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  
  // Info
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Background
  bgPrimary: '#F3F4F6',
  bgWhite: '#FFFFFF',
  bgPurpleLight: '#F5F3FF',
  
  // Borders
  borderGray: '#E5E7EB',
  borderGrayLight: '#F3F4F6',
  
  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF'
};

// 🧭 Sidebar Navigation Design
export const SIDEBAR = {
  // Layout
  width: '280px',
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
  fontFamily: "'Tajawal', sans-serif",
  direction: 'rtl',

  // Logo section
  logo: {
    padding: '18px 16px',
    borderBottom: '1px solid #E5E7EB',
    height: '40px'
  },

  // Section labels
  label: {
    fontSize: '11px',
    color: '#9CA3AF',
    fontWeight: '700',
    padding: '10px 20px 4px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },

  // Nav item states
  item: {
    default: {
      color: '#6B7280',
      background: 'transparent',
      padding: '11px 16px',
      margin: '2px 8px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500'
    },
    hover: {
      color: '#374151',
      background: '#F9FAFB'
    },
    active: {
      color: '#7C3AED',
      background: '#F5F3FF',
      bar: {
        width: '3px',
        color: '#7C3AED',
        borderRadius: '3px 0 0 3px'
      }
    }
  },

  // English subtitle under Arabic name
  subtitle: {
    fontSize: '11px',
    color: '#9CA3AF'
  },

  // Icon wrapper
  icon: {
    size: '38px',
    borderRadius: '9px'
  },

  // Icon backgrounds per section (Thermal Philosophy - Cold → Hot)
  icons: {
    dashboard:  { bg: '#EFF6FF', color: '#0EA5E9' }, // ❄️ Cold Blue
    contacts:   { bg: '#F5F3FF', color: '#7C3AED' }, // 💜 Purple
    campaigns:  { bg: '#FFFBEB', color: '#F59E0B' }, // 🌤️ Warm Gold
    builder:    { bg: '#FFF7ED', color: '#F97316' }, // 🔥 Hot Orange
    inbox:      { bg: '#EFF6FF', color: '#3B82F6' }, // 🔵 Cool Blue
    facebook:   { bg: '#EBF3FF', color: '#1877F2' }, // Facebook Blue
    instagram:  { bg: '#FDE8F0', color: '#E1306C' }, // Instagram Pink
    rules:      { bg: '#EDE9FE', color: '#7C3AED' }, // 💜 Purple
    automation: { bg: '#FEF3C7', color: '#D97706' }, // 🌤️ Warm
    replies:    { bg: '#D1FAE5', color: '#059669' }, // ✅ Green
    analytics:  { bg: '#DBEAFE', color: '#2563EB' }, // 📊 Blue
    settings:   { bg: '#F3F4F6', color: '#6B7280' }, // ⚙️ Gray
    logout:     { bg: '#FEE2E2', color: '#EF4444' }  // 🚪 Red
  },

  // Badge
  badge: {
    default: { bg: '#EF4444', color: '#FFFFFF' },
    green:   { bg: '#10B981', color: '#FFFFFF' },
    blue:    { bg: '#3B82F6', color: '#FFFFFF' },
    fontSize: '10px',
    fontWeight: '700',
    padding: '1px 7px',
    borderRadius: '999px'
  },

  // User card (bottom)
  userCard: {
    margin: '8px',
    padding: '10px 12px',
    background: 'linear-gradient(135deg, #F5F3FF, #EFF6FF)',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    avatar: {
      size: '36px',
      background: 'linear-gradient(135deg, #7C3AED, #0EA5E9)',
      borderRadius: '50%',
      color: '#FFFFFF',
      fontSize: '15px',
      fontWeight: '700'
    },
    name: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#111827'
    },
    plan: {
      fontSize: '11px',
      color: '#059669',
      fontWeight: '500'
    }
  },

  // Logout button
  logout: {
    color: '#EF4444',
    hoverBg: '#FEF2F2'
  }
};

// 🎯 ألوان المراحل (Customer Journey Stages)
export const STAGE_COLORS = {
  contact: {
    name: 'Contact',
    nameAr: 'جهة اتصال',
    bg: '#EDE9FE',
    text: '#A78BFA',
    solid: '#A78BFA'
  },
  engager: {
    name: 'Engager',
    nameAr: 'متفاعل',
    bg: '#DBEAFE',
    text: '#60A5FA',
    solid: '#60A5FA'
  },
  subscriber: {
    name: 'Subscriber',
    nameAr: 'مشترك',
    bg: '#FEF3C7',
    text: '#FBBF24',
    solid: '#FBBF24'
  },
  messager: {
    name: 'Messager',
    nameAr: 'مراسل',
    bg: '#E9D5FF',
    text: '#8B5CF6',
    solid: '#8B5CF6'
  },
  lead: {
    name: 'Lead',
    nameAr: 'عميل محتمل',
    bg: '#FED7AA',
    text: '#FB923C',
    solid: '#FB923C'
  },
  mql: {
    name: 'MQL',
    nameAr: 'مؤهل تسويقياً',
    bg: '#FDBA74',
    text: '#F97316',
    solid: '#F97316'
  },
  sql: {
    name: 'SQL',
    nameAr: 'مؤهل للمبيعات',
    bg: '#FECACA',
    text: '#F87171',
    solid: '#F87171'
  },
  sal: {
    name: 'SAL',
    nameAr: 'مقبول للمبيعات',
    bg: '#FEE2E2',
    text: '#EF4444',
    solid: '#EF4444'
  },
  customer: {
    name: 'Customer',
    nameAr: 'عميل',
    bg: '#D1FAE5',
    text: '#10B981',
    solid: '#10B981'
  },
  upseller: {
    name: 'Upseller',
    nameAr: 'بائع أعلى',
    bg: '#A7F3D0',
    text: '#059669',
    solid: '#059669'
  },
  downseller: {
    name: 'Downseller',
    nameAr: 'بائع أقل',
    bg: '#FED7AA',
    text: '#B45309',
    solid: '#B45309'
  }
};

// 🌡️ ألوان النمط الحراري (Thermal Pattern) - محدث v2
export const THERMAL_COLORS = {
  frozen: {
    name: 'Frozen',
    nameAr: 'متجمد',
    bg: '#EFF6FF',      // blue-50 - أفتح
    text: '#93C5FD',    // blue-300
    solid: '#93C5FD',
    circle: '#BFDBFE'   // blue-200 للدوائر الكبيرة
  },
  cold: {
    name: 'Cold',
    nameAr: 'بارد',
    bg: '#E0F2FE',      // sky-100 - مختلف عن frozen
    text: '#38BDF8',    // sky-400
    solid: '#38BDF8',
    circle: '#BAE6FD'   // sky-200 للدوائر الكبيرة
  },
  warm: {
    name: 'Warm',
    nameAr: 'دافئ',
    bg: '#FEF3C7',      // yellow-100
    text: '#FBBF24',    // yellow-400
    solid: '#FBBF24',
    circle: '#FDE68A'   // yellow-200 للدوائر الكبيرة
  },
  hot: {
    name: 'Hot',
    nameAr: 'ساخن',
    bg: '#FEE2E2',      // red-100
    text: '#EF4444',    // red-500
    solid: '#EF4444',
    circle: '#FECACA'   // red-200 للدوائر الكبيرة
  }
};

// 📊 ترتيب المراحل
export const STAGE_ORDER = [
  'contact',
  'engager',
  'subscriber',
  'messager',
  'lead',
  'mql',
  'sql',
  'sal',
  'customer',
  'upseller',
  'downseller'
];

// 🌡️ ترتيب النمط الحراري
export const THERMAL_ORDER = [
  'frozen',
  'cold',
  'warm',
  'hot'
];

// 🎨 Helper Functions
export const getStageColor = (stage) => {
  return STAGE_COLORS[stage?.toLowerCase()] || STAGE_COLORS.contact;
};

export const getThermalColor = (thermal) => {
  return THERMAL_COLORS[thermal?.toLowerCase()] || THERMAL_COLORS.cold;
};

export const getStageLabel = (stage, lang = 'ar') => {
  const stageData = STAGE_COLORS[stage?.toLowerCase()];
  if (!stageData) return stage;
  return lang === 'ar' ? stageData.nameAr : stageData.name;
};

export const getThermalLabel = (thermal, lang = 'ar') => {
  const thermalData = THERMAL_COLORS[thermal?.toLowerCase()];
  if (!thermalData) return thermal;
  return lang === 'ar' ? thermalData.nameAr : thermalData.name;
};

// 🎯 Badge Component Helper
export const getStageBadgeClass = (stage) => {
  const color = getStageColor(stage);
  return {
    backgroundColor: color.bg,
    color: color.text
  };
};

export const getThermalBadgeClass = (thermal) => {
  const color = getThermalColor(thermal);
  return {
    backgroundColor: color.bg,
    color: color.text
  };
};

// 🧭 Sidebar Icon Helper
export const getSidebarIcon = (key) => {
  return SIDEBAR.icons[key] || SIDEBAR.icons.settings;
};

// 📏 Spacing & Sizes
export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
};

export const BORDER_RADIUS = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  full: '9999px'
};

// 🔤 Typography
export const FONT_SIZES = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem' // 30px
};

export const FONT_WEIGHTS = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

// 🎨 Component Styles
export const COMPONENT_STYLES = {
  card: {
    background: COLORS.bgWhite,
    border: `1px solid ${COLORS.borderGray}`,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
  },
  
  button: {
    primary: {
      background: COLORS.primary,
      color: COLORS.bgWhite,
      borderRadius: BORDER_RADIUS.md,
      padding: `${SPACING.sm} ${SPACING.lg}`,
      fontWeight: FONT_WEIGHTS.medium
    },
    secondary: {
      background: 'transparent',
      color: COLORS.textPrimary,
      border: `1px solid ${COLORS.borderGray}`,
      borderRadius: BORDER_RADIUS.md,
      padding: `${SPACING.sm} ${SPACING.lg}`,
      fontWeight: FONT_WEIGHTS.medium
    }
  },
  
  input: {
    border: `1px solid ${COLORS.borderGray}`,
    borderRadius: BORDER_RADIUS.md,
    padding: `${SPACING.sm} ${SPACING.md}`,
    fontSize: FONT_SIZES.sm
  },
  
  badge: {
    borderRadius: BORDER_RADIUS.full,
    padding: `${SPACING.xs} ${SPACING.md}`,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold
  }
};

// 📱 Breakpoints (for responsive design)
export const BREAKPOINTS = {
  mobile: '640px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px'
};

// 🎨 Logo & Branding
export const LOGO = {
  icon: '/assets/logo-icon.png',
  full: '/assets/logo-full.png',
  light: '/assets/logo-full-light.png',
  dark: '/assets/logo-full-dark.png',
  shell: '/logo.png',
  
  sizes: {
    xs: { width: 24, height: 24 },
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 128, height: 128 },
    '2xl': { width: 256, height: 256 }
  },
  
  symbolism: {
    flame: 'اللهب يمثل التحول والطاقة',
    blue: 'الأزرق يمثل العملاء الباردين (Cold/Frozen)',
    orange: 'البرتقالي يمثل العملاء الساخنين (Warm/Hot)',
    gradient: 'التدرج يمثل رحلة التحول الحراري للعملاء',
    tShape: 'حرف T يمثل Triggerio ويرمز للدقة والاستهداف'
  }
};

// 🎨 Brand Colors
export const BRAND_COLORS = {
  coldBlue: {
    light: '#38BDF8',
    main: '#0EA5E9',
    dark: '#0284C7'
  },
  coolBlue: {
    light: '#60A5FA',
    main: '#3B82F6',
    dark: '#2563EB'
  },
  warmPurple: {
    light: '#A78BFA',
    main: '#8B5CF6',
    dark: '#7C3AED'
  },
  warmGold: {
    light: '#FCD34D',
    main: '#F59E0B',
    dark: '#D97706'
  },
  hotOrange: {
    light: '#FB923C',
    main: '#F97316',
    dark: '#EA580C'
  },
  thermalGradient: {
    start: '#0EA5E9',
    cool: '#3B82F6',
    transition: '#8B5CF6',
    warm: '#F59E0B',
    hot: '#F97316'
  }
};

// 🎭 Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
};

// 🔢 Z-Index Layers
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60
};

// 🎨 Helper Functions
export const getLogoSize = (size = 'md') => {
  return LOGO.sizes[size] || LOGO.sizes.md;
};

export const getLogoPath = (variant = 'full') => {
  return LOGO[variant] || LOGO.full;
};

export const getThermalGradient = (direction = 'to right') => {
  return `linear-gradient(${direction}, ${BRAND_COLORS.thermalGradient.start}, ${BRAND_COLORS.thermalGradient.cool}, ${BRAND_COLORS.thermalGradient.warm}, ${BRAND_COLORS.thermalGradient.hot})`;
};

export const getFullThermalGradient = (direction = 'to right') => {
  return `linear-gradient(${direction}, 
    ${BRAND_COLORS.thermalGradient.start}, 
    ${BRAND_COLORS.thermalGradient.cool}, 
    ${BRAND_COLORS.thermalGradient.transition}, 
    ${BRAND_COLORS.thermalGradient.warm}, 
    ${BRAND_COLORS.thermalGradient.hot}
  )`;
};

export const getThermalBrandColor = (thermal) => {
  const patterns = {
    frozen: BRAND_COLORS.coldBlue.dark,
    cold: BRAND_COLORS.coldBlue.main,
    warm: BRAND_COLORS.warmGold.main,
    hot: BRAND_COLORS.hotOrange.main
  };
  return patterns[thermal?.toLowerCase()] || BRAND_COLORS.coldBlue.main;
};

export default {
  COLORS,
  SIDEBAR,
  STAGE_COLORS,
  THERMAL_COLORS,
  STAGE_ORDER,
  THERMAL_ORDER,
  LOGO,
  BRAND_COLORS,
  getStageColor,
  getThermalColor,
  getStageLabel,
  getThermalLabel,
  getStageBadgeClass,
  getThermalBadgeClass,
  getSidebarIcon,
  getLogoSize,
  getLogoPath,
  getThermalGradient,
  getFullThermalGradient,
  getThermalBrandColor,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
  FONT_WEIGHTS,
  COMPONENT_STYLES,
  BREAKPOINTS,
  SHADOWS,
  Z_INDEX
};