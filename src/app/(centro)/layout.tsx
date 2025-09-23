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
        { icon: "pi-calendar", label: "Turnos", path: "/turnos", options: null },
        { icon: "pi-calendar-plus", label: "Agendar", path: "/agendar", options: null },
        { icon: "pi-clock", label: "D turno", path: "/dturno", options: null },
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

            <main className="flex-1 h-full overflow-auto p-0 bg-white">
            {children}
            </main>
        </div>
        </div>
    );
}