"use client"

import { Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WaitNodeProps {
  step: any
  onUpdate: (stepId: string, updates: any) => void
  onDelete: (stepId: string) => void
}

export default function WaitNode({ step, onUpdate, onDelete }: WaitNodeProps) {
  return (
    <div className="flex items-center gap-2 border border-gray-300 bg-gray-50 rounded-full px-4 py-2 shadow-sm">
      <Clock className="w-4 h-4 text-gray-400" />
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        onClick={() =>
          onUpdate(step.stepId, { waitDays: Math.max(0, (step.waitDays || 1) - 1) })
        }
      >
        -
      </Button>
      <span className="text-sm font-medium text-gray-600 min-w-[50px] text-center">
        {step.waitDays || 0}d
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        onClick={() =>
          onUpdate(step.stepId, { waitDays: (step.waitDays || 0) + 1 })
        }
      >
        +
      </Button>

      {(step.waitHours !== undefined && step.waitHours > 0) || step.waitDays === 0 ? (
        <>
          <span className="text-gray-300">|</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            onClick={() =>
              onUpdate(step.stepId, { waitHours: Math.max(0, (step.waitHours || 0) - 1) })
            }
          >
            -
          </Button>
          <span className="text-sm font-medium text-gray-600 min-w-[40px] text-center">
            {step.waitHours || 0}h
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            onClick={() =>
              onUpdate(step.stepId, { waitHours: (step.waitHours || 0) + 1 })
            }
          >
            +
          </Button>
        </>
      ) : null}

      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 ml-1"
        onClick={() => onDelete(step.stepId)}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
