"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CampaignsPage() {
  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang')
    const lang = urlLang || localStorage.getItem('triggerio_language') || 'ar'
    router.replace(`/campaigns/create?lang=${lang}`)
  }, [router])

  return null
}
