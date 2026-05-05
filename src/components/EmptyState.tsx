type EmptyStateProps = {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  variant?: 'start' | 'filtered'
}

export const EmptyState = ({
  title,
  message,
  actionLabel,
  onAction,
  variant = 'start',
}: EmptyStateProps) => (
  <div className={`empty-state empty-state--${variant}`}>
    <div className="empty-state__mark" aria-hidden="true">
      {variant === 'filtered' ? '0' : '+'}
    </div>
    <p className="empty-state__title">{title}</p>
    <p>{message}</p>
    {actionLabel && onAction ? (
      <button className="secondary-button" type="button" onClick={onAction}>
        {actionLabel}
      </button>
    ) : null}
  </div>
)
