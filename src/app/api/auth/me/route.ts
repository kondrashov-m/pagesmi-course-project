import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, displayName: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}
