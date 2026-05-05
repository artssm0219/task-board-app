import type { ViewMode } from '../types/task'

type ViewModeToggleProps = {
  viewMode: ViewMode
  onViewModeChange: (viewMode: ViewMode) => void
}

const viewModes: Array<{ label: string; value: ViewMode }> = [
  { label: 'リスト', value: 'list' },
  { label: 'ボード', value: 'board' },
]

export const ViewModeToggle = ({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) => (
  <fieldset className="view-mode-toggle">
    <legend>表示形式</legend>
    <div className="view-mode-toggle__options">
      {viewModes.map((mode) => (
        <label key={mode.value} className="view-mode-toggle__option">
          <input
            type="radio"
            name="view-mode"
            value={mode.value}
            checked={viewMode === mode.value}
            onChange={() => onViewModeChange(mode.value)}
          />
          <span>{mode.label}</span>
        </label>
      ))}
    </div>
  </fieldset>
)
