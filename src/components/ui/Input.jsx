import './Input.css'

function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  ...props
}) {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`
  const classes = [
    'input-wrapper',
    fullWidth && 'input-wrapper-full',
    error && 'input-wrapper-error',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className="input"
        {...props}
      />
      {(error || helperText) && (
        <span className={`input-helper ${error ? 'input-error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  )
}

export default Input
