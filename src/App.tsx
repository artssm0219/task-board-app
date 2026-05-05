import { useMemo, useState } from 'react'
import './App.css'
import { TaskFilters } from './components/TaskFilters'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { TaskSummary } from './components/TaskSummary'
import { useLocalStorageTasks } from './hooks/useLocalStorageTasks'
import type {
  PriorityFilter,
  SortOption,
  StatusFilter,
  TaskDraft,
  TaskUpdate,
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

  const handleToggleTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
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
          <h2 id="task-list-heading">タスク一覧</h2>
          <p aria-live="polite">
            {visibleTasks.length} / {tasks.length} 件を表示
          </p>
        </div>

        <TaskList
          tasks={visibleTasks}
          hasFilters={hasFilters}
          onToggleTask={handleToggleTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </section>
    </main>
  )
}

export default App
