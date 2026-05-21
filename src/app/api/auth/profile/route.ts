import { NextResponse } from 'next/server'
import { getSessionFromCookies, signToken, createSessionCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getSessionFromCookies()
  if (!session) return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, displayName: true, role: true, createdAt: true },
  })
  if (!user) return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 })

  return NextResponse.json({ user })
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })

    const body = await request.json()
    const { displayName, currentPassword, newPassword } = body

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 })

    const updateData: { displayName?: string; password?: string } = {}

    if (displayName !== undefined) {
      if (!displayName.trim()) return NextResponse.json({ message: 'Имя не может быть пустым' }, { status: 400 })
      updateData.displayName = displayName.trim()
    }

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ message: 'Введите текущий пароль' }, { status: 400 })
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return NextResponse.json({ message: 'Неверный текущий пароль' }, { status: 400 })
      if (newPassword.length < 6) return NextResponse.json({ message: 'Новый пароль должен быть не менее 6 символов' }, { status: 400 })
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: { id: true, email: true, displayName: true, role: true },
    })

    const newToken = await signToken({
      userId: updated.id,
      email: updated.email,
      displayName: updated.displayName ?? undefined,
      role: updated.role,
    })
    const cookieStore = await cookies()
    cookieStore.set(createSessionCookie(newToken))

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}