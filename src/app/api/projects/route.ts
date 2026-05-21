import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — все проекты пользователя
export async function GET() {
  try {
    const session = await getSessionFromCookies()
    if (!session) return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })

    const projects = await prisma.project.findMany({
      where: { userId: session.userId },
      select: { id: true, name: true, updatedAt: true, createdAt: true, data: true },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ projects })
  } catch {
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}

// POST — создать новый или обновить существующий (если передан id)
export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })

    const body = await request.json()
    const { id, name, data } = body

    if (!data) return NextResponse.json({ message: 'Данные проекта обязательны' }, { status: 400 })

    let project

    if (id) {
      // Обновляем существующий — проверяем что он принадлежит пользователю
      const existing = await prisma.project.findFirst({ where: { id, userId: session.userId } })
      if (!existing) return NextResponse.json({ message: 'Проект не найден' }, { status: 404 })

      project = await prisma.project.update({
        where: { id },
        data: { name: name ?? existing.name, data },
      })
    } else {
      // Создаём новый проект
      project = await prisma.project.create({
        data: { name: name ?? 'Новый проект', data, userId: session.userId },
      })
    }

    return NextResponse.json({ success: true, project })
  } catch {
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}

// DELETE — удалить проект по id
export async function DELETE(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ message: 'ID проекта не указан' }, { status: 400 })

    const existing = await prisma.project.findFirst({ where: { id, userId: session.userId } })
    if (!existing) return NextResponse.json({ message: 'Проект не найден' }, { status: 404 })

    await prisma.project.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}
