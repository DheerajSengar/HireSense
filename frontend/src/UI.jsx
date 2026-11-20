import { LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useId } from 'react'

export function Button({
  children,
  className = '',
  icon: Icon,
  size = 'regular',
  to,
  variant = 'primary',
  ...props
}) {
  const classes = `button button--${variant} button--${size} ${className}`.trim()
  const content = <>{children}{Icon && <Icon aria-hidden="true" size={17} strokeWidth={1.8} />}</>

  if (to) {
    return <Link className={classes} to={to} {...props}>{content}</Link>
  }

  return <button className={classes} type="button" {...props}>{content}</button>
}

export function Input({ label, hint, icon: Icon, id, className = '', ...props }) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={`field ${className}`.trim()}>
      <label className="field__label" htmlFor={inputId}>{label}</label>
      <div className="field__control">
        {Icon && <Icon aria-hidden="true" className="field__icon" size={18} strokeWidth={1.8} />}
        <input id={inputId} {...props} />
      </div>
      {hint && <span className="field__hint">{hint}</span>}
    </div>
  )
}

export function Card({ as: Element = 'div', className = '', children, ...props }) {
  return <Element className={`card ${className}`.trim()} {...props}>{children}</Element>
}

export function Loading({ label = 'Loading' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <LoaderCircle aria-hidden="true" className="loading__spinner" size={22} />
      <span>{label}</span>
    </div>
  )
}