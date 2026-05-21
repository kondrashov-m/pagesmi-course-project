import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, createSessionCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, displayName } = body

    if (!email || !password) {
      return NextResponse.json({ message: 'Email и пароль обязательны' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Пароль должен содержать не менее 6 символов' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existing) {
      return NextResponse.json({ message: 'Пользователь с таким email уже существует' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        displayName: displayName ?? null,
        role: 'user',
      },
      select: { id: true, email: true, displayName: true, role: true },
    })

    // Автоматически входим после регистрации
    const token = await signToken({
      userId: user.id,
      email: user.email,
      displayName: user.displayName ?? undefined,
      role: user.role,
    })

    const response = NextResponse.json({
      success: true,
      message: 'Регистрация выполнена успешно',
      user: { id: user.id, email: user.email, displayName: user.displayName },
    }, { status: 201 })

    response.cookies.set(createSessionCookie(token))
    return response
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    return NextResponse.json({ message: 'Ошибка сервера при регистрации' }, { status: 500 })
  }
}
