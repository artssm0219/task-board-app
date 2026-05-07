import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('タイトルとメッセージが描画される', () => {
    render(<EmptyState title="タイトル" message="メッセージ" />)
    expect(screen.getByText('タイトル')).toBeInTheDocument()
    expect(screen.getByText('メッセージ')).toBeInTheDocument()
  })

  it('actionLabel と onAction を渡すとボタンが表示される', () => {
    const onAction = vi.fn()
    render(<EmptyState title="T" message="M" actionLabel="リセット" onAction={onAction} />)
    expect(screen.getByRole('button', { name: 'リセット' })).toBeInTheDocument()
  })

  it('ボタンクリックで onAction が呼ばれる', async () => {
    const onAction = vi.fn()
    render(<EmptyState title="T" message="M" actionLabel="リセット" onAction={onAction} />)
    await userEvent.click(screen.getByRole('button', { name: 'リセット' }))
    expect(onAction).toHaveBeenCalledOnce()
  })

  it('actionLabel がなければボタンは描画されない', () => {
    render(<EmptyState title="T" message="M" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
