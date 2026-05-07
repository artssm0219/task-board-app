import { getPriorityDistribution } from '../utils/chartUtils'
import type { Priority, PriorityFilter, Task } from '../types/task'
import { priorityLabels } from '../types/task'

type PriorityBarChartProps = {
  tasks: Task[]
  activeFilter: PriorityFilter
  onPrioritySelect: (priority: PriorityFilter) => void
}

const BAR_STYLES: Record<Priority, { fill: string; border: string }> = {
  high:   { fill: 'var(--high-bg)',    border: 'var(--high)' },
  medium: { fill: 'var(--medium-bg)',  border: 'var(--medium)' },
  low:    { fill: 'var(--low-bg)',     border: 'var(--low)' },
}

export const PriorityBarChart = ({ tasks, activeFilter, onPrioritySelect }: PriorityBarChartProps) => {
  const distribution = getPriorityDistribution(tasks)
  const max = Math.max(...distribution.map((d) => d.count), 1)
  const isFiltering = activeFilter !== 'all'

  return (
    <div className="chart-card">
      <p className="chart-card__title">優先度</p>
      <div className="priority-bars">
        {distribution.map(({ priority, count }) => {
          const isActive = activeFilter === priority
          const pct = (count / max) * 100
          return (
            <button
              key={priority}
              className="priority-bar-row"
              style={{ opacity: isFiltering && !isActive ? 0.4 : 1 }}
              onClick={() => onPrioritySelect(priority)}
              aria-pressed={isActive}
              aria-label={`${priorityLabels[priority]}優先度 ${count}件`}
            >
              <span className="priority-bar-row__label">{priorityLabels[priority]}</span>
              <span className="priority-bar-row__track">
                <span
                  className="priority-bar-row__fill"
                  style={{
                    width: `${pct}%`,
                    background: BAR_STYLES[priority].fill,
                    borderColor: BAR_STYLES[priority].border,
                  }}
                />
              </span>
              <span className="priority-bar-row__count">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
