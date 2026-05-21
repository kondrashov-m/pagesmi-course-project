import { NextResponse } from 'next/server'
import { clearSessionCookie, getSessionFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getSessionFromCookies()
    if (session) {
      await prisma.$executeRaw`DELETE FROM "UserSession" WHERE "userId" = ${session.userId}`
    }
  } catch {}

  const response = NextResponse.json({ success: true, message: 'Выход выполнен' })
  const cookie = clearSessionCookie()
  response.cookies.set(cookie)
  return response
}
