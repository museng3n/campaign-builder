"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    const urlLang = urlParams.get('lang')

    if (urlToken) {
      localStorage.setItem('triggerio_token', urlToken)
    }
    if (urlLang === 'ar' || urlLang === 'en') {
      localStorage.setItem('triggerio_language', urlLang)
    }
    const urlTheme = urlParams.get('theme')
    if (urlTheme === 'light' || urlTheme === 'dark') {
      localStorage.setItem('triggerio_theme', urlTheme)
    }

    // Pass lang and theme to the create page so it reads them correctly
    const lang = urlLang || localStorage.getItem('triggerio_language') || 'ar'
    const theme = urlTheme || localStorage.getItem('triggerio_theme') || 'light'
    router.replace(`/campaigns/create?lang=${lang}&theme=${theme}`)
  }, [router])

  return null
}
