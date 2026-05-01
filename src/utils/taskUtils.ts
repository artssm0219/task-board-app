import type { Task, TaskDraft, TaskFilters } from '../types/task'

const FALLBACK_CATEGORY = '未分類'

const createId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const createTask = (draft: TaskDraft): Task => ({
  id: createId(),
  title: draft.title.trim(),
  completed: false,
  priority: draft.priority,
  category: draft.category.trim() || FALLBACK_CATEGORY,
  createdAt: new Date().toISOString(),
})

export const filterTasks = (tasks: Task[], filters: TaskFilters) => {
  const query = filters.searchQuery.trim().toLowerCase()

  return tasks.filter((task) => {
    const matchesSearch =
      query.length === 0 ||
      task.title.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query)

    const matchesStatus =
      filters.statusFilter === 'all' ||
      (filters.statusFilter === 'active' && !task.completed) ||
      (filters.statusFilter === 'completed' && task.completed)

    const matchesPriority =
      filters.priorityFilter === 'all' ||
      task.priority === filters.priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })
}
