'use client'

import { useAuth } from '@/hooks/useAuth'

export default function GerentePage() {
  const { user, logout } = useAuth()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Gerente</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          Bienvenido <strong>{user?.nombre}</strong>, estás en el panel de gerencia.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-green-900 mb-2">Información de sesión:</h3>
          <p className="text-sm text-green-800">Usuario: {user?.nombre}</p>
          <p className="text-sm text-green-800">Rol: {user?.rol}</p>
          <p className="text-sm text-green-800">Email: {user?.email}</p>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">Dashboard Ejecutivo</h3>
            <p className="text-sm text-gray-600 mt-2">Métricas y KPIs del centro</p>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">Gestión de Personal</h3>
            <p className="text-sm text-gray-600 mt-2">Supervisión de profesionales</p>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">Reportes Gerenciales</h3>
            <p className="text-sm text-gray-600 mt-2">Informes operativos y financieros</p>
          </div>
        </div>
      </div>
    </div>
  )
}