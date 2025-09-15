'use server'

import { redirect } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/server'

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/auth/callback`,
    },
  })

  if (error) {
    console.error('[OAuth] Sign in error:', error)
    return { data: null, error: error.message }
  }

  // Return the URL instead of redirecting
  return { data: { url: data.url }, error: null }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('[Auth] Sign in error:', error)
    return { data: null, error: error.message }
  }

  return { data: data.user, error: null }
}

export async function signUp(email: string, password: string, metadata?: any) {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  if (error) {
    console.error('[Auth] Sign up error:', error)
    return { data: null, error: error.message }
  }

  return { data: data.user, error: null }
}

export async function signOut() {
  const supabase = await createSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('[Auth] Sign out error:', error)
    return { data: null, error: error.message }
  }

  return { data: null, error: null }
}

export async function resetPassword(email: string) {
  const supabase = await createSupabaseClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/auth/reset-password`,
  })

  if (error) {
    console.error('[Auth] Reset password error:', error)
    return { data: null, error: error.message }
  }

  return { data: null, error: null }
}

export async function updatePassword(newPassword: string) {
  const supabase = await createSupabaseClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error('[Auth] Update password error:', error)
    return { data: null, error: error.message }
  }

  return { data: null, error: null }
}

export async function getSession() {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('[Auth] Get session error:', error)
    return null
  }

  return data.session
}

export async function getUser() {
  const supabase = await createSupabaseClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('[Auth] Get user error:', error)
    return null
  }

  return user
}