import { describe, expect, it } from 'vitest'
import type { Task } from '../types/task'
import {
  applyTaskUpdate,
  createTask,
  filterTasks,
  getDaysUntilDueDate,
  getDueDateStatus,
  getTaskSummary,
  isDueTodayTask,
  isOverdueTask,
  normalizeDescription,
  normalizeDueDate,
  normalizeTask,
  normalizeTasks,
  sortTasks,
} from './taskUtils'

// ─── helpers ────────────────────────────────────────────────────────────────

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'test-id',
  title: 'Test Task',
  description: '',
  status: 'todo',
  priority: 'medium',
  category: 'Work',
  createdAt: '2024-01-15T00:00:00.000Z',
  dueDate: null,
  ...overrides,
})

// ─── normalizeDueDate ────────────────────────────────────────────────────────

describe('normalizeDueDate', () => {
  it('有効な日付文字列をそのまま返す', () => {
    expect(normalizeDueDate('2024-06-15')).toBe('2024-06-15')
  })

  it('null を返す: 空文字', () => {
    expect(normalizeDueDate('')).toBeNull()
  })

  it('null を返す: 数値', () => {
    expect(normalizeDueDate(20240615)).toBeNull()
  })

  it('null を返す: null', () => {
    expect(normalizeDueDate(null)).toBeNull()
  })

  it('null を返す: YYYY/MM/DD フォーマット', () => {
    expect(normalizeDueDate('2024/06/15')).toBeNull()
  })

  it('null を返す: 存在しない日付 (2024-02-30)', () => {
    expect(normalizeDueDate('2024-02-30')).toBeNull()
  })

  it('null を返す: 存在しない月 (2024-13-01)', () => {
    expect(normalizeDueDate('2024-13-01')).toBeNull()
  })

  it('有効なうるう年日付を返す (2024-02-29)', () => {
    expect(normalizeDueDate('2024-02-29')).toBe('2024-02-29')
  })

  it('null を返す: 無効なうるう年 (2023-02-29)', () => {
    expect(normalizeDueDate('2023-02-29')).toBeNull()
  })
})

// ─── normalizeDescription ────────────────────────────────────────────────────

describe('normalizeDescription', () => {
  it('文字列はトリムして返す', () => {
    expect(normalizeDescription('  hello  ')).toBe('hello')
  })

  it('空文字を返す: 数値', () => {
    expect(normalizeDescription(123)).toBe('')
  })

  it('空文字を返す: null', () => {
    expect(normalizeDescription(null)).toBe('')
  })

  it('空文字を返す: undefined', () => {
    expect(normalizeDescription(undefined)).toBe('')
  })

  it('空白のみの文字列は空文字になる', () => {
    expect(normalizeDescription('   ')).toBe('')
  })
})

// ─── normalizeTask ───────────────────────────────────────────────────────────

describe('normalizeTask', () => {
  const validRaw = {
    id: 'abc',
    title: 'My Task',
    status: 'todo',
    priority: 'high',
    category: 'Work',
    createdAt: '2024-01-01T00:00:00.000Z',
  }

  it('有効なオブジェクトを Task に変換する', () => {
    const result = normalizeTask(validRaw)
    expect(result).not.toBeNull()
    expect(result?.id).toBe('abc')
    expect(result?.status).toBe('todo')
    expect(result?.priority).toBe('high')
  })

  it('description がなければ空文字になる', () => {
    expect(normalizeTask(validRaw)?.description).toBe('')
  })

  it('dueDate がなければ null になる', () => {
    expect(normalizeTask(validRaw)?.dueDate).toBeNull()
  })

  it('boolean の completed:true → status:"done" に変換する', () => {
    const raw = { ...validRaw, status: undefined, completed: true }
    expect(normalizeTask(raw)?.status).toBe('done')
  })

  it('boolean の completed:false → status:"todo" に変換する', () => {
    const raw = { ...validRaw, status: undefined, completed: false }
    expect(normalizeTask(raw)?.status).toBe('todo')
  })

  it('null を返す: null 入力', () => {
    expect(normalizeTask(null)).toBeNull()
  })

  it('null を返す: id が欠損', () => {
    const { id: _id, ...rest } = validRaw
    expect(normalizeTask(rest)).toBeNull()
  })

  it('null を返す: 不正な priority', () => {
    expect(normalizeTask({ ...validRaw, priority: 'urgent' })).toBeNull()
  })

  it('null を返す: createdAt が不正な日付文字列', () => {
    expect(normalizeTask({ ...validRaw, createdAt: 'not-a-date' })).toBeNull()
  })
})

