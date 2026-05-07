import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '../types/task'
import { TaskList } from './TaskList'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Test Task',
  description: '',
  status: 'todo',
  priority: 'medium',
  category: 'Work',
  createdAt: '2024-01-15T00:00:00.000Z',
  dueDate: null,
  ...overrides,
})

const defaultProps = {
  hasFilters: false,
  filterEpoch: '',
  onStatusChange: vi.fn(),
  onUpdateTask: vi.fn(),
  onDeleteTask: vi.fn(),
  onResetFilters: vi.fn(),
}

describe('TaskList', () => {
  it('タスクのタイトルが描画される', () => {
    const tasks = [
      makeTask({ id: '1', title: 'First Task' }),
      makeTask({ id: '2', title: 'Second Task' }),
    ]
    render(<TaskList tasks={tasks} {...defaultProps} />)
    expect(screen.getByText('First Task')).toBeInTheDocument()
    expect(screen.getByText('Second Task')).toBeInTheDocument()
  })

  it('タスクが空で hasFilters=false → 開始を促すメッセージを表示', () => {
    render(<TaskList tasks={[]} {...defaultProps} hasFilters={false} />)
    expect(screen.getByText('最初のタスクを追加しましょう')).toBeInTheDocument()
  })

  it('タスクが空で hasFilters=true → フィルタ結果なしのメッセージを表示', () => {
    render(<TaskList tasks={[]} {...defaultProps} hasFilters={true} />)
    expect(screen.getByText('条件に一致するタスクがありません')).toBeInTheDocument()
  })
})
