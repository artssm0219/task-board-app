import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Priority, Task } from '../types/task'

const STORAGE_KEY = 'task-board-app:tasks'
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
        error: '保存済みデータの形式が正しくなかったため、空の状態で起動しました。',
      }
    }

    return { tasks: parsedTasks, error: null }
  } catch {
    return {
      tasks: [],
      error: '保存済みデータを読み込めなかったため、空の状態で起動しました。',
    }
  }
}

export const useLocalStorageTasks = (): {
  tasks: Task[]
  setTasks: Dispatch<SetStateAction<Task[]>>
  storageError: string | null
} => {
  const [storedState] = useState(readTasksFromStorage)
  const [tasks, setTasks] = useState<Task[]>(storedState.tasks)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      console.warn('タスクをブラウザに保存できませんでした。')
    }
  }, [tasks])

  return { tasks, setTasks, storageError: storedState.error }
}
