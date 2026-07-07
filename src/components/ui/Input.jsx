function Input({ id, label, ...props }) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="ui-input" {...props} />
    </div>
  )
}

export default Input
