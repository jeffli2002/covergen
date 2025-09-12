import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    return NextResponse.json({
      dependencies: {
        '@supabase/supabase-js': packageJson.dependencies?.['@supabase/supabase-js'],
        '@supabase/ssr': packageJson.dependencies?.['@supabase/ssr'],
        'next': packageJson.dependencies?.['next']
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read package.json' }, { status: 500 })
  }
}