import { useEffect, useRef, useState } from 'react'
import type { TaskStatus } from '../types/task'

export const useStatusFlash = (status: TaskStatus) => {
  const [flashKey, setFlashKey] = useState(0)
  const prevStatusRef = useRef<TaskStatus>(status)

  useEffect(() => {
    if (prevStatusRef.current !== 'done' && status === 'done') {
      setFlashKey((k) => k + 1)
    }
    prevStatusRef.current = status
  }, [status])

  return flashKey
}
