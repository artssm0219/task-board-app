import { useCallback, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Priority, Task } from '../types/task'
import { normalizeDueDate } from '../utils/taskUtils'

const STORAGE_KEY = 'task-board-app:tasks'
const SAVE_ERROR_MESSAGE =
  'データを保存できませんでした。ブラウザの容量や設定を確認してください。'
const priorities: Priority[] = ['high', 'medium', 'low']

type StoredTasksState = {
  tasks: Task[]
  error: string | null
}

const isPriority = (value: unknown): value is Priority =>
  typeof value === 'string' && priorities.includes(value as Priority)

const normalizeStoredTask = (value: unknown): Task | null => {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const task = value as Record<string, unknown>
  const id = task.id
  const title = task.title
  const completed = task.completed
  const priority = task.priority
  const category = task.category
  const createdAt = task.createdAt

  const hasValidBaseFields =
    typeof id === 'string' &&
    typeof title === 'string' &&
    typeof completed === 'boolean' &&
    isPriority(priority) &&
    typeof category === 'string' &&
    typeof createdAt === 'string' &&
    !Number.isNaN(Date.parse(createdAt))

  if (!hasValidBaseFields) {
    return null
  }

  return {
    id,
    title,
    completed,
    priority,
    category,
    createdAt,
    dueDate: normalizeDueDate(task.dueDate),
  }
}

const readTasksFromStorage = (): StoredTasksState => {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY)

    if (!storedTasks) {
      return { tasks: [], error: null }
    }

    const parsedTasks: unknown = JSON.parse(storedTasks)

    if (!Array.isArray(parsedTasks)) {
      return {
        tasks: [],
        error:
          '保存データを読み込めなかったため、初期状態で表示しています。',
      }
    }

    const normalizedTasks: Task[] = []

    for (const parsedTask of parsedTasks) {
      const normalizedTask = normalizeStoredTask(parsedTask)

      if (normalizedTask === null) {
        return {
          tasks: [],
          error:
            '保存データを読み込めなかったため、初期状態で表示しています。',
        }
      }

      normalizedTasks.push(normalizedTask)
    }

    return { tasks: normalizedTasks, error: null }
  } catch {
    return {
      tasks: [],
      error: '保存データを読み込めなかったため、初期状態で表示しています。',
    }
  }
}

const resolveNextTasks = (
  action: SetStateAction<Task[]>,
  currentTasks: Task[],
) => {
  if (typeof action === 'function') {
    return action(currentTasks)
  }

  return action
}

export const useLocalStorageTasks = (): {
  tasks: Task[]
  setTasks: Dispatch<SetStateAction<Task[]>>
  storageWarning: string | null
  dismissStorageWarning: () => void
} => {
  const [storedState] = useState(readTasksFromStorage)
  const [tasks, setTasks] = useState<Task[]>(storedState.tasks)
  const tasksRef = useRef(storedState.tasks)
  const [storageWarning, setStorageWarning] = useState<string | null>(
    storedState.error,
  )

  const persistTasks: Dispatch<SetStateAction<Task[]>> = useCallback(
    (action) => {
      const nextTasks = resolveNextTasks(action, tasksRef.current)

      tasksRef.current = nextTasks
      setTasks(nextTasks)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks))
        setStorageWarning(null)
      } catch {
        setStorageWarning(SAVE_ERROR_MESSAGE)
      }
    },
    [],
  )

  const dismissStorageWarning = useCallback(() => {
    setStorageWarning(null)
  }, [])

  return {
    tasks,
    setTasks: persistTasks,
    storageWarning,
    dismissStorageWarning,
  }
}
