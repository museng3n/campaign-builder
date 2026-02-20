"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    if (urlToken) {
      localStorage.setItem('authToken', urlToken)
      window.history.replaceState({}, '', window.location.pathname)
    }
    router.replace("/campaigns/create")
  }, [router])

  return null
}
