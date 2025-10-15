import dotenv from 'dotenv'
import path from 'path'
// 优先加载 .env.local，其次回退到默认 .env
try {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
} catch {}
dotenv.config()
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

type SignInRow = {
  date: string
  user_id: string
  email: string | null
  ip_address: string | null
  user_agent: string | null
  session_id: string
  signed_in_at: string
}

function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing env ${name}`)
  return val
}

function startOfDayOffset(offsetDays: number): Date {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d
}

function toIso(d: Date): string {
  return d.toISOString()
}

function csvEscape(value: any): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function toCSV(rows: SignInRow[]): string {
  const header = ['date','user_id','email','ip_address','user_agent','session_id','signed_in_at']
  const lines = [header.join(',')]
  for (const r of rows) {
    lines.push([
      csvEscape(r.date),
      csvEscape(r.user_id),
      csvEscape(r.email),
      csvEscape(r.ip_address),
      csvEscape(r.user_agent),
      csvEscape(r.session_id),
      csvEscape(r.signed_in_at),
    ].join(','))
  }
  return lines.join('\n') + '\n'
}

async function querySignInsForRange(supabase: ReturnType<typeof createClient>, dayStart: Date, dayEnd: Date): Promise<SignInRow[]> {
  // Try schema version first
  const selectColumns = `sessions:bestauth.sessions(id, user_id, ip_address, user_agent, created_at), users:bestauth.users(id, email)`
  const fromSchema = `bestauth.sessions`
  const fromUnderscore = `bestauth_sessions`

  // Helper: run a RPC-like join using two queries due to Supabase limitations
  async function runDirect(table: string, usersTable: string) {
    type SessionRow = {
      id: string
      user_id: string
      ip_address: string | null
      user_agent: string | null
      created_at: string
    }
    
    const { data: sessions, error } = await supabase
      .from(table)
      .select('id, user_id, ip_address, user_agent, created_at')
      .gte('created_at', toIso(dayStart))
      .lt('created_at', toIso(dayEnd))
      .order('created_at', { ascending: true })

    if (error) throw error
    if (!sessions || sessions.length === 0) return []

    const typedSessions = sessions as SessionRow[]
    const userIds = Array.from(new Set(typedSessions.map(s => s.user_id)))
    const { data: users, error: userErr } = await supabase
      .from(usersTable)
      .select('id, email')
      .in('id', userIds)

    if (userErr) throw userErr
    const userById = new Map<string, any>((users || []).map(u => [u.id, u]))

    const label = new Date(dayStart).toISOString().slice(0,10)
    const rows: SignInRow[] = typedSessions.map((s) => ({
      date: label,
      user_id: s.user_id,
      email: userById.get(s.user_id)?.email ?? null,
      ip_address: s.ip_address ?? null,
      user_agent: s.user_agent ?? null,
      session_id: s.id,
      signed_in_at: s.created_at,
    }))
    return rows
  }

  // Try bestauth schema tables
  try {
    return await runDirect('bestauth.sessions', 'bestauth.users')
  } catch (e) {
    // Fallback to underscore tables in public schema
    return await runDirect('bestauth_sessions', 'bestauth_users')
  }
}

async function main() {
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const ranges = [
    { name: 'day_before_yesterday', start: startOfDayOffset(-2), end: startOfDayOffset(-1) },
    { name: 'yesterday', start: startOfDayOffset(-1), end: startOfDayOffset(0) },
    { name: 'today', start: startOfDayOffset(0), end: startOfDayOffset(1) },
  ]

  for (const r of ranges) {
    const rows = await querySignInsForRange(supabase, r.start, r.end)
    const csv = toCSV(rows)
    const outPath = path.resolve(process.cwd(), `${r.name}-signins.csv`)
    fs.writeFileSync(outPath, csv, 'utf8')
    console.log('Written', outPath, rows.length, 'rows')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


