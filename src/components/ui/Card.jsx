function Card({ as: Component = 'section', children, className = '', ...props }) {
  const classes = ['ui-card', className].filter(Boolean).join(' ')

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}

export default Card
