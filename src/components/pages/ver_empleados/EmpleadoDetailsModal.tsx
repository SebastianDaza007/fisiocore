'use client';

import { Dialog } from 'primereact/dialog';

interface Empleado {
  id_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
  dni_usuario: string;
  email_usuario: string;
  estado: string;
  roles: {
    nombre_rol: string;
  };
}

interface EmpleadoDetailsModalProps {
  visible: boolean;
  empleado: Empleado | null;
  onHide: () => void;
}

export default function EmpleadoDetailsModal({
  visible,
  empleado,
  onHide,
}: EmpleadoDetailsModalProps) {
  if (!empleado) return null;

  const rolMap: Record<string, string> = {
    'ADMIN': 'Administrador',
    'GERENTE': 'Gerente',
    'ADMINISTRATIVO': 'Administrativo',
  };

  const rolLabel = rolMap[empleado.roles.nombre_rol] || empleado.roles.nombre_rol;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Detalles del Empleado"
      style={{ width: '50vw' }}
      breakpoints={{ '960px': '75vw', '641px': '95vw' }}
      modal
    >
      <div className="space-y-6">
        {/* Información Personal */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i className="pi pi-user text-teal-600"></i>
            Información Personal
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nombre Completo
              </label>
              <p className="text-gray-900 font-medium">
                {empleado.nombre_usuario} {empleado.apellido_usuario}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                DNI
              </label>
              <p className="text-gray-900">{empleado.dni_usuario}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <p className="text-gray-900">{empleado.email_usuario}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Rol
              </label>
              <p className="text-gray-900">{rolLabel}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Estado
              </label>
              <p className="text-gray-900">{empleado.estado}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onHide}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </div>
    </Dialog>
  );
}
