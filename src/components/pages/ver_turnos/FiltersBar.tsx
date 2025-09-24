"use client";

import React from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Button from "@/components/common/button";

export type Option = { label: string; value: string };

type Props = {
  onClear: () => void;
};

export default function FiltersBar({ onClear }: Props) {
  const [q, setQ] = React.useState("");
  const [especialidad, setEspecialidad] = React.useState<string | null>(null);
  const [profesional, setProfesional] = React.useState<string | null>(null);
  const [tipo, setTipo] = React.useState<string | null>(null);

  const opciones: Option[] = [
    { label: "Todos", value: "" },
    { label: "Kinesiologo", value: "kinesiologo" },
    { label: "Fisioterapeuta", value: "fisioterapeuta" },
  ];

  const profesionales: Option[] = [
    { label: "Dr. Lautaro Papiruna", value: "papiruna" },
    { label: "Dra. Musa Rella", value: "rella" },
  ];

  const tipos: Option[] = [
    { label: "Tratamiento", value: "tratamiento" },
    { label: "Otra Consulta", value: "otra" },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="DNI Paciente"
          className="h-10"
        />
      </span>
      <Dropdown
        value={especialidad ?? ""}
        options={opciones}
        onChange={(e) => setEspecialidad(e.value as string)}
        placeholder="Especialidad"
        className="min-w-48 h-10"
      />
      <Dropdown
        value={profesional ?? ""}
        options={profesionales}
        onChange={(e) => setProfesional(e.value as string)}
        placeholder="Profesional"
        className="min-w-48 h-10"
      />
      <Dropdown
        value={tipo ?? ""}
        options={tipos}
        onChange={(e) => setTipo(e.value as string)}
        placeholder="Tipo de Consulta"
        className="min-w-48 h-10"
      />
      <Button
        label="Limpiar Filtros"
        icon="pi pi-filter-slash"
        onClick={onClear}
        severity="secondary"
      />
      <Button icon="pi pi-refresh" aria-label="refresh" outlined />
    </div>
  );
}
