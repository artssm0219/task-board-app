import type { DueDateStatus, Priority, Task, TaskStatus, TaskSummary } from '../types/task'
import { getDueDateStatus, getTodayDateKey } from './taskUtils'

export type StatusDistribution = { status: TaskStatus; count: number }[]
export type PriorityDistribution = { priority: Priority; count: number }[]
export type DueStatusDistribution = { dueStatus: DueDateStatus; count: number }[]

export const getStatusDistribution = (summary: TaskSummary): StatusDistribution => [
  { status: 'todo', count: summary.todo },
  { status: 'inProgress', count: summary.inProgress },
  { status: 'done', count: summary.done },
]

export const getPriorityDistribution = (tasks: Task[]): PriorityDistribution => {
  const counts = { high: 0, medium: 0, low: 0 }
  for (const task of tasks) counts[task.priority]++
  return [
    { priority: 'high', count: counts.high },
    { priority: 'medium', count: counts.medium },
    { priority: 'low', count: counts.low },
  ]
}

export const getDueStatusDistribution = (tasks: Task[]): DueStatusDistribution => {
  const counts: Record<DueDateStatus, number> = { none: 0, overdue: 0, today: 0, soon: 0, later: 0 }
  const todayKey = getTodayDateKey()
  for (const task of tasks) counts[getDueDateStatus(task, todayKey)]++
  return [
    { dueStatus: 'overdue', count: counts.overdue },
    { dueStatus: 'today', count: counts.today },
    { dueStatus: 'soon', count: counts.soon },
    { dueStatus: 'later', count: counts.later },
    { dueStatus: 'none', count: counts.none },
  ]
}

// ─── SVG arc helpers ─────────────────────────────────────────────────────────

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => ({
  x: cx + r * Math.cos(angle),
  y: cy + r * Math.sin(angle),
})

/**
 * SVG path for a donut arc segment.
 * Angles are in radians, measured from the positive x-axis.
 * Use startAngle = -Math.PI / 2 to begin at the top.
 */
export const describeArc = (
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string => {
  const span = endAngle - startAngle
  if (Math.abs(span) < 1e-9) return ''

  // Clamp to just under 2π to avoid degenerate full-circle arcs
  const clampedEnd = span >= 2 * Math.PI - 1e-9
    ? startAngle + 2 * Math.PI - 1e-4
    : endAngle

  const outerStart = polarToCartesian(cx, cy, outerR, startAngle)
  const outerEnd   = polarToCartesian(cx, cy, outerR, clampedEnd)
  const innerEnd   = polarToCartesian(cx, cy, innerR, clampedEnd)
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle)
  const largeArc   = clampedEnd - startAngle > Math.PI ? 1 : 0

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}
