import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// PKCE: po prihlásení sa Supabase vráti s ?code=… (nie s #access_token=…),
// takže sa nebije s pozíciou mapy v URL (#zoom/lat/lon).
export const supabase = url && anonKey ? createClient(url, anonKey, { auth: { flowType: 'pkce' } }) : null
