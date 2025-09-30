"use client";
import Link from "next/link";
import React from "react";

// ---------- UI helpers ----------
function KpiCard({ color, icon, label, value }: { color: "emerald" | "teal" | "cyan"; icon: string; label: string; value: number; }) {
  const cardBg: Record<string, string> = {
    emerald: "from-emerald-50 to-emerald-25",
    teal: "from-teal-50 to-teal-25",
    cyan: "from-cyan-50 to-cyan-25",
  };
  const textColor: Record<string, string> = {
    emerald: "text-emerald-700",
    teal: "text-teal-700",
    cyan: "text-cyan-700",
  };
  const iconBg: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    teal: "bg-teal-100 text-teal-700",
    cyan: "bg-cyan-100 text-cyan-700",
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-b ${cardBg[color]} p-4 ring-1 ring-white/60 shadow-sm flex items-center justify-between`}>
      <div className={`${textColor[color]}`}>
        <div className="text-[11px] uppercase tracking-wide opacity-75">{label}</div>
        <div className="text-2xl font-semibold leading-tight">{value}</div>
      </div>
      <div className={`h-9 w-9 rounded-full grid place-items-center ${iconBg[color]} ring-1 ring-black/5`}>
        <i className={`${icon}`}></i>
      </div>
    </div>
  );
}

function QuickAccessCard({ title, href, icon }: { title: string; href: string; icon: string; }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl bg-white/70 backdrop-blur-[2px] ring-1 ring-black/5 shadow-sm p-4 flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all"
    >
      <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center ring-1 ring-emerald-200">
        <i className={`${icon} text-lg`}></i>
      </div>
      <div className="text-[#1f6f69] font-medium">{title}</div>
      <i className="pi pi-arrow-right ml-auto text-[#1f6f69]/60 group-hover:translate-x-0.5 transition-transform"></i>
    </Link>
  );
}

export default function HomeGerentePage() {
  // Placeholder de identidad (puedes conectar a auth/centro luego)
  const managerName = "Nombre del gerente";
  const centerName = "Centro FisioCore";

  // Datos simples del día (reemplazar por reales)
  const resumen = {
    profesionalesActivos: 12,
    turnosHoy: 18,
    pacientesHoy: 16,
  };

  const today = new Date();
  const fecha = today.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" });

  return (
    <div className="h-full w-full overflow-hidden px-4 md:px-6 lg:px-8 py-4 bg-[#f5eef7]">
      <div className="max-w-7xl h-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* HEADER: Bienvenida / Identidad */}
        <header className="md:col-span-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-teal-200 text-teal-900 grid place-items-center font-semibold ring-1 ring-black/10">
              {centerName.split(" ").map(w => w[0]).join("")}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-[#2f4858]">Bienvenido/a, {managerName}</h1>
              <p className="text-sm text-[#2f4858]/70">{centerName}</p>
            </div>
          </div>
          <span className="text-sm text-[#2f4858]/70 capitalize">{fecha}</span>
        </header>

        {/* Columna principal */}
        <div className="md:col-span-2 min-h-0 space-y-4">
          {/* Resumen del día */}
          <section className="mt-1">
            <h2 className="text-[#2f4858] text-lg font-semibold mb-3">Resumen del día</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <KpiCard color="emerald" icon="pi pi-verified" label="Profesionales activos" value={resumen.profesionalesActivos} />
              <KpiCard color="teal" icon="pi pi-calendar" label="Turnos hoy" value={resumen.turnosHoy} />
              <KpiCard color="cyan" icon="pi pi-users" label="Pacientes hoy" value={resumen.pacientesHoy} />
            </div>
          </section>

          {/* Acceso rápido */}
          <section>
            <h2 className="text-[#2f4858] text-lg font-semibold mb-3">Acceso rápido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <QuickAccessCard title="Profesionales (listado)" href="/profesionales" icon="pi pi-users" />
              <QuickAccessCard title="Agenda por profesional" href="/turnos" icon="pi pi-calendar" />
            </div>
          </section>

          {/* Notificaciones / Alertas (placeholder) */}
          <section>
            <h2 className="text-[#2f4858] text-lg font-semibold mb-3">Notificaciones / Alertas</h2>
            <div className="rounded-2xl bg-white/60 backdrop-blur-[2px] ring-1 ring-black/5 shadow-sm p-4 text-[#2f4858]">
              <div className="flex items-center gap-2">
                <i className="pi pi-bell text-rose-600"></i>
                <span>No hay alertas por el momento</span>
              </div>
              <p className="text-sm text-[#2f4858]/70 mt-1">Aquí se mostrarán las alertas importantes.</p>
            </div>
          </section>
        </div>

        {/* Lateral derecho opcional (espacio vacío por ahora para futuro) */}
        <aside className="space-y-3"></aside>
      </div>
    </div>
  );
}

