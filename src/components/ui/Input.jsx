function Input({
  action,
  className = '',
  errorMessage = '',
  id,
  label,
  ...props
}) {
  const describedBy = [
    props['aria-describedby'],
    errorMessage ? `${id}-error` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const inputClasses = ['ui-input', className].filter(Boolean).join(' ')

  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <div className={action ? 'field-control' : undefined}>
        <input
          id={id}
          className={inputClasses}
          aria-describedby={describedBy || undefined}
          aria-invalid={errorMessage ? 'true' : undefined}
          {...props}
        />
        {action}
      </div>
      {errorMessage && (
        <p className="field-error" id={`${id}-error`}>
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export default Input
