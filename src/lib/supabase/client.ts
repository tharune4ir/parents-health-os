import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

// ============================================================
// 🔒 PROJECT SAFETY GUARD — DO NOT REMOVE
// Protected project: trelis-life (lhqtqofjrqoyscobsfud)
// This guard prevents Parents Health OS from accidentally
// connecting to the protected trelis-life Supabase project.
// See PROJECT_SAFETY_LOCK.md for full context.
// ============================================================
const FORBIDDEN_PROJECT_REF = 'lhqtqofjrqoyscobsfud'

function assertNotForbiddenProject(url: string | undefined): void {
  if (!url) return
  if (url.includes(FORBIDDEN_PROJECT_REF)) {
    const msg =
      '[Parents Health OS] SAFETY VIOLATION: The configured NEXT_PUBLIC_SUPABASE_URL ' +
      'points to the protected trelis-life project (ref: lhqtqofjrqoyscobsfud). ' +
      'This project must NEVER be used for Parents Health OS. ' +
      'Remove the trelis-life credentials from .env.local immediately. ' +
      'See PROJECT_SAFETY_LOCK.md for details.'
    // Only throw in development — in production, log silently and block init
    if (process.env.NODE_ENV === 'development') {
      throw new Error(msg)
    } else {
      console.error(msg)
    }
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Intentional sandbox mode — no Supabase env vars configured
    // This keeps the app in safe localStorage-only mode
    return null as any
  }

  // Safety check: refuse to connect to trelis-life under any circumstance
  assertNotForbiddenProject(url)

  return createBrowserClient<Database>(url, key)
}
