"use client"

import { Button } from "@/components/ui/button"
import { Clock, TrendingUp } from "lucide-react"
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Line, ResponsiveContainer
} from "recharts"
import { Goal } from "@/lib/goals/types"
import { generateTimelineData, generateMilestoneData } from "@/lib/goals/utils"

interface Props {
  goal: Goal
}

export function GoalTimeline({ goal }: Props) {
  return (
    <div className="pt-4 border-t border-border mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Timeline Visualization
        </h3>
        <Button variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Full Timeline
        </Button>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              name="Date"
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getMonth() + 1}/${date.getDate()}`
              }}
            />
            <YAxis
              dataKey="progress"
              name="Progress"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Progress']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US')}
            />
            <Line
              type="monotone"
              data={generateTimelineData(goal)}
              dataKey="progress"
              name="Progress"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Scatter name="Milestones" data={generateMilestoneData(goal)} fill="#10b981" shape="triangle" />
            <Scatter
              name="Current"
              data={[{ date: new Date().toISOString(), progress: goal.progress, type: 'current' }]}
              fill="#ef4444"
              shape="star"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Progress trend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-transparent border-b-green-500"></div>
          <span>Milestones</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 transform rotate-45"></div>
          <span>Current position</span>
        </div>
      </div>
    </div>
  )
}
