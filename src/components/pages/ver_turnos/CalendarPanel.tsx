"use client";

import React from "react";
import { Calendar } from "primereact/calendar";
import { addLocale, locale as setLocale } from "primereact/api";

type Props = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export default function CalendarPanel({ value, onChange }: Props) {
  React.useEffect(() => {
    // Configurar locale en español con abreviaturas personalizadas L, M, X, J, V, S, D
    addLocale("es-turnos", {
      firstDayOfWeek: 1,
      dayNames: [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
      ],
      dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
      // Orden requerido por PrimeReact comienza en domingo; con firstDayOfWeek=1, se mostrará iniciando en lunes
      dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
      monthNames: [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ],
      monthNamesShort: [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sep",
        "oct",
        "nov",
        "dic",
      ],
      today: "Hoy",
      clear: "Limpiar",
    });
    setLocale("es-turnos");
  }, []);

  const dateTemplate = (date: any) => {
    const isToday = date.today;
    const isOtherMonth = date.otherMonth;
    const isSelected =
      value &&
      date.day === value.getDate() &&
      date.month === value.getMonth() &&
      date.year === value.getFullYear();

    const base = "w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors";
    let classes = "text-gray-700";
    if (isOtherMonth) classes += " opacity-40";
    if (isSelected) classes += " bg-sky-600 text-white shadow";
    else if (isToday) classes += " ring-2 ring-sky-300";

    return <div className={`${base} ${classes}`}>{date.day}</div>;
  };
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-4 text-gray-800">
      <div className="bg-gray-50 rounded-xl p-2 flex-1">
        <Calendar
          value={value ?? undefined}
          onChange={(e) => onChange((e.value as Date) || null)}
          className="w-full"
          dateFormat="dd/mm/yy"
          dateTemplate={dateTemplate}
          inline
        />
      </div>
      <div className="flex justify-between px-1 text-sm">
        <button
          type="button"
          onClick={() => onChange(new Date())}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-teal-500 text-white shadow hover:bg-teal-600 active:bg-teal-700 transition-colors"
        >
          <i className="pi pi-calendar" />
          <span className="font-medium">Hoy</span>
        </button>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-600 text-white shadow hover:bg-slate-700 active:bg-slate-800 transition-colors"
        >
          <i className="pi pi-times" />
          <span className="font-medium">Limpiar</span>
        </button>
      </div>
    </div>
  );
}
