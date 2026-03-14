"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Mail, Clock, GitBranch } from "lucide-react"

interface AddNodeButtonProps {
  onAdd: (type: "email" | "wait" | "condition") => void
}

export default function AddNodeButton({ onAdd }: AddNodeButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-purple-400 flex items-center justify-center text-gray-400 hover:text-purple-500 transition-all duration-300 hover:bg-purple-50"
      >
        <Plus className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute z-50 top-10 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px]">
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            onClick={() => { onAdd("email"); setOpen(false) }}
          >
            <Mail className="w-4 h-4" /> Add Email Step
          </button>
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-600 transition-colors"
            onClick={() => { onAdd("wait"); setOpen(false) }}
          >
            <Clock className="w-4 h-4" /> Add Wait Step
          </button>
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            onClick={() => { onAdd("condition"); setOpen(false) }}
          >
            <GitBranch className="w-4 h-4" /> Add Condition
          </button>
        </div>
      )}
    </div>
  )
}
