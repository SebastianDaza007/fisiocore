'use client'

import { useAuth } from '@/hooks/useAuth'

export default function AdminPage() {
  const { user, logout } = useAuth()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          Bienvenido <strong>{user?.nombre}</strong>, estás en el panel de administrador.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">Información de sesión:</h3>
          <p className="text-sm text-blue-800">Usuario: {user?.nombre}</p>
          <p className="text-sm text-blue-800">Rol: {user?.rol}</p>
          <p className="text-sm text-blue-800">Email: {user?.email}</p>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">Gestión de Sistema</h3>
            <p className="text-sm text-gray-600 mt-2">Configuración y administración del sistema</p>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">Usuarios y Roles</h3>
            <p className="text-sm text-gray-600 mt-2">Administrar usuarios y permisos</p>
          </div>
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900">Logs y Auditoría</h3>
            <p className="text-sm text-gray-600 mt-2">Revisar actividad del sistema</p>
          </div>
        </div>
      </div>
    </div>
  )
}