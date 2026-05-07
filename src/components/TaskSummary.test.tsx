import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TaskSummary } from './TaskSummary'

const summary = {
  total: 10,
  todo: 3,
  inProgress: 4,
  done: 3,
  highPriority: 2,
  dueToday: 1,
  overdue: 2,
}

describe('TaskSummary', () => {
  it('全体件数が表示される', () => {
    render(<TaskSummary summary={summary} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('各カテゴリのラベルが表示される', () => {
    render(<TaskSummary summary={summary} />)
    expect(screen.getByText('未着手')).toBeInTheDocument()
    expect(screen.getByText('進行中')).toBeInTheDocument()
    expect(screen.getByText('完了')).toBeInTheDocument()
    expect(screen.getByText('高優先度')).toBeInTheDocument()
    expect(screen.getByText('今日が期限')).toBeInTheDocument()
    expect(screen.getByText('期限切れ')).toBeInTheDocument()
  })

  it('各カテゴリの値が表示される', () => {
    render(<TaskSummary summary={summary} />)
    // todo:3 と done:3 で同じ値が 2 つ存在するため getAllByText を使う
    expect(screen.getAllByText('3', { selector: 'dd' })).toHaveLength(2)
    expect(screen.getByText('4', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getAllByText('2', { selector: 'dd' })).toHaveLength(2)
  })
})
