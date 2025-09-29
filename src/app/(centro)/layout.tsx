"use client";
import React from "react";
import Sidebar from "@/components/pages/centro_layout/sidebar";
import DashboardNavbar from "@/components/pages/centro_layout/navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
    }) {
    const sidebarItems = [
        { icon: "pi-calendar", label: "Calendario de turnos", path: "/turnos", options: null },
        { icon: "pi-calendar-plus", label: "Agendar turnos", path: "/agendar", options: null },
        { icon: "pi-users", label: "Gestionar profesionales", path: "/profesionales", options: null },
    ];

    return (
        <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar title="FisioCore" items={sidebarItems} />

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardNavbar
            idUsuario={5}
            usuario={{ nombre: "Andrea" }}
            urlLogin="/login"
            urlRegistro="/registro"
            notificaciones={[]}
            />

            <main className="flex-1 h-full overflow-auto bg-gray-50 p-6">
            {children}
            </main>
        </div>
        </div>
    );
}