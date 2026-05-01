import { useMemo, useState } from 'react'
import './App.css'
import { TaskFilters } from './components/TaskFilters'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { useLocalStorageTasks } from './hooks/useLocalStorageTasks'
import type {
  PriorityFilter,
  StatusFilter,
  TaskDraft,
} from './types/task'
import { createTask, filterTasks } from './utils/taskUtils'

const initialStatusFilter: StatusFilter = 'all'
const initialPriorityFilter: PriorityFilter = 'all'

function App() {
  const { tasks, setTasks, storageWarning, dismissStorageWarning } =
    useLocalStorageTasks()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>(initialStatusFilter)
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>(
    initialPriorityFilter,
  )

  const filteredTasks = useMemo(
    () =>
      filterTasks(tasks, {
        searchQuery,
        statusFilter,
        priorityFilter,
      }),
    [priorityFilter, searchQuery, statusFilter, tasks],
  )

  const activeCount = tasks.filter((task) => !task.completed).length
  const completedCount = tasks.length - activeCount
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

  const handleDeleteTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    )
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setStatusFilter(initialStatusFilter)
    setPriorityFilter(initialPriorityFilter)
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Local task board</p>
          <h1>タスク管理</h1>
        </div>

        <dl className="task-stats" aria-label="タスク件数">
          <div>
            <dt>全体</dt>
            <dd>{tasks.length}</dd>
          </div>
          <div>
            <dt>未完了</dt>
            <dd>{activeCount}</dd>
          </div>
          <div>
            <dt>完了</dt>
            <dd>{completedCount}</dd>
          </div>
        </dl>
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
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onPriorityFilterChange={setPriorityFilter}
          onResetFilters={handleResetFilters}
        />
      </section>

      <section className="task-section" aria-labelledby="task-list-heading">
        <div className="section-heading">
          <h2 id="task-list-heading">タスク一覧</h2>
          <p aria-live="polite">
            {filteredTasks.length} / {tasks.length} 件を表示
          </p>
        </div>

        <TaskList
          tasks={filteredTasks}
          hasFilters={hasFilters}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
        />
      </section>
    </main>
  )
}

export default App
