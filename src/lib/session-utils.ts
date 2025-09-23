// Session utilities for tracking unauthenticated users
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

const SESSION_COOKIE_NAME = 'covergen_session_id'
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function getOrCreateSessionId(): Promise<{ sessionId: string; isNew: boolean }> {
  const cookieStore = await cookies()
  const existingSessionId = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (existingSessionId?.value) {
    return { sessionId: existingSessionId.value, isNew: false }
  }
  
  // Create new session ID
  const newSessionId = uuidv4()
  
  // Set cookie
  cookieStore.set(SESSION_COOKIE_NAME, newSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: '/'
  })
  
  return { sessionId: newSessionId, isNew: true }
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: '/'
  }
}