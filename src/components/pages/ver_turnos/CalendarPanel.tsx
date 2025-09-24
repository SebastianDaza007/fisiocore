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
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button label="Agendar turno" icon="pi pi-plus" severity="success" />
      </div>
      <div className="border rounded-xl p-2">
        <Calendar
          value={value ?? undefined}
          onChange={(e) => onChange((e.value as Date) || null)}
          inline
        />
      </div>
      <div className="flex justify-between text-sky-600 text-sm px-1">
        <span>Today</span>
        <span>Clear</span>
      </div>
    </div>
  );
}
