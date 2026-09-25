import { useState } from 'react'

export default function AuthField({ id, label, error, hint, type = 'text', ...inputProps }) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const isPassword = type === 'password'
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-zinc-200">{label}</label>
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          type={isPassword && passwordVisible ? 'text' : type}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`min-h-12 w-full rounded-xl border bg-[#0c0d10] px-4 py-3 text-sm text-zinc-100 transition-colors placeholder:text-zinc-500 focus:outline-none focus:ring-2 ${isPassword ? 'pr-16' : ''} ${error ? 'border-rose-400/70 focus:border-rose-400 focus:ring-rose-400/15' : 'border-white/10 hover:border-white/20 focus:border-violet-400 focus:ring-violet-400/15'}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible(visible => !visible)}
            aria-label={`${passwordVisible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            aria-controls={id}
            aria-pressed={passwordVisible}
            className="absolute inset-y-1 right-1 rounded-lg px-3 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-violet-300"
          >
            {passwordVisible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {hint && <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-zinc-400">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-2 text-xs leading-5 text-rose-300">{error}</p>}
    </div>
  )
}
