import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_PATHS = ['/agent', '/admin', '/app']
const AUTH_PATHS = ['/login', '/register', '/invite']

// 根据用户角色返回对应的首页路径
async function getHomePath(request: NextRequest, supabase: ReturnType<typeof createServerClient>): Promise<string> {
  try {
    const { data: appUser } = await supabase
      .from('app_user')
      .select('role')
      .single()
    return appUser?.role === 'requester' ? '/app/tickets' : '/agent/dashboard'
  } catch {
    return '/agent/dashboard'
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 未登录：访问受保护路由 → 重定向到 /login
  if (!user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 已登录：访问 auth 路由 → 按角色跳转对应首页
  if (user && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    const homePath = await getHomePath(request, supabase)
    return NextResponse.redirect(new URL(homePath, request.url))
  }

  // 已登录：访问根路径 / → 按角色跳转对应首页
  if (user && pathname === '/') {
    const homePath = await getHomePath(request, supabase)
    return NextResponse.redirect(new URL(homePath, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
