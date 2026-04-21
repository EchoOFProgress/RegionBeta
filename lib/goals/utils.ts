import { CheckSquare, Flame, Zap, Target, Link, FileText } from "lucide-react"
import React from "react"

export function getIconForType(type: string): React.ReactElement {
  switch (type) {
    case "task": return React.createElement(CheckSquare, { className: "h-4 w-4" })
    case "habit": return React.createElement(Flame, { className: "h-4 w-4" })
    case "challenge": return React.createElement(Zap, { className: "h-4 w-4" })
    case "resource": return React.createElement(Link, { className: "h-4 w-4" })
    case "note": return React.createElement(FileText, { className: "h-4 w-4" })
    default: return React.createElement(Target, { className: "h-4 w-4" })
  }
}

export function getTypeColor(type: string): string {
  switch (type) {
    case "task": return "bg-blue-500"
    case "habit": return "bg-green-500"
    case "challenge": return "bg-purple-500"
    default: return "bg-gray-500"
  }
}
