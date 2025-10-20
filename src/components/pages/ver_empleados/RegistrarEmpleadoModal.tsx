"use client";

import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';

interface Rol {
  id_rol: number;
  nombre_rol: string;
  label: string;
}

interface RegistrarEmpleadoModalProps {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
}

export default function RegistrarEmpleadoModal({
  visible,
  onHide,
  onSave
}: RegistrarEmpleadoModalProps) {
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rolId, setRolId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useRef<Toast>(null);

  // Roles disponibles para empleados administrativos
  const rolesDisponibles: Rol[] = [
    { id_rol: 1, nombre_rol: 'ADMIN', label: 'Administrador' },
    { id_rol: 2, nombre_rol: 'GERENTE', label: 'Gerente' },
    { id_rol: 4, nombre_rol: 'ADMINISTRATIVO', label: 'Administrativo' }
  ];

  // Limpiar formulario cuando se cierra el modal
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setDni('');
    setNombre('');
    setApellido('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRolId(null);
    setErrors({});
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    toast.current?.show({
      severity: 'success',
      summary: 'Contraseña Generada',
      detail: 'Se ha generado una contraseña segura',
      life: 2000
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // DNI
    if (!dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!/^\d{7,8}$/.test(dni.trim())) {
      newErrors.dni = 'El DNI debe tener 7 u 8 dígitos';
    }

    // Nombre
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Apellido
    if (!apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    } else if (apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Email inválido';
    }

    // Password
    if (!password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.trim().length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Rol
    if (!rolId) {
      newErrors.rol = 'Debe seleccionar un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error de Validación',
        detail: 'Por favor complete todos los campos correctamente',
        life: 4000
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/empleados/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni_usuario: dni.trim(),
          nombre_usuario: nombre.trim(),
          apellido_usuario: apellido.trim(),
          email_usuario: email.trim(),
          password: password.trim(),
          rol_id: rolId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar empleado');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Empleado Registrado',
        detail: `${nombre} ${apellido} registrado exitosamente`,
        life: 4000
      });

      setTimeout(() => {
        onSave();
        onHide();
      }, 500);

    } catch (error) {
      console.error('Error al registrar empleado:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Error al registrar el empleado',
        life: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header="Registrar Nuevo Empleado"
        style={{ width: '700px' }}
        breakpoints={{ '960px': '90vw', '641px': '95vw' }}
        modal
        dismissableMask={false}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="pi pi-user text-teal-600"></i>
              Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DNI */}
              <div>
                <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
                  DNI *
                </label>
                <InputText
                  id="dni"
                  value={dni}
                  onChange={(e) => {
                    setDni(e.target.value);
                    setErrors({ ...errors, dni: '' });
                  }}
                  className={`w-full ${errors.dni ? 'p-invalid' : ''}`}
                  placeholder="12345678"
                  maxLength={8}
                />
                {errors.dni && <small className="text-red-500 block mt-1">{errors.dni}</small>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && <small className="text-red-500 block mt-1">{errors.email}</small>}
              </div>

              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <InputText
                  id="nombre"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setErrors({ ...errors, nombre: '' });
                  }}
                  className={`w-full ${errors.nombre ? 'p-invalid' : ''}`}
                  placeholder="Juan"
                />
                {errors.nombre && <small className="text-red-500 block mt-1">{errors.nombre}</small>}
              </div>

              {/* Apellido */}
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <InputText
                  id="apellido"
                  value={apellido}
                  onChange={(e) => {
                    setApellido(e.target.value);
                    setErrors({ ...errors, apellido: '' });
                  }}
                  className={`w-full ${errors.apellido ? 'p-invalid' : ''}`}
                  placeholder="Pérez"
                />
                {errors.apellido && <small className="text-red-500 block mt-1">{errors.apellido}</small>}
              </div>
            </div>
          </div>

          {/* Rol del Sistema */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="pi pi-briefcase text-teal-600"></i>
              Rol del Sistema
            </h3>

            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <Dropdown
                id="rol"
                value={rolId}
                onChange={(e) => {
                  setRolId(e.value);
                  setErrors({ ...errors, rol: '' });
                }}
                options={rolesDisponibles}
                optionLabel="label"
                optionValue="id_rol"
                placeholder="Seleccione un rol"
                className={`w-full ${errors.rol ? 'p-invalid' : ''}`}
              />
              {errors.rol && <small className="text-red-500 block mt-1">{errors.rol}</small>}
              <small className="text-gray-500 block mt-1">
                Define los permisos y accesos en el sistema
              </small>
            </div>
          </div>

          {/* Contraseña */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="pi pi-lock text-teal-600"></i>
              Contraseña *
            </h3>

            <div className="space-y-3">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña del Usuario
                </label>
                <div className="p-inputgroup">
                  <InputText
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: '' });
                    }}
                    placeholder="Mínimo 6 caracteres"
                    type={showPassword ? "text" : "password"}
                    className={errors.password ? 'p-invalid' : ''}
                  />
                  <Button
                    icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-button-text"
                    type="button"
                    tooltip={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tooltipOptions={{ position: 'top' }}
                  />
                  <Button
                    icon="pi pi-lock"
                    onClick={generatePassword}
                    className="bg-teal-600 hover:bg-teal-700 border-teal-600"
                    type="button"
                    tooltip="Generar Contraseña"
                    tooltipOptions={{ position: 'top' }}
                  />
                </div>
                {errors.password && <small className="text-red-500 block mt-1">{errors.password}</small>}
                <small className="text-gray-500 mt-2 block">
                  * Mínimo 6 caracteres. Use el botón para generar una contraseña segura.
                </small>
              </div>
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
              disabled={saving}
              className="flex-1"
            />
            <Button
              type="submit"
              label={saving ? 'Registrando...' : 'Registrar Empleado'}
              severity="success"
              disabled={saving}
              className="flex-1"
              icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
            />
          </div>
        </form>
      </Dialog>
    </>
  );
}
