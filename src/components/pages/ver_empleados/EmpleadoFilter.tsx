'use client';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTableFilterMeta } from 'primereact/datatable';

interface EmpleadoFilterProps {
  globalFilterValue: string;
  filters: DataTableFilterMeta;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  onRolFilterChange: (value: string | null) => void;
  onEstadoFilterChange: (value: string | null) => void;
  onClearFilters: () => void;
  rolFilter: string | null;
  estadoFilter: string | null;
  availableRoles: string[];
}

export default function EmpleadoFilter({
  globalFilterValue,
  onGlobalFilterChange,
  onRefresh,
  onRolFilterChange,
  onEstadoFilterChange,
  onClearFilters,
  rolFilter,
  estadoFilter,
  availableRoles,
}: EmpleadoFilterProps) {
  const rolesOptions = availableRoles.map(rol => ({
    label: rol === 'ADMIN' ? 'Administrador' :
           rol === 'GERENTE' ? 'Gerente' :
           rol === 'ADMINISTRATIVO' ? 'Administrativo' : rol,
    value: rol
  }));

  const estadosOptions = [
    { label: 'Activo', value: 'Activo' },
    { label: 'Inactivo', value: 'Inactivo' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Búsqueda Global */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Búsqueda General
          </label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Nombre, DNI..."
              className="w-full"
            />
          </span>
        </div>

        {/* Filtro por Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rol
          </label>
          <Dropdown
            value={rolFilter}
            onChange={(e) => onRolFilterChange(e.value)}
            options={rolesOptions}
            placeholder="Todos los roles"
            className="w-full"
            showClear
          />
        </div>

        {/* Filtro por Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <Dropdown
            value={estadoFilter}
            onChange={(e) => onEstadoFilterChange(e.value)}
            options={estadosOptions}
            placeholder="Todos"
            className="w-full"
            showClear
          />
        </div>

        {/* Botones de acción */}
        <div className="flex items-end gap-2">
          <Button
            type="button"
            icon="pi pi-filter-slash"
            label="Limpiar"
            outlined
            onClick={onClearFilters}
            className="flex-1"
          />
          <Button
            type="button"
            icon="pi pi-refresh"
            outlined
            onClick={onRefresh}
            tooltip="Recargar"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
    </div>
  );
}
