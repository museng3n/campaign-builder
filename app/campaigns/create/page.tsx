"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ArrowLeft, Mail, Clock, CheckCircle2, X, Loader2, List, GitBranch, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { popularTemplates, byGoalTemplates, byIndustryTemplates } from "@/lib/campaign-templates"
import { campaignsAPI, emailAccountsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import SequenceFlowBuilder from "@/components/SequenceBuilder/SequenceFlowBuilder"
import type { SequenceGraph } from "@/components/SequenceBuilder/SequenceFlowBuilder"

const steps = [
  { name: "Template", nameAr: "قالب" },
  { name: "Details", nameAr: "التفاصيل" },
  { name: "Audience", nameAr: "الجمهور" },
  { name: "Sequence", nameAr: "التسلسل" },
  { name: "Emails", nameAr: "الرسائل" },
  { name: "Settings", nameAr: "الإعدادات" },
  { name: "Review", nameAr: "المراجعة" },
]

export default function CreateCampaignPage() {
  const { toast } = useToast()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')
    if (urlToken) {
      localStorage.setItem('triggerio_token', urlToken)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("popular")
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<any>(null)

  const [saving, setSaving] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [savedCampaignId, setSavedCampaignId] = useState<string | null>(null)
  const [emailAccounts, setEmailAccounts] = useState<any[]>([])
  const [selectedEmailAccount, setSelectedEmailAccount] = useState("")
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showLaunchConfirm, setShowLaunchConfirm] = useState(false)
  const [showLaunchSuccess, setShowLaunchSuccess] = useState(false)
  const [emailEdits, setEmailEdits] = useState<{ subject: string; body: string }[]>([])
  const [sequenceSteps, setSequenceSteps] = useState<Array<{
    type: "email" | "wait";
    emailIndex?: number;
    subject?: string;
    body?: string;
    waitDays?: number;
    label?: string;
  }>>([])

  // GHL-68 Phase 3: Smart Sequence (graph-based)
  const [sequenceType, setSequenceType] = useState<"linear" | "graph">("linear")
  const [sequenceGraph, setSequenceGraph] = useState<SequenceGraph>({ steps: [], startStepId: null, version: 1 })

  // GHL-69: Audience Type & Count
  const [audienceType, setAudienceType] = useState('all')
  const [audienceCount, setAudienceCount] = useState<number | null>(null)
  const [audienceBreakdown, setAudienceBreakdown] = useState<any>({})
  const [audienceLoading, setAudienceLoading] = useState(false)
  const [availableGroups, setAvailableGroups] = useState<string[]>([])
  const [availableCsvLists, setAvailableCsvLists] = useState<any[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedCsvListId, setSelectedCsvListId] = useState('')
  const [singleContactSearch, setSingleContactSearch] = useState('')
  const [singleContactResults, setSingleContactResults] = useState<any[]>([])
  const [selectedSingleContact, setSelectedSingleContact] = useState<any>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  const [campaignData, setCampaignData] = useState({
    name: "",
    goal: "",
    industry: "",
    description: "",
    tags: [] as string[],
    audience: {
      temperature: ["warm"] as string[],
      sources: ["csv"] as string[],
      filters: {
        industry: "",
        location: "",
        tags: "",
        groups: "",
      },
      excludeBounced: true,
      excludeUnsubscribed: true,
      excludeReplied: false,
    },
    sendSchedule: {
      sendTime: "best",
      specificTime: "",
      days: ["mon", "tue", "wed", "thu", "fri"] as string[],
      dailyLimit: 50,
      warmup: true,
      warmupStart: 20,
      warmupIncrement: 10,
    },
    tracking: {
      opens: true,
      clicks: true,
      replies: true,
      unsubscribeLink: false,
    },
    sequence: {
      stopOnReply: true,
      stopOnUnsubscribe: true,
      continueOnBounce: false,
    },
  })

  const handleNext = () => {
    if (currentStep === 2 && audienceType === 'single' && selectedSingleContact) {
      setCampaignData(prev => ({
        ...prev,
        audience: { ...prev.audience, audienceType: 'single', singleContactId: selectedSingleContact._id }
      }));
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    if (template?.structure?.length) {
      setEmailEdits(
        template.structure.map((email: any) => ({
          subject: email.subject || "",
          body: email.body || "",
        }))
      )
      // Build sequenceSteps from template structure
      const newSteps: typeof sequenceSteps = []
      template.structure.forEach((item: any, index: number) => {
        if (index > 0) {
          const prevDay = template.structure[index - 1].day
          const waitDays = item.day - prevDay
          newSteps.push({ type: "wait", waitDays })
        }
        newSteps.push({
          type: "email",
          emailIndex: index,
          subject: item.subject,
          body: item.body,
          label: item.type?.toUpperCase() || `EMAIL ${index + 1}`,
        })
      })
      setSequenceSteps(newSteps)
    } else {
      setEmailEdits([{ subject: "", body: "" }])
      setSequenceSteps([{ type: "email", emailIndex: 0, subject: "", body: "", label: "EMAIL 1" }])
    }
    toast({ title: `Template '${template.name}' applied successfully` })
    handleNext()
  }

  const renderTemplateCard = (template: any) => (
    <Card
      key={template.id}
      className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#7C3AED]"
    >
      <CardContent className="p-6">
        {/* Badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-purple-100 text-[#7C3AED] hover:bg-purple-100">{template.badge}</Badge>
          <span className="text-xs text-gray-500">by {template.author}</span>
        </div>

        {/* Template Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{template.description}</p>

        {/* Sequence Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{template.emails} emails</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{template.days} days</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-xs text-gray-500 mb-1">Open Rate</div>
            <div className="text-lg font-bold text-[#10B981]">{template.stats.avgOpenRate}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Reply Rate</div>
            <div className="text-lg font-bold text-[#7C3AED]">{template.stats.avgReplyRate}%</div>
          </div>
        </div>

        {/* Usage */}
        <div className="text-xs text-gray-500 mb-4">
          Used {template.stats.usedCount} times
        </div>

        {/* Best For Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.bestFor.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="bg-blue-50 text-blue-600">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-[#7C3AED] text-[#7C3AED] bg-transparent"
            onClick={() => {
              setPreviewTemplate(template)
              setShowPreview(true)
            }}
          >
            Preview
          </Button>
          <Button
            className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9]"
            onClick={() => handleTemplateSelect(template)}
          >
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // جلب حسابات البريد المتصلة
  useEffect(() => {
    const fetchEmailAccounts = async () => {
      try {
        const data = await emailAccountsAPI.getAll()
        setEmailAccounts(data.accounts || [])
        if (data.accounts?.length > 0) {
          setSelectedEmailAccount(data.accounts[0]._id)
        }
      } catch (err) {
        console.error("Failed to fetch email accounts:", err)
      }
    }
    fetchEmailAccounts()
  }, [])

  // Auto-save campaign data to sessionStorage
  useEffect(() => {
    const dataToSave = {
      campaignData,
      selectedTemplate: selectedTemplate ? { id: selectedTemplate.id, name: selectedTemplate.name } : null,
      emailEdits,
      sequenceSteps,
      selectedEmailAccount,
      currentStep,
    }
    sessionStorage.setItem('triggerio_campaign_draft', JSON.stringify(dataToSave))
  }, [campaignData, selectedTemplate, emailEdits, sequenceSteps, selectedEmailAccount, currentStep])

  // Restore from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('triggerio_campaign_draft')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.campaignData) setCampaignData(data.campaignData)
        if (data.emailEdits?.length) setEmailEdits(data.emailEdits)
        if (data.sequenceSteps?.length) setSequenceSteps(data.sequenceSteps)
        if (data.selectedEmailAccount) setSelectedEmailAccount(data.selectedEmailAccount)
        if (data.currentStep) setCurrentStep(data.currentStep)
      } catch (e) {
        console.error('Failed to restore draft:', e)
      }
    }
  }, [])

  // Build sequence steps from sequenceSteps + emailEdits for payload
  const buildSequenceSteps = () => {
    if (sequenceSteps.length === 0) {
      const edit = emailEdits[0] || { subject: "", body: "" }
      return [{ stepNumber: 1, delayDays: 0, subject: edit.subject, body: edit.body, type: "initial" }]
    }
    let dayCounter = 0
    return sequenceSteps
      .filter(s => s.type === "email")
      .map((step, index) => {
        // Calculate day from wait steps before this email
        dayCounter = 0
        const emailStepIndex = sequenceSteps.indexOf(step)
        for (let i = 0; i < emailStepIndex; i++) {
          if (sequenceSteps[i].type === "wait") {
            dayCounter += sequenceSteps[i].waitDays || 0
          }
        }
        const edit = emailEdits[index]
        return {
          stepNumber: index + 1,
          delayDays: dayCounter,
          subject: edit?.subject || step.subject || "",
          body: edit?.body || step.body || "",
          type: index === 0 ? "initial" : "follow_up",
        }
      })
  }

  // حفظ كمسودة - returns campaign ID
  const handleSaveDraft = async (): Promise<string | null> => {
    setSaving(true)
    setStatusMessage(null)
    try {
      const payload: any = {
        name: campaignData.name || "Untitled Campaign",
        status: "draft",
        emailAccountId: selectedEmailAccount || undefined,
        sequenceType,
        ...(sequenceType === "graph" ? { sequenceGraph } : {}),
        sequence: {
          steps: buildSequenceSteps(),
        },
        audience: {
          temperature: campaignData.audience.temperature,
          sources: campaignData.audience.sources,
          filters: campaignData.audience.filters,
          excludeBounced: campaignData.audience.excludeBounced,
          excludeUnsubscribed: campaignData.audience.excludeUnsubscribed,
        },
        settings: {
          dailyLimit: campaignData.sendSchedule.dailyLimit,
          sendWindow: campaignData.sendSchedule.sendTime === "specific"
            ? { start: campaignData.sendSchedule.specificTime, end: campaignData.sendSchedule.specificTime }
            : { start: "09:00", end: "17:00" },
          timezone: "Asia/Baghdad",
          sendTime: campaignData.sendSchedule.sendTime,
          days: campaignData.sendSchedule.days,
          warmup: campaignData.sendSchedule.warmup,
          stopOnReply: campaignData.sequence.stopOnReply,
          stopOnUnsubscribe: campaignData.sequence.stopOnUnsubscribe,
          trackOpens: campaignData.tracking.opens,
          trackClicks: campaignData.tracking.clicks,
          trackReplies: campaignData.tracking.replies,
        },
      }

      // Validate email steps
      if (sequenceType === "graph") {
        // Graph mode: validate graph email steps
        const graphEmails = sequenceGraph.steps.filter((s) => s.type === "email")
        const emptyGraphEmails = graphEmails.filter((s) => !s.subject?.trim() || !s.body?.trim())
        if (graphEmails.length > 0 && emptyGraphEmails.length > 0) {
          setStatusMessage({ type: "error", text: "Some email steps in the smart sequence are missing subject or body." })
          toast({ title: "Please fill in all email steps", variant: "destructive" })
          setSaving(false)
          return null
        }
      } else {
        const emptySteps = payload.sequence.steps.filter(
          (s: any) => !s.subject.trim() || !s.body.trim()
        )
        if (emptySteps.length > 0) {
          setStatusMessage({
            type: "error",
            text: `Email step(s) ${emptySteps.map((s: any) => s.stepNumber).join(", ")} missing subject or body. Please fill in all emails.`,
          })
          toast({ title: "Please fill in all required fields", variant: "destructive" })
          setSaving(false)
          return null
        }
      }

      console.log('Campaign payload:', JSON.stringify(payload, null, 2))

      if (savedCampaignId) {
        await campaignsAPI.update(savedCampaignId, payload)
        setStatusMessage({ type: "success", text: "Draft updated successfully!" })
        toast({ title: "Campaign saved as draft" })
        sessionStorage.removeItem('triggerio_campaign_draft')
        return savedCampaignId
      } else {
        const result = await campaignsAPI.create(payload)
        const newId = result.data?._id || result.campaign?._id
        setSavedCampaignId(newId)
        setStatusMessage({ type: "success", text: "Draft saved successfully!" })
        toast({ title: "Campaign saved as draft" })
        sessionStorage.removeItem('triggerio_campaign_draft')
        return newId
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save draft" })
      return null
    } finally {
      setSaving(false)
      setTimeout(() => setStatusMessage(null), 4000)
    }
  }

  // إطلاق الحملة
  const handleLaunchCampaign = async () => {
    if (!selectedEmailAccount) {
      setStatusMessage({ type: "error", text: "Please select an email account first" })
      return
    }
    setLaunching(true)
    setStatusMessage(null)
    try {
      // حفظ أولاً إذا لم تُحفظ - get ID directly from return value
      let campaignId = savedCampaignId
      if (!campaignId) {
        campaignId = await handleSaveDraft()
      }
      if (!campaignId) {
        throw new Error("Failed to save campaign before launching")
      }
      await campaignsAPI.launch(campaignId)
      setStatusMessage({ type: "success", text: "Campaign launched successfully!" })
      toast({ title: "Campaign launched!" })
      sessionStorage.removeItem('triggerio_campaign_draft')
      setShowLaunchSuccess(true)
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to launch campaign" })
    } finally {
      setLaunching(false)
    }
  }

  // GHL-69: API helpers for audience count
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('triggerio_token') || ''
    }
    return ''
  }

  const API_BASE = 'https://triggerio-backend.onrender.com'

  const fetchAudienceCount = async () => {
    // For single contact, count is 1 if selected, 0 if not
    if (audienceType === 'single') {
      setAudienceCount(selectedSingleContact ? 1 : 0);
      setAudienceLoading(false);
      return;
    }
    setAudienceLoading(true)
    try {
      const body: any = { audienceType }
      if (audienceType === 'filter') {
        body.temperature = campaignData.audience?.temperature || []
        body.sources = campaignData.audience?.sources || []
        body.filters = campaignData.audience?.filters || {}
      } else if (audienceType === 'groups') {
        body.groups = selectedGroups
      } else if (audienceType === 'csv') {
        body.csvListId = selectedCsvListId
      }
      const res = await fetch(`${API_BASE}/api/campaigns/audience-count`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (res.ok) {
        setAudienceCount(data.count)
        setAudienceBreakdown(data.breakdown || {})
      }
    } catch (err) {
      console.error('Error fetching audience count:', err)
    }
    setAudienceLoading(false)
  }

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/campaigns/groups-list`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (res.ok) {
        setAvailableGroups(data.groups || [])
      }
    } catch (err) {
      console.error('Error fetching groups:', err)
    }
  }

  const fetchCsvLists = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/campaigns/csv-lists`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (res.ok) {
        setAvailableCsvLists(data.lists || [])
      }
    } catch (err) {
      console.error('Error fetching CSV lists:', err)
    }
  }

  const searchContacts = async (query: string) => {
    if (!query || query.length < 2) {
      setSingleContactResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/contacts?search=${encodeURIComponent(query)}&limit=10`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSingleContactResults(data.contacts || data.data || data || []);
      }
    } catch (err) {
      console.error('Error searching contacts:', err);
    }
    setSearchLoading(false);
  };

  // إرسال بريد تجريبي
  const handleSendTestEmail = async () => {
    if (!selectedEmailAccount) {
      setStatusMessage({ type: "error", text: "Please select an email account first" })
      return
    }
    try {
      await emailAccountsAPI.sendTest(selectedEmailAccount)
      setStatusMessage({ type: "success", text: "Test email sent! Check your inbox." })
      setTimeout(() => setStatusMessage(null), 4000)
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to send test email" })
    }
  }

  // GHL-69: Fetch groups and CSV lists when entering Step 3 (index 2)
  useEffect(() => {
    if (currentStep === 2) {
      fetchGroups()
      fetchCsvLists()
      fetchAudienceCount()
    }
  }, [currentStep])

  // GHL-69: Re-fetch count when audience type or filters change
  useEffect(() => {
    if (currentStep === 2) {
      fetchAudienceCount()
    }
  }, [audienceType, selectedGroups, selectedCsvListId, selectedSingleContact, campaignData.audience?.temperature, campaignData.audience?.sources])

  return (
    <div className="min-h-screen bg-[#F3F4F6]" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/campaigns">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
              <p className="text-sm text-gray-600">إنشاء حملة جديدة</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                      index < currentStep
                        ? "bg-[#7C3AED] text-white cursor-pointer"
                        : index === currentStep
                          ? "bg-[#7C3AED] text-white cursor-pointer"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed opacity-50"
                    }`}
                    onClick={() => {
                      if (index <= currentStep) {
                        setCurrentStep(index)
                      }
                    }}
                  >
                    {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <span>{index + 1}</span>}
                  </div>

                  {/* Step Label */}
                  <div
                    className={`text-xs mt-2 font-medium ${index === currentStep ? "text-[#7C3AED]" : "text-gray-500"}`}
                  >
                    {step.name}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-6 ${index < currentStep ? "bg-[#7C3AED]" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Step 1: Choose Template */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Start with a proven template</h2>
              <p className="text-gray-600">ابدأ بقالب مجرب</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 justify-center mb-8">
              <Button
                variant={activeTab === "popular" ? "default" : "outline"}
                onClick={() => setActiveTab("popular")}
                className={activeTab === "popular" ? "bg-[#7C3AED]" : ""}
              >
                Popular
              </Button>
              <Button
                variant={activeTab === "goal" ? "default" : "outline"}
                onClick={() => setActiveTab("goal")}
                className={activeTab === "goal" ? "bg-[#7C3AED]" : ""}
              >
                By Goal
              </Button>
              <Button
                variant={activeTab === "industry" ? "default" : "outline"}
                onClick={() => setActiveTab("industry")}
                className={activeTab === "industry" ? "bg-[#7C3AED]" : ""}
              >
                By Industry
              </Button>
              <Button
                variant={activeTab === "blank" ? "default" : "outline"}
                onClick={() => setActiveTab("blank")}
                className={activeTab === "blank" ? "bg-[#7C3AED]" : ""}
              >
                Blank
              </Button>
            </div>

            {/* Template Grid */}
            {activeTab === "popular" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularTemplates.filter(t => t.id !== 13).map((template) => renderTemplateCard(template))}
              </div>
            )}

            {activeTab === "goal" && (
              <div className="space-y-8">
                {byGoalTemplates.map((group) => (
                  <div key={group.goal}>
                    <h3 className="text-lg font-semibold mb-4">{group.goal}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.templates.map((id) => {
                        const template = popularTemplates.find(t => t.id === id)
                        if (!template) return null
                        return renderTemplateCard(template)
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "industry" && (
              <div className="space-y-8">
                {byIndustryTemplates.map((group) => (
                  <div key={group.industry}>
                    <h3 className="text-lg font-semibold mb-4">{group.industry}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.templates.map((id) => {
                        const template = popularTemplates.find(t => t.id === id)
                        if (!template) return null
                        return renderTemplateCard(template)
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "blank" && (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-12 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Start from Scratch</h3>
                  <p className="text-gray-600 mb-6">Build your own campaign from scratch. Full control over every email.</p>
                  <Button
                    className="bg-[#7C3AED] hover:bg-[#6D28D9]"
                    onClick={() => {
                      const blankTemplate = popularTemplates.find(t => t.id === 13)
                      if (blankTemplate) handleTemplateSelect(blankTemplate)
                    }}
                  >
                    Create Blank Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Campaign Details */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 space-y-6">
                <div>
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Tech Startups Q4 Outreach"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="goal">Goal</Label>
                  <Select
                    value={campaignData.goal}
                    onValueChange={(value) => setCampaignData({ ...campaignData, goal: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select campaign goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book_meeting">Book Meeting</SelectItem>
                      <SelectItem value="demo_request">Demo Request</SelectItem>
                      <SelectItem value="generate_leads">Generate Leads</SelectItem>
                      <SelectItem value="build_relationship">Build Relationship</SelectItem>
                      <SelectItem value="re_engage">Re-engage Cold Leads</SelectItem>
                      <SelectItem value="get_feedback">Get Feedback</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={campaignData.industry}
                    onValueChange={(value) => setCampaignData({ ...campaignData, industry: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saas">SaaS / Technology</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="agencies">Agencies / Marketing</SelectItem>
                      <SelectItem value="consulting">Consulting / Services</SelectItem>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="finance">Finance / Insurance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your campaign goals and target audience..."
                    value={campaignData.description}
                    onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                    className="mt-2 min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., Q4, Tech, High-Value"
                    className="mt-2"
                    value={campaignData.tags.join(", ")}
                    onChange={(e) => setCampaignData(prev => ({
                      ...prev,
                      tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Press Enter to add tags</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Target Audience */}
        {currentStep === 2 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-8 space-y-6">

                {/* ===== AUDIENCE TYPE SELECTOR ===== */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Who will receive this campaign?</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Contacts', desc: 'Send to everyone in your contact list' },
                      { value: 'csv', label: 'Specific CSV List', desc: 'Send to contacts from a specific CSV import' },
                      { value: 'groups', label: 'Specific Group(s)', desc: 'Send to contacts in selected groups' },
                      { value: 'filter', label: 'Custom Filter', desc: 'Filter by temperature, source, tags, etc.' },
                      { value: 'single', label: 'Single Contact', desc: 'Send to one specific contact' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          audienceType === option.value
                            ? 'border-purple-400 bg-purple-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="audienceType"
                          value={option.value}
                          checked={audienceType === option.value}
                          onChange={(e) => {
                            setAudienceType(e.target.value)
                            setCampaignData(prev => ({
                              ...prev,
                              audience: { ...prev.audience, audienceType: e.target.value }
                            }))
                          }}
                          className="mt-1 accent-purple-500"
                        />
                        <div>
                          <div className="font-medium text-gray-800">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ===== CSV LIST SELECTOR ===== */}
                {audienceType === 'csv' && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-gray-700 mb-3">Select CSV List</h4>
                    {availableCsvLists.length > 0 ? (
                      <div className="space-y-2">
                        {availableCsvLists.map((list: any) => (
                          <label
                            key={list.csvListId}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedCsvListId === list.csvListId
                                ? 'border-blue-400 bg-blue-100'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="csvList"
                                value={list.csvListId}
                                checked={selectedCsvListId === list.csvListId}
                                onChange={(e) => {
                                  setSelectedCsvListId(e.target.value)
                                  setCampaignData(prev => ({
                                    ...prev,
                                    audience: { ...prev.audience, csvListId: e.target.value }
                                  }))
                                }}
                                className="accent-blue-500"
                              />
                              <span className="font-medium text-gray-700">{list.csvListId}</span>
                            </div>
                            <span className="text-sm text-gray-500">{list.count} contacts</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg className="w-10 h-10 text-blue-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <p className="text-gray-500 text-sm mb-3">لا توجد قوائم CSV بعد</p>
                        <p className="text-gray-400 text-xs mb-4">ارفع ملف CSV من صفحة جهات الاتصال أولاً</p>
                        <button
                          type="button"
                          onClick={() => window.open('/contacts?action=import', '_blank')}
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all duration-300"
                        >
                          <span className="flex items-center gap-2 justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            رفع ملف CSV
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== GROUPS SELECTOR ===== */}
                {audienceType === 'groups' && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-gray-700 mb-3">Select Group(s)</h4>
                    {availableGroups.length > 0 ? (
                      <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {availableGroups.map((group: string) => (
                            <button
                              key={group}
                              type="button"
                              onClick={() => {
                                const newGroups = selectedGroups.includes(group)
                                  ? selectedGroups.filter((g) => g !== group)
                                  : [...selectedGroups, group]
                                setSelectedGroups(newGroups)
                                setCampaignData(prev => ({
                                  ...prev,
                                  audience: { ...prev.audience, selectedGroups: newGroups }
                                }))
                              }}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                selectedGroups.includes(group)
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400'
                              }`}
                            >
                              {group}
                              {selectedGroups.includes(group) && (
                                <svg className="w-3 h-3 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                        {selectedGroups.length > 0 && (
                          <p className="text-sm text-green-600">تم اختيار {selectedGroups.length} مجموعة</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg className="w-10 h-10 text-green-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        <p className="text-gray-500 text-sm mb-3">لا توجد مجموعات بعد</p>
                        <p className="text-gray-400 text-xs">أضف مجموعات لجهات الاتصال من صفحة جهات الاتصال أولاً</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ===== SINGLE CONTACT ===== */}
                {audienceType === 'single' && (
                  <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-gray-700 mb-3">Select Contact</h4>

                    {/* Search Input */}
                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={singleContactSearch}
                        onChange={(e) => {
                          setSingleContactSearch(e.target.value);
                          searchContacts(e.target.value);
                        }}
                        placeholder="ابحث بالاسم أو الإيميل أو الرقم..."
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                      />
                      <svg className="w-4 h-4 text-gray-400 absolute right-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                      </svg>
                    </div>

                    {/* Search Results */}
                    {searchLoading && (
                      <div className="text-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500 mx-auto"></div>
                      </div>
                    )}

                    {!searchLoading && singleContactResults.length > 0 && !selectedSingleContact && (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {singleContactResults.map((c: any) => (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => {
                              setSelectedSingleContact(c);
                              setSingleContactSearch('');
                              setSingleContactResults([]);
                              setCampaignData(prev => ({
                                ...prev,
                                audience: { ...prev.audience, audienceType: 'single', singleContactId: c._id }
                              }));
                            }}
                            className="w-full text-right p-2.5 rounded-lg border border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 transition-all text-sm"
                          >
                            <div className="font-medium text-gray-700">{c.name || c.firstName || c.email || 'بدون اسم'}</div>
                            <div className="text-xs text-gray-400">
                              {c.email && <span>{c.email}</span>}
                              {c.email && c.phone && <span> | </span>}
                              {c.phone && <span>{c.phone}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected Contact */}
                    {selectedSingleContact && (
                      <div className="p-3 rounded-lg border-2 border-purple-400 bg-purple-100 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-700">{selectedSingleContact.name || selectedSingleContact.firstName || selectedSingleContact.email}</div>
                          <div className="text-xs text-gray-500">
                            {selectedSingleContact.email}
                            {selectedSingleContact.phone && ` | ${selectedSingleContact.phone}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSingleContact(null);
                            setSingleContactSearch('');
                          }}
                          className="text-purple-400 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {!selectedSingleContact && singleContactResults.length === 0 && singleContactSearch.length === 0 && (
                      <p className="text-gray-400 text-xs text-center">اكتب اسم أو إيميل جهة الاتصال للبحث</p>
                    )}
                  </div>
                )}

                {/* ===== CUSTOM FILTER ===== */}
                {audienceType === 'filter' && (
                  <div className="mb-6 space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">1. Temperature Targeting</Label>
                      <div className="space-y-3">
                        {[
                          { value: "cold", label: "Cold (Never contacted)" },
                          { value: "warm", label: "Warm (Opened/Clicked before)" },
                          { value: "hot", label: "Hot (Replied before)" },
                          { value: "frozen", label: "Frozen (No activity 30+ days)" },
                        ].map((temp) => (
                          <div key={temp.value} className="flex items-center gap-2">
                            <Checkbox
                              id={temp.value}
                              checked={campaignData.audience.temperature.includes(temp.value)}
                              onCheckedChange={(checked) => {
                                setCampaignData(prev => ({
                                  ...prev,
                                  audience: {
                                    ...prev.audience,
                                    temperature: checked
                                      ? [...prev.audience.temperature, temp.value]
                                      : prev.audience.temperature.filter(t => t !== temp.value)
                                  }
                                }))
                              }}
                            />
                            <Label htmlFor={temp.value} className="font-normal">
                              {temp.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-lg font-semibold mb-4 block">2. Source Filters</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: "csv", label: "CSV Import" },
                          { value: "apollo", label: "Apollo.io" },
                          { value: "hunter", label: "Hunter.io" },
                          { value: "linkedin", label: "LinkedIn" },
                          { value: "instagram", label: "Instagram (engaged)" },
                          { value: "facebook", label: "Facebook" },
                          { value: "manual", label: "Manual Entry" },
                        ].map((source) => (
                          <div key={source.value} className="flex items-center gap-2">
                            <Checkbox
                              id={source.value}
                              checked={campaignData.audience.sources.includes(source.value)}
                              onCheckedChange={(checked) => {
                                setCampaignData(prev => ({
                                  ...prev,
                                  audience: {
                                    ...prev.audience,
                                    sources: checked
                                      ? [...prev.audience.sources, source.value]
                                      : prev.audience.sources.filter(s => s !== source.value)
                                  }
                                }))
                              }}
                            />
                            <Label htmlFor={source.value} className="font-normal">
                              {source.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-lg font-semibold mb-4 block">3. Advanced Filters</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="filter-industry">Industry</Label>
                          <Input
                            id="filter-industry"
                            placeholder="Technology"
                            className="mt-2"
                            value={campaignData.audience.filters.industry}
                            onChange={(e) => setCampaignData(prev => ({
                              ...prev,
                              audience: { ...prev.audience, filters: { ...prev.audience.filters, industry: e.target.value } }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="filter-location">Location</Label>
                          <Input
                            id="filter-location"
                            placeholder="Dubai, UAE"
                            className="mt-2"
                            value={campaignData.audience.filters.location}
                            onChange={(e) => setCampaignData(prev => ({
                              ...prev,
                              audience: { ...prev.audience, filters: { ...prev.audience.filters, location: e.target.value } }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="filter-tags">Tags</Label>
                          <Input
                            id="filter-tags"
                            placeholder="VIP, Interested"
                            className="mt-2"
                            value={campaignData.audience.filters.tags}
                            onChange={(e) => setCampaignData(prev => ({
                              ...prev,
                              audience: { ...prev.audience, filters: { ...prev.audience.filters, tags: e.target.value } }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="filter-groups">Groups</Label>
                          <Input
                            id="filter-groups"
                            placeholder="Q4 Leads"
                            className="mt-2"
                            value={campaignData.audience.filters.groups}
                            onChange={(e) => setCampaignData(prev => ({
                              ...prev,
                              audience: { ...prev.audience, filters: { ...prev.audience.filters, groups: e.target.value } }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== AUDIENCE COUNT DISPLAY ===== */}
                <div className={`mt-6 p-4 rounded-lg border-2 ${
                  audienceCount !== null && audienceCount > 0
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-semibold text-gray-700">
                        {audienceLoading ? 'Counting...' : `${audienceCount !== null ? audienceCount.toLocaleString() : '—'} contacts will receive this campaign`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={fetchAudienceCount}
                      disabled={audienceLoading}
                      className="text-sm text-purple-500 hover:text-purple-700 font-medium"
                    >
                      {audienceLoading ? '...' : 'Refresh'}
                    </button>
                  </div>

                  {audienceCount !== null && audienceCount > 0 && audienceBreakdown?.byTemperature && Object.keys(audienceBreakdown.byTemperature).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">Breakdown by temperature:</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(audienceBreakdown.byTemperature).map(([temp, count]: [string, any]) => (
                          <span key={temp} className={`px-2 py-1 rounded-full text-xs font-medium ${
                            temp === 'hot' ? 'bg-red-100 text-red-700' :
                            temp === 'warm' ? 'bg-orange-100 text-orange-700' :
                            temp === 'cold' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {temp.charAt(0).toUpperCase() + temp.slice(1)}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== EXCLUSIONS (always visible) ===== */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Exclusions</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="exclude-unsubscribed"
                        checked={campaignData.audience.excludeUnsubscribed}
                        onCheckedChange={(checked) => setCampaignData(prev => ({
                          ...prev,
                          audience: { ...prev.audience, excludeUnsubscribed: !!checked }
                        }))}
                      />
                      <Label htmlFor="exclude-unsubscribed" className="font-normal">
                        Exclude unsubscribed
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="exclude-bounced"
                        checked={campaignData.audience.excludeBounced}
                        onCheckedChange={(checked) => setCampaignData(prev => ({
                          ...prev,
                          audience: { ...prev.audience, excludeBounced: !!checked }
                        }))}
                      />
                      <Label htmlFor="exclude-bounced" className="font-normal">
                        Exclude bounced emails
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="exclude-replied"
                        checked={campaignData.audience.excludeReplied}
                        onCheckedChange={(checked) => setCampaignData(prev => ({
                          ...prev,
                          audience: { ...prev.audience, excludeReplied: !!checked }
                        }))}
                      />
                      <Label htmlFor="exclude-replied" className="font-normal">
                        Exclude contacts who already replied
                      </Label>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Sequence Builder */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Email Sequence</h3>
                  <p className="text-gray-600">Pre-filled from template (editable)</p>
                </div>

                {/* Toggle: Linear vs Smart Sequence */}
                <div className="flex gap-2 mb-6">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      sequenceType === "linear"
                        ? "bg-purple-100 border-purple-400 text-purple-700"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                    onClick={() => setSequenceType("linear")}
                  >
                    <List className="w-4 h-4 inline mr-1" /> Linear Sequence
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      sequenceType === "graph"
                        ? "bg-purple-100 border-purple-400 text-purple-700"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                    onClick={() => setSequenceType("graph")}
                  >
                    <GitBranch className="w-4 h-4 inline mr-1" /> Smart Sequence (with Conditions)
                  </button>
                </div>

                {/* Smart Sequence (graph-based) */}
                {sequenceType === "graph" ? (
                  <SequenceFlowBuilder
                    steps={sequenceGraph.steps}
                    startStepId={sequenceGraph.startStepId}
                    onChange={(newGraph) => setSequenceGraph(newGraph)}
                  />
                ) : (
                <>
                <div className="space-y-4">
                  {sequenceSteps.map((step, stepIndex) => {
                    const getCumulativeDay = (targetIndex: number) => {
                      let days = 0
                      for (let i = 0; i < targetIndex; i++) {
                        if (sequenceSteps[i].type === "wait") {
                          days += sequenceSteps[i].waitDays || 0
                        }
                      }
                      return days
                    }
                    return (
                    step.type === "wait" ? (
                      <div key={`wait-${stepIndex}`} className="flex items-center justify-center py-2">
                        <div className="flex flex-col items-center">
                          <div className="w-0.5 h-4 bg-gray-300"></div>
                          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                              onClick={() => {
                                setSequenceSteps(prev => prev.map((s, i) =>
                                  i === stepIndex ? { ...s, waitDays: Math.max(1, (s.waitDays || 1) - 1) } : s
                                ))
                              }}
                            >
                              -
                            </Button>
                            <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
                              {step.waitDays} {step.waitDays === 1 ? "day" : "days"}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                              onClick={() => {
                                setSequenceSteps(prev => prev.map((s, i) =>
                                  i === stepIndex ? { ...s, waitDays: (s.waitDays || 1) + 1 } : s
                                ))
                              }}
                            >
                              +
                            </Button>
                          </div>
                          <div className="w-0.5 h-4 bg-gray-300"></div>
                        </div>
                      </div>
                    ) : (
                      <Card key={`email-${stepIndex}`} className={`border-l-4 ${
                        step.emailIndex === 0
                          ? "border-l-[#7C3AED]"
                          : step.emailIndex === sequenceSteps.filter(s => s.type === "email").length - 1
                            ? "border-l-[#EF4444]"
                            : "border-l-[#3B82F6]"
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                EMAIL {(step.emailIndex ?? 0) + 1}: Day {getCumulativeDay(stepIndex)} - {step.label?.replace(/EMAIL \d+/, '').trim() || (step.emailIndex === 0 ? "INITIAL" : "FOLLOW UP")}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {emailEdits[step.emailIndex ?? 0]?.subject || step.subject || "(no subject)"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentStep(4)}
                              >
                                <Pencil className="w-3.5 h-3.5 inline mr-1" /> Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const emailCount = sequenceSteps.filter(s => s.type === "email").length
                                  if (emailCount <= 1) {
                                    setStatusMessage({ type: "error", text: "يجب إبقاء إيميل واحد على الأقل" })
                                    setTimeout(() => setStatusMessage(null), 3000)
                                    return
                                  }
                                  const emailIdx = step.emailIndex
                                  setSequenceSteps(prev => {
                                    const newSteps = [...prev]
                                    if (stepIndex > 0 && newSteps[stepIndex - 1].type === "wait") {
                                      newSteps.splice(stepIndex - 1, 2)
                                    } else {
                                      newSteps.splice(stepIndex, 1)
                                    }
                                    let emailCounter = 0
                                    return newSteps.map(s => {
                                      if (s.type === "email") {
                                        return { ...s, emailIndex: emailCounter++, label: `EMAIL ${emailCounter}` }
                                      }
                                      return s
                                    })
                                  })
                                  toast({ title: "Email step removed" })
                                  if (emailIdx !== undefined) {
                                    setEmailEdits(prev => prev.filter((_, i) => i !== emailIdx))
                                  }
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                    )
                  })}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      const emailCount = sequenceSteps.filter(s => s.type === "email").length
                      const newEmailIndex = emailCount
                      setEmailEdits(prev => [...prev, { subject: "", body: "" }])
                      setSequenceSteps(prev => [
                        ...prev,
                        { type: "wait", waitDays: 3 },
                        { type: "email", emailIndex: newEmailIndex, subject: "", body: "", label: `EMAIL ${newEmailIndex + 1}` }
                      ])
                      toast({ title: "Email step added" })
                    }}
                  >
                    + Add Email Step
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setSequenceSteps(prev => [...prev, { type: "wait", waitDays: 1 }])
                    }}
                  >
                    + Add Wait Time
                  </Button>
                </div>

                </>
                )}

                <div className="mt-8 space-y-3">
                  <Label className="font-semibold">Settings:</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="stop-reply"
                      checked={campaignData.sequence.stopOnReply}
                      onCheckedChange={(checked) => setCampaignData(prev => ({
                        ...prev,
                        sequence: { ...prev.sequence, stopOnReply: !!checked }
                      }))}
                    />
                    <Label htmlFor="stop-reply" className="font-normal">
                      Stop sequence on reply
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="stop-unsubscribe"
                      checked={campaignData.sequence.stopOnUnsubscribe}
                      onCheckedChange={(checked) => setCampaignData(prev => ({
                        ...prev,
                        sequence: { ...prev.sequence, stopOnUnsubscribe: !!checked }
                      }))}
                    />
                    <Label htmlFor="stop-unsubscribe" className="font-normal">
                      Stop sequence on unsubscribe
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="continue-bounce"
                      checked={campaignData.sequence.continueOnBounce}
                      onCheckedChange={(checked) => setCampaignData(prev => ({
                        ...prev,
                        sequence: { ...prev.sequence, continueOnBounce: !!checked }
                      }))}
                    />
                    <Label htmlFor="continue-bounce" className="font-normal">
                      Continue if email bounces (not recommended)
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Email Composer */}
        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {emailEdits.map((edit, index) => {
              const templateEmail = selectedTemplate?.structure?.[index]
              return (
                <Card key={index}>
                  <CardContent className="p-8 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Email {index + 1}: {templateEmail?.type?.replace("_", " ") || "Email"} (Day {templateEmail?.day ?? index})
                      </h3>
                    </div>

                    <div>
                      <Label htmlFor={`subject-${index}`}>Subject Line *</Label>
                      <Input
                        id={`subject-${index}`}
                        placeholder={templateEmail?.subject || "Enter subject line..."}
                        className="mt-2"
                        value={edit.subject}
                        onChange={(e) => {
                          const updated = [...emailEdits]
                          updated[index] = { ...updated[index], subject: e.target.value }
                          setEmailEdits(updated)
                        }}
                      />
                      {index === 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900 mb-2">AI Suggestions:</p>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>- Quick question about {"{company}"}</li>
                            <li>- {"{firstName}"}, impressive work on {"{achievement}"}</li>
                            <li>- Curious about your approach to {"{pain_point}"}</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`body-${index}`}>Email Body *</Label>
                      <Textarea
                        id={`body-${index}`}
                        className="mt-2 font-mono text-sm"
                        rows={8}
                        placeholder={`Hi {{firstName}},\n\nWrite your email body here...\n\n{{yourName}}`}
                        value={edit.body}
                        onChange={(e) => {
                          const updated = [...emailEdits]
                          updated[index] = { ...updated[index], body: e.target.value }
                          setEmailEdits(updated)
                        }}
                      />
                      <div className="mt-3 text-xs text-gray-500">
                        <p className="mb-2">
                          <strong>Variables Available:</strong> <span className="text-gray-400">(click to insert)</span>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {["{{firstName}}", "{{lastName}}", "{{company}}", "{{industry}}", "{{location}}", "{{achievement}}", "{{pain_point}}", "{{specific_detail}}", "{{yourName}}", "{{yourTitle}}"].map((variable) => (
                            <button
                              key={variable}
                              type="button"
                              className="text-xs px-2 py-1 bg-gray-100 hover:bg-purple-50 hover:text-purple-600 rounded transition-colors cursor-pointer"
                              onClick={() => {
                                setEmailEdits(prev => prev.map((edit, i) =>
                                  i === index
                                    ? { ...edit, body: edit.body + " " + variable }
                                    : edit
                                ))
                              }}
                            >
                              {variable}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {!edit.subject.trim() || !edit.body.trim() ? (
                      <p className="text-sm text-red-500">Please fill in both subject and body for this email.</p>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Step 6: Settings */}
        {currentStep === 5 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Email Account Selection */}
            <Card>
              <CardContent className="p-8 space-y-4">
                <Label className="text-lg font-semibold mb-4 block">Email Account</Label>
                <p className="text-sm text-gray-600 mb-2">اختر حساب البريد الذي سيُرسل منه الحملة</p>
                {emailAccounts.length > 0 ? (
                  <Select value={selectedEmailAccount} onValueChange={setSelectedEmailAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select email account" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailAccounts.map((account: any) => (
                        <SelectItem key={account._id} value={account._id}>
                          {account.email} ({account.provider}) — {account.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4 text-sm text-yellow-900">
                      No email accounts connected. Please connect a Gmail account from Settings first.
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 space-y-8">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">1. Send Schedule</Label>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="best-time"
                          name="timing"
                          checked={campaignData.sendSchedule.sendTime === "best"}
                          onChange={() => setCampaignData(prev => ({
                            ...prev,
                            sendSchedule: { ...prev.sendSchedule, sendTime: "best" }
                          }))}
                        />
                        <Label htmlFor="best-time" className="font-normal">
                          Best time (AI optimized)
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="specific-time"
                          name="timing"
                          checked={campaignData.sendSchedule.sendTime === "specific"}
                          onChange={() => setCampaignData(prev => ({
                            ...prev,
                            sendSchedule: { ...prev.sendSchedule, sendTime: "specific" }
                          }))}
                        />
                        <Label htmlFor="specific-time" className="font-normal">
                          Specific time
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="random-time"
                          name="timing"
                          checked={campaignData.sendSchedule.sendTime === "random"}
                          onChange={() => setCampaignData(prev => ({
                            ...prev,
                            sendSchedule: { ...prev.sendSchedule, sendTime: "random" }
                          }))}
                        />
                        <Label htmlFor="random-time" className="font-normal">
                          Random time during business hours
                        </Label>
                      </div>
                    </div>

                    <div>
                      <Label className="block mb-2">Days:</Label>
                      <div className="flex gap-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                          const dayKey = day.toLowerCase()
                          const isActive = campaignData.sendSchedule.days.includes(dayKey)
                          return (
                            <Button
                              key={day}
                              variant={isActive ? "default" : "outline"}
                              size="sm"
                              className={isActive ? "bg-[#7C3AED]" : ""}
                              onClick={() => setCampaignData(prev => {
                                const days = prev.sendSchedule.days.includes(dayKey)
                                  ? prev.sendSchedule.days.filter(d => d !== dayKey)
                                  : [...prev.sendSchedule.days, dayKey]
                                return { ...prev, sendSchedule: { ...prev.sendSchedule, days } }
                              })}
                            >
                              {day}
                            </Button>
                          )
                        })}
                      </div>
                    </div>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-3 text-sm text-blue-900">
                        {campaignData.sendSchedule.sendTime === "best"
                          ? "AI will optimize send times for best results"
                          : campaignData.sendSchedule.days.some(d => ["sat", "sun"].includes(d))
                            ? "Weekend sending may have lower open rates"
                            : "Sending emails during business hours on weekdays typically yields higher open rates"}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">2. Send Limits (Deliverability Protection)</Label>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="daily-limit">Daily send limit:</Label>
                      <Select
                        value={String(campaignData.sendSchedule.dailyLimit)}
                        onValueChange={(val) => setCampaignData(prev => ({
                          ...prev,
                          sendSchedule: { ...prev.sendSchedule, dailyLimit: parseInt(val) }
                        }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20 emails per day</SelectItem>
                          <SelectItem value="30">30 emails per day</SelectItem>
                          <SelectItem value="50">50 emails per day</SelectItem>
                          <SelectItem value="100">100 emails per day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-3 text-sm text-orange-900">
                        <p className="mb-1">Domain health will be checked before first send</p>
                        <p>Recommended limit: 30-50 emails/day</p>
                      </CardContent>
                    </Card>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="warmup"
                        checked={campaignData.sendSchedule.warmup}
                        onCheckedChange={(checked) => setCampaignData(prev => ({
                          ...prev,
                          sendSchedule: { ...prev.sendSchedule, warmup: !!checked }
                        }))}
                      />
                      <Label htmlFor="warmup" className="font-normal">
                        {campaignData.sendSchedule.warmup
                          ? "Warmup enabled: gradually increases daily volume"
                          : "Warmup disabled: sending at full volume from day 1"}
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">3. Tracking</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="track-opens"
                        checked={campaignData.tracking.opens}
                        onCheckedChange={(checked) => setCampaignData(prev => ({
                          ...prev,
                          tracking: { ...prev.tracking, opens: !!checked }
                        }))}
                      />
                      <Label htmlFor="track-opens" className="font-normal">
                        Track email opens
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="track-clicks"
                        checked={campaignData.tracking.clicks}
                        onCheckedChange={(checked) => setCampaignData(prev => ({
                          ...prev,
                          tracking: { ...prev.tracking, clicks: !!checked }
                        }))}
                      />
                      <Label htmlFor="track-clicks" className="font-normal">
                        Track link clicks
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="track-replies"
                        checked={campaignData.tracking.replies}
                        onCheckedChange={(checked) => setCampaignData(prev => ({
                          ...prev,
                          tracking: { ...prev.tracking, replies: !!checked }
                        }))}
                      />
                      <Label htmlFor="track-replies" className="font-normal">
                        Track replies
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="unsubscribe-link"
                        checked={campaignData.tracking.unsubscribeLink}
                        onCheckedChange={(checked) => setCampaignData(prev => ({
                          ...prev,
                          tracking: { ...prev.tracking, unsubscribeLink: !!checked }
                        }))}
                      />
                      <Label htmlFor="unsubscribe-link" className="font-normal">
                        Add unsubscribe link (required by law)
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 7: Review */}
        {currentStep === 6 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </span>
                    DETAILS
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong> {campaignData.name || "Untitled Campaign"}
                    </p>
                    <p>
                      <strong>Goal:</strong> {campaignData.goal || "Not set"}
                    </p>
                    <p>
                      <strong>Industry:</strong> {campaignData.industry || "Not set"}
                    </p>
                    <p>
                      <strong>Description:</strong> {campaignData.description || "No description"}
                    </p>
                    <p>
                      <strong>Tags:</strong> {campaignData.tags.length > 0 ? campaignData.tags.join(", ") : "None"}
                    </p>
                    <p>
                      <strong>Template:</strong> {selectedTemplate?.name || "None selected"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </span>
                    AUDIENCE
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Audience Type:</strong>{" "}
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {audienceType === 'all' ? 'All Contacts' :
                         audienceType === 'csv' ? 'Specific CSV List' :
                         audienceType === 'groups' ? 'Specific Group(s)' :
                         audienceType === 'filter' ? 'Custom Filter' :
                         audienceType === 'single' ? 'Single Contact' : audienceType}
                      </span>
                    </p>
                    {audienceType === 'csv' && selectedCsvListId && (
                      <p><strong>CSV List:</strong> {selectedCsvListId}</p>
                    )}
                    {audienceType === 'groups' && selectedGroups.length > 0 && (
                      <p><strong>Groups:</strong> {selectedGroups.join(', ')}</p>
                    )}
                    {audienceType === 'filter' && (
                      <>
                        <p>
                          <strong>Temperature:</strong> {campaignData.audience.temperature.length > 0
                            ? campaignData.audience.temperature.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
                            : "None selected"}
                        </p>
                        <p>
                          <strong>Sources:</strong> {campaignData.audience.sources.length > 0
                            ? campaignData.audience.sources.map(s => s.toUpperCase()).join(", ")
                            : "None selected"}
                        </p>
                      </>
                    )}
                    <p>
                      <strong>Estimated Contacts:</strong>{" "}
                      {audienceCount !== null
                        ? <span className="text-green-600 font-semibold">{audienceCount.toLocaleString()} contacts</span>
                        : <span className="text-gray-400">Not calculated yet</span>
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </span>
                    SEQUENCE
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>
                        {sequenceSteps.filter(s => s.type === "email").length} emails over {sequenceSteps.filter(s => s.type === "wait").reduce((sum, s) => sum + (s.waitDays || 0), 0)} days
                      </strong>
                    </p>
                    {sequenceSteps.filter(s => s.type === "email").map((step, i) => (
                      <p key={i}>
                        • Email {i + 1}: {emailEdits[i]?.subject || "No subject"}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </span>
                    SETTINGS
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Send Time:</strong> {campaignData.sendSchedule.sendTime === "best" ? "Best time (AI optimized)" : campaignData.sendSchedule.sendTime === "specific" ? campaignData.sendSchedule.specificTime : "Random time"}
                    </p>
                    <p>
                      <strong>Days:</strong> {campaignData.sendSchedule.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}
                    </p>
                    <p>
                      <strong>Daily Limit:</strong> {campaignData.sendSchedule.dailyLimit} emails/day
                    </p>
                    <p>
                      <strong>Email Account:</strong> {selectedEmailAccount ? emailAccounts.find((a: any) => a._id === selectedEmailAccount)?.email || "Selected" : "Not selected"}
                    </p>
                    <p>
                      <strong>Stop on Reply:</strong> {campaignData.sequence.stopOnReply ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Track Opens:</strong> {campaignData.tracking.opens ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Track Clicks:</strong> {campaignData.tracking.clicks ? "Yes" : "No"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-purple-50 border-[#7C3AED]">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">CAMPAIGN SUMMARY</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Total emails in sequence:</strong> {sequenceSteps.filter(s => s.type === "email").length}
                  </p>
                  <p>
                    <strong>Daily sending limit:</strong> {campaignData.sendSchedule.dailyLimit}
                  </p>
                  <p>
                    <strong>Estimated campaign duration:</strong> {sequenceSteps.filter(s => s.type === "wait").reduce((sum, s) => sum + (s.waitDays || 0), 0)} days
                  </p>
                  <p className="text-gray-500 mt-2">Results will appear after launch</p>
                </div>
              </CardContent>
            </Card>

            {(() => {
              const validations = {
                hasName: campaignData.name.trim().length > 0,
                hasEmailAccount: !!selectedEmailAccount,
                hasEmails: emailEdits.length > 0 && emailEdits.every(e => e.subject.trim() && e.body.trim()),
                hasAudience: campaignData.audience.temperature.length > 0,
                hasSources: campaignData.audience.sources.length > 0,
                hasDays: campaignData.sendSchedule.days.length > 0,
              }
              const passedCount = Object.values(validations).filter(Boolean).length
              const totalCount = Object.keys(validations).length
              const checkItems = [
                { key: "hasName" as const, label: "Campaign name set" },
                { key: "hasEmailAccount" as const, label: "Email account connected" },
                { key: "hasEmails" as const, label: "All emails have subject + body" },
                { key: "hasAudience" as const, label: "Target audience selected" },
                { key: "hasSources" as const, label: "Contact sources selected" },
                { key: "hasDays" as const, label: "Send days configured" },
              ]
              return (
                <Card className="border-green-200">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">PRE-LAUNCH CHECKLIST ({passedCount}/{totalCount} passed)</h3>
                    <div className="space-y-2 text-sm">
                      {checkItems.map((item) => (
                        <div key={item.key} className="flex items-center gap-2">
                          {validations[item.key] ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                          <span className={validations[item.key] ? "" : "text-red-600"}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Spam score available after first send</p>
                  </CardContent>
                </Card>
              )
            })()}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            ← Back
          </Button>

          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>

          <div className="flex gap-3 items-center">
            {statusMessage && (
              <span className={`text-sm font-medium ${statusMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {statusMessage.text}
              </span>
            )}
            {currentStep === 6 ? (
              <>
                <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin ml-2" /> Saving...</> : "Save as Draft"}
                </Button>
                <Button variant="outline" onClick={handleSendTestEmail}>
                  Send Test Email
                </Button>
                <Button
                  className="bg-[#7C3AED] hover:bg-[#6D28D9]"
                  onClick={() => setShowLaunchConfirm(true)}
                  disabled={launching || !(
                    campaignData.name.trim().length > 0 &&
                    !!selectedEmailAccount &&
                    emailEdits.length > 0 && emailEdits.every(e => e.subject.trim() && e.body.trim()) &&
                    campaignData.audience.temperature.length > 0 &&
                    campaignData.audience.sources.length > 0 &&
                    campaignData.sendSchedule.days.length > 0
                  )}
                >
                  {launching ? <><Loader2 className="w-4 h-4 animate-spin ml-2" /> Launching...</> : "Launch Campaign"}
                </Button>
              </>
            ) : (
              <Button className="bg-[#7C3AED] hover:bg-[#6D28D9]" onClick={handleNext}>
                Next →
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Launch Confirmation Dialog */}
      <Dialog open={showLaunchConfirm} onOpenChange={setShowLaunchConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Launch Campaign?</DialogTitle>
            <DialogDescription>
              This will start sending emails to your audience. Make sure all details are correct.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p><strong>Campaign:</strong> {campaignData.name || "Untitled"}</p>
            <p><strong>Emails:</strong> {sequenceSteps.filter(s => s.type === "email").length} steps</p>
            <p><strong>Daily limit:</strong> {campaignData.sendSchedule.dailyLimit} emails/day</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLaunchConfirm(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#7C3AED] hover:bg-[#6D28D9]"
              onClick={() => {
                setShowLaunchConfirm(false)
                handleLaunchCampaign()
              }}
            >
              Confirm Launch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Launch Success Dialog */}
      <Dialog open={showLaunchSuccess} onOpenChange={setShowLaunchSuccess}>
        <DialogContent className="text-center">
          <div className="py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Campaign Launched!</h2>
            <p className="text-gray-600 mb-4">
              Your campaign &quot;{campaignData.name || 'Untitled'}&quot; is now live and sending.
            </p>
            <div className="space-y-1 text-sm text-gray-500 mb-6">
              <p>Daily limit: {campaignData.sendSchedule.dailyLimit} emails/day</p>
              <p>Sequence: {sequenceSteps.filter(s => s.type === "email").length} emails</p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => {
              setShowLaunchSuccess(false)
              window.location.href = "/campaigns"
            }}>
              View Campaigns
            </Button>
            <Button className="bg-[#7C3AED] hover:bg-[#6D28D9]" onClick={() => {
              setShowLaunchSuccess(false)
              setCurrentStep(0)
              setCampaignData(prev => ({ ...prev, name: "", description: "", tags: [] }))
              setEmailEdits([])
              setSequenceSteps([])
              setSelectedTemplate(null)
              setSavedCampaignId(null)
            }}>
              Create Another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Modal */}
      {showPreview && previewTemplate && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPreview(false)}
        >
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-0">
              <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{previewTemplate.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {previewTemplate.emails} emails over {previewTemplate.days} days
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                {previewTemplate.structure?.map((step: any, index: number) => (
                  <div key={index} className="border-l-4 border-[#7C3AED] pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-100 text-[#7C3AED]">
                        Day {step.day} - {step.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Subject: {step.subject}</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-line">
                      {step.body || `Sample email content for ${step.type}...`}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowPreview(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9]"
                  onClick={() => {
                    handleTemplateSelect(previewTemplate)
                    setShowPreview(false)
                  }}
                >
                  Use This Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
