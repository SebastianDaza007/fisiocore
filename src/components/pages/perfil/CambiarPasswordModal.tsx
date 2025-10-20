'use client';

import { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

interface CambiarPasswordModalProps {
  visible: boolean;
  onHide: () => void;
  userId: number;
}

export default function CambiarPasswordModal({
  visible,
  onHide,
  userId
}: CambiarPasswordModalProps) {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNueva, setShowPasswordNueva] = useState(false);
  const [showPasswordConfirmar, setShowPasswordConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useRef<Toast>(null);

  const resetForm = () => {
    setPasswordActual('');
    setPasswordNueva('');
    setPasswordConfirmar('');
    setShowPasswordActual(false);
    setShowPasswordNueva(false);
    setShowPasswordConfirmar(false);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Contraseña actual
    if (!passwordActual.trim()) {
      newErrors.passwordActual = 'La contraseña actual es obligatoria';
    }

    // Contraseña nueva
    if (!passwordNueva.trim()) {
      newErrors.passwordNueva = 'La contraseña nueva es obligatoria';
    } else if (passwordNueva.trim().length < 6) {
      newErrors.passwordNueva = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Confirmar contraseña
    if (!passwordConfirmar.trim()) {
      newErrors.passwordConfirmar = 'Debe confirmar la contraseña';
    } else if (passwordNueva !== passwordConfirmar) {
      newErrors.passwordConfirmar = 'Las contraseñas no coinciden';
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (passwordActual === passwordNueva) {
      newErrors.passwordNueva = 'La nueva contraseña debe ser diferente a la actual';
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

    setLoading(true);

    try {
      const response = await fetch('/api/auth/cambiar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          password_actual: passwordActual.trim(),
          password_nueva: passwordNueva.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Contraseña Actualizada',
        detail: 'Tu contraseña ha sido cambiada exitosamente',
        life: 4000
      });

      setTimeout(() => {
        resetForm();
        onHide();
      }, 1000);

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Error al cambiar la contraseña',
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={handleClose}
        header="Cambiar Contraseña"
        style={{ width: '500px' }}
        breakpoints={{ '960px': '75vw', '641px': '95vw' }}
        modal
        dismissableMask={false}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <i className="pi pi-info-circle text-amber-600 text-xl"></i>
            <div className="flex-1">
              <p className="text-sm text-amber-800 font-medium">Importante</p>
              <p className="text-sm text-amber-700 mt-1">
                Por seguridad, necesitas ingresar tu contraseña actual para cambiarla.
              </p>
            </div>
          </div>

          {/* Contraseña Actual */}
          <div>
            <label htmlFor="passwordActual" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual *
            </label>
            <div className="p-inputgroup">
              <InputText
                id="passwordActual"
                value={passwordActual}
                onChange={(e) => {
                  setPasswordActual(e.target.value);
                  setErrors({ ...errors, passwordActual: '' });
                }}
                placeholder="Ingresa tu contraseña actual"
                type={showPasswordActual ? "text" : "password"}
                className={errors.passwordActual ? 'p-invalid w-full' : 'w-full'}
              />
              <Button
                icon={showPasswordActual ? "pi pi-eye-slash" : "pi pi-eye"}
                onClick={() => setShowPasswordActual(!showPasswordActual)}
                className="p-button-text"
                type="button"
                tooltip={showPasswordActual ? "Ocultar" : "Mostrar"}
                tooltipOptions={{ position: 'top' }}
              />
            </div>
            {errors.passwordActual && (
              <small className="text-red-500 block mt-1">{errors.passwordActual}</small>
            )}
          </div>

          {/* Contraseña Nueva */}
          <div>
            <label htmlFor="passwordNueva" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Nueva *
            </label>
            <div className="p-inputgroup">
              <InputText
                id="passwordNueva"
                value={passwordNueva}
                onChange={(e) => {
                  setPasswordNueva(e.target.value);
                  setErrors({ ...errors, passwordNueva: '' });
                }}
                placeholder="Mínimo 6 caracteres"
                type={showPasswordNueva ? "text" : "password"}
                className={errors.passwordNueva ? 'p-invalid w-full' : 'w-full'}
              />
              <Button
                icon={showPasswordNueva ? "pi pi-eye-slash" : "pi pi-eye"}
                onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                className="p-button-text"
                type="button"
                tooltip={showPasswordNueva ? "Ocultar" : "Mostrar"}
                tooltipOptions={{ position: 'top' }}
              />
            </div>
            {errors.passwordNueva && (
              <small className="text-red-500 block mt-1">{errors.passwordNueva}</small>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="passwordConfirmar" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña Nueva *
            </label>
            <div className="p-inputgroup">
              <InputText
                id="passwordConfirmar"
                value={passwordConfirmar}
                onChange={(e) => {
                  setPasswordConfirmar(e.target.value);
                  setErrors({ ...errors, passwordConfirmar: '' });
                }}
                placeholder="Repite la contraseña nueva"
                type={showPasswordConfirmar ? "text" : "password"}
                className={errors.passwordConfirmar ? 'p-invalid w-full' : 'w-full'}
              />
              <Button
                icon={showPasswordConfirmar ? "pi pi-eye-slash" : "pi pi-eye"}
                onClick={() => setShowPasswordConfirmar(!showPasswordConfirmar)}
                className="p-button-text"
                type="button"
                tooltip={showPasswordConfirmar ? "Ocultar" : "Mostrar"}
                tooltipOptions={{ position: 'top' }}
              />
            </div>
            {errors.passwordConfirmar && (
              <small className="text-red-500 block mt-1">{errors.passwordConfirmar}</small>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              outlined
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            />
            <Button
              type="submit"
              label={loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              className="flex-1 bg-teal-600 hover:bg-teal-700 border-teal-600"
              disabled={loading}
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
            />
          </div>
        </form>
      </Dialog>
    </>
  );
}
