import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Task, TaskSummary } from '../types/task'
import { TaskCharts } from './TaskCharts'

const summary: TaskSummary = {
  total: 2,
  todo: 1,
  inProgress: 0,
  done: 1,
  highPriority: 0,
  dueToday: 0,
  overdue: 0,
}

const tasks: Task[] = [
  { id: '1', title: 'A', description: '', status: 'todo', priority: 'medium', category: '', createdAt: '', dueDate: null },
  { id: '2', title: 'B', description: '', status: 'done', priority: 'high', category: '', createdAt: '', dueDate: null },
]

describe('TaskCharts', () => {
  it('3 つのチャートカードを表示する', () => {
    render(
      <TaskCharts
        tasks={tasks}
        summary={summary}
        statusFilter="all"
        priorityFilter="all"
        onStatusSelect={vi.fn()}
        onPrioritySelect={vi.fn()}
      />,
    )
    expect(screen.getByText('ステータス')).toBeInTheDocument()
    expect(screen.getByText('優先度')).toBeInTheDocument()
    expect(screen.getByText('期限状況')).toBeInTheDocument()
  })
})
