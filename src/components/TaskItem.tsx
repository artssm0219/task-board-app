import { useId, useState } from 'react'
import { TaskEditForm } from './TaskEditForm'
import type { DueDateStatus, Task, TaskStatus } from '../types/task'
import type { TaskUpdate } from '../types/task'
import { priorityLabels, taskStatusLabels } from '../types/task'
import { getDaysUntilDueDate, getDueDateStatus } from '../utils/taskUtils'

type TaskItemProps = {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onUpdateTask: (taskId: string, taskUpdate: TaskUpdate) => void
  onDeleteTask: (taskId: string) => void
}

type StatusAction = {
  status: TaskStatus
  label: string
  ariaLabel: string
}

const DESCRIPTION_PREVIEW_LENGTH = 120
const DESCRIPTION_PREVIEW_LINES = 3

const statusActionsByStatus: Record<TaskStatus, StatusAction[]> = {
  todo: [
    { status: 'inProgress', label: '開始', ariaLabel: '進行中にする' },
    { status: 'done', label: '完了', ariaLabel: '完了にする' },
  ],
  inProgress: [
    { status: 'todo', label: '未着手', ariaLabel: '未着手に戻す' },
    { status: 'done', label: '完了', ariaLabel: '完了にする' },
  ],
  done: [
    { status: 'todo', label: '未着手', ariaLabel: '未着手に戻す' },
    { status: 'inProgress', label: '再開', ariaLabel: '進行中に戻す' },
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

const getDueDateBadgeText = (
  task: Task,
  dueDateStatus: DueDateStatus,
  daysUntilDueDate: number | null,
) => {
  if (!task.dueDate || dueDateStatus === 'none') {
    return '期限なし'
  }

  const dueDateText = formatDateKey(task.dueDate)

  if (task.status === 'done') {
    return `期限: ${dueDateText}`
  }

  switch (dueDateStatus) {
    case 'overdue':
      return `期限切れ: ${dueDateText}`
    case 'today':
      return `今日が期限: ${dueDateText}`
    case 'soon':
      return `あと${daysUntilDueDate}日: ${dueDateText}`
    case 'later':
      return `期限: ${dueDateText}`
  }
}

const getDueDateAriaLabel = (
  task: Task,
  dueDateStatus: DueDateStatus,
  daysUntilDueDate: number | null,
) => {
  if (!task.dueDate || dueDateStatus === 'none') {
    return `${task.title}の期限は設定されていません`
  }

  const dueDateText = formatDateKey(task.dueDate)

  if (task.status === 'done') {
    return `${task.title}は完了済みです。期限は${dueDateText}です`
  }

  switch (dueDateStatus) {
    case 'overdue':
      return `${task.title}は${dueDateText}が期限で、期限切れです`
    case 'today':
      return `${task.title}は今日が期限です`
    case 'soon':
      return `${task.title}は${dueDateText}が期限で、あと${daysUntilDueDate}日です`
    case 'later':
      return `${task.title}は${dueDateText}が期限で、期限に余裕があります`
  }
}

export const TaskItem = ({
  task,
  onStatusChange,
  onUpdateTask,
  onDeleteTask,
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const descriptionId = useId()
  const dueDateStatus = getDueDateStatus(task)
  const daysUntilDueDate = task.dueDate
    ? getDaysUntilDueDate(task.dueDate)
    : null
  const isOverdue = dueDateStatus === 'overdue'
  const descriptionLineCount = task.description.split(/\r\n|\r|\n/).length
  const hasDescription = task.description.length > 0
  const isDescriptionExpandable =
    task.description.length > DESCRIPTION_PREVIEW_LENGTH ||
    descriptionLineCount > DESCRIPTION_PREVIEW_LINES

  const handleSave = (taskId: string, taskUpdate: TaskUpdate) => {
    onUpdateTask(taskId, taskUpdate)
    setIsEditing(false)
  }

  const taskItemClassName = [
    'task-item',
    `task-item--status-${task.status}`,
    `task-item--due-${dueDateStatus}`,
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
        {hasDescription ? (
          <div className="task-description">
            <p
              id={descriptionId}
              className={
                isDescriptionExpandable && !isDescriptionExpanded
                  ? 'task-description__text task-description__text--collapsed'
                  : 'task-description__text'
              }
            >
              {task.description}
            </p>
            {isDescriptionExpandable ? (
              <button
                className="task-description__toggle"
                type="button"
                aria-controls={descriptionId}
                aria-expanded={isDescriptionExpanded}
                onClick={() =>
                  setIsDescriptionExpanded(
                    (currentIsDescriptionExpanded) =>
                      !currentIsDescriptionExpanded,
                  )
                }
              >
                {isDescriptionExpanded ? '閉じる' : 'もっと見る'}
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="task-meta">
          <span className={`status-badge status-badge--${task.status}`}>
            {taskStatusLabels[task.status]}
          </span>
          <span className="category-label">{task.category}</span>
          <span className={`priority-badge priority-badge--${task.priority}`}>
            優先度: {priorityLabels[task.priority]}
          </span>
          <span
            className={`due-date-badge due-date-badge--${dueDateStatus}`}
            aria-label={getDueDateAriaLabel(
              task,
              dueDateStatus,
              daysUntilDueDate,
            )}
          >
            {getDueDateBadgeText(task, dueDateStatus, daysUntilDueDate)}
          </span>
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
            aria-label={`${task.title}を${action.ariaLabel}`}
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
