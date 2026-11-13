import { lazy, Suspense, useState } from 'react'
import { signOut, takeLoginError, useSession } from './auth'
import { LoginScreen } from './LoginScreen'
import { supabase } from './supabase'

// Mapa (MapLibre, dlaždice Mapy.com) sa načíta až po prihlásení.
const App = lazy(() => import('./App').then((m) => ({ default: m.App })))

export function AuthGate() {
  const session = useSession()
  const [loginFailed] = useState(takeLoginError)

  if (!supabase) {
    return (
      <div className="error">
        Chýba nastavenie Supabase. Doplň <code>VITE_SUPABASE_URL</code> a <code>VITE_SUPABASE_ANON_KEY</code> do{' '}
        <code>apps/web/.env.local</code> a reštartuj dev server.
      </div>
    )
  }
  if (session === undefined) return null
  if (!session) return <LoginScreen failed={loginFailed} />

  return (
    <Suspense fallback={null}>
      <App userEmail={session.user.email ?? ''} onSignOut={signOut} />
    </Suspense>
  )
}
