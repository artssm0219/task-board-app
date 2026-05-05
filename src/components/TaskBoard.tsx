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
}

const taskStatuses: TaskStatus[] = ['todo', 'inProgress', 'done']

export const TaskBoard = ({
  tasks,
  hasFilters,
  onStatusChange,
  onUpdateTask,
  onDeleteTask,
}: TaskBoardProps) => {
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
                    onStatusChange={onStatusChange}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                  />
                ))}
              </ul>
            ) : (
              <p className="task-board__empty">タスクはありません</p>
            )}
          </section>
        )
      })}
    </div>
  )
}
