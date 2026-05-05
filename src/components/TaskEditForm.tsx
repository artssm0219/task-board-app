import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Priority, Task, TaskStatus, TaskUpdate } from '../types/task'
import { taskStatusLabels } from '../types/task'

type TaskEditFormProps = {
  task: Task
  onSave: (taskId: string, taskUpdate: TaskUpdate) => void
  onCancel: () => void
}

const taskStatuses: TaskStatus[] = ['todo', 'inProgress', 'done']

export const TaskEditForm = ({
  task,
  onSave,
  onCancel,
}: TaskEditFormProps) => {
  const [title, setTitle] = useState(task.title)
  const [category, setCategory] = useState(task.category)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [dueDate, setDueDate] = useState(task.dueDate ?? '')
  const isTitleBlank = title.trim().length === 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isTitleBlank) {
      return
    }

    onSave(task.id, {
      title,
      category,
      status,
      priority,
      dueDate: dueDate || null,
    })
  }

  return (
    <form className="task-edit-form" onSubmit={handleSubmit}>
      <p className="task-edit-form__title">タスクを編集</p>

      <div className="field">
        <label htmlFor={`edit-title-${task.id}`}>タスク名</label>
        <input
          id={`edit-title-${task.id}`}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="task-edit-form__grid">
        <div className="field">
          <label htmlFor={`edit-category-${task.id}`}>カテゴリ</label>
          <input
            id={`edit-category-${task.id}`}
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor={`edit-status-${task.id}`}>状態</label>
          <select
            id={`edit-status-${task.id}`}
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
          >
            {taskStatuses.map((taskStatus) => (
              <option key={taskStatus} value={taskStatus}>
                {taskStatusLabels[taskStatus]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor={`edit-priority-${task.id}`}>優先度</label>
          <select
            id={`edit-priority-${task.id}`}
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor={`edit-due-date-${task.id}`}>期限日</label>
          <input
            id={`edit-due-date-${task.id}`}
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
      </div>

      <div className="task-edit-form__actions">
        <button className="primary-button" type="submit" disabled={isTitleBlank}>
          保存
        </button>
        <button className="secondary-button" type="button" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </form>
  )
}
