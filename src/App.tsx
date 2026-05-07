import { useMemo, useState } from 'react'
import './App.css'
import { TaskBoard } from './components/TaskBoard'
import { TaskCharts } from './components/TaskCharts'
import { TaskFilters } from './components/TaskFilters'
import { TaskForm } from './components/TaskForm'
import { TaskImportExport } from './components/TaskImportExport'
import { TaskList } from './components/TaskList'
import { TaskSummary } from './components/TaskSummary'
import { ThemeToggle } from './components/ThemeToggle'
import { ViewModeToggle } from './components/ViewModeToggle'
import { useLocalStorageTasks } from './hooks/useLocalStorageTasks'
import { useTheme } from './hooks/useTheme'
import type {
  PriorityFilter,
  SortOption,
  StatusFilter,
  Task,
  TaskImportMode,
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
  const { theme, toggleTheme } = useTheme()
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

  const filterEpoch = useMemo(
    () => `${searchQuery}|${statusFilter}|${priorityFilter}|${sortOption}`,
    [searchQuery, statusFilter, priorityFilter, sortOption],
  )

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

  const handleImportTasks = (
    importedTasks: Task[],
    importMode: TaskImportMode,
  ) => {
    if (importMode === 'replace') {
      setTasks(importedTasks)
      handleResetFilters()
      return
    }

    setTasks((currentTasks) => [...importedTasks, ...currentTasks])
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-header__main">
          <div>
            <p className="eyebrow">Local task board</p>
            <h1>タスク管理</h1>
          </div>
          <ThemeToggle theme={theme} onToggleTheme={toggleTheme} />
        </div>

        <TaskSummary summary={taskSummary} />
      </header>

      <TaskCharts
        tasks={tasks}
        summary={taskSummary}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onStatusSelect={(next) =>
          setStatusFilter(next === statusFilter ? 'all' : next)
        }
        onPrioritySelect={(next) =>
          setPriorityFilter(next === priorityFilter ? 'all' : next)
        }
      />

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

      <section
        className="tool-section"
        aria-labelledby="data-management-heading"
      >
        <h2 id="data-management-heading">データ管理</h2>
        <TaskImportExport tasks={tasks} onImportTasks={handleImportTasks} />
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

        <div className="view-swap" key={viewMode}>
          {viewMode === 'list' ? (
            <TaskList
              tasks={visibleTasks}
              hasFilters={hasFilters}
              filterEpoch={filterEpoch}
              onStatusChange={handleStatusChange}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onResetFilters={handleResetFilters}
            />
          ) : (
            <TaskBoard
              tasks={visibleTasks}
              hasFilters={hasFilters}
              onStatusChange={handleStatusChange}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onResetFilters={handleResetFilters}
            />
          )}
        </div>
      </section>
    </main>
  )
}

export default App
