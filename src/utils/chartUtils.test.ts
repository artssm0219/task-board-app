import { describe, expect, it } from 'vitest'
import type { Task } from '../types/task'
import {
  describeArc,
  getDueStatusDistribution,
  getPriorityDistribution,
  getStatusDistribution,
} from './chartUtils'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'id',
  title: 'T',
  description: '',
  status: 'todo',
  priority: 'medium',
  category: 'C',
  createdAt: '2024-01-01T00:00:00.000Z',
  dueDate: null,
  ...overrides,
})

// ─── getStatusDistribution ───────────────────────────────────────────────────

describe('getStatusDistribution', () => {
  it('サマリーからステータス分布を返す', () => {
    const summary = { total: 6, todo: 2, inProgress: 3, done: 1, highPriority: 0, dueToday: 0, overdue: 0 }
    const dist = getStatusDistribution(summary)
    expect(dist).toEqual([
      { status: 'todo', count: 2 },
      { status: 'inProgress', count: 3 },
      { status: 'done', count: 1 },
    ])
  })

  it('全件0のとき全て0を返す', () => {
    const summary = { total: 0, todo: 0, inProgress: 0, done: 0, highPriority: 0, dueToday: 0, overdue: 0 }
    const dist = getStatusDistribution(summary)
    expect(dist.every((d) => d.count === 0)).toBe(true)
  })
})

// ─── getPriorityDistribution ─────────────────────────────────────────────────

describe('getPriorityDistribution', () => {
  it('タスク配列から優先度ごとの件数を返す', () => {
    const tasks = [
      makeTask({ priority: 'high' }),
      makeTask({ priority: 'high' }),
      makeTask({ priority: 'medium' }),
      makeTask({ priority: 'low' }),
    ]
    const dist = getPriorityDistribution(tasks)
    expect(dist).toEqual([
      { priority: 'high', count: 2 },
      { priority: 'medium', count: 1 },
      { priority: 'low', count: 1 },
    ])
  })

  it('空配列のとき全て0を返す', () => {
    const dist = getPriorityDistribution([])
    expect(dist.every((d) => d.count === 0)).toBe(true)
  })
})

// ─── getDueStatusDistribution ─────────────────────────────────────────────────

describe('getDueStatusDistribution', () => {
  it('dueDate なしのタスクは none になる', () => {
    const tasks = [makeTask({ dueDate: null })]
    const dist = getDueStatusDistribution(tasks)
    const none = dist.find((d) => d.dueStatus === 'none')
    expect(none?.count).toBe(1)
  })

  it('空配列のとき全て0を返す', () => {
    const dist = getDueStatusDistribution([])
    expect(dist.every((d) => d.count === 0)).toBe(true)
  })

  it('done タスクはどの期限でも later になる', () => {
    const tasks = [makeTask({ status: 'done', dueDate: '2020-01-01' })]
    const dist = getDueStatusDistribution(tasks)
    const later = dist.find((d) => d.dueStatus === 'later')
    const overdue = dist.find((d) => d.dueStatus === 'overdue')
    expect(later?.count).toBe(1)
    expect(overdue?.count).toBe(0)
  })
})

// ─── describeArc ─────────────────────────────────────────────────────────────

describe('describeArc', () => {
  it('span が 0 のとき空文字を返す', () => {
    expect(describeArc(50, 50, 40, 20, 0, 0)).toBe('')
  })

  it('180° アークのとき largeArc フラグが 0 になる', () => {
    const d = describeArc(50, 50, 40, 20, -Math.PI / 2, Math.PI / 2)
    // largeArc=0 is the flag in "A r r 0 {largeArc} 1 ..."
    expect(d).toContain('0 0 1')
  })

  it('270° アークのとき largeArc フラグが 1 になる', () => {
    const d = describeArc(50, 50, 40, 20, -Math.PI / 2, Math.PI)
    expect(d).toContain('0 1 1')
  })

  it('ほぼ 360° のとき空文字にならない', () => {
    const d = describeArc(50, 50, 40, 20, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI)
    expect(d.length).toBeGreaterThan(0)
  })
})
