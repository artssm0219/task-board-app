import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'
import type { Task, TaskStatus, TaskUpdate } from '../types/task'
import { taskStatusLabels } from '../types/task'

type TaskBoardProps = {
  tasks: Task[]
  hasFilters: boolean
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onUpdateTask: (taskId: string, taskUpdate: TaskUpdate) => void
  onDeleteTask: (taskId: string) => void
  onResetFilters: () => void
}

const taskStatuses: TaskStatus[] = ['todo', 'inProgress', 'done']

export const TaskBoard = ({
  tasks,
  hasFilters,
  onStatusChange,
  onUpdateTask,
  onDeleteTask,
  onResetFilters,
}: TaskBoardProps) => {
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
    <div className="task-board" aria-label="ステータス別ボード">
      {taskStatuses.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status)

        return (
          <section
            key={status}
            className={`task-board__column task-board__column--${status}`}
            aria-labelledby={`board-column-${status}`}
          >
            <div className="task-board__header">
              <h3 id={`board-column-${status}`}>{taskStatusLabels[status]}</h3>
              <span>{columnTasks.length}</span>
            </div>

            {columnTasks.length > 0 ? (
              <ul className="task-board__list">
                {columnTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    displayMode="board"
                    onStatusChange={onStatusChange}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                  />
                ))}
              </ul>
            ) : (
              <div className="task-board__empty">
                <p>{taskStatusLabels[status]}のタスクはありません</p>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
