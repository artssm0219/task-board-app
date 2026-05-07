import { createRef, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { Announcements, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'
import { DraggableTaskItem } from './DraggableTaskItem'
import { DroppableColumn } from './DroppableColumn'
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
const TRANSITION_TIMEOUT = { enter: 220, exit: 280 }

export const TaskBoard = ({
  tasks,
  hasFilters,
  onStatusChange,
  onUpdateTask,
  onDeleteTask,
  onResetFilters,
}: TaskBoardProps) => {
  const [expandedDescriptionTaskIds, setExpandedDescriptionTaskIds] = useState<
    Set<string>
  >(() => new Set())
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const nodeRefs = useRef(new Map<string, React.RefObject<HTMLLIElement | null>>())

  const getNodeRef = (taskId: string): React.RefObject<HTMLLIElement | null> => {
    if (!nodeRefs.current.has(taskId)) {
      nodeRefs.current.set(taskId, createRef<HTMLLIElement | null>())
    }
    return nodeRefs.current.get(taskId)!
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  const announcements: Announcements = {
    onDragStart({ active }) {
      const task = tasks.find((t) => t.id === active.id)
      return task ? `「${task.title}」をドラッグ中です。` : undefined
    },
    onDragOver({ active, over }) {
      const task = tasks.find((t) => t.id === active.id)
      const columnLabel = over?.data.current?.status
        ? taskStatusLabels[over.data.current.status as TaskStatus]
        : null
      if (task && columnLabel) {
        return `「${task.title}」を「${columnLabel}」列の上に移動しました。`
      }
    },
    onDragEnd({ active, over }) {
      const task = tasks.find((t) => t.id === active.id)
      const columnLabel = over?.data.current?.status
        ? taskStatusLabels[over.data.current.status as TaskStatus]
        : null
      if (task && columnLabel) {
        return `「${task.title}」を「${columnLabel}」列に移動しました。`
      }
      return 'ドラッグをキャンセルしました。'
    },
    onDragCancel({ active }) {
      const task = tasks.find((t) => t.id === active.id)
      return task
        ? `「${task.title}」のドラッグをキャンセルしました。`
        : 'ドラッグをキャンセルしました。'
    },
  }

  const handleToggleDescription = (taskId: string) => {
    setExpandedDescriptionTaskIds((currentTaskIds) => {
      const nextTaskIds = new Set(currentTaskIds)
      if (nextTaskIds.has(taskId)) {
        nextTaskIds.delete(taskId)
      } else {
        nextTaskIds.add(taskId)
      }
      return nextTaskIds
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const targetStatus = over.data.current?.status as TaskStatus | undefined
    const sourceStatus = active.data.current?.currentStatus as
      | TaskStatus
      | undefined

    if (!targetStatus || targetStatus === sourceStatus) return

    onStatusChange(String(active.id), targetStatus)
  }

  const handleDragCancel = () => {
    setActiveTask(null)
  }

  const isDragActive = activeTask !== null

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            'Space または Enter キーでタスクを掴み、矢印キーで列を移動し、Space または Enter キーで離してください。Escape でキャンセルできます。',
        },
      }}
    >
      <div className="task-board" aria-label="ステータス別ボード">
        {taskStatuses.map((status) => {
          const columnTasks = tasks.filter((task) => task.status === status)

          return (
            <DroppableColumn
              key={status}
              status={status}
              taskCount={columnTasks.length}
              isDragActive={isDragActive}
            >
              {columnTasks.length > 0 ? (
                <TransitionGroup
                  component="ul"
                  className="task-board__list"
                >
                  {columnTasks.map((task) => {
                    const nodeRef = getNodeRef(task.id)
                    return (
                      <CSSTransition
                        key={task.id}
                        nodeRef={nodeRef}
                        timeout={TRANSITION_TIMEOUT}
                        classNames="task-item-anim"
                        enter={!isDragActive}
                        exit={!isDragActive}
                      >
                        <DraggableTaskItem
                          ref={nodeRef}
                          task={task}
                          isDescriptionExpanded={expandedDescriptionTaskIds.has(
                            task.id,
                          )}
                          onToggleDescription={handleToggleDescription}
                          onStatusChange={onStatusChange}
                          onUpdateTask={onUpdateTask}
                          onDeleteTask={onDeleteTask}
                        />
                      </CSSTransition>
                    )
                  })}
                </TransitionGroup>
              ) : (
                <div
                  className={
                    isDragActive
                      ? 'task-board__empty task-board__empty--droppable'
                      : 'task-board__empty'
                  }
                >
                  <p>
                    {isDragActive
                      ? 'ここにドロップ'
                      : `${status === 'todo' ? '未着手' : status === 'inProgress' ? '進行中' : '完了'}のタスクはありません`}
                  </p>
                </div>
              )}
            </DroppableColumn>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <ul className="task-board__list task-board__drag-overlay">
            <TaskItem
              task={activeTask}
              displayMode="board"
              isDescriptionExpanded={false}
              onStatusChange={onStatusChange}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          </ul>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
