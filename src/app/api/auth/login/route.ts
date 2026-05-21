import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, createSessionCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ message: 'Email и пароль обязательны' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json({ message: 'Пользователь с таким email не найден' }, { status: 404 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Неверный пароль' }, { status: 401 })
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      displayName: user.displayName ?? undefined,
      role: user.role,
    })

    // Сохраняем активную сессию (для счётчика онлайн в админке)
    try {
      const sessionId = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await prisma.$executeRaw`DELETE FROM "UserSession" WHERE "userId" = ${user.id}`
      await prisma.$executeRaw`
        INSERT INTO "UserSession" (id, token, "userId", "expiresAt", "createdAt")
        VALUES (${sessionId}, ${token}, ${user.id}, ${expiresAt}, NOW())
      `
    } catch {}

    const response = NextResponse.json({
      success: true,
      message: 'Вход выполнен успешно',
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    })

    const cookie = createSessionCookie(token)
    response.cookies.set(cookie)

    return response
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Неверный формат запроса' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}
