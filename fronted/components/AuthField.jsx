import { useState } from 'react'

export default function AuthField({ id, label, error, hint, type = 'text', ...inputProps }) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const isPassword = type === 'password'
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-[var(--text)]">{label}</label>
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          type={isPassword && passwordVisible ? 'text' : type}
          required
          spellCheck={isPassword ? false : inputProps.spellCheck}
          autoCapitalize={isPassword ? 'none' : inputProps.autoCapitalize}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`min-h-12 w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] transition-colors placeholder:text-[var(--subtle)] focus:outline-none focus:ring-2 ${isPassword ? 'pr-16' : ''} ${error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--accent-soft)]' : 'border-[var(--border)] hover:border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent-soft)]'}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible(visible => !visible)}
            aria-label={`${passwordVisible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            aria-controls={id}
            aria-pressed={passwordVisible}
            className="absolute inset-y-1 right-1 rounded-lg px-3 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--accent)]"
          >
            {passwordVisible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {hint && <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-[var(--muted)]">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-2 text-xs leading-5 text-[var(--danger)]">{error}</p>}
    </div>
  )
}
