'use client'

import { useState, useEffect } from 'react'

interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: string
  profesionalId?: number
}

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false
  })

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          user: data.user,
          loading: false,
          isAuthenticated: true
        })
      } else {
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false
        })
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false
      })
    }
  }

  const login = async (dni: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dni, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          user: data.user,
          loading: false,
          isAuthenticated: true
        })

        // Redirigir según el rol
        const roleRoutes = {
          ADMIN: '/admin',
          GERENTE: '/gerente',
          PROFESIONAL: '/profesional',
          ADMINISTRATIVO: '/administrativo'
        }

        const redirectTo = roleRoutes[data.user.rol as keyof typeof roleRoutes] || '/administrativo'
        window.location.href = redirectTo

        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error || 'Error de login' }
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Error al hacer logout:', error)
    } finally {
      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false
      })
      window.location.href = '/login'
    }
  }

  const hasRole = (role: string): boolean => {
    if (!authState.user) return false

    // ADMIN puede acceder a todo
    if (authState.user.rol === 'ADMIN') return true

    // GERENTE puede acceder a GERENTE, PROFESIONAL y ADMINISTRATIVO
    if (authState.user.rol === 'GERENTE') {
      return ['GERENTE', 'PROFESIONAL', 'ADMINISTRATIVO'].includes(role)
    }

    // Otros roles solo a su propio rol
    return authState.user.rol === role
  }

  const canAccessRoute = (route: string): boolean => {
    if (!authState.user) return false

    const roleRoutes = {
      ADMIN: ['/admin', '/gerente', '/profesional', '/administrativo'],
      GERENTE: ['/gerente', '/profesional', '/administrativo'],
      PROFESIONAL: ['/profesional'],
      ADMINISTRATIVO: ['/administrativo']
    }

    const allowedRoutes = roleRoutes[authState.user.rol as keyof typeof roleRoutes] || []
    return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute))
  }

  return {
    ...authState,
    login,
    logout,
    checkAuth,
    hasRole,
    canAccessRoute
  }
}