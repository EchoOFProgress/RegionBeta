"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from "recharts"
import { Activity, Calendar, CheckCircle2, TrendingUp } from "lucide-react"
import { Challenge } from "./challenge-module"

export function ProjectStatistics({ project }: { project: Challenge }) {
    const stats = useMemo(() => {
        const today = new Date()
        const endDate = new Date(project.endDate)
        const startDate = new Date(project.startDate)

        const daysTotal = project.duration
        const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
        const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

        const currentProgress = project.currentAmount || project.currentDay
        const targetAmount = project.totalAmount || project.duration

        const progressPercent = Math.min(100, Math.round((currentProgress / targetAmount) * 100))
        const daysPercent = Math.min(100, Math.round((daysElapsed / daysTotal) * 100))

        const dailyTargetNeeded = daysLeft > 0 ? (targetAmount - currentProgress) / daysLeft : 0

        // Chart data
        const chartData = (project.completionRecords || []).reduce((acc: any[], record, idx) => {
            const prevAmount = idx > 0 ? acc[idx - 1].cumulative : 0
            acc.push({
                date: record.date,
                added: record.amount,
                cumulative: prevAmount + record.amount
            })
            return acc
        }, [])

        return {
            progressPercent,
            daysElapsed,
            daysLeft,
            daysPercent,
            dailyTargetNeeded: dailyTargetNeeded.toFixed(2),
            chartData,
            completedMilestones: project.milestones?.filter(m => m.achieved).length || 0,
            totalMilestones: project.milestones?.length || 0
        }
    }, [project])

    const rings = [
        { name: "Progress", value: stats.progressPercent, color: "#3b82f6", icon: <TrendingUp className="h-4 w-4" /> },
        { name: "Days", value: stats.daysPercent, color: "#10b981", icon: <Calendar className="h-4 w-4" /> },
        { name: "Tasks", value: stats.totalMilestones > 0 ? Math.round((stats.completedMilestones / stats.totalMilestones) * 100) : 0, color: "#a855f7", icon: <CheckCircle2 className="h-4 w-4" /> }
    ]

    return (
        <div className="space-y-6">
            {/* Ring Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rings.map((ring) => (
                    <Card key={ring.name} className="overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-md">
                        <CardContent className="p-6 flex flex-col items-center justify-center relative">
                            <div className="h-32 w-32 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { value: ring.value },
                                                { value: 100 - ring.value }
                                            ]}
                                            innerRadius={45}
                                            outerRadius={60}
                                            startAngle={90}
                                            endAngle={-270}
                                            paddingAngle={0}
                                            dataKey="value"
                                        >
                                            <Cell fill={ring.color} />
                                            <Cell fill="rgba(0,0,0,0.1)" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold">{ring.value}%</span>
                                    <span className="text-[10px] uppercase text-muted-foreground">{ring.name}</span>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                                {ring.icon}
                                {ring.name === "Days" ? `${stats.daysElapsed} days in` : ring.name}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Daily Target Section */}
            <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-none shadow-xl">
                <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Daily Pace Needed</h3>
                    <div className="text-5xl font-black text-primary mb-2">
                        {stats.dailyTargetNeeded} <span className="text-2xl">unit/day</span>
                    </div>
                    <p className="max-w-md mx-auto text-sm opacity-80">
                        To reach your goal by {new Date(project.endDate).toLocaleDateString()}, you need to maintain this average daily progress.
                    </p>
                </CardContent>
            </Card>

            {/* Line Chart Section */}
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Cumulative Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10 }}
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="cumulative"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Milestones Section */}
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-muted/30 flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-sm uppercase tracking-widest opacity-70">Milestones Progress</CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                        {stats.completedMilestones}/{stats.totalMilestones} Completed
                    </Badge>
                </CardHeader>
                <div className="p-4 space-y-4">
                    {project.milestones?.map((milestone) => (
                        <div key={milestone.id} className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: milestone.color || milestone.achieved ? '#10b981' : '#3b82f6' }}
                                    />
                                    <span className={milestone.achieved ? "line-through opacity-70" : "font-medium"}>
                                        {milestone.title}
                                    </span>
                                </div>
                                <div className="text-xs font-mono">
                                    {milestone.achieved ? (
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none h-5">
                                            ACHIEVED
                                        </Badge>
                                    ) : (
                                        milestone.targetValue > 0 ? `${milestone.currentValue}/${milestone.targetValue}` : "PENDING"
                                    )
                                    }
                                </div>
                            </div>
                            {!milestone.achieved && milestone.targetValue > 0 && (
                                <Progress
                                    value={Math.min(100, (milestone.currentValue / milestone.targetValue) * 100)}
                                    className="h-1"
                                />
                            )}
                        </div>
                    ))}
                    {(!project.milestones || project.milestones.length === 0) && (
                        <p className="text-center py-4 text-sm text-muted-foreground italic">
                            No milestones defined for this challenge.
                        </p>
                    )}
                </div>
            </Card>

            {/* Logs Table */}
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-sm uppercase tracking-widest opacity-70">Daily Progress Logs</CardTitle>
                </CardHeader>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Added</TableHead>
                            <TableHead className="text-right">Note</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {project.completionRecords?.slice().reverse().map((record, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-medium">
                                    {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                                </TableCell>
                                <TableCell className="text-right font-bold text-primary">+{record.amount}</TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm">{record.note || "-"}</TableCell>
                            </TableRow>
                        ))}
                        {(!project.completionRecords || project.completionRecords.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                    No logs recorded yet. Start by adding progress!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
