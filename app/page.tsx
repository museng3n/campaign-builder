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

    // Pass lang to the create page so it reads it correctly
    const lang = urlLang || localStorage.getItem('triggerio_language') || 'ar'
    router.replace(`/campaigns/create?lang=${lang}`)
  }, [router])

  return null
}
