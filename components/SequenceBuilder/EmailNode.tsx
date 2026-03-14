"use client"

import { Mail, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EmailNodeProps {
  step: any
  onUpdate: (stepId: string, updates: any) => void
  onDelete: (stepId: string) => void
  onDuplicate?: (stepId: string) => void
}

const categoryStyles: Record<string, string> = {
  initial: "border-purple-400 bg-purple-50",
  "follow-up": "border-blue-400 bg-blue-50",
  breakup: "border-red-400 bg-red-50",
  "": "border-gray-300 bg-gray-50",
}

const categoryLabels: Record<string, string> = {
  initial: "Initial Email",
  "follow-up": "Follow-up",
  breakup: "Breakup",
  "": "Email",
}

export default function EmailNode({ step, onUpdate, onDelete, onDuplicate }: EmailNodeProps) {
  const category = step.emailCategory || ""
  const style = categoryStyles[category] || categoryStyles[""]

  return (
    <div className={`border-2 rounded-lg p-4 w-[340px] ${style} shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-bold text-gray-700">
            {categoryLabels[category] || "Email"}
          </span>
        </div>
        <div className="flex gap-1">
          {onDuplicate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-blue-500"
              onClick={() => onDuplicate(step.stepId)}
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
            onClick={() => onDelete(step.stepId)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Category selector */}
      <Select
        value={category}
        onValueChange={(val) => onUpdate(step.stepId, { emailCategory: val })}
      >
        <SelectTrigger className="h-8 text-xs mb-2 bg-white">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="initial">Initial</SelectItem>
          <SelectItem value="follow-up">Follow-up</SelectItem>
          <SelectItem value="breakup">Breakup</SelectItem>
        </SelectContent>
      </Select>

      {/* Subject */}
      <Input
        placeholder="Email subject..."
        value={step.subject || ""}
        onChange={(e) => onUpdate(step.stepId, { subject: e.target.value })}
        className="text-sm mb-2 bg-white"
      />

      {/* Body */}
      <Textarea
        placeholder="Email body..."
        value={step.body || ""}
        onChange={(e) => onUpdate(step.stepId, { body: e.target.value })}
        className="text-sm min-h-[80px] bg-white resize-none"
        rows={3}
      />
    </div>
  )
}
