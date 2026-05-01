import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'
import type { Task } from '../types/task'

type TaskListProps = {
  tasks: Task[]
  hasFilters: boolean
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

export const TaskList = ({
  tasks,
  hasFilters,
  onToggleTask,
  onDeleteTask,
}: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title={hasFilters ? '条件に合うタスクがありません' : 'タスクはまだありません'}
        message={
          hasFilters
            ? '検索キーワードやフィルタを変えると、別のタスクが見つかるかもしれません。'
            : '上のフォームから最初のタスクを追加できます。'
        }
      />
    )
  }

  return (
    <ul className="task-list" aria-label="タスク一覧">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </ul>
  )
}
