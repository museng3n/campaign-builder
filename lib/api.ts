const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://triggerio-backend.onrender.com"

function getHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("triggerio_token") : null
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const campaignsAPI = {
  create: async (data: any) => {
    const res = await fetch(`${API_URL}/api/campaigns`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error((await res.json()).message || "Failed to create campaign")
    return res.json()
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error((await res.json()).message || "Failed to update campaign")
    return res.json()
  },

  launch: async (id: string) => {
    const res = await fetch(`${API_URL}/api/campaigns/${id}/launch`, {
      method: "POST",
      headers: getHeaders(),
    })
    if (!res.ok) throw new Error((await res.json()).message || "Failed to launch campaign")
    return res.json()
  },

  getAll: async () => {
    const res = await fetch(`${API_URL}/api/campaigns`, {
      headers: getHeaders(),
    })
    if (!res.ok) throw new Error("Failed to fetch campaigns")
    return res.json()
  },
}

export const emailAccountsAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/email-accounts`, {
      headers: getHeaders(),
    })
    if (!res.ok) throw new Error("Failed to fetch email accounts")
    return res.json()
  },

  sendTest: async (id: string) => {
    const res = await fetch(`${API_URL}/api/email-accounts/${id}/test`, {
      method: "POST",
      headers: getHeaders(),
    })
    if (!res.ok) throw new Error("Failed to send test email")
    return res.json()
  },
}
