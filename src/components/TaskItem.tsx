import { useState } from 'react'
import { TaskEditForm } from './TaskEditForm'
import type { Task, TaskStatus } from '../types/task'
import type { TaskUpdate } from '../types/task'
import { priorityLabels, taskStatusLabels } from '../types/task'
import { isOverdueTask } from '../utils/taskUtils'

type TaskItemProps = {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onUpdateTask: (taskId: string, taskUpdate: TaskUpdate) => void
  onDeleteTask: (taskId: string) => void
}

type StatusAction = {
  status: TaskStatus
  label: string
}

const statusActionsByStatus: Record<TaskStatus, StatusAction[]> = {
  todo: [
    { status: 'inProgress', label: '進行中にする' },
    { status: 'done', label: '完了にする' },
  ],
  inProgress: [
    { status: 'todo', label: '未着手に戻す' },
    { status: 'done', label: '完了にする' },
  ],
  done: [
    { status: 'todo', label: '未着手に戻す' },
    { status: 'inProgress', label: '進行中に戻す' },
  ],
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))

const formatDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export const TaskItem = ({
  task,
  onStatusChange,
  onUpdateTask,
  onDeleteTask,
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const isOverdue = isOverdueTask(task)

  const handleSave = (taskId: string, taskUpdate: TaskUpdate) => {
    onUpdateTask(taskId, taskUpdate)
    setIsEditing(false)
  }

  const taskItemClassName = [
    'task-item',
    `task-item--status-${task.status}`,
    isOverdue ? 'task-item--overdue' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const statusActions = statusActionsByStatus[task.status]

  if (isEditing) {
    return (
      <li className="task-item task-item--editing">
        <TaskEditForm
          task={task}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className={taskItemClassName}>
      <div className="task-item__content">
        <p
          className={task.status === 'done' ? 'task-title task-title--done' : 'task-title'}
        >
          {task.title}
        </p>
        <div className="task-meta">
          <span className={`status-badge status-badge--${task.status}`}>
            {taskStatusLabels[task.status]}
          </span>
          <span className="category-label">{task.category}</span>
          <span className={`priority-badge priority-badge--${task.priority}`}>
            優先度: {priorityLabels[task.priority]}
          </span>
          {task.dueDate ? (
            <span
              className={
                isOverdue ? 'due-date-badge due-date-badge--overdue' : 'due-date-badge'
              }
            >
              期限: {formatDateKey(task.dueDate)}
              {isOverdue ? '（期限切れ）' : ''}
            </span>
          ) : null}
          <time dateTime={task.createdAt}>{formatDate(task.createdAt)}</time>
        </div>
      </div>

      <div
        className="task-status-actions"
        role="group"
        aria-label={`${task.title}の状態変更`}
      >
        {statusActions.map((action) => (
          <button
            key={action.status}
            className={`status-action-button status-action-button--${action.status}`}
            type="button"
            aria-label={`${task.title}を${action.label}`}
            onClick={() => onStatusChange(task.id, action.status)}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="task-actions">
        <button
          className="secondary-button"
          type="button"
          aria-label={`${task.title}を編集`}
          onClick={() => setIsEditing(true)}
        >
          編集
        </button>
        <button
          className="danger-button"
          type="button"
          aria-label={`${task.title}を削除`}
          onClick={() => onDeleteTask(task.id)}
        >
          削除
        </button>
      </div>
    </li>
  )
}
