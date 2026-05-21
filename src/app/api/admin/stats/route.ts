import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<{ tbl: string; cnt: number }[]>`
      SELECT 'users'     AS tbl, COUNT(*)::int AS cnt FROM "User"
      UNION ALL
      SELECT 'projects'  AS tbl, COUNT(*)::int AS cnt FROM "Project"
      UNION ALL
      SELECT 'online'    AS tbl, COUNT(*)::int AS cnt FROM "UserSession" WHERE "expiresAt" > NOW()
      UNION ALL
      SELECT 'templates' AS tbl, COUNT(*)::int AS cnt FROM "Template"
    `

    const get = (key: string) => rows.find(r => r.tbl === key)?.cnt ?? 0

    return NextResponse.json({
      users:     get('users'),
      projects:  get('projects'),
      online:    get('online'),
      templates: get('templates'),
    })
  } catch (e) {
    console.error('Stats error:', e)
    return NextResponse.json({ users: 0, projects: 0, savedBlocks: 0, templates: 0 }, { status: 500 })
  }
}
