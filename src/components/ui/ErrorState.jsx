function ErrorState({ children, ...props }) {
  return (
    <p className="ui-error-state" role="alert" {...props}>
      {children}
    </p>
  )
}

export default ErrorState
