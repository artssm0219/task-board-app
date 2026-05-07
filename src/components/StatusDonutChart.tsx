import { describeArc, getStatusDistribution } from '../utils/chartUtils'
import type { StatusFilter, TaskSummary } from '../types/task'
import { taskStatusLabels } from '../types/task'

type StatusDonutChartProps = {
  summary: TaskSummary
  activeFilter: StatusFilter
  onStatusSelect: (status: StatusFilter) => void
}

const CX = 52
const CY = 52
const OUTER_R = 44
const INNER_R = 28
const START_ANGLE = -Math.PI / 2

const SEGMENT_STYLES = {
  todo:       { fill: 'var(--status-todo-bg)',       stroke: 'var(--status-todo-border)' },
  inProgress: { fill: 'var(--status-progress-bg)',   stroke: 'var(--status-progress-border)' },
  done:       { fill: 'var(--status-done-bg)',        stroke: 'var(--status-done-border)' },
} as const

export const StatusDonutChart = ({ summary, activeFilter, onStatusSelect }: StatusDonutChartProps) => {
  const distribution = getStatusDistribution(summary)
  const total = distribution.reduce((sum, d) => sum + d.count, 0)
  const isEmpty = total === 0

  const segments: { status: typeof distribution[number]['status']; startAngle: number; endAngle: number }[] = []
  let currentAngle = START_ANGLE

  for (const { status, count } of distribution) {
    const span = isEmpty ? 0 : (count / total) * 2 * Math.PI
    segments.push({ status, startAngle: currentAngle, endAngle: currentAngle + span })
    currentAngle += span
  }

  return (
    <div className="chart-card">
      <p className="chart-card__title">ステータス</p>
      <svg
        viewBox="0 0 104 104"
        className="status-donut"
        role="img"
        aria-label={`ステータス分布: 未着手${summary.todo}件、進行中${summary.inProgress}件、完了${summary.done}件`}
      >
        {isEmpty ? (
          <>
            <circle cx={CX} cy={CY} r={OUTER_R} fill="var(--control-bg)" />
            <circle cx={CX} cy={CY} r={INNER_R} fill="var(--surface)" />
            <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" className="donut-center-text donut-center-text--muted">0</text>
          </>
        ) : (
          segments.map(({ status, startAngle, endAngle }) => {
            const isActive = activeFilter === status
            const isFiltering = activeFilter !== 'all'
            const d = describeArc(CX, CY, OUTER_R, INNER_R, startAngle, endAngle)
            if (!d) return null
            return (
              <g
                key={status}
                role="button"
                tabIndex={0}
                aria-label={`${taskStatusLabels[status]} ${distribution.find(x => x.status === status)?.count ?? 0}件`}
                aria-pressed={isActive}
                style={{ cursor: 'pointer', opacity: isFiltering && !isActive ? 0.4 : 1 }}
                onClick={() => onStatusSelect(status)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStatusSelect(status) } }}
              >
                <path
                  d={d}
                  fill={SEGMENT_STYLES[status].fill}
                  stroke={SEGMENT_STYLES[status].stroke}
                  strokeWidth={1}
                />
              </g>
            )
          })
        )}
        {!isEmpty && (
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" className="donut-center-text">
            {total}
          </text>
        )}
      </svg>
      <div className="chart-legend">
        {distribution.map(({ status, count }) => (
          <button
            key={status}
            className="chart-legend__item"
            style={{ opacity: activeFilter !== 'all' && activeFilter !== status ? 0.4 : 1 }}
            onClick={() => onStatusSelect(status)}
            aria-pressed={activeFilter === status}
          >
            <span className="chart-legend__dot" style={{ background: SEGMENT_STYLES[status].stroke }} />
            <span className="chart-legend__label">{taskStatusLabels[status]}</span>
            <span className="chart-legend__count">{count}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
