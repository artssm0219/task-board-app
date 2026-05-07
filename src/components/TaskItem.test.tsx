import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '../types/task'
import { TaskItem } from './TaskItem'

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
  onStatusChange: vi.fn(),
  onUpdateTask: vi.fn(),
  onDeleteTask: vi.fn(),
}

describe('TaskItem', () => {
  it('タスクタイトルが描画される', () => {
    render(<TaskItem task={makeTask()} {...defaultProps} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('優先度バッジが描画される', () => {
    render(<TaskItem task={makeTask({ priority: 'high' })} {...defaultProps} />)
    expect(screen.getByText(/高/)).toBeInTheDocument()
  })

  it('ステータスバッジが描画される', () => {
    render(<TaskItem task={makeTask({ status: 'inProgress' })} {...defaultProps} />)
    expect(screen.getByText('進行中')).toBeInTheDocument()
  })

  it('"開始" ボタンクリックで onStatusChange(id, "inProgress") が呼ばれる', async () => {
    const onStatusChange = vi.fn()
    render(<TaskItem task={makeTask()} {...defaultProps} onStatusChange={onStatusChange} />)
    await userEvent.click(screen.getByRole('button', { name: /進行中にする/ }))
    expect(onStatusChange).toHaveBeenCalledWith('task-1', 'inProgress')
  })

  it('"完了" ボタンクリックで onStatusChange(id, "done") が呼ばれる', async () => {
    const onStatusChange = vi.fn()
    render(<TaskItem task={makeTask()} {...defaultProps} onStatusChange={onStatusChange} />)
    await userEvent.click(screen.getByRole('button', { name: /完了にする/ }))
    expect(onStatusChange).toHaveBeenCalledWith('task-1', 'done')
  })

  it('削除ボタンクリックで onDeleteTask(id) が呼ばれる', async () => {
    const onDeleteTask = vi.fn()
    render(<TaskItem task={makeTask()} {...defaultProps} onDeleteTask={onDeleteTask} />)
    await userEvent.click(screen.getByRole('button', { name: /削除/ }))
    expect(onDeleteTask).toHaveBeenCalledWith('task-1')
  })

  it('list モードで編集ボタンをクリックすると inline フォームが表示される', async () => {
    render(<TaskItem task={makeTask()} {...defaultProps} displayMode="list" />)
    await userEvent.click(screen.getByRole('button', { name: /編集/ }))
    expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument()
  })

  it('説明が長いとき「もっと見る」ボタンが表示される', () => {
    const longDescription = 'a'.repeat(200)
    render(<TaskItem task={makeTask({ description: longDescription })} {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'もっと見る' })).toBeInTheDocument()
  })

  it('「もっと見る」クリックで「折りたたむ」に切り替わる', async () => {
    const longDescription = 'a'.repeat(200)
    render(<TaskItem task={makeTask({ description: longDescription })} {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: 'もっと見る' }))
    expect(screen.getByRole('button', { name: '折りたたむ' })).toBeInTheDocument()
  })
})
