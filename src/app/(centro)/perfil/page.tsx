"use client";

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useAuth } from '@/hooks/useAuth';
import CambiarPasswordModal from '@/components/pages/perfil/CambiarPasswordModal';

interface UsuarioPerfil {
  id_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
  dni_usuario: string;
  email_usuario: string;
  roles: {
    nombre_rol: string;
  };
  profesionales?: {
    matricula_profesional: string;
    especialidades: {
      nombre_especialidad: string;
    };
  };
}

export default function PerfilPage() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Error al cargar perfil');
      }
      const data = await response.json();
      setPerfil(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  const getRolLabel = (rol: string) => {
    const rolMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'GERENTE': 'Gerente',
      'PROFESIONAL': 'Profesional',
      'ADMINISTRATIVO': 'Administrativo'
    };
    return rolMap[rol] || rol;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-teal-600"></i>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <i className="pi pi-exclamation-triangle text-4xl text-red-500"></i>
          <p className="mt-4 text-gray-600">No se pudo cargar el perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
            <p className="text-gray-600 mt-1">Información personal y configuración de cuenta</p>
          </div>
          <div className="bg-teal-600 text-white p-4 rounded-full">
            <i className="pi pi-user text-3xl"></i>
          </div>
        </div>

        {/* Información Personal */}
        <Card className="shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <i className="pi pi-id-card text-teal-600 text-xl"></i>
            <h2 className="text-2xl font-semibold text-gray-800">Información Personal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Nombre Completo
              </label>
              <p className="text-lg text-gray-900 font-medium">
                {perfil.nombre_usuario} {perfil.apellido_usuario}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                DNI
              </label>
              <p className="text-lg text-gray-900">
                {perfil.dni_usuario}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <p className="text-lg text-gray-900">
                {perfil.email_usuario}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Rol
              </label>
              <p className="text-lg text-gray-900">
                {getRolLabel(perfil.roles.nombre_rol)}
              </p>
            </div>

            {/* Información adicional para profesionales */}
            {perfil.profesionales && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Matrícula Profesional
                  </label>
                  <p className="text-lg text-gray-900">
                    {perfil.profesionales.matricula_profesional}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Especialidad
                  </label>
                  <p className="text-lg text-gray-900">
                    {perfil.profesionales.especialidades.nombre_especialidad}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Seguridad */}
        <Card className="shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <i className="pi pi-shield text-teal-600 text-xl"></i>
            <h2 className="text-2xl font-semibold text-gray-800">Seguridad</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-gray-800">Contraseña</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Cambia tu contraseña para mantener tu cuenta segura
                </p>
              </div>
              <Button
                label="Cambiar Contraseña"
                icon="pi pi-lock"
                className="bg-teal-600 hover:bg-teal-700 border-teal-600"
                onClick={() => setShowPasswordModal(true)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-gray-800">Última Actividad</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Sesión iniciada como {getRolLabel(perfil.roles.nombre_rol)}
                </p>
              </div>
              <i className="pi pi-check-circle text-green-500 text-2xl"></i>
            </div>
          </div>
        </Card>

        {/* Modal Cambiar Contraseña */}
        <CambiarPasswordModal
          visible={showPasswordModal}
          onHide={() => setShowPasswordModal(false)}
          userId={perfil.id_usuario}
        />
      </div>
    </div>
  );
}
