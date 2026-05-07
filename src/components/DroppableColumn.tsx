import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'
import type { TaskStatus } from '../types/task'
import { taskStatusLabels } from '../types/task'

type DroppableColumnProps = {
  status: TaskStatus
  taskCount: number
  isDragActive: boolean
  children: ReactNode
}

export const DroppableColumn = ({
  status,
  taskCount,
  isDragActive,
  children,
}: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: 'column', status },
  })

  const className = [
    'task-board__column',
    `task-board__column--${status}`,
    isOver ? 'task-board__column--drop-target' : '',
    isDragActive && !isOver ? 'task-board__column--drag-active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      ref={setNodeRef}
      className={className}
      aria-labelledby={`board-column-${status}`}
    >
      <div className="task-board__header">
        <h3 id={`board-column-${status}`}>{taskStatusLabels[status]}</h3>
        <span>{taskCount}</span>
      </div>
      {children}
    </section>
  )
}
