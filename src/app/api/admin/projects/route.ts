import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
        updatedAt: true,
        createdAt: true,
        data: true,
        user: { select: { email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(
      projects.map(p => ({
        id: p.id,
        name: p.name,
        userId: p.userId,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
        data: p.data,
        userEmail: p.user.email,
      }))
    )
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
