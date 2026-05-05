import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Priority, TaskDraft, TaskStatus } from '../types/task'
import { taskStatusLabels } from '../types/task'

type TaskFormProps = {
  onAddTask: (task: TaskDraft) => void
}

const defaultPriority: Priority = 'medium'
const defaultStatus: TaskStatus = 'todo'
const taskStatuses: TaskStatus[] = ['todo', 'inProgress', 'done']

export const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [priority, setPriority] = useState<Priority>(defaultPriority)
  const [dueDate, setDueDate] = useState('')
  const isTitleBlank = title.trim().length === 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isTitleBlank) {
      return
    }

    onAddTask({ title, category, status, priority, dueDate: dueDate || null })
    setTitle('')
    setCategory('')
    setStatus(defaultStatus)
    setPriority(defaultPriority)
    setDueDate('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="field task-form__title">
        <label htmlFor="task-title">タスク名</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例: 企画書を確認する"
          autoComplete="off"
          required
          aria-describedby="task-title-help"
        />
        <p className="field-hint" id="task-title-help">
          タスク名を入力すると追加できます。
        </p>
      </div>

      <div className="field">
        <label htmlFor="task-category">カテゴリ</label>
        <input
          id="task-category"
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="例: 仕事"
          autoComplete="off"
        />
      </div>

      <div className="field">
        <label htmlFor="task-status">状態</label>
        <select
          id="task-status"
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
        <label htmlFor="task-priority">優先度</label>
        <select
          id="task-priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value as Priority)}
        >
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="task-due-date">期限日</label>
        <input
          id="task-due-date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </div>

      <button className="primary-button" type="submit" disabled={isTitleBlank}>
        追加
      </button>
    </form>
  )
}
