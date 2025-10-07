"use client";

import React from "react";
import CalendarPanel from "./CalendarPanel";
import FiltersBar from "./FiltersBar";
import TurnosTable from "./TurnosTable";
import type { Turno } from "./types";
import type { Option } from "./FiltersBar";
import Button from "@/components/common/button";

export default function VerTurnosPage() {
  const [mounted, setMounted] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [items, setItems] = React.useState<Turno[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState({
    q: "",
    especialidadId: null as string | null,
    profesionalId: null as string | null,
    tipoId: null as string | null,
    estadoTurnoId: null as string | null,
  });
  const [options, setOptions] = React.useState<{
    especialidades: Option[];
    profesionales: Option[];
    tipos: Option[];
    estados: Option[];
  }>({ especialidades: [], profesionales: [], tipos: [], estados: [] });

  // Debounce para el campo DNI (q)
  const debouncedQ = React.useMemo(() => {
    let handler: ReturnType<typeof setTimeout> | null = null;
    let latest = filters.q;
    const subscribers: Array<(v: string) => void> = [];
    const api = {
      subscribe(cb: (v: string) => void) {
        subscribers.push(cb);
        return () => {
          const idx = subscribers.indexOf(cb);
          if (idx >= 0) subscribers.splice(idx, 1);
        };
      },
      set(value: string) {
        latest = value;
        if (handler) clearTimeout(handler);
        handler = setTimeout(() => {
          subscribers.forEach((cb) => cb(latest));
        }, 400);
      },
    };
    return api;
  }, [filters.q]);

  const [qDebouncedValue, setQDebouncedValue] = React.useState("");
  React.useEffect(() => {
    const unsub = debouncedQ.subscribe(setQDebouncedValue);
    debouncedQ.set(filters.q);
    return () => unsub();
  }, [debouncedQ, filters.q]);

  // Set initial date on client
  React.useEffect(() => {
    setMounted(true);
    setSelectedDate(new Date());
  }, []);

  const titulo = React.useMemo(() => {
    if (!mounted) return "Turnos";
    const d = selectedDate ?? new Date();
    const formatter = new Intl.DateTimeFormat("es-AR", {
      weekday: "long",
      day: "numeric",
    });
    const texto = formatter.format(d);
    return `Turnos para ${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;
  }, [mounted, selectedDate]);

  // Cargar meta (opciones de filtros)
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/ver_turnos/meta", { cache: "no-store" });
        if (!res.ok) throw new Error("Error meta");
        const data = await res.json();
        if (!mounted) return;
        setOptions({
          especialidades: [{ label: "Todos", value: "" }, ...data.especialidades],
          profesionales: [{ label: "Todos", value: "" }, ...data.profesionales],
          tipos: [{ label: "Todos", value: "" }, ...data.tipos],
          estados: [{ label: "Todos", value: "" }, ...(data.estados ?? [])],
        });
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ⬇️ NUEVO: función load reutilizable
  const load = React.useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setErrorMsg(null);
      try {
        const params = new URLSearchParams();
        if (selectedDate) {
          const y = selectedDate.getFullYear();
          const m = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
          const d = selectedDate.getDate().toString().padStart(2, "0");
          params.set("date", `${y}-${m}-${d}`);
        }
        if (qDebouncedValue) params.set("q", qDebouncedValue);
        if (filters.especialidadId) params.set("especialidadId", filters.especialidadId);
        if (filters.profesionalId) params.set("profesionalId", filters.profesionalId);
        if (filters.tipoId) params.set("tipoId", filters.tipoId);
        if (filters.estadoTurnoId) params.set("estadoTurnoId", filters.estadoTurnoId);

        const res = await fetch(`/api/ver_turnos?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) {
          let details = "";
          try {
            const err = await res.json();
            details = err?.details || err?.error || "";
          } catch {}
          console.error("Error turnos", details);
          throw new Error("Error turnos");
        }
        const data = await res.json();
        setItems(data.items ?? []);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          // nada
        } else {
          console.error(e);
        }
        setItems([]);
        setErrorMsg("No se pudieron cargar los turnos. Intente nuevamente.");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [selectedDate, qDebouncedValue, filters]
  );

  // Cargar turnos cuando cambie fecha o filtros
  React.useEffect(() => {
    const controller = new AbortController();

    // Primera carga con spinner
    load(true);

    // Polling cada 3 segundos (sin spinner)
    const interval = setInterval(() => load(false), 3000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [selectedDate, qDebouncedValue, filters, load]);

  // Actualizar estado de turno
  async function handleChangeEstado(id: number, estado: string) {
    try {
      const res = await fetch(`/api/turnos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      const data = await res.json();
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, estado: data.estado } : t)));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          {mounted ? (
            <CalendarPanel value={selectedDate} onChange={setSelectedDate} />
          ) : (
            <div className="bg-white rounded-xl shadow p-4 h-[360px]" />
          )}
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-4 text-gray-900">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900">{titulo}</h2>
              <div className="flex items-center gap-2">
                <Button label="Agendar turno" icon="pi pi-plus" severity="success" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-1">
              <FiltersBar
                onClear={() => {
                  setSelectedDate(new Date());
                  setFilters({
                    q: "",
                    especialidadId: null,
                    profesionalId: null,
                    tipoId: null,
                    estadoTurnoId: null,
                  });
                }}
                onRefresh={() => load(true)}
                value={filters}
                options={options}
                onChange={setFilters}
              />
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                Cargando turnos...
              </div>
            ) : errorMsg ? (
              <div className="bg-white rounded-xl shadow p-4 text-red-700 border border-red-200">
                {errorMsg}
              </div>
            ) : (
              <TurnosTable items={items} onChangeEstado={handleChangeEstado} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
