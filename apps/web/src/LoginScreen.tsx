import { useState } from 'react'
import { signInWithGoogle } from './auth'

export function LoginScreen({ failed }: { failed: boolean }) {
  const [error, setError] = useState(failed)
  const [pending, setPending] = useState(false)

  async function handleClick() {
    setPending(true)
    setError(false)
    try {
      await signInWithGoogle()
    } catch {
      setError(true)
      setPending(false)
    }
  }

  return (
    <main className="login">
      <div className="login__card">
        <a className="login__logo" href="../">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#17251c" />
            <path d="M6 23 C11 21 11 12 16 12 S 21 19 26 9" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
            <path d="M6 23 C11 21 11 12 16 12 S 21 19 26 9" stroke="#d32f2f" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Prejdené trasy
        </a>

        <h1 className="login__title">Prihlás sa a pokračuj na mapu</h1>
        <p className="login__text">
          Na mapu sa dostaneš po prihlásení. Prihlásiť sa dá iba cez Google účet.
        </p>

        <button type="button" className="login__google" onClick={handleClick} disabled={pending}>
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          {pending ? 'Presmerúvam na Google…' : 'Prihlásiť sa cez Google'}
        </button>

        {error && (
          <p className="login__error" role="alert">
            Prihlásenie sa nepodarilo. Skús to znova.
          </p>
        )}

        <a className="login__back" href="../">
          Späť na úvodnú stránku
        </a>
      </div>
    </main>
  )
}
