"use client"

import { GitBranch, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ConditionNodeProps {
  step: any
  emailSteps: Array<{ stepId: string; subject: string; emailCategory: string }>
  onUpdate: (stepId: string, updates: any) => void
  onDelete: (stepId: string) => void
  children?: React.ReactNode
}

export default function ConditionNode({
  step,
  emailSteps,
  onUpdate,
  onDelete,
  children,
}: ConditionNodeProps) {
  const condition = step.condition || { type: "opened", checkStepId: "", waitDaysBeforeCheck: 1 }

  const updateCondition = (field: string, value: any) => {
    onUpdate(step.stepId, {
      condition: { ...condition, [field]: value },
    })
  }

  return (
    <div className="flex flex-col items-center">
      {/* Condition card */}
      <div className="border-2 border-orange-400 bg-orange-50 rounded-lg p-4 w-[340px] shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-700">Condition</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
            onClick={() => onDelete(step.stepId)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Condition type */}
        <Select
          value={condition.type || "opened"}
          onValueChange={(val) => updateCondition("type", val)}
        >
          <SelectTrigger className="h-8 text-xs mb-2 bg-white">
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opened">Email Opened</SelectItem>
            <SelectItem value="clicked">Link Clicked</SelectItem>
            <SelectItem value="replied">Email Replied</SelectItem>
            <SelectItem value="bounced">Email Bounced</SelectItem>
          </SelectContent>
        </Select>

        {/* Which email to check */}
        <Select
          value={condition.checkStepId || ""}
          onValueChange={(val) => updateCondition("checkStepId", val)}
        >
          <SelectTrigger className="h-8 text-xs mb-2 bg-white">
            <SelectValue placeholder="Check which email?" />
          </SelectTrigger>
          <SelectContent>
            {emailSteps.map((es) => (
              <SelectItem key={es.stepId} value={es.stepId}>
                {es.subject || es.emailCategory || "Untitled Email"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Wait days before check */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">Wait</span>
          <Input
            type="number"
            min={1}
            max={30}
            value={condition.waitDaysBeforeCheck || 1}
            onChange={(e) => updateCondition("waitDaysBeforeCheck", parseInt(e.target.value) || 1)}
            className="h-8 text-xs w-16 bg-white"
          />
          <span className="text-xs text-gray-500">days before checking</span>
        </div>
      </div>

      {/* Branches */}
      {children && (
        <div className="flex gap-8 mt-0">
          {children}
        </div>
      )}
    </div>
  )
}
