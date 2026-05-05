import { useCallback, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Task } from '../types/task'
import { normalizeTasks } from '../utils/taskUtils'

const STORAGE_KEY = 'task-board-app:tasks'
const SAVE_ERROR_MESSAGE =
  'データを保存できませんでした。ブラウザの容量や設定を確認してください。'

type StoredTasksState = {
  tasks: Task[]
  error: string | null
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

    const normalizedTasks = normalizeTasks(parsedTasks)

    if (normalizedTasks === null) {
      return {
        tasks: [],
        error:
          '保存データを読み込めなかったため、初期状態で表示しています。',
      }
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
