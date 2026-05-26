import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

type PasswordFieldProps = {
  autoComplete: string
  id: string
  label: string
  onChange: (value: string) => void
  value: string
}

export function PasswordField({
  autoComplete,
  id,
  label,
  onChange,
  value,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <label htmlFor={id}>
      {label}
      <span className="password-field">
        <input
          autoComplete={autoComplete}
          id={id}
          minLength={8}
          onChange={(event) => onChange(event.target.value)}
          required
          type={isVisible ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className="icon-button"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {isVisible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
        </button>
      </span>
    </label>
  )
}
