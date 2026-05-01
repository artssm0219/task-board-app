type EmptyStateProps = {
  title: string
  message: string
}

export const EmptyState = ({ title, message }: EmptyStateProps) => (
  <div className="empty-state">
    <p className="empty-state__title">{title}</p>
    <p>{message}</p>
  </div>
)
