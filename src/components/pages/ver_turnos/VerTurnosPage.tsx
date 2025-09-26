"use client";

import React from "react";
import CalendarPanel from "./CalendarPanel";
import FiltersBar from "./FiltersBar";
import TurnosTable from "./TurnosTable";
import type { Turno } from "./types";
import type { Option } from "./FiltersBar";

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
    let handler: any;
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
        clearTimeout(handler);
        handler = setTimeout(() => {
          subscribers.forEach((cb) => cb(latest));
        }, 400);
      },
    };
    return api;
    // We want to recreate only when filters.q reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  const [qDebouncedValue, setQDebouncedValue] = React.useState("");
  React.useEffect(() => {
    const unsub = debouncedQ.subscribe(setQDebouncedValue);
    debouncedQ.set(filters.q);
    return () => unsub();
  }, [debouncedQ, filters.q]);

  // Set initial date on client to avoid SSR/client mismatch
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
    // Capitalizar primera letra del día
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

  // Cargar turnos cuando cambie fecha o filtros
  React.useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
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

        const res = await fetch(`/api/ver_turnos?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
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
        if (!mounted) return;
        setItems(data.items ?? []);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") console.error(e);
        if (mounted) {
          setItems([]);
          setErrorMsg("No se pudieron cargar los turnos. Intente nuevamente.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [selectedDate, qDebouncedValue, filters.especialidadId, filters.profesionalId, filters.tipoId, filters.estadoTurnoId]);

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{titulo}</h2>
            </div>
            <FiltersBar
              onClear={() => {
                setSelectedDate(new Date());
                setFilters({ q: "", especialidadId: null, profesionalId: null, tipoId: null, estadoTurnoId: null });
              }}
              value={filters}
              options={options}
              onChange={setFilters}
            />
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
              <TurnosTable items={items} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
