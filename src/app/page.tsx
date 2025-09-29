'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { isAuthenticated, user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Si está autenticado, redirigir según el rol
        const roleRoutes = {
          ADMIN: '/admin',
          GERENTE: '/gerente',
          PROFESIONAL: '/profesional',
          ADMINISTRATIVO: '/administrativo'
        }

        const redirectTo = roleRoutes[user.rol as keyof typeof roleRoutes] || '/administrativo'
        window.location.href = redirectTo
      } else {
        // Si no está autenticado, ir al login
        window.location.href = '/login'
      }
    }
  }, [isAuthenticated, user, loading])

  // Mostrar loading mientras verifica autenticación
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}
