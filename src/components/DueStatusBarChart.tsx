import { getDueStatusDistribution } from '../utils/chartUtils'
import type { DueDateStatus, Task } from '../types/task'

type DueStatusBarChartProps = {
  tasks: Task[]
}

const DUE_STYLES: Record<DueDateStatus, { fill: string; label: string }> = {
  overdue: { fill: 'var(--danger)',   label: '期限切れ' },
  today:   { fill: 'var(--due-today-text)', label: '今日' },
  soon:    { fill: 'var(--due-soon-text)',  label: 'まもなく' },
  later:   { fill: 'var(--primary)',        label: '余裕あり' },
  none:    { fill: 'var(--muted)',          label: '期限なし' },
}

export const DueStatusBarChart = ({ tasks }: DueStatusBarChartProps) => {
  const distribution = getDueStatusDistribution(tasks)
  const max = Math.max(...distribution.map((d) => d.count), 1)

  return (
    <div className="chart-card">
      <p className="chart-card__title">期限状況</p>
      <div className="priority-bars">
        {distribution.map(({ dueStatus, count }) => {
          const pct = (count / max) * 100
          const style = DUE_STYLES[dueStatus]
          return (
            <div key={dueStatus} className="priority-bar-row priority-bar-row--static">
              <span className="priority-bar-row__label">{style.label}</span>
              <span className="priority-bar-row__track">
                <span
                  className="priority-bar-row__fill"
                  style={{ width: `${pct}%`, background: `color-mix(in srgb, ${style.fill} 18%, var(--surface))`, borderColor: style.fill }}
                />
              </span>
              <span className="priority-bar-row__count">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
