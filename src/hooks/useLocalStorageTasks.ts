import { useCallback, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Priority, Task } from '../types/task'

const STORAGE_KEY = 'task-board-app:tasks'
const SAVE_ERROR_MESSAGE =
  'データを保存できませんでした。ブラウザの容量や設定を確認してください。'
const priorities: Priority[] = ['high', 'medium', 'low']

type StoredTasksState = {
  tasks: Task[]
  error: string | null
}

const isTask = (value: unknown): value is Task => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const task = value as Record<string, unknown>

  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.priority === 'string' &&
    priorities.includes(task.priority as Priority) &&
    typeof task.category === 'string' &&
    typeof task.createdAt === 'string' &&
    !Number.isNaN(Date.parse(task.createdAt))
  )
}

const readTasksFromStorage = (): StoredTasksState => {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY)

    if (!storedTasks) {
      return { tasks: [], error: null }
    }

    const parsedTasks: unknown = JSON.parse(storedTasks)

    if (!Array.isArray(parsedTasks) || !parsedTasks.every(isTask)) {
      return {
        tasks: [],
        error:
          '保存データを読み込めなかったため、初期状態で表示しています。',
      }
    }

    return { tasks: parsedTasks, error: null }
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
