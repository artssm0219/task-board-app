import type { Task } from '../types/task'
import { priorityLabels } from '../types/task'

type TaskItemProps = {
  task: Task
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))

export const TaskItem = ({
  task,
  onToggleTask,
  onDeleteTask,
}: TaskItemProps) => (
  <li className="task-item">
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
      <p className={task.completed ? 'task-title task-title--done' : 'task-title'}>
        {task.title}
      </p>
      <div className="task-meta">
        <span className="category-label">{task.category}</span>
        <span className={`priority-badge priority-badge--${task.priority}`}>
          優先度: {priorityLabels[task.priority]}
        </span>
        <time dateTime={task.createdAt}>{formatDate(task.createdAt)}</time>
      </div>
    </div>

    <button
      className="danger-button"
      type="button"
      onClick={() => onDeleteTask(task.id)}
    >
      削除
    </button>
  </li>
)