// ─── normalizeTasks ──────────────────────────────────────────────────────────

describe('normalizeTasks', () => {
  const validRaw = {
    id: '1',
    title: 'T',
    status: 'todo',
    priority: 'low',
    category: 'X',
    createdAt: '2024-01-01T00:00:00.000Z',
  }

  it('空配列 → []', () => {
    expect(normalizeTasks([])).toEqual([])
  })

  it('全て有効なら Task[] を返す', () => {
    const result = normalizeTasks([validRaw])
    expect(result).toHaveLength(1)
    expect(result?.[0].id).toBe('1')
  })

  it('1件でも不正なら null を返す', () => {
    expect(normalizeTasks([validRaw, { id: 123 }])).toBeNull()
  })
})

// ─── getDaysUntilDueDate ─────────────────────────────────────────────────────

describe('getDaysUntilDueDate', () => {
  it('当日 → 0', () => {
    expect(getDaysUntilDueDate('2024-06-15', '2024-06-15')).toBe(0)
  })

  it('昨日 → -1', () => {
    expect(getDaysUntilDueDate('2024-06-14', '2024-06-15')).toBe(-1)
  })

  it('明日 → 1', () => {
    expect(getDaysUntilDueDate('2024-06-16', '2024-06-15')).toBe(1)
  })

  it('7日後 → 7', () => {
    expect(getDaysUntilDueDate('2024-06-22', '2024-06-15')).toBe(7)
  })
})

// ─── getDueDateStatus ────────────────────────────────────────────────────────

describe('getDueDateStatus', () => {
  it('dueDate なし → "none"', () => {
    expect(getDueDateStatus(makeTask(), '2024-06-15')).toBe('none')
  })

  it('done 状態なら日付に関わらず "later"', () => {
    const task = makeTask({ status: 'done', dueDate: '2024-01-01' })
    expect(getDueDateStatus(task, '2024-06-15')).toBe('later')
  })

  it('過去の日付 → "overdue"', () => {
    const task = makeTask({ dueDate: '2024-06-10' })
    expect(getDueDateStatus(task, '2024-06-15')).toBe('overdue')
  })

  it('当日 → "today"', () => {
    const task = makeTask({ dueDate: '2024-06-15' })
    expect(getDueDateStatus(task, '2024-06-15')).toBe('today')
  })

  it('3日以内 → "soon"', () => {
    const task = makeTask({ dueDate: '2024-06-17' })
    expect(getDueDateStatus(task, '2024-06-15')).toBe('soon')
  })

  it('3日を超える未来 → "later"', () => {
    const task = makeTask({ dueDate: '2024-07-01' })
    expect(getDueDateStatus(task, '2024-06-15')).toBe('later')
  })
})

// ─── isOverdueTask ───────────────────────────────────────────────────────────

describe('isOverdueTask', () => {
  it('過去日付 + 未完了 → true', () => {
    expect(isOverdueTask(makeTask({ dueDate: '2024-06-10' }), '2024-06-15')).toBe(true)
  })

  it('過去日付 + done → false', () => {
    expect(isOverdueTask(makeTask({ dueDate: '2024-06-10', status: 'done' }), '2024-06-15')).toBe(false)
  })

  it('未来日付 + 未完了 → false', () => {
    expect(isOverdueTask(makeTask({ dueDate: '2024-06-20' }), '2024-06-15')).toBe(false)
  })

  it('dueDate なし → false', () => {
    expect(isOverdueTask(makeTask(), '2024-06-15')).toBe(false)
  })
})

