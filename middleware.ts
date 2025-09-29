import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Configuración de rutas por rol
const ROLE_ROUTES = {
  ADMIN: ['/admin', '/gerente', '/profesional', '/administrativo', '/paciente'],
  GERENTE: ['/gerente', '/profesional', '/administrativo', '/paciente'],
  PROFESIONAL: ['/profesional'],
  ADMINISTRATIVO: ['/administrativo', '/paciente']
}

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/api/auth/logout']

function hasAccess(userRole: string, requestPath: string): boolean {
  const allowedRoutes = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES] || []
  return allowedRoutes.some(route => requestPath.startsWith(route))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar token para rutas protegidas (cualquier ruta que no sea pública)
  if (!PUBLIC_ROUTES.some(route => pathname.startsWith(route)) && pathname !== '/') {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      const userRole = decoded.rol

      // Verificar si el usuario tiene acceso a la ruta
      if (!hasAccess(userRole, pathname)) {
        // Redirigir a la ruta por defecto según el rol
        const defaultRoutes = {
          ADMIN: '/admin',
          GERENTE: '/gerente',
          PROFESIONAL: '/profesional',
          ADMINISTRATIVO: '/administrativo'
        }

        const defaultRoute = defaultRoutes[userRole as keyof typeof defaultRoutes] || '/login'
        return NextResponse.redirect(new URL(defaultRoute, request.url))
      }

      // Usuario autorizado, continuar
      return NextResponse.next()

    } catch (error) {
      // Token inválido, redirigir a login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}