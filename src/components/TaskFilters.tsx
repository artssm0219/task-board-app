import type { PriorityFilter, StatusFilter } from '../types/task'
import { priorityFilterLabels, statusFilterLabels } from '../types/task'

type TaskFiltersProps = {
  searchQuery: string
  statusFilter: StatusFilter
  priorityFilter: PriorityFilter
  onSearchChange: (searchQuery: string) => void
  onStatusFilterChange: (statusFilter: StatusFilter) => void
  onPriorityFilterChange: (priorityFilter: PriorityFilter) => void
  onResetFilters: () => void
}

const statusFilters: StatusFilter[] = ['all', 'active', 'completed']
const priorityFilters: PriorityFilter[] = ['all', 'high', 'medium', 'low']

export const TaskFilters = ({
  searchQuery,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onResetFilters,
}: TaskFiltersProps) => (
  <div className="task-filters">
    <div className="field task-filters__search">
      <label htmlFor="task-search">キーワード検索</label>
      <input
        id="task-search"
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="タスク名・カテゴリで検索"
      />
    </div>

    <fieldset className="segmented-control">
      <legend>完了状態</legend>
      <div className="segmented-control__options">
        {statusFilters.map((filter) => (
          <label key={filter} className="segmented-control__option">
            <input
              type="radio"
              name="status-filter"
              value={filter}
              checked={statusFilter === filter}
              onChange={() => onStatusFilterChange(filter)}
            />
            <span>{statusFilterLabels[filter]}</span>
          </label>
        ))}
      </div>
    </fieldset>

    <div className="field">
      <label htmlFor="priority-filter">優先度</label>
      <select
        id="priority-filter"
        value={priorityFilter}
        onChange={(event) =>
          onPriorityFilterChange(event.target.value as PriorityFilter)
        }
      >
        {priorityFilters.map((filter) => (
          <option key={filter} value={filter}>
            {priorityFilterLabels[filter]}
          </option>
        ))}
      </select>
    </div>

    <button className="secondary-button" type="button" onClick={onResetFilters}>
      リセット
    </button>
  </div>
)