// ─── isDueTodayTask ──────────────────────────────────────────────────────────

describe('isDueTodayTask', () => {
  it('当日 + 未完了 → true', () => {
    expect(isDueTodayTask(makeTask({ dueDate: '2024-06-15' }), '2024-06-15')).toBe(true)
  })

  it('当日 + done → false', () => {
    expect(isDueTodayTask(makeTask({ dueDate: '2024-06-15', status: 'done' }), '2024-06-15')).toBe(false)
  })

  it('別の日付 → false', () => {
    expect(isDueTodayTask(makeTask({ dueDate: '2024-06-16' }), '2024-06-15')).toBe(false)
  })
})

// ─── getTaskSummary ──────────────────────────────────────────────────────────

describe('getTaskSummary', () => {
  it('空配列 → 全て 0', () => {
    const summary = getTaskSummary([])
    expect(summary).toEqual({ total: 0, todo: 0, inProgress: 0, done: 0, highPriority: 0, dueToday: 0, overdue: 0 })
  })

  it('各カウントが正確に集計される', () => {
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

    const tasks = [
      makeTask({ status: 'todo', priority: 'high', dueDate: todayKey }),
      makeTask({ status: 'inProgress', priority: 'medium' }),
      makeTask({ status: 'done', priority: 'high' }),
      makeTask({ status: 'todo', priority: 'low', dueDate: yKey }),
    ]
    const summary = getTaskSummary(tasks)
    expect(summary.total).toBe(4)
    expect(summary.todo).toBe(2)
    expect(summary.inProgress).toBe(1)
    expect(summary.done).toBe(1)
    expect(summary.highPriority).toBe(2)
    expect(summary.dueToday).toBe(1)
    expect(summary.overdue).toBe(1)
  })
})

// ─── filterTasks ─────────────────────────────────────────────────────────────

