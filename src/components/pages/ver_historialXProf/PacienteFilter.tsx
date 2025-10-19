"use client";

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

interface PacienteFilterProps {
  globalFilterValue: string;
  sexoFilter: string | null;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSexoFilterChange: (value: string | null) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
}

export default function PacienteFilter({
  globalFilterValue,
  sexoFilter,
  onGlobalFilterChange,
  onSexoFilterChange,
  onClearFilters,
  onRefresh,
}: PacienteFilterProps) {
  const sexoOptions = [
    { label: 'Masculino', value: 'Masculino' },
    { label: 'Femenino', value: 'Femenino' },
    { label: 'Otro', value: 'Otro' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-stretch sm:items-center">
          <div className="flex-1">
            <span className="p-input-icon-left">
              <i className="pi pi-search text-gray-800" style={{ paddingLeft: '1rem' }} />
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="DNI - Nombre"
                className="w-full"
                style={{ paddingLeft: '2.5rem' }}
              />
            </span>
          </div>

          <div className="w-full sm:w-48">
            <Dropdown
              value={sexoFilter}
              options={sexoOptions}
              onChange={(e) => onSexoFilterChange(e.value)}
              placeholder="Sexo"
              className="w-full"
              showClear
            />
          </div>

          <Button
            icon="pi pi-filter-slash"
            label="Limpiar Filtros"
            onClick={onClearFilters}
            className="p-button-outlined p-button-secondary w-full sm:w-auto"
          />

          <Button
            icon="pi pi-refresh"
            onClick={onRefresh}
            className="p-button-outlined w-full sm:w-auto"
            tooltip="Actualizar lista"
          />
        </div>
      </div>
    </div>
  );
}
