"use client";

import React from "react";
import CalendarPanel from "./CalendarPanel";
import FiltersBar from "./FiltersBar";
import TurnosTable from "./TurnosTable";
import Button from "@/components/common/button";

export default function VerTurnosPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());

  const titulo = React.useMemo(() => {
    const d = selectedDate ?? new Date();
    const formatter = new Intl.DateTimeFormat("es-AR", {
      weekday: "long",
      day: "numeric",
    });
    const texto = formatter.format(d);
    // Capitalizar primera letra del día
    return `Turnos para ${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;
  }, [selectedDate]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <CalendarPanel value={selectedDate} onChange={setSelectedDate} />
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{titulo}</h2>
              <Button label="Turnos vencidos" severity="danger" />
            </div>
            <FiltersBar onClear={() => setSelectedDate(new Date())} />
          </div>
          <div className="mt-4">
            <TurnosTable />
          </div>
        </div>
      </div>
    </div>
  );
}
