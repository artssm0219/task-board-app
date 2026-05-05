import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'
import type { Task } from '../types/task'
import type { TaskStatus, TaskUpdate } from '../types/task'

type TaskListProps = {
  tasks: Task[]
  hasFilters: boolean
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onUpdateTask: (taskId: string, taskUpdate: TaskUpdate) => void
  onDeleteTask: (taskId: string) => void
  onResetFilters: () => void
}

export const TaskList = ({
  tasks,
  hasFilters,
  onStatusChange,
  onUpdateTask,
  onDeleteTask,
  onResetFilters,
}: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title={
          hasFilters
            ? '条件に一致するタスクがありません'
            : '最初のタスクを追加しましょう'
        }
        message={
          hasFilters
            ? '検索キーワードやフィルタを見直すと、別のタスクが見つかるかもしれません。'
            : '上のフォームからタスク名、優先度、期限日を設定して追加できます。'
        }
        actionLabel={hasFilters ? 'フィルタをリセット' : undefined}
        onAction={hasFilters ? onResetFilters : undefined}
        variant={hasFilters ? 'filtered' : 'start'}
      />
    )
  }

  return (
    <ul className="task-list" aria-label="タスク一覧">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </ul>
  )
}
