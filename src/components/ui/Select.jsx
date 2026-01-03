import './Select.css'

function Select({
  label,
  error,
  helperText,
  fullWidth = false,
  options = [],
  className = '',
  ...props
}) {
  const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`
  const classes = [
    'select-wrapper',
    fullWidth && 'select-wrapper-full',
    error && 'select-wrapper-error',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className="select"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <span className={`select-helper ${error ? 'select-error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  )
}

export default Select
