function LoadingSkeleton({ lines = 3 }) {
  return (
    <div className="ui-skeleton-stack" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span
          className="ui-loading-skeleton"
          key={`skeleton-${index + 1}`}
        />
      ))}
    </div>
  )
}

export default LoadingSkeleton
