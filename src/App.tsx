import { useMemo, useState } from 'react'
import './App.css'
import { TaskBoard } from './components/TaskBoard'
import { TaskFilters } from './components/TaskFilters'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { TaskSummary } from './components/TaskSummary'
import { ViewModeToggle } from './components/ViewModeToggle'
import { useLocalStorageTasks } from './hooks/useLocalStorageTasks'
import type {
  PriorityFilter,
  SortOption,
  StatusFilter,
  TaskStatus,
  TaskDraft,
  TaskUpdate,
  ViewMode,
} from './types/task'
import {
  applyTaskUpdate,
  createTask,
  filterTasks,
  getTaskSummary,
  sortTasks,
} from './utils/taskUtils'

const initialStatusFilter: StatusFilter = 'all'
const initialPriorityFilter: PriorityFilter = 'all'
const initialSortOption: SortOption = 'created-desc'
const initialViewMode: ViewMode = 'list'

function App() {
  const { tasks, setTasks, storageWarning, dismissStorageWarning } =
    useLocalStorageTasks()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>(initialStatusFilter)
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(
    initialPriorityFilter,
  )
  const [sortOption, setSortOption] = useState<SortOption>(initialSortOption)
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)

  const visibleTasks = useMemo(() => {
    const filteredTasks = filterTasks(tasks, {
      searchQuery,
      statusFilter,
      priorityFilter,
    })

    return sortTasks(filteredTasks, sortOption)
  }, [priorityFilter, searchQuery, sortOption, statusFilter, tasks])

  const taskSummary = useMemo(() => getTaskSummary(tasks), [tasks])
  const hasFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== initialStatusFilter ||
    priorityFilter !== initialPriorityFilter

  const handleAddTask = (taskDraft: TaskDraft) => {
    setTasks((currentTasks) => [createTask(taskDraft), ...currentTasks])
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task,
      ),
    )
  }

  const handleUpdateTask = (taskId: string, taskUpdate: TaskUpdate) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? applyTaskUpdate(task, taskUpdate) : task,
      ),
    )
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    )
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter(initialStatusFilter)
    setPriorityFilter(initialPriorityFilter)
    setSortOption(initialSortOption)
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Local task board</p>
          <h1>タスク管理</h1>
        </div>

        <TaskSummary summary={taskSummary} />
      </header>

      {storageWarning ? (
        <div className="storage-alert" role="alert">
          <p>{storageWarning}</p>
          <button
            className="storage-alert__close"
            type="button"
            onClick={dismissStorageWarning}
          >
            閉じる
          </button>
        </div>
      ) : null}

      <section className="tool-section" aria-labelledby="add-task-heading">
        <h2 id="add-task-heading">タスクを追加</h2>
        <TaskForm onAddTask={handleAddTask} />
      </section>

      <section className="tool-section" aria-labelledby="filter-heading">
        <h2 id="filter-heading">検索とフィルタ</h2>
        <TaskFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          sortOption={sortOption}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onPriorityFilterChange={setPriorityFilter}
          onSortOptionChange={setSortOption}
          onResetFilters={handleResetFilters}
        />
      </section>

      <section className="task-section" aria-labelledby="task-list-heading">
        <div className="section-heading">
          <div>
            <h2 id="task-list-heading">
              {viewMode === 'list' ? 'タスク一覧' : 'タスクボード'}
            </h2>
            <p aria-live="polite">
              {visibleTasks.length} / {tasks.length} 件を表示
            </p>
          </div>
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {viewMode === 'list' ? (
          <TaskList
            tasks={visibleTasks}
            hasFilters={hasFilters}
            onStatusChange={handleStatusChange}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        ) : (
          <TaskBoard
            tasks={visibleTasks}
            hasFilters={hasFilters}
            onStatusChange={handleStatusChange}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </section>
    </main>
  )
}

export default App
