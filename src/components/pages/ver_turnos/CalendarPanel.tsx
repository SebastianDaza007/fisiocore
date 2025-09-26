"use client";

import React from "react";
import { Calendar } from "primereact/calendar";
import Button from "@/components/common/button";

type Props = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export default function CalendarPanel({ value, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-4 text-gray-800">
      <div className="flex items-center justify-between">
        <Button label="Agendar turno" icon="pi pi-plus" severity="success" />
      </div>
      <div className="border rounded-xl p-2 flex-1">
        <Calendar
          value={value ?? undefined}
          onChange={(e) => onChange((e.value as Date) || null)}
          className="w-full"
          inline
        />
      </div>
      <div className="flex justify-between text-sky-700 text-sm px-1">
        <button type="button" onClick={() => onChange(new Date())} className="hover:underline">
          Hoy
        </button>
        <button type="button" onClick={() => onChange(null)} className="hover:underline">
          Limpiar
        </button>
      </div>
    </div>
  );
}
