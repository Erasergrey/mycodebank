function EmptyState({ children, title }) {
  return (
    <div className="ui-empty-state">
      {title && <h2>{title}</h2>}
      <p>{children}</p>
    </div>
  )
}

export default EmptyState
