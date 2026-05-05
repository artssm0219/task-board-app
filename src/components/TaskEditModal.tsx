import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { TaskEditForm } from './TaskEditForm'
import type { Task, TaskUpdate } from '../types/task'

type TaskEditModalProps = {
  task: Task
  onSave: (taskId: string, taskUpdate: TaskUpdate) => void
  onCancel: () => void
}

export const TaskEditModal = ({
  task,
  onSave,
  onCancel,
}: TaskEditModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return createPortal(
    <div
      className="task-edit-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <div
        className="task-edit-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${task.title}を編集`}
      >
        <TaskEditForm task={task} onSave={onSave} onCancel={onCancel} />
      </div>
    </div>,
    document.body,
  )
}
