function ErrorState({ children }) {
  return (
    <p className="ui-error-state" role="alert">
      {children}
    </p>
  )
}

export default ErrorState
