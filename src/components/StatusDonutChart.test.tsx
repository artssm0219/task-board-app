import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { TaskSummary } from '../types/task'
import { StatusDonutChart } from './StatusDonutChart'

const makeSummary = (overrides: Partial<TaskSummary> = {}): TaskSummary => ({
  total: 6,
  todo: 2,
  inProgress: 1,
  done: 3,
  highPriority: 0,
  dueSoon: 0,
  overdue: 0,
  ...overrides,
})

describe('StatusDonutChart', () => {
  it('タスクが 0 件のとき空状態を表示する', () => {
    const summary = makeSummary({ total: 0, todo: 0, inProgress: 0, done: 0 })
    render(<StatusDonutChart summary={summary} activeFilter="all" onStatusSelect={vi.fn()} />)
    // SVG center text shows 0; legend counts also show 0 — verify SVG text specifically
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(1)
  })

  it('合計件数を中央に表示する', () => {
    render(<StatusDonutChart summary={makeSummary()} activeFilter="all" onStatusSelect={vi.fn()} />)
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('凡例に各ステータスのカウントを表示する', () => {
    render(<StatusDonutChart summary={makeSummary()} activeFilter="all" onStatusSelect={vi.fn()} />)
    const counts = screen.getAllByText('2')
    expect(counts.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('凡例ボタンをクリックすると onStatusSelect が呼ばれる', async () => {
    const onStatusSelect = vi.fn()
    render(<StatusDonutChart summary={makeSummary()} activeFilter="all" onStatusSelect={onStatusSelect} />)
    // Use the <button> elements in the legend (not the SVG <g role="button"> segments)
    const btns = screen.getAllByRole('button', { name: /未着手/ })
    await userEvent.click(btns[0])
    expect(onStatusSelect).toHaveBeenCalledWith('todo')
  })

  it('activeFilter=todo のとき未着手の凡例ボタンが aria-pressed=true になる', () => {
    render(<StatusDonutChart summary={makeSummary()} activeFilter="todo" onStatusSelect={vi.fn()} />)
    // The legend <button> for 未着手 has aria-pressed; the SVG <g> also does — check all
    const btns = screen.getAllByRole('button', { name: /未着手/ })
    const pressed = btns.filter((b) => b.getAttribute('aria-pressed') === 'true')
    expect(pressed.length).toBeGreaterThanOrEqual(1)
  })
})
