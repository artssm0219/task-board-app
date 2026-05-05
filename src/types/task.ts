export type Priority = 'high' | 'medium' | 'low'

export type StatusFilter = 'all' | 'active' | 'completed'

export type PriorityFilter = 'all' | Priority

export type Task = {
  id: string
  title: string
  completed: boolean
  priority: Priority
  category: string
  createdAt: string
  dueDate: string | null
}

export type TaskDraft = {
  title: string
  priority: Priority
  category: string
  dueDate: string | null
}

export type TaskUpdate = TaskDraft

export type TaskFilters = {
  searchQuery: string
  statusFilter: StatusFilter
  priorityFilter: PriorityFilter
}

export type TaskSummary = {
  total: number
  active: number
  completed: number
  highPriority: number
  overdue: number
}

export const priorityLabels: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export const statusFilterLabels: Record<StatusFilter, string> = {
  all: 'すべて',
  active: '未完了',
  completed: '完了済み',
}

export const priorityFilterLabels: Record<PriorityFilter, string> = {
  all: 'すべて',
  high: '高',
  medium: '中',
  low: '低',
}
