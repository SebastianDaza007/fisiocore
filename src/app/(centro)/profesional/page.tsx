"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";

// ---------- UI helpers (simple cards) ----------
function KpiCard({ color, icon, label, value }: { color: "emerald" | "teal" | "cyan" | "rose"; icon: string; label: string; value: number; }) {
  const cardBg: Record<string, string> = {
    emerald: "from-emerald-50 to-emerald-25",
    teal: "from-teal-50 to-teal-25",
    cyan: "from-cyan-50 to-cyan-25",
    rose: "from-rose-50 to-rose-25",
  };
  const textColor: Record<string, string> = {
    emerald: "text-emerald-700",
    teal: "text-teal-700",
    cyan: "text-cyan-700",
    rose: "text-rose-700",
  };
  const iconBg: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    teal: "bg-teal-100 text-teal-700",
    cyan: "bg-cyan-100 text-cyan-700",
    rose: "bg-rose-100 text-rose-700",
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

function Panel({ title, icon, color, children }: { title: string; icon: string; color: "emerald" | "teal" | "rose" | "blue"; children: React.ReactNode; }) {
  const headerColor: Record<string, string> = {
    emerald: "text-emerald-700",
    teal: "text-teal-700",
    rose: "text-rose-700",
    blue: "text-blue-700",
  };
  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-[2px] ring-1 ring-black/5 shadow-sm p-4">
      <div className={`flex items-center gap-2 mb-2 ${headerColor[color]}`}>
        <i className={`${icon}`}></i>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="list-none pl-0 m-0 space-y-1">{children}</ul>
    </div>
  );
}

interface ResumenData {
  resumen: {
    pacientesHoy: number;
    completados: number;
    pendientes: number;
    alertas: number;
  };
  proximosTurnos: Array<{ id: number; texto: string; icon: string }>;
  pacientesEnEspera: Array<{ id: number; texto: string; icon: string }>;
}

export default function HomeAdministradorPage() {
  const [mounted, setMounted] = React.useState(false);
  const [data, setData] = React.useState<ResumenData>({
    resumen: {
      pacientesHoy: 0,
      completados: 0,
      pendientes: 0,
      alertas: 0,
    },
    proximosTurnos: [],
    pacientesEnEspera: [],
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Cargar datos del día
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/profesional/home");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Error al cargar datos del día:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const { resumen, proximosTurnos, pacientesEnEspera } = data;

  // href genérico: reemplazar cada "#" por el path real cuando esté definido
  const cards = [
    {
      title: "Ver Turnos",
      href: "/profesional/agenda_turnos",
      icon: "pi pi-calendar-plus",
      image: "/images/calendario.jpg",
      spanCols: 1,
    },
    {
      title: "Historia clinica",
      href: "/desarrollo",
      icon: "pi pi-users",
      image: "/images/gestionar%20profesionales.jpg",
      spanCols: 1,
    },
    {
      title: "Reportes",
      href: "/profesional/reportes",
      icon: "pi pi-chart-line",
      image: "/images/statsprof.svg", 
      spanCols: 2,
    },
  ] as const;
  const today = new Date();
  const fecha = today.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" });

  return (
    <div className="h-full w-full overflow-hidden px-4 md:px-6 lg:px-8 py-4 bg-[#f5eef7]">
      <div className="max-w-7xl h-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <header className="md:col-span-3 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold text-[#2f4858]">Panel Profesional</h1>
          <span className="text-sm text-[#2f4858]/70 capitalize">{fecha}</span>
        </header>
        {/* MAIN COLUMN */}
        <div className="md:col-span-2 min-h-0 space-y-4">
          {/* Resumen del día */}
          <section className="mt-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[#2f4858] text-lg font-semibold">Resumen del día</h2>
              {loading && (
                <i className="pi pi-spin pi-spinner text-teal-600 text-sm"></i>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <KpiCard color="emerald" icon="pi pi-calendar" label="Pacientes Hoy" value={resumen.pacientesHoy} />
              <KpiCard color="teal" icon="pi pi-users" label="Completados" value={resumen.completados} />
              <KpiCard color="cyan" icon="pi pi-refresh" label="Pendientes" value={resumen.pendientes} />
            </div>
          </section>
          {/* Accesos principales (tus 3 tarjetas con imagen) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-h-0">
            {cards.map((c, idx) => (
              <Link
                key={idx}
                href={c.href}
                className={`group relative rounded-3xl overflow-hidden bg-gray-50/60 backdrop-blur-[2px] cursor-pointer ${
                  c.spanCols === 2 ? "md:col-span-2" : ""
                } shadow-lg ring-1 ring-white/40 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/60 hover:shadow-2xl hover:ring-teal-300/50 hover:-translate-y-1 hover:scale-[1.01]`}
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <div className="absolute inset-0">
                  {/* Wash suave */}
                  <div className="pointer-events-none absolute inset-0 bg-white/30 md:bg-white/25" />
                  {/* Sheen + vignette overlays to improve perceived depth while keeping image visible */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/40 via-white/10 to-transparent opacity-70" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
                </div>
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  className="object-cover opacity-100 transition-opacity duration-300"
                  style={{ filter: "saturate(0.88) brightness(0.97)" }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
                  priority={idx === 0}
                />

                {/* Content overlay */}
                <div
                  className={`relative flex items-center justify-center gap-3 md:gap-5 h-40 md:h-48 lg:h-52 px-6 md:px-8 transition-all duration-500 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                >
                  <i className={`${c.icon} text-3xl md:text-4xl lg:text-5xl text-[#1f6f69] drop-shadow-sm group-hover:scale-110 transition-transform duration-300`} style={{ fontSize: "3rem" }} ></i>
                  <span className="text-[#1f6f69] group-hover:text-[#155e57] text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm text-center transition-colors">
                    {c.title}
                  </span>
                </div>

                {/* subtle bottom gradient accent */}
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400/80 via-teal-400/70 to-cyan-400/80 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>

          {/* (Se movieron las estadísticas al sidebar derecho) */}
        </div>

        {/* SIDEBAR DERECHO */}
        <aside className="md:sticky md:top-4 space-y-3 max-h-[calc(100vh-7rem)] overflow-auto pr-1 md:mt-[40px]">
          <Panel title="Sala de espera" icon="pi pi-users" color="teal">
            {pacientesEnEspera.length > 0 ? (
              pacientesEnEspera.map(p => (
                <li key={p.id} className="flex items-center gap-2 py-1 text-sm text-[#2f4858] truncate">
                  <i className={`${p.icon} text-teal-600`}></i>
                  <span>{p.texto}</span>
                </li>
              ))
            ) : (
              <li className="py-1 text-sm text-[#2f4858]/60 italic">No hay pacientes esperando</li>
            )}
          </Panel>
          <Panel title="Próximos turnos" icon="pi pi-clock" color="emerald">
            {proximosTurnos.length > 0 ? (
              proximosTurnos.map(r => (
                <li key={r.id} className="flex items-center gap-2 py-1 text-sm text-[#2f4858] truncate">
                  <i className={`${r.icon} text-emerald-600`}></i>
                  <span>{r.texto}</span>
                </li>
              ))
            ) : (
              <li className="py-1 text-sm text-[#2f4858]/60 italic">No hay turnos próximos hoy</li>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}