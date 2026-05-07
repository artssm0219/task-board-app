import { DueStatusBarChart } from './DueStatusBarChart'
import { PriorityBarChart } from './PriorityBarChart'
import { StatusDonutChart } from './StatusDonutChart'
import type { PriorityFilter, StatusFilter, Task, TaskSummary } from '../types/task'

type TaskChartsProps = {
  tasks: Task[]
  summary: TaskSummary
  statusFilter: StatusFilter
  priorityFilter: PriorityFilter
  onStatusSelect: (status: StatusFilter) => void
  onPrioritySelect: (priority: PriorityFilter) => void
}

export const TaskCharts = ({
  tasks,
  summary,
  statusFilter,
  priorityFilter,
  onStatusSelect,
  onPrioritySelect,
}: TaskChartsProps) => (
  <div className="task-charts" aria-label="タスク分布チャート">
    <StatusDonutChart
      summary={summary}
      activeFilter={statusFilter}
      onStatusSelect={onStatusSelect}
    />
    <PriorityBarChart
      tasks={tasks}
      activeFilter={priorityFilter}
      onPrioritySelect={onPrioritySelect}
    />
    <DueStatusBarChart tasks={tasks} />
  </div>
)
