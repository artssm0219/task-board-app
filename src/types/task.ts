export type Priority = 'high' | 'medium' | 'low'

export type TaskStatus = 'todo' | 'inProgress' | 'done'

export type StatusFilter = 'all' | TaskStatus

export type PriorityFilter = 'all' | Priority

export type ViewMode = 'list' | 'board'

export type TaskImportMode = 'replace' | 'append'

export type DueDateStatus = 'none' | 'overdue' | 'today' | 'soon' | 'later'

export type SortOption =
  | 'created-desc'
  | 'created-asc'
  | 'due-asc'
  | 'due-desc'
  | 'priority-desc'
  | 'priority-asc'
  | 'active-first'

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  category: string
  createdAt: string
  dueDate: string | null
}

export type TaskDraft = {
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  category: string
  dueDate: string | null
}

export type TaskUpdate = TaskDraft

export type TaskExportFile = {
  version: 1
  exportedAt: string
  app: 'task-board-app'
  tasks: Task[]
}

export type TaskFilters = {
  searchQuery: string
  statusFilter: StatusFilter
  priorityFilter: PriorityFilter
}

export type TaskSummary = {
  total: number
  todo: number
  inProgress: number
  done: number
  highPriority: number
  dueToday: number
  overdue: number
}

export const priorityLabels: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: '未着手',
  inProgress: '進行中',
  done: '完了',
}

export const statusFilterLabels: Record<StatusFilter, string> = {
  all: 'すべて',
  ...taskStatusLabels,
}

export const priorityFilterLabels: Record<PriorityFilter, string> = {
  all: 'すべて',
  high: '高',
  medium: '中',
  low: '低',
}

export const sortOptionLabels: Record<SortOption, string> = {
  'created-desc': '作成日: 新しい順',
  'created-asc': '作成日: 古い順',
  'due-asc': '期限: 早い順',
  'due-desc': '期限: 遅い順',
  'priority-desc': '優先度: 高い順',
  'priority-asc': '優先度: 低い順',
  'active-first': '未完了を上に表示',
}
