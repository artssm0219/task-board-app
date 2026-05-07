import React, { forwardRef, useCallback } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { TaskItem } from './TaskItem'
import type { Task, TaskStatus, TaskUpdate } from '../types/task'

type DraggableTaskItemProps = {
  task: Task
  isDescriptionExpanded: boolean
  onToggleDescription: (taskId: string) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onUpdateTask: (taskId: string, taskUpdate: TaskUpdate) => void
  onDeleteTask: (taskId: string) => void
}

export const DraggableTaskItem = forwardRef<
  HTMLLIElement,
  DraggableTaskItemProps
>(function DraggableTaskItem(
  {
    task,
    isDescriptionExpanded,
    onToggleDescription,
    onStatusChange,
    onUpdateTask,
    onDeleteTask,
  },
  ref,
) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'task', currentStatus: task.status },
  })

  const mergedRef = useCallback(
    (node: HTMLLIElement | null) => {
      setNodeRef(node)
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ;(ref as React.RefObject<HTMLLIElement | null>).current = node
      }
    },
    [setNodeRef, ref],
  )

  return (
    <TaskItem
      ref={mergedRef}
      task={task}
      displayMode="board"
      isDescriptionExpanded={isDescriptionExpanded}
      onToggleDescription={onToggleDescription}
      onStatusChange={onStatusChange}
      onUpdateTask={onUpdateTask}
      onDeleteTask={onDeleteTask}
      draggableAttributes={attributes}
      draggableListeners={
        listeners as Record<string, React.EventHandler<React.SyntheticEvent>>
      }
      isDragging={isDragging}
    />
  )
})
