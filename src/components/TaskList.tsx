import { createRef, useRef } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'
import type { Task } from '../types/task'
import type { TaskStatus, TaskUpdate } from '../types/task'

type TaskListProps = {
  tasks: Task[]
  hasFilters: boolean
  filterEpoch: string
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onUpdateTask: (taskId: string, taskUpdate: TaskUpdate) => void
  onDeleteTask: (taskId: string) => void
  onResetFilters: () => void
}

const TRANSITION_TIMEOUT = { enter: 220, exit: 280 }

export const TaskList = ({
  tasks,
  hasFilters,
  filterEpoch,
  onStatusChange,
  onUpdateTask,
  onDeleteTask,
  onResetFilters,
}: TaskListProps) => {
  const nodeRefs = useRef(new Map<string, React.RefObject<HTMLLIElement | null>>())

  const getNodeRef = (taskId: string): React.RefObject<HTMLLIElement | null> => {
    if (!nodeRefs.current.has(taskId)) {
      nodeRefs.current.set(taskId, createRef<HTMLLIElement | null>())
    }
    return nodeRefs.current.get(taskId)!
  }

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
    <TransitionGroup
      key={filterEpoch}
      component="ul"
      className="task-list"
      aria-label="タスク一覧"
      appear
    >
      {tasks.map((task) => {
        const nodeRef = getNodeRef(task.id)
        return (
          <CSSTransition
            key={task.id}
            nodeRef={nodeRef}
            timeout={TRANSITION_TIMEOUT}
            classNames="task-item-anim"
          >
            <TaskItem
              ref={nodeRef}
              task={task}
              onStatusChange={onStatusChange}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          </CSSTransition>
        )
      })}
    </TransitionGroup>
  )
}