describe('filterTasks', () => {
  const tasks = [
    makeTask({ id: '1', title: 'Fix bug', status: 'todo', priority: 'high' }),
    makeTask({ id: '2', title: 'Write docs', description: 'readme update', status: 'inProgress', priority: 'low' }),
    makeTask({ id: '3', title: 'Deploy', category: 'DevOps', status: 'done', priority: 'medium' }),
  ]

  const base = { searchQuery: '', statusFilter: 'all' as const, priorityFilter: 'all' as const }

  it('フィルタなし → 全タスク返す', () => {
    expect(filterTasks(tasks, base)).toHaveLength(3)
  })

  it('タイトルで検索できる（大文字小文字不問）', () => {
    expect(filterTasks(tasks, { ...base, searchQuery: 'fix' })).toHaveLength(1)
  })

  it('説明で検索できる', () => {
    expect(filterTasks(tasks, { ...base, searchQuery: 'readme' })).toHaveLength(1)
  })

  it('カテゴリで検索できる', () => {
    expect(filterTasks(tasks, { ...base, searchQuery: 'devops' })).toHaveLength(1)
  })

  it('ステータスフィルタ: todo のみ', () => {
    expect(filterTasks(tasks, { ...base, statusFilter: 'todo' })).toHaveLength(1)
  })

  it('優先度フィルタ: high のみ', () => {
    expect(filterTasks(tasks, { ...base, priorityFilter: 'high' })).toHaveLength(1)
  })

  it('検索 + ステータスの複合フィルタ', () => {
    const result = filterTasks(tasks, { ...base, searchQuery: 'deploy', statusFilter: 'done' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('3')
  })

  it('マッチしない検索 → 空配列', () => {
    expect(filterTasks(tasks, { ...base, searchQuery: 'zzznomatch' })).toHaveLength(0)
  })
})

// ─── sortTasks ───────────────────────────────────────────────────────────────

describe('sortTasks', () => {
  const tasks = [
    makeTask({ id: 'a', createdAt: '2024-01-01T00:00:00.000Z', dueDate: '2024-06-20', priority: 'low', status: 'done' }),
    makeTask({ id: 'b', createdAt: '2024-01-03T00:00:00.000Z', dueDate: '2024-06-10', priority: 'high', status: 'todo' }),
    makeTask({ id: 'c', createdAt: '2024-01-02T00:00:00.000Z', dueDate: null, priority: 'medium', status: 'inProgress' }),
  ]

  const ids = (result: Task[]) => result.map((t) => t.id)

  it('created-desc: 新しい順', () => {
    expect(ids(sortTasks(tasks, 'created-desc'))).toEqual(['b', 'c', 'a'])
  })

  it('created-asc: 古い順', () => {
    expect(ids(sortTasks(tasks, 'created-asc'))).toEqual(['a', 'c', 'b'])
  })

  it('due-asc: 期限が早い順、dueDate なしは末尾', () => {
    const result = ids(sortTasks(tasks, 'due-asc'))
    expect(result[0]).toBe('b')
    expect(result[1]).toBe('a')
    expect(result[2]).toBe('c')
  })

  it('due-desc: 期限が遅い順、dueDate なしは末尾', () => {
    const result = ids(sortTasks(tasks, 'due-desc'))
    expect(result[0]).toBe('a')
    expect(result[1]).toBe('b')
    expect(result[2]).toBe('c')
  })

  it('priority-desc: 優先度が高い順', () => {
    const result = ids(sortTasks(tasks, 'priority-desc'))
    expect(result[0]).toBe('b')
    expect(result[1]).toBe('c')
    expect(result[2]).toBe('a')
  })

  it('priority-asc: 優先度が低い順', () => {
    const result = ids(sortTasks(tasks, 'priority-asc'))
    expect(result[0]).toBe('a')
    expect(result[1]).toBe('c')
    expect(result[2]).toBe('b')
  })

  it('active-first: done を末尾、todo → inProgress の順', () => {
    const result = ids(sortTasks(tasks, 'active-first'))
    expect(result[result.length - 1]).toBe('a')
    expect(result[0]).toBe('b')
  })

  it('元の配列を変更しない', () => {
    const original = [...tasks]
    sortTasks(tasks, 'priority-desc')
    expect(tasks).toEqual(original)
  })
})

// ─── createTask ──────────────────────────────────────────────────────────────

describe('createTask', () => {
  const draft = {
    title: '  My Task  ',
    description: '  desc  ',
    status: 'todo' as const,
    priority: 'medium' as const,
    category: '  Work  ',
    dueDate: null,
  }

  it('title は trim される', () => {
    expect(createTask(draft).title).toBe('My Task')
  })

  it('description は trim される', () => {
    expect(createTask(draft).description).toBe('desc')
  })

  it('category は trim される', () => {
    expect(createTask(draft).category).toBe('Work')
  })

  it('空の category → "未分類"', () => {
    expect(createTask({ ...draft, category: '' }).category).toBe('未分類')
  })

  it('id と createdAt が生成される', () => {
    const task = createTask(draft)
    expect(task.id).toBeTruthy()
    expect(task.createdAt).toBeTruthy()
  })
})

// ─── applyTaskUpdate ─────────────────────────────────────────────────────────

describe('applyTaskUpdate', () => {
  const task = makeTask()
  const update = {
    title: '  Updated  ',
    description: '  new desc  ',
    status: 'done' as const,
    priority: 'high' as const,
    category: '  Design  ',
    dueDate: '2024-12-31',
  }

  it('フィールドを正しく更新する', () => {
    const result = applyTaskUpdate(task, update)
    expect(result.title).toBe('Updated')
    expect(result.description).toBe('new desc')
    expect(result.status).toBe('done')
    expect(result.priority).toBe('high')
    expect(result.category).toBe('Design')
    expect(result.dueDate).toBe('2024-12-31')
  })

  it('空の category → "未分類"', () => {
    expect(applyTaskUpdate(task, { ...update, category: '' }).category).toBe('未分類')
  })

  it('id と createdAt は変わらない', () => {
    const result = applyTaskUpdate(task, update)
    expect(result.id).toBe(task.id)
    expect(result.createdAt).toBe(task.createdAt)
  })
})
