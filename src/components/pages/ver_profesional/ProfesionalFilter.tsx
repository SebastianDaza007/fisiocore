"use client";

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { FilterMatchMode } from 'primereact/api';

interface ProfesionalFilterProps {
  globalFilterValue: string;
  filters: any;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  onEspecialidadFilterChange: (value: string | null) => void;
  onEstadoFilterChange: (value: string | null) => void;
  onClearFilters: () => void;
  especialidadFilter: string | null;
  estadoFilter: string | null;
  availableEspecialidades?: string[];
}

export default function ProfesionalFilter({
  globalFilterValue,
  filters,
  onGlobalFilterChange,
  onRefresh,
  onEspecialidadFilterChange,
  onEstadoFilterChange,
  onClearFilters,
  especialidadFilter,
  estadoFilter,
  availableEspecialidades = []
}: ProfesionalFilterProps) {

  const especialidadOptions = [
    { label: 'Todas las especialidades', value: null },
    ...availableEspecialidades.map(especialidad => ({
      label: especialidad,
      value: especialidad
    }))
  ];

  const estadoOptions = [
    { label: 'Todos los estados', value: null },
    { label: 'Activo', value: 'Activo' },
    { label: 'Inactivo', value: 'Inactivo' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Título */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Listado de Profesionales</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona y consulta información de los profesionales del centro
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
          {/* Búsqueda global */}
          <div className="flex-1 lg:flex-initial">
            <span className="p-input-icon-left">
              <i className="pi pi-search text-gray-800" style={{ paddingLeft: '1rem' }} />
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Buscar por nombre, apellido, DNI..."
                className="w-full lg:w-80"
                style={{ paddingLeft: '2.5rem' }} 
              />
            </span>
          </div>

          {/* Filtro por especialidad */}
          <div className="w-full sm:w-48">
            <Dropdown
              value={especialidadFilter}
              options={especialidadOptions}
              onChange={(e) => onEspecialidadFilterChange(e.value)}
              placeholder="Especialidad"
              className="w-full"
              showClear
            />
          </div>

          {/* Filtro por estado */}
          <div className="w-full sm:w-40">
            <Dropdown
              value={estadoFilter}
              options={estadoOptions}
              onChange={(e) => onEstadoFilterChange(e.value)}
              placeholder="Estado"
              className="w-full"
              showClear
            />
          </div>

          {/* Botón limpiar filtros */}
          <Button
            icon="pi pi-filter-slash"
            onClick={onClearFilters}
            tooltip="Limpiar filtros"
            className="p-button-outlined p-button-secondary"
          />

          {/* Botón refrescar */}
          <Button
            icon="pi pi-refresh"
            onClick={onRefresh}
            tooltip="Actualizar lista"
            className="p-button-outlined"
          />
        </div>
      </div>
    </div>
  );
}