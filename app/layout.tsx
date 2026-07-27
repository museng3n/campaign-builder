import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 📝 GHL-74: سكربت منع الوميض الموحّد — الإشارة الوحيدة هي class="dark" */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try{
    var t = null;
    // 1. الأولوية القصوى: معامل الرابط (الطريقة الوحيدة التي تعمل عبر iframe)
    var q = new URLSearchParams(window.location.search).get('theme');
    if (q === 'dark' || q === 'light') { t = q; }
    // 2. الاحتياطي: التخزين المحلي
    if (!t) { t = localStorage.getItem('triggerio_theme'); }
    // 3. الأخير: تفضيل نظام التشغيل
    if (t !== 'dark' && t !== 'light') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var d = document.documentElement;
    // الإشارة الوحيدة — class فقط
    if (t === 'dark') { d.classList.add('dark'); }
    else { d.classList.remove('dark'); }
    // خاصية متصفح لتلوين شريط التمرير والحقول
    d.style.colorScheme = t;
    localStorage.setItem('triggerio_theme', t);
  }catch(e){}
})();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
