import type { TaskSummary as TaskSummaryData } from '../types/task'

type TaskSummaryProps = {
  summary: TaskSummaryData
}

export const TaskSummary = ({ summary }: TaskSummaryProps) => {
  const summaryItems = [
    { label: '全体', value: summary.total, tone: 'total' },
    { label: '未完了', value: summary.active, tone: 'active' },
    { label: '完了', value: summary.completed, tone: 'completed' },
    { label: '高優先度', value: summary.highPriority, tone: 'high' },
    { label: '期限切れ', value: summary.overdue, tone: 'overdue' },
  ]

  return (
    <dl className="task-summary" aria-label="タスクサマリー">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className={`task-summary__card task-summary__card--${item.tone}`}
        >
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
