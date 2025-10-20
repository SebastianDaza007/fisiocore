'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { DataTableFilterMeta } from 'primereact/datatable';

interface Empleado {
  id_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
  dni_usuario: string;
  email_usuario: string;
  estado: string;
  roles: {
    nombre_rol: string;
  };
}

interface EmpleadoTableProps {
  empleados: Empleado[];
  loading: boolean;
  filters: DataTableFilterMeta;
  globalFilterFields: string[];
  onViewDetails: (empleado: Empleado) => void;
  onEdit: (empleado: Empleado) => void;
}

export default function EmpleadoTable({
  empleados,
  loading,
  filters,
  globalFilterFields,
  onViewDetails,
  onEdit,
}: EmpleadoTableProps) {
  const nombreCompletoTemplate = (rowData: Empleado) => {
    return (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-800">
          {rowData.apellido_usuario}, {rowData.nombre_usuario}
        </span>
      </div>
    );
  };

  const rolTemplate = (rowData: Empleado) => {
    const rolMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'GERENTE': 'Gerente',
      'ADMINISTRATIVO': 'Administrativo',
    };

    const rolLabel = rolMap[rowData.roles.nombre_rol] || rowData.roles.nombre_rol;

    return <span className="text-gray-900">{rolLabel}</span>;
  };

  const estadoTemplate = (rowData: Empleado) => {
    return <span className="text-gray-900">{rowData.estado}</span>;
  };

  const accionesTemplate = (rowData: Empleado) => {
    return (
      <div className="flex gap-1">
        <Button
          icon="pi pi-eye"
          className="p-button-text"
          tooltip="Ver detalles"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onViewDetails(rowData)}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-text"
          tooltip="Editar"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onEdit(rowData)}
        />
      </div>
    );
  };

  return (
    <DataTable
      value={empleados}
      loading={loading}
      paginator
      rows={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
      dataKey="id_usuario"
      filters={filters}
      globalFilterFields={globalFilterFields}
      emptyMessage="No se encontraron empleados"
      stripedRows
      className="p-datatable-sm"
      responsiveLayout="scroll"
    >
      <Column
        field="usuarios.apellido_usuario"
        header="Nombre Completo"
        body={nombreCompletoTemplate}
        sortable
        style={{ minWidth: '200px' }}
      />
      <Column
        field="dni_usuario"
        header="DNI"
        sortable
        style={{ minWidth: '100px' }}
      />
      <Column
        field="email_usuario"
        header="Email"
        sortable
        style={{ minWidth: '200px' }}
      />
      <Column
        field="roles.nombre_rol"
        header="Rol"
        body={rolTemplate}
        sortable
        style={{ minWidth: '150px' }}
      />
      <Column
        field="estado"
        header="Estado"
        body={estadoTemplate}
        sortable
        style={{ minWidth: '100px' }}
      />
      <Column
        header="Acciones"
        body={accionesTemplate}
        exportable={false}
        style={{ minWidth: '100px' }}
      />
    </DataTable>
  );
}
