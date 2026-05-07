import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskForm } from './TaskForm'

describe('TaskForm', () => {
  it('フォームの入力フィールドが描画される', () => {
    render(<TaskForm onAddTask={vi.fn()} />)
    expect(screen.getByLabelText('タスク名')).toBeInTheDocument()
    expect(screen.getByLabelText('カテゴリ')).toBeInTheDocument()
    expect(screen.getByLabelText('優先度')).toBeInTheDocument()
    expect(screen.getByLabelText('期限日')).toBeInTheDocument()
  })

  it('タイトルが空のとき追加ボタンが disabled になる', () => {
    render(<TaskForm onAddTask={vi.fn()} />)
    expect(screen.getByRole('button', { name: '追加' })).toBeDisabled()
  })

  it('タイトルを入力すると追加ボタンが有効になる', async () => {
    render(<TaskForm onAddTask={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('タスク名'), 'New Task')
    expect(screen.getByRole('button', { name: '追加' })).toBeEnabled()
  })

  it('タイトル入力後にサブミットすると onAddTask が正しい引数で呼ばれる', async () => {
    const onAddTask = vi.fn()
    render(<TaskForm onAddTask={onAddTask} />)
    await userEvent.type(screen.getByLabelText('タスク名'), 'My Task')
    await userEvent.click(screen.getByRole('button', { name: '追加' }))
    expect(onAddTask).toHaveBeenCalledOnce()
    expect(onAddTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My Task', status: 'todo', priority: 'medium' }),
    )
  })

  it('サブミット後にタイトルフィールドがリセットされる', async () => {
    render(<TaskForm onAddTask={vi.fn()} />)
    const titleInput = screen.getByLabelText('タスク名')
    await userEvent.type(titleInput, 'My Task')
    await userEvent.click(screen.getByRole('button', { name: '追加' }))
    expect(titleInput).toHaveValue('')
  })

  it('タイトルが空白のみのときは onAddTask が呼ばれない', async () => {
    const onAddTask = vi.fn()
    render(<TaskForm onAddTask={onAddTask} />)
    await userEvent.type(screen.getByLabelText('タスク名'), '   ')
    await userEvent.click(screen.getByRole('button', { name: '追加' }))
    expect(onAddTask).not.toHaveBeenCalled()
  })
})
