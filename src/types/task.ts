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
}

export type TaskDraft = {
  title: string
  priority: Priority
  category: string
}

export type TaskFilters = {
  searchQuery: string
  statusFilter: StatusFilter
  priorityFilter: PriorityFilter
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
