"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CampaignsPage() {
  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang')
    const urlTheme = urlParams.get('theme')
    const lang = urlLang || localStorage.getItem('triggerio_language') || 'ar'
    const theme = urlTheme || localStorage.getItem('triggerio_theme') || 'light'
    router.replace(`/campaigns/create?lang=${lang}&theme=${theme}`)
  }, [router])

  return null
}
