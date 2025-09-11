'use client'

import { useEffect, useState } from 'react'

export default function OAuthConfigCheck() {
  const [config, setConfig] = useState<any>(null)
  
  useEffect(() => {
    const checkConfig = async () => {
      const baseUrl = window.location.origin
      const configs = {
        currentOrigin: baseUrl,
        expectedCallbackUrls: {
          popup: `${baseUrl}/auth/callback-popup`,
          standard: `${baseUrl}/auth/callback-official`,
          supabaseDefault: `${baseUrl}/auth/callback`
        },
        instructions: {
          step1: 'Go to your Supabase Dashboard',
          step2: 'Navigate to Authentication → Providers → Google',
          step3: 'In the "Redirect URLs" section, add ALL of these URLs:',
          urls: [
            `${baseUrl}/auth/callback-popup`,
            `${baseUrl}/auth/callback`,
            `${baseUrl}/auth/callback-official`
          ],
          step4: 'Save the changes in Supabase',
          step5: 'Wait 1-2 minutes for changes to propagate'
        }
      }
      
      setConfig(configs)
    }
    
    checkConfig()
  }, [])
  
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'monospace',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: 1.6
    }}>
      <h1 style={{ marginBottom: '1.5rem' }}>OAuth Configuration Check</h1>
      
      {config && (
        <>
          <section style={{ marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
            <h2>Current Configuration</h2>
            <p><strong>Your Origin:</strong> <code>{config.currentOrigin}</code></p>
          </section>
          
          <section style={{ marginBottom: '2rem', padding: '1rem', background: '#ffe5b4', borderRadius: '8px' }}>
            <h2 style={{ color: '#d97706' }}>🚨 Issue Detected</h2>
            <p>Google OAuth is redirecting to the base URL instead of the callback-popup route.</p>
            <p>This happens when the redirect URI is not properly configured in Supabase.</p>
          </section>
          
          <section style={{ marginBottom: '2rem', padding: '1rem', background: '#e8f5e9', borderRadius: '8px' }}>
            <h2 style={{ color: '#2e7d32' }}>✅ Fix Instructions</h2>
            <ol>
              <li>{config.instructions.step1}</li>
              <li>{config.instructions.step2}</li>
              <li>{config.instructions.step3}</li>
              <ul style={{ marginLeft: '2rem' }}>
                {config.instructions.urls.map((url: string, i: number) => (
                  <li key={i}>
                    <code style={{ 
                      background: '#fff', 
                      padding: '0.2rem 0.4rem',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      display: 'inline-block',
                      marginBottom: '0.5rem'
                    }}>{url}</code>
                  </li>
                ))}
              </ul>
              <li>{config.instructions.step4}</li>
              <li>{config.instructions.step5}</li>
            </ol>
          </section>
          
          <section style={{ marginBottom: '2rem', padding: '1rem', background: '#f0f4f8', borderRadius: '8px' }}>
            <h2>Expected Redirect URLs</h2>
            <p><strong>Popup Flow:</strong> <code>{config.expectedCallbackUrls.popup}</code></p>
            <p><strong>Standard Flow:</strong> <code>{config.expectedCallbackUrls.standard}</code></p>
            <p><strong>Supabase Default:</strong> <code>{config.expectedCallbackUrls.supabaseDefault}</code></p>
          </section>
          
          <section style={{ padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
            <h2>Testing</h2>
            <p>After updating the redirect URLs in Supabase:</p>
            <ol>
              <li>Clear your browser cookies for this domain</li>
              <li>Try the Google OAuth popup flow again</li>
              <li>The popup should now stay on <code>/auth/callback-popup</code> and close automatically</li>
            </ol>
          </section>
        </>
      )}
    </div>
  )
}