import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const templates = await prisma.$queryRaw`
      SELECT id, name, category, description, colors, "isBuiltIn", "createdAt"
      FROM "Template"
      ORDER BY "createdAt" ASC
    `
    return NextResponse.json({ templates })
  } catch (error) {
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 })
  }
}
