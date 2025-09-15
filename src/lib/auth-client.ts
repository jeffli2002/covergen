'use client'

// Client-side wrapper for auth actions
export async function signInWithOAuth(provider: 'google' | 'github') {
  const response = await fetch('/api/auth/oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
  })
  
  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.error)
  }
  
  if (data.url) {
    window.location.href = data.url
  }
  
  return data
}

export async function signOut() {
  const response = await fetch('/api/auth/signout', {
    method: 'POST',
  })
  
  return response.json()
}

export async function getUser() {
  const response = await fetch('/api/auth/user')
  
  if (!response.ok) {
    return null
  }
  
  const data = await response.json()
  return data.user
}