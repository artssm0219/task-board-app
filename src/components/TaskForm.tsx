import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Priority, TaskDraft } from '../types/task'

type TaskFormProps = {
  onAddTask: (task: TaskDraft) => void
}

const defaultPriority: Priority = 'medium'

export const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<Priority>(defaultPriority)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    onAddTask({ title, category, priority })
    setTitle('')
    setCategory('')
    setPriority(defaultPriority)
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
        />
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

      <button className="primary-button" type="submit">
        追加
      </button>
    </form>
  )
}
