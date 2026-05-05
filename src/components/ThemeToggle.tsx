import type { Theme } from '../hooks/useTheme'

type ThemeToggleProps = {
  theme: Theme
  onToggleTheme: () => void
}

export const ThemeToggle = ({
  theme,
  onToggleTheme,
}: ThemeToggleProps) => {
  const nextThemeLabel = theme === 'dark' ? 'ライト' : 'ダーク'

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`${nextThemeLabel}モードに切り替える`}
      aria-pressed={theme === 'dark'}
      onClick={onToggleTheme}
    >
      <span
        className={
          theme === 'light'
            ? 'theme-toggle__option theme-toggle__option--active'
            : 'theme-toggle__option'
        }
      >
        ライト
      </span>
      <span
        className={
          theme === 'dark'
            ? 'theme-toggle__option theme-toggle__option--active'
            : 'theme-toggle__option'
        }
      >
        ダーク
      </span>
    </button>
  )
}
