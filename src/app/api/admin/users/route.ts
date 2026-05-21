import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, displayName: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, displayName, role } = body

    if (!email || !password) {
      return NextResponse.json({ message: 'Email и пароль обязательны' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ message: 'Пользователь с таким email уже существует' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        displayName: displayName ?? null,
        role: role === 'admin' ? 'admin' : 'user',
      },
      select: { id: true, email: true, displayName: true, role: true },
    })

    return NextResponse.json({ success: true, message: 'Пользователь создан', user }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { userId, newPassword, role, email, displayName } = body

    if (!userId) {
      return NextResponse.json({ message: 'ID пользователя обязателен' }, { status: 400 })
    }

    const updateData: { password?: string; role?: string; email?: string; displayName?: string } = {}

    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 12)
    if (role) {
      if (!['user', 'admin'].includes(role))
        return NextResponse.json({ message: 'Недопустимая роль' }, { status: 400 })
      updateData.role = role
    }
    if (email) {
      const conflict = await prisma.user.findFirst({ where: { email: email.toLowerCase(), NOT: { id: userId } } })
      if (conflict) return NextResponse.json({ message: 'Email уже занят' }, { status: 409 })
      updateData.email = email.toLowerCase()
    }
    if (displayName !== undefined) updateData.displayName = displayName || null

    if (Object.keys(updateData).length === 0)
      return NextResponse.json({ message: 'Нечего обновлять' }, { status: 400 })

    await prisma.user.update({ where: { id: userId }, data: updateData })

    return NextResponse.json({ success: true, message: 'Пользователь обновлён' })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID пользователя не предоставлен' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Пользователь удалён' })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ message: 'Пользователь с таким ID не найден' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}
