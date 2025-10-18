"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/pages/centro_layout/sidebar";
import DashboardNavbar from "@/components/pages/centro_layout/navbar";

interface SidebarItem {
  icon: string;
  label: string;
  path: string;
  options: null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);

  // Configurar items del sidebar según el rol
  useEffect(() => {
    if (user?.rol) {
      const items = getSidebarItemsByRole(user.rol);
      setSidebarItems(items);
    }
  }, [user]);

  // Función para obtener items del sidebar según el rol
  const getSidebarItemsByRole = (rol: string): SidebarItem[] => {
    const baseItems = [
      { icon: "pi-cog", label: "Ajustes", path: "/ajustes", options: null },
    ];

    switch (rol) {
      case 'ADMIN':
        return [
          { icon: "pi-user-plus", label: "Profesionales", path: "/profesional", options: null },
          { icon: "pi-id-card", label: "Ver Profesionales", path: "/administrativo/ver_profesional", options: null },
          { icon: "pi-calendar", label: "Turnos", path: "/turnos", options: null },
          { icon: "pi-calendar-plus", label: "Agendar", path: "/administrativo/agendar", options: null },
          { icon: "pi-chart-bar", label: "Dashboard", path: "/admin", options: null },
          { icon: "pi-cog", label: "Configuración", path: "/admin/config", options: null },
          ...baseItems
        ];

      case 'GERENTE':
        return [
          { icon: "pi-home", label: "Inicio", path: "/gerente", options: null },
          { icon: "pi-id-card", label: "Ver Profesionales", path: "/administrativo/ver_profesional", options: null },
          { icon: "pi-users", label: "Estadisticas pacientes", path: "/gerente/estadisticas-pacientes", options: null },
          { icon: "pi-chart-bar", label: "Estadisticas profesionales", path: "/gerente/estadisticas", options: null },
          ...baseItems
        ];

      case 'PROFESIONAL':
        return [
          { icon: "pi-home", label: "Inicio", path: "/profesional", options: null },
          { icon: "pi-calendar", label: "Agenda de Turnos", path: "/profesional/agenda_turnos", options: null },
          { icon: "pi-users", label: "Mis Pacientes", path: "/desarrollo", options: null },
          ...baseItems
        ];

      case 'ADMINISTRATIVO':
        return [
          { icon: "pi-home", label: "Inicio", path: "/administrativo", options: null },
          { icon: "pi-calendar-plus", label: "Agendar Turno", path: "/administrativo/agendar", options: null },
          { icon: "pi-calendar", label: "Turnos", path: "/administrativo/turnos/ver", options: null },
          { icon: "pi-id-card", label: "Ver Profesionales", path: "/administrativo/ver_profesional", options: null },
          { icon: "pi-users", label: "Ver Pacientes", path: "/administrativo/ver_pacientes", options: null },
          ...baseItems
        ];

      default:
        return baseItems;
    }
  };

  // Mostrar loading si está cargando
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated || !user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar title="FisioCore" items={sidebarItems} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar
          idUsuario={user.id}
          usuario={{ nombre: user.nombre }}
          rol={user.rol}
          urlLogin="/login"
          urlRegistro="/registro"
          notificaciones={[]}
          onLogout={logout}
        />

        <main className="flex-1 h-full overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}