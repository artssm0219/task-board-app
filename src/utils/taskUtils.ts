import type {
  DueDateStatus,
  Task,
  TaskDraft,
  TaskFilters,
  TaskSummary,
  TaskUpdate,
  SortOption,
  TaskStatus,
} from '../types/task'

const FALLBACK_CATEGORY = '未分類'
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000
const SOON_DUE_DAYS = 3
const priorityRanks = {
  high: 3,
  medium: 2,
  low: 1,
} as const

const statusRanks: Record<TaskStatus, number> = {
  todo: 1,
  inProgress: 2,
  done: 3,
}

const createId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const createTask = (draft: TaskDraft): Task => ({
  id: createId(),
  title: draft.title.trim(),
  description: normalizeDescription(draft.description),
  status: draft.status,
  priority: draft.priority,
  category: draft.category.trim() || FALLBACK_CATEGORY,
  createdAt: new Date().toISOString(),
  dueDate: normalizeDueDate(draft.dueDate),
})

export const applyTaskUpdate = (task: Task, update: TaskUpdate): Task => ({
  ...task,
  title: update.title.trim(),
  description: normalizeDescription(update.description),
  status: update.status,
  priority: update.priority,
  category: update.category.trim() || FALLBACK_CATEGORY,
  dueDate: normalizeDueDate(update.dueDate),
})

export const normalizeDescription = (value: unknown): string => {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

export const normalizeDueDate = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }

  const dateKey = value.trim()

  if (!DATE_KEY_PATTERN.test(dateKey)) {
    return null
  }

  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return dateKey
}

export const getTodayDateKey = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getDateKeyTime = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number)

  return Date.UTC(year, month - 1, day)
}

export const getDaysUntilDueDate = (
  dueDate: string,
  todayDateKey = getTodayDateKey(),
) =>
  Math.round(
    (getDateKeyTime(dueDate) - getDateKeyTime(todayDateKey)) /
      MILLISECONDS_PER_DAY,
  )

export const getDueDateStatus = (
  task: Task,
  todayDateKey = getTodayDateKey(),
): DueDateStatus => {
  if (!task.dueDate) {
    return 'none'
  }

  if (task.status === 'done') {
    return 'later'
  }

  const daysUntilDueDate = getDaysUntilDueDate(task.dueDate, todayDateKey)

  if (daysUntilDueDate < 0) {
    return 'overdue'
  }

  if (daysUntilDueDate === 0) {
    return 'today'
  }

  if (daysUntilDueDate <= SOON_DUE_DAYS) {
    return 'soon'
  }

  return 'later'
}

export const isOverdueTask = (
  task: Task,
  todayDateKey = getTodayDateKey(),
) => Boolean(task.dueDate && task.status !== 'done' && task.dueDate < todayDateKey)

export const isDueTodayTask = (
  task: Task,
  todayDateKey = getTodayDateKey(),
) => Boolean(task.dueDate && task.status !== 'done' && task.dueDate === todayDateKey)

export const getTaskSummary = (tasks: Task[]): TaskSummary => {
  const todayDateKey = getTodayDateKey()

  return tasks.reduce<TaskSummary>(
    (summary, task) => ({
      total: summary.total + 1,
      todo: summary.todo + (task.status === 'todo' ? 1 : 0),
      inProgress:
        summary.inProgress + (task.status === 'inProgress' ? 1 : 0),
      done: summary.done + (task.status === 'done' ? 1 : 0),
      highPriority: summary.highPriority + (task.priority === 'high' ? 1 : 0),
      dueToday: summary.dueToday + (isDueTodayTask(task, todayDateKey) ? 1 : 0),
      overdue: summary.overdue + (isOverdueTask(task, todayDateKey) ? 1 : 0),
    }),
    {
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      highPriority: 0,
      dueToday: 0,
      overdue: 0,
    },
  )
}

export const filterTasks = (tasks: Task[], filters: TaskFilters) => {
  const query = filters.searchQuery.trim().toLowerCase()

  return tasks.filter((task) => {
    const matchesSearch =
      query.length === 0 ||
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query)

    const matchesStatus =
      filters.statusFilter === 'all' ||
      task.status === filters.statusFilter

    const matchesPriority =
      filters.priorityFilter === 'all' ||
      task.priority === filters.priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })
}

const compareCreatedAt = (leftTask: Task, rightTask: Task) =>
  Date.parse(rightTask.createdAt) - Date.parse(leftTask.createdAt)

const compareDueDate = (direction: 'asc' | 'desc') => {
  const missingDueDateRank = 1

  return (leftTask: Task, rightTask: Task) => {
    if (!leftTask.dueDate || !rightTask.dueDate) {
      const leftRank = leftTask.dueDate ? 0 : missingDueDateRank
      const rightRank = rightTask.dueDate ? 0 : missingDueDateRank

      return leftRank - rightRank
    }

    return direction === 'asc'
      ? leftTask.dueDate.localeCompare(rightTask.dueDate)
      : rightTask.dueDate.localeCompare(leftTask.dueDate)
  }
}

const comparePriority = (direction: 'asc' | 'desc') => {
  const directionMultiplier = direction === 'asc' ? 1 : -1

  return (leftTask: Task, rightTask: Task) =>
    (priorityRanks[leftTask.priority] - priorityRanks[rightTask.priority]) *
    directionMultiplier
}

export const sortTasks = (tasks: Task[], sortOption: SortOption): Task[] => {
  const sortedTasks = [...tasks]

  switch (sortOption) {
    case 'created-desc':
      return sortedTasks.sort(compareCreatedAt)
    case 'created-asc':
      return sortedTasks.sort((leftTask, rightTask) =>
        compareCreatedAt(rightTask, leftTask),
      )
    case 'due-asc':
      return sortedTasks.sort(compareDueDate('asc'))
    case 'due-desc':
      return sortedTasks.sort(compareDueDate('desc'))
    case 'priority-desc':
      return sortedTasks.sort(comparePriority('desc'))
    case 'priority-asc':
      return sortedTasks.sort(comparePriority('asc'))
    case 'active-first':
      return sortedTasks.sort(
        (leftTask, rightTask) =>
          Number(leftTask.status === 'done') -
            Number(rightTask.status === 'done') ||
          statusRanks[leftTask.status] - statusRanks[rightTask.status],
      )
  }
}
