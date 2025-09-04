export function migrateAuthCookies() {
  if (typeof window === 'undefined') return
  
  const cookies = document.cookie.split('; ')
  const oldTokenCookie = cookies.find(row => row.startsWith('supabase.auth.token.0='))
  const newTokenCookie = cookies.find(row => row.startsWith('sb-exungkcoaihcemcmhqdr-auth-token.0='))
  
  // If we have old cookies but not new ones, migrate them
  if (oldTokenCookie && !newTokenCookie) {
    console.log('[Cookie Migration] Migrating old auth cookies to new format...')
    
    // Get all old token parts
    const oldTokenParts: Record<string, string> = {}
    cookies.forEach(cookie => {
      if (cookie.startsWith('supabase.auth.token.')) {
        const [name, value] = cookie.split('=')
        const index = name.split('.').pop()!
        oldTokenParts[index] = value
      }
    })
    
    // Set new format cookies
    Object.entries(oldTokenParts).forEach(([index, value]) => {
      const newName = `sb-exungkcoaihcemcmhqdr-auth-token.${index}`
      document.cookie = `${newName}=${value}; path=/; SameSite=Lax; Max-Age=604800` // 7 days
    })
    
    console.log('[Cookie Migration] Migration complete')
    return true
  }
  
  return false
}