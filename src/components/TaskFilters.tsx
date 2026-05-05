import type { PriorityFilter, SortOption, StatusFilter } from '../types/task'
import {
  priorityFilterLabels,
  sortOptionLabels,
  statusFilterLabels,
} from '../types/task'

type TaskFiltersProps = {
  searchQuery: string
  statusFilter: StatusFilter
  priorityFilter: PriorityFilter
  sortOption: SortOption
  onSearchChange: (searchQuery: string) => void
  onStatusFilterChange: (statusFilter: StatusFilter) => void
  onPriorityFilterChange: (priorityFilter: PriorityFilter) => void
  onSortOptionChange: (sortOption: SortOption) => void
  onResetFilters: () => void
}

const statusFilters: StatusFilter[] = ['all', 'todo', 'inProgress', 'done']
const priorityFilters: PriorityFilter[] = ['all', 'high', 'medium', 'low']
const sortOptions: SortOption[] = [
  'created-desc',
  'created-asc',
  'due-asc',
  'due-desc',
  'priority-desc',
  'priority-asc',
  'active-first',
]

export const TaskFilters = ({
  searchQuery,
  statusFilter,
  priorityFilter,
  sortOption,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onSortOptionChange,
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
        placeholder="タスク名・カテゴリ・メモで検索"
      />
    </div>

    <fieldset className="segmented-control">
      <legend>状態</legend>
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

    <div className="field">
      <label htmlFor="task-sort">並び替え</label>
      <select
        id="task-sort"
        value={sortOption}
        onChange={(event) =>
          onSortOptionChange(event.target.value as SortOption)
        }
      >
        {sortOptions.map((option) => (
          <option key={option} value={option}>
            {sortOptionLabels[option]}
          </option>
        ))}
      </select>
    </div>

    <button className="secondary-button" type="button" onClick={onResetFilters}>
      リセット
    </button>
  </div>
)
