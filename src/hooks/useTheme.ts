import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'task-board-app:theme'

const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark'

const getSystemTheme = (): Theme => {
  if (globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

const getInitialTheme = (): Theme => {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)

    if (isTheme(storedTheme)) {
      return storedTheme
    }
  } catch {
    // If localStorage is unavailable, fall back to the OS preference.
  }

  return getSystemTheme()
}

const persistTheme = (theme: Theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Theme persistence is optional; the app should keep working without it.
  }
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'

      persistTheme(nextTheme)

      return nextTheme
    })
  }, [])

  return {
    theme,
    toggleTheme,
  }
}
