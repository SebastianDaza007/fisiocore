"use client";

import UserMenu from "./usermenu";
import NotificationsMenu, { Notificacion } from "./notificationsmenu";

type User = {
    nombre: string;
};

type NavbarProps = {
    idUsuario: string | number | null;
    usuario: User | null;
    rol?: string | null;
    urlLogin: string;
    urlRegistro: string;
    notificaciones: Notificacion[];
    onLogout?: () => void;
};

const ROL_DISPLAY: Record<string, string> = {
    'ADMIN': 'Admin',
    'GERENTE': 'Gerente',
    'PROFESIONAL': 'Profesional',
    'ADMINISTRATIVO': 'Administrativo',
};

export default function DashboardNavbar({
    idUsuario,
    usuario,
    rol,
    urlLogin,
    urlRegistro,
    notificaciones,
    onLogout,
}: NavbarProps) {
    const rolDisplay = rol ? (ROL_DISPLAY[rol] || rol) : 'Sistema';

    return (
        <header className="h-16 text-gray-800 flex items-center justify-between px-6 shadow-sm" style={{ backgroundColor: "#FEF7FF" }}>
        {/* Título con rol del usuario */}
        <h1 className="text-3xl font-semibold">{rolDisplay}</h1>

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
