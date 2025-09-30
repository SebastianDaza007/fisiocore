"use client";

import React from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Button from "@/components/common/button";

export type Option = { label: string; value: string };

type Props = {
  onClear: () => void;
  onRefresh?: () => void;
  value: {
    q: string;
    especialidadId: string | null;
    profesionalId: string | null;
    tipoId: string | null;
    estadoTurnoId: string | null;
  };
  options: {
    especialidades: Option[];
    profesionales: Option[];
    tipos: Option[];
    estados: Option[];
  };
  onChange: (next: Props["value"]) => void;
};

export default function FiltersBar({ onClear, onRefresh, value, options, onChange }: Props) {
  const { q, especialidadId, profesionalId, tipoId, estadoTurnoId } = value;
  const handleChange = (patch: Partial<Props["value"]>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="flex flex-wrap gap-3 items-center w-full">
      <span className="p-input-icon-left">
        <i className="pi pi-search" style={{ left: "1rem" }} />
        <InputText
          value={q}
          onChange={(e) => handleChange({ q: e.target.value })}
          placeholder="DNI Paciente"
          className="h-10 text-gray-800 rounded-lg shadow-sm border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          style={{ paddingLeft: "2.5rem" }}
        />
      </span>
      <Dropdown
        value={especialidadId}
        options={options.especialidades}
        onChange={(e) => handleChange({ especialidadId: e.value || null })}
        placeholder="Especialidad"
        className="min-w-48 h-10 text-gray-800 rounded-lg shadow-sm border border-gray-200 focus:outline-none"
        showClear
      />
      <Dropdown
        value={profesionalId}
        options={options.profesionales}
        onChange={(e) => handleChange({ profesionalId: e.value || null })}
        placeholder="Profesional"
        className="min-w-48 h-10 text-gray-800 rounded-lg shadow-sm border border-gray-200 focus:outline-none"
        filter
        filterBy="label"
        showClear
      />
      <Dropdown
        value={tipoId}
        options={options.tipos}
        onChange={(e) => handleChange({ tipoId: e.value || null })}
        placeholder="Tipo de Consulta"
        className="min-w-48 h-10 text-gray-800 rounded-lg shadow-sm border border-gray-200 focus:outline-none"
        showClear
      />
      <Dropdown
        value={estadoTurnoId}
        options={options.estados}
        onChange={(e) => handleChange({ estadoTurnoId: e.value || null })}
        placeholder="Estado del turno"
        className="min-w-48 h-10 text-gray-800 rounded-lg shadow-sm border border-gray-200 focus:outline-none"
        showClear
      />
      <Button
        label="Limpiar Filtros"
        icon="pi pi-filter-slash"
        onClick={onClear}
        severity="secondary"
      />
      {onRefresh && (
        <Button
          icon="pi pi-refresh"
          aria-label="refresh"
          onClick={onRefresh}
          outlined
        />
      )}
    </div>
  );
}
