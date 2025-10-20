'use client';

import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

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
  turnos: Array<{
    id_turno: number;
    fecha_turno: Date;
  }>;
  cantidadTurnos: number;
}

interface EditEmpleadoModalProps {
  visible: boolean;
  empleado: Empleado | null;
  onHide: () => void;
  onSave: () => void;
}

export default function EditEmpleadoModal({
  visible,
  empleado,
  onHide,
  onSave,
}: EditEmpleadoModalProps) {
  const [formData, setFormData] = useState({
    email_usuario: '',
    estado: 'Activo',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const estadosOptions = [
    { label: 'Activo', value: 'Activo' },
    { label: 'Inactivo', value: 'Inactivo' },
  ];

  useEffect(() => {
    if (empleado) {
      setFormData({
        email_usuario: empleado.email_usuario,
        estado: empleado.estado || 'Activo',
      });
      setErrors({});
    }
  }, [empleado]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const newErrors: { email?: string } = {};

    if (!formData.email_usuario.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email_usuario)) {
      newErrors.email = 'Email inválido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/empleados/${empleado?.id_usuario}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_usuario: formData.email_usuario.trim(),
          estado: formData.estado,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar empleado');
      }

      // Guardar el estado en localStorage (visual)
      const estadosGuardados = JSON.parse(localStorage.getItem('empleadosEstados') || '{}');
      estadosGuardados[empleado?.id_usuario || 0] = formData.estado;
      localStorage.setItem('empleadosEstados', JSON.stringify(estadosGuardados));

      onSave();
      onHide();
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      setErrors({ email: error instanceof Error ? error.message : 'Error al actualizar' });
    } finally {
      setLoading(false);
    }
  };

  if (!empleado) return null;

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Editar Empleado"
      style={{ width: '500px' }}
      breakpoints={{ '960px': '75vw', '641px': '95vw' }}
      modal
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del empleado (solo lectura) */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Información del Empleado
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Nombre:</span>
              <span className="font-medium text-gray-900">
                {empleado.nombre_usuario} {empleado.apellido_usuario}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">DNI:</span>
              <span className="font-medium text-gray-900">{empleado.dni_usuario}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rol:</span>
              <span className="font-medium text-gray-900">
                {empleado.roles.nombre_rol === 'ADMIN' ? 'Administrador' :
                 empleado.roles.nombre_rol === 'GERENTE' ? 'Gerente' :
                 empleado.roles.nombre_rol === 'ADMINISTRATIVO' ? 'Administrativo' :
                 empleado.roles.nombre_rol}
              </span>
            </div>
          </div>
        </div>

        {/* Campos editables */}
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <InputText
              id="email"
              value={formData.email_usuario}
              onChange={(e) => {
                setFormData({ ...formData, email_usuario: e.target.value });
                setErrors({ ...errors, email: undefined });
              }}
              className={`w-full ${errors.email ? 'p-invalid' : ''}`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <small className="text-red-500 block mt-1">{errors.email}</small>
            )}
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <Dropdown
              id="estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.value })}
              options={estadosOptions}
              className="w-full"
              placeholder="Seleccione un estado"
            />
            <small className="text-gray-500 block mt-1">
              El estado es visual y no afecta el acceso al sistema
            </small>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            outlined
            onClick={onHide}
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            label={loading ? 'Guardando...' : 'Guardar Cambios'}
            severity="success"
            disabled={loading}
            className="flex-1"
            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
          />
        </div>
      </form>
    </Dialog>
  );
}
