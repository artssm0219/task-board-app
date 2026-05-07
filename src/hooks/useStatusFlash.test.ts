import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useStatusFlash } from './useStatusFlash'

describe('useStatusFlash', () => {
  it('初期状態は flashKey === 0', () => {
    const { result } = renderHook(() => useStatusFlash('todo'))
    expect(result.current).toBe(0)
  })

  it('todo → done に変化すると flashKey がインクリメントされる', () => {
    const { result, rerender } = renderHook(
      ({ status }) => useStatusFlash(status),
      { initialProps: { status: 'todo' as const } },
    )
    act(() => { rerender({ status: 'done' }) })
    expect(result.current).toBe(1)
  })

  it('inProgress → done に変化しても flashKey がインクリメントされる', () => {
    const { result, rerender } = renderHook(
      ({ status }) => useStatusFlash(status),
      { initialProps: { status: 'inProgress' as const } },
    )
    act(() => { rerender({ status: 'done' }) })
    expect(result.current).toBe(1)
  })

  it('done → done (変化なし) では flashKey は変化しない', () => {
    const { result, rerender } = renderHook(
      ({ status }) => useStatusFlash(status),
      { initialProps: { status: 'done' as const } },
    )
    act(() => { rerender({ status: 'done' }) })
    expect(result.current).toBe(0)
  })

  it('done → todo では flashKey は変化しない', () => {
    const { result, rerender } = renderHook(
      ({ status }) => useStatusFlash(status),
      { initialProps: { status: 'done' as const } },
    )
    act(() => { rerender({ status: 'todo' }) })
    expect(result.current).toBe(0)
  })

  it('todo → done → todo → done で 2 回インクリメントされる', () => {
    const { result, rerender } = renderHook(
      ({ status }) => useStatusFlash(status),
      { initialProps: { status: 'todo' as const } },
    )
    act(() => { rerender({ status: 'done' }) })
    act(() => { rerender({ status: 'todo' }) })
    act(() => { rerender({ status: 'done' }) })
    expect(result.current).toBe(2)
  })
})
