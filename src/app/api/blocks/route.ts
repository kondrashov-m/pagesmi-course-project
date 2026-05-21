import { NextResponse } from 'next/server'
import { getSessionFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
    }

    const blocks = await prisma.$queryRaw`
      SELECT id, name, element, "userId", "createdAt"
      FROM "SavedBlock"
      WHERE "userId" = ${session.userId}
      ORDER BY "createdAt" DESC
    `

    return NextResponse.json({ blocks })
  } catch (error) {
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { name, element } = body

    if (!name || !element) {
      return NextResponse.json({ message: 'Название и элемент обязательны' }, { status: 400 })
    }

    const elementJson = JSON.stringify(element)
    const id = crypto.randomUUID()

    await prisma.$executeRaw`
      INSERT INTO "SavedBlock" (id, name, element, "userId", "createdAt")
      VALUES (${id}, ${name}, ${elementJson}::jsonb, ${session.userId}, NOW())
    `

    const rows = await prisma.$queryRaw`
      SELECT id, name, element, "userId", "createdAt"
      FROM "SavedBlock" WHERE id = ${id}
    ` as any[]

    return NextResponse.json({ success: true, block: rows[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID блока не указан' }, { status: 400 })
    }

    const rows = await prisma.$queryRaw`
      SELECT id FROM "SavedBlock" WHERE id = ${id} AND "userId" = ${session.userId}
    ` as any[]

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Блок не найден' }, { status: 404 })
    }

    await prisma.$executeRaw`DELETE FROM "SavedBlock" WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}
