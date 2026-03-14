"use client"

import { useCallback } from "react"
import EmailNode from "./EmailNode"
import WaitNode from "./WaitNode"
import ConditionNode from "./ConditionNode"
import AddNodeButton from "./AddNodeButton"

export interface GraphStep {
  stepId: string
  type: "email" | "wait" | "condition"
  subject?: string
  body?: string
  emailCategory?: string
  waitDays?: number
  waitHours?: number
  condition?: {
    type: string
    checkStepId: string
    waitDaysBeforeCheck: number
  }
  nextStepId: string | null
  yesNextStepId: string | null
  noNextStepId: string | null
  position: { x: number; y: number }
}

export interface SequenceGraph {
  steps: GraphStep[]
  startStepId: string | null
  version: number
}

interface SequenceFlowBuilderProps {
  steps: GraphStep[]
  startStepId: string | null
  onChange: (graph: SequenceGraph) => void
}

export default function SequenceFlowBuilder({ steps, startStepId, onChange }: SequenceFlowBuilderProps) {
  // Helper to emit changes
  const emit = useCallback(
    (newSteps: GraphStep[], newStartId: string | null) => {
      onChange({ steps: newSteps, startStepId: newStartId, version: 1 })
    },
    [onChange],
  )

  // Get all email steps (for condition dropdowns)
  const emailSteps = steps.filter((s) => s.type === "email").map((s) => ({
    stepId: s.stepId,
    subject: s.subject || "",
    emailCategory: s.emailCategory || "",
  }))

  // === Create step ===
  function createStep(type: "email" | "wait" | "condition", afterStepId?: string, branch?: "yes" | "no") {
    const newStep: GraphStep = {
      stepId: crypto.randomUUID(),
      type,
      subject: type === "email" ? "" : undefined,
      body: type === "email" ? "" : undefined,
      emailCategory: type === "email" ? "follow-up" : undefined,
      waitDays: type === "wait" ? 1 : undefined,
      waitHours: type === "wait" ? 0 : undefined,
      condition:
        type === "condition"
          ? { type: "opened", checkStepId: "", waitDaysBeforeCheck: 1 }
          : undefined,
      nextStepId: null,
      yesNextStepId: null,
      noNextStepId: null,
      position: { x: 0, y: 0 },
    }

    let newSteps = [...steps]
    let newStartId = startStepId

    if (afterStepId && branch) {
      // Insert into a condition branch (yes/no)
      const parentIdx = newSteps.findIndex((s) => s.stepId === afterStepId)
      if (parentIdx >= 0) {
        const parent = { ...newSteps[parentIdx] }
        const existingNextId = branch === "yes" ? parent.yesNextStepId : parent.noNextStepId
        newStep.nextStepId = existingNextId
        if (branch === "yes") parent.yesNextStepId = newStep.stepId
        else parent.noNextStepId = newStep.stepId
        newSteps[parentIdx] = parent
      }
    } else if (afterStepId) {
      // Insert after a regular step
      const prevIdx = newSteps.findIndex((s) => s.stepId === afterStepId)
      if (prevIdx >= 0) {
        const prev = { ...newSteps[prevIdx] }
        newStep.nextStepId = prev.nextStepId
        prev.nextStepId = newStep.stepId
        newSteps[prevIdx] = prev
      }
    } else {
      // First step or replace start
      if (newStartId) {
        newStep.nextStepId = newStartId
      }
      newStartId = newStep.stepId
    }

    newSteps.push(newStep)
    emit(newSteps, newStartId)
  }

  // === Update step ===
  function updateStep(stepId: string, updates: Partial<GraphStep>) {
    const newSteps = steps.map((s) => (s.stepId === stepId ? { ...s, ...updates } : s))
    emit(newSteps, startStepId)
  }

  // === Delete step ===
  function deleteStep(stepId: string) {
    const stepToDelete = steps.find((s) => s.stepId === stepId)
    if (!stepToDelete) return

    let newSteps = [...steps]
    let newStartId = startStepId

    // What comes after the deleted step
    const childId = stepToDelete.nextStepId

    // Re-link parents pointing to this step
    if (newStartId === stepId) {
      newStartId = childId
    }

    newSteps = newSteps.map((s) => {
      const updated = { ...s }
      if (updated.nextStepId === stepId) updated.nextStepId = childId
      if (updated.yesNextStepId === stepId) updated.yesNextStepId = childId
      if (updated.noNextStepId === stepId) updated.noNextStepId = childId
      return updated
    })

    // For condition nodes: also remove orphaned branch children
    if (stepToDelete.type === "condition") {
      const orphanIds = new Set<string>()
      function collectOrphans(sid: string | null) {
        if (!sid) return
        orphanIds.add(sid)
        const s = newSteps.find((x) => x.stepId === sid)
        if (s) {
          collectOrphans(s.nextStepId)
          collectOrphans(s.yesNextStepId)
          collectOrphans(s.noNextStepId)
        }
      }
      collectOrphans(stepToDelete.yesNextStepId)
      collectOrphans(stepToDelete.noNextStepId)
      // Only remove those that aren't reachable from the new graph
      // For simplicity, remove all branch descendants
      newSteps = newSteps.filter((s) => !orphanIds.has(s.stepId))
    }

    // Remove the step itself
    newSteps = newSteps.filter((s) => s.stepId !== stepId)
    emit(newSteps, newStartId)
  }

  // === Duplicate email step ===
  function duplicateStep(stepId: string) {
    const original = steps.find((s) => s.stepId === stepId)
    if (!original || original.type !== "email") return

    const newStep: GraphStep = {
      ...original,
      stepId: crypto.randomUUID(),
      nextStepId: original.nextStepId,
    }

    let newSteps = steps.map((s) =>
      s.stepId === stepId ? { ...s, nextStepId: newStep.stepId } : s,
    )
    newSteps.push(newStep)
    emit(newSteps, startStepId)
  }

  // === Recursive render ===
  function renderStep(stepId: string | null, depth = 0): React.ReactNode {
    if (!stepId || depth > 50) return null
    const step = steps.find((s) => s.stepId === stepId)
    if (!step) return null

    return (
      <div className="flex flex-col items-center" key={step.stepId}>
        {/* Render node by type */}
        {step.type === "email" && (
          <EmailNode
            step={step}
            onUpdate={updateStep}
            onDelete={deleteStep}
            onDuplicate={duplicateStep}
          />
        )}

        {step.type === "wait" && (
          <WaitNode step={step} onUpdate={updateStep} onDelete={deleteStep} />
        )}

        {step.type === "condition" && (
          <ConditionNode
            step={step}
            emailSteps={emailSteps}
            onUpdate={updateStep}
            onDelete={deleteStep}
          >
            {/* YES branch */}
            <div className="flex flex-col items-center pt-2">
              <div className="w-px h-6 bg-green-400" />
              <span className="text-green-600 text-xs font-bold mb-1">YES</span>
              {step.yesNextStepId && renderStep(step.yesNextStepId, depth + 1)}
              <div className="w-px h-4 bg-green-300" />
              <AddNodeButton onAdd={(type) => createStep(type, step.stepId, "yes")} />
            </div>
            {/* NO branch */}
            <div className="flex flex-col items-center pt-2">
              <div className="w-px h-6 bg-red-400" />
              <span className="text-red-600 text-xs font-bold mb-1">NO</span>
              {step.noNextStepId && renderStep(step.noNextStepId, depth + 1)}
              <div className="w-px h-4 bg-red-300" />
              <AddNodeButton onAdd={(type) => createStep(type, step.stepId, "no")} />
            </div>
          </ConditionNode>
        )}

        {/* Connector + Add button (for non-condition steps) */}
        {step.type !== "condition" && (
          <>
            <div className="w-px h-8 bg-gray-300" />
            <AddNodeButton onAdd={(type) => createStep(type, step.stepId)} />
            {step.nextStepId && (
              <>
                <div className="w-px h-8 bg-gray-300" />
                {renderStep(step.nextStepId, depth + 1)}
              </>
            )}
          </>
        )}

        {/* For condition: render what comes after the condition via nextStepId (merge point) */}
        {step.type === "condition" && step.nextStepId && (
          <>
            <div className="w-px h-8 bg-gray-300 mt-4" />
            {renderStep(step.nextStepId, depth + 1)}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-y-auto max-h-[600px] py-6">
      <div className="flex flex-col items-center min-w-[400px]">
        {steps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4 text-sm">Start building your smart sequence</p>
            <AddNodeButton onAdd={(type) => createStep(type)} />
          </div>
        ) : (
          <>
            {renderStep(startStepId)}
          </>
        )}
      </div>
    </div>
  )
}
