import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '../types/task'
import { PriorityBarChart } from './PriorityBarChart'

const makeTask = (priority: Task['priority']): Task => ({
  id: Math.random().toString(),
  title: 'test',
  status: 'todo',
  priority,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const tasks: Task[] = [
  makeTask('high'),
  makeTask('high'),
  makeTask('medium'),
  makeTask('low'),
]

describe('PriorityBarChart', () => {
  it('各優先度のカウントを表示する', () => {
    render(<PriorityBarChart tasks={tasks} activeFilter="all" onPrioritySelect={vi.fn()} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    const ones = screen.getAllByText('1')
    expect(ones.length).toBe(2)
  })

  it('ボタンをクリックすると onPrioritySelect が呼ばれる', async () => {
    const onPrioritySelect = vi.fn()
    render(<PriorityBarChart tasks={tasks} activeFilter="all" onPrioritySelect={onPrioritySelect} />)
    await userEvent.click(screen.getByRole('button', { name: /高/ }))
    expect(onPrioritySelect).toHaveBeenCalledWith('high')
  })

  it('activeFilter=high のとき高優先度ボタンが aria-pressed=true になる', () => {
    render(<PriorityBarChart tasks={tasks} activeFilter="high" onPrioritySelect={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /高/ })
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('フィルタ中は非アクティブな行の opacity が下がる', () => {
    render(<PriorityBarChart tasks={tasks} activeFilter="high" onPrioritySelect={vi.fn()} />)
    const lowBtn = screen.getByRole('button', { name: /低/ })
    expect(lowBtn).toHaveStyle({ opacity: '0.4' })
  })

  it('タスクが空のとき全行ゼロを表示する', () => {
    render(<PriorityBarChart tasks={[]} activeFilter="all" onPrioritySelect={vi.fn()} />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBe(3)
  })
})
