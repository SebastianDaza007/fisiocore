"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function HomeAdministradorPage() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const cards = [
    {
      title: "Agendar turnos",
      href: "/agendar",
      icon: "pi pi-calendar-plus",
      image: "/images/calendario.jpg",
      spanCols: 1,
    },
    {
      title: "Gestionar profesionales",
      href: "/profesionales",
      icon: "pi pi-users",
      image: "/images/gestionar%20profesionales.jpg",
      spanCols: 1,
    },
    {
      title: "Calendario de turnos",
      href: "/turnos",
      icon: "pi pi-calendar",
      image: "/images/agendar%20turno.jpg",
      spanCols: 2,
    },
  ] as const;

  return (
    <div className="min-h-full w-full px-4 py-6 bg-[#f5eef7] flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mx-auto">
          {cards.map((c, idx) => (
            <Link
              key={idx}
              href={c.href}
              className={`group relative rounded-3xl overflow-hidden bg-gray-50/60 backdrop-blur-[2px] cursor-pointer ${
                c.spanCols === 2 ? "md:col-span-2" : ""
              } shadow-lg ring-1 ring-white/40 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/60 hover:shadow-2xl hover:ring-teal-300/50 hover:-translate-y-1 hover:scale-[1.01]`}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              {/* Background image */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gray-200" />
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  className="object-cover opacity-100 transition-opacity duration-300"
                  style={{ filter: "saturate(0.9) brightness(0.96)" }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
                  priority={idx === 0}
                />
                {/* Soft wash to match reference look: subtle white veil + tiny blur for legibility */}
                <div className="pointer-events-none absolute inset-0 bg-white/35 md:bg-white/30 backdrop-blur-[1px]" />
                {/* Sheen + vignette overlays to improve perceived depth while keeping image visible */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/40 via-white/10 to-transparent opacity-80" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
              </div>

              {/* Content overlay */}
              <div
                className={`relative flex items-center justify-center gap-3 md:gap-5 h-48 md:h-56 lg:h-60 px-8 md:px-10 transition-all duration-500 ${
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
      </div>
    </div>
  );
}

