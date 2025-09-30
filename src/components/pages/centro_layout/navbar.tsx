
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
    onLogout?: () => void;
};

function capitalizarRuta(ruta: string): string {
    if (!ruta || ruta === "") return "Inicio";
    return ruta.charAt(0).toUpperCase() + ruta.slice(1);
}

const TITULOS: Record<string, string> = {
    "/agendar": "Registrar o Agendar Turnos",
    "/dturno": "Detalle de Turno",
    "/profesionales": "Listado de profesionales",
    "/administrativo/ver_profesional": "Listado de Profesionales",
};

export default function DashboardNavbar({
    idUsuario,
    usuario,
    urlLogin,
    urlRegistro,
    notificaciones,
    onLogout,
}: NavbarProps) {
    const pathname = usePathname();

    // Buscar título exacto primero, luego por primer segmento
    const titulo = TITULOS[pathname] ||
                   TITULOS[`/${pathname.split("/")[1]}`] ||
                   capitalizarRuta(pathname.split("/")[1] || "");

    return (
        <header className="h-16 text-gray-800 flex items-center justify-between px-6 shadow-sm" style={{ backgroundColor: "#FEF7FF" }}>
        {/* Título dinámico */}
        <h1 className="text-3xl font-semibold">{titulo}</h1>

        {/* Menús a la derecha */}
        <div className="flex items-center gap-4">
            <NotificationsMenu notificaciones={notificaciones} />
            <UserMenu
            usuario={usuario}
            idUsuario={idUsuario}
            urlLogin={urlLogin}
            urlRegistro={urlRegistro}
            onLogout={onLogout}
            />
        </div>
        </header>
    );
}
