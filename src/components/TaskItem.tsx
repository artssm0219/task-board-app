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

const taskStatuses: TaskStatus[] = ['todo', 'inProgress', 'done']

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

      <div className="task-status-control">
        <label htmlFor={`status-${task.id}`}>状態</label>
        <select
          id={`status-${task.id}`}
          value={task.status}
          onChange={(event) =>
            onStatusChange(task.id, event.target.value as TaskStatus)
          }
        >
          {taskStatuses.map((taskStatus) => (
            <option key={taskStatus} value={taskStatus}>
              {taskStatusLabels[taskStatus]}
            </option>
          ))}
        </select>
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
