import { useState } from 'react'
import { TaskEditForm } from './TaskEditForm'
import type { Task } from '../types/task'
import type { TaskUpdate } from '../types/task'
import { priorityLabels } from '../types/task'
import { isOverdueTask } from '../utils/taskUtils'

type TaskItemProps = {
  task: Task
  onToggleTask: (taskId: string) => void
  onUpdateTask: (taskId: string, taskUpdate: TaskUpdate) => void
  onDeleteTask: (taskId: string) => void
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
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const isOverdue = isOverdueTask(task)

  const handleSave = (taskId: string, taskUpdate: TaskUpdate) => {
    onUpdateTask(taskId, taskUpdate)
    setIsEditing(false)
  }

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
    <li className={isOverdue ? 'task-item task-item--overdue' : 'task-item'}>
      <label className="task-item__check">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleTask(task.id)}
        />
        <span className="visually-hidden">
          {task.title}を{task.completed ? '未完了' : '完了'}にする
        </span>
      </label>

      <div className="task-item__content">
        <p
          className={task.completed ? 'task-title task-title--done' : 'task-title'}
        >
          {task.title}
        </p>
        <div className="task-meta">
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
