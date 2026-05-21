import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-change-me'
)
const COOKIE_NAME = 'pagesmi_session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Пропускаем публичные маршруты
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/templates') ||
    pathname.startsWith('/api/blocks') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Защита admin-маршрутов — только для role=admin
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if ((payload as any).role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
