"use client";

import UserMenu from "./usermenu";
import NotificationsMenu, { Notificacion } from "./notificationsmenu";
import { usePathname } from "next/navigation";

type User = {
    nombre: string;
};

type NavbarProps = {
    idUsuario: string | number | null;
    usuario: User | null;
    urlLogin: string;
    urlRegistro: string;
    notificaciones: Notificacion[];
};

function capitalizarRuta(ruta: string): string {
    if (!ruta || ruta === "") return "Inicio";
    return ruta.charAt(0).toUpperCase() + ruta.slice(1);
}

// Diccionario para títulos personalizados
const TITULOS: Record<string, string> = {
    "/agendar": "Registrar o Agendar Turnos",
    "/dturno": "Detalle de Turno",
};

export default function DashboardNavbar({
    idUsuario,
    usuario,
    urlLogin,
    urlRegistro,
    notificaciones,
    }: NavbarProps) {
    const pathname = usePathname();
    const segmento = pathname.split("/")[1] || "";

    // Primero busca en el diccionario, si no existe capitaliza la ruta
    const titulo = TITULOS[`/${segmento}`] || capitalizarRuta(segmento);

    return (
        <header className="h-16 bg-teal-500 text-white flex items-center justify-between px-6 shadow">
        {/* Título dinámico */}
        <h1 className="text-2xl font-bold">{titulo}</h1>

        {/* Menús a la derecha */}
        <div className="flex items-center gap-4">
            <NotificationsMenu notificaciones={notificaciones} />
            <span className="font-medium">{usuario ? "Admin" : ""}</span>
            <UserMenu
            usuario={usuario}
            idUsuario={idUsuario}
            urlLogin={urlLogin}
            urlRegistro={urlRegistro}
            />
        </div>
        </header>
    );
}
