import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

const HASH_KEY = 'mapHashBeforeLogin'

// undefined = stav prihlásenia sa ešte načítava, null = neprihlásený
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  return session
}

// Jediný spôsob prihlásenia je Google účet.
export async function signInWithGoogle() {
  if (!supabase) return
  // Pozícia mapy (#zoom/lat/lon) by sa cestou cez Google stratila, po návrate ju obnoví restoreMapHash().
  sessionStorage.setItem(HASH_KEY, location.hash)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin + location.pathname },
  })
  if (error) throw error
}

export async function signOut() {
  await supabase?.auth.signOut()
}

export function restoreMapHash() {
  const saved = sessionStorage.getItem(HASH_KEY)
  sessionStorage.removeItem(HASH_KEY)
  if (saved && !location.hash) history.replaceState(null, '', location.pathname + location.search + saved)
}

// Chyba, s ktorou sa Supabase vrátil z prihlásenia (?error=…&error_description=…).
export function takeLoginError() {
  const params = new URLSearchParams(location.search)
  if (!params.has('error')) return false
  history.replaceState(null, '', location.pathname + location.hash)
  return true
}
