"use client";

import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

export interface Paciente {
  id_paciente: number;
  dni_paciente: string;
  nombre_paciente: string;
  apellido_paciente: string;
  email_paciente?: string | null;
  telefono_paciente?: string | null;
  fecha_nacimiento_paciente?: string | Date | null;
  direccion_paciente?: string | null;
  sexo?: string | null; // opcional en API
}

interface PacienteTableProps {
  pacientes: Paciente[];
  loading: boolean;
  filters: DataTableFilterMeta;
  globalFilterFields: string[];
  onEdit: (paciente: Paciente) => void;
  onView: (paciente: Paciente) => void;
}

function calcularEdad(fecha?: string | Date | null): number | null {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - d.getFullYear();
  const m = hoy.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) edad--;
  return edad;
}

export default function PacienteTable({
  pacientes,
  loading,
  filters,
  globalFilterFields,
  onEdit,
  onView,
}: PacienteTableProps) {
  const nombreDniTemplate = (row: Paciente) => (
    <div className="flex flex-col">
      <span className="font-semibold text-gray-900">
        {row.nombre_paciente} {row.apellido_paciente}
      </span>
      <span className="text-sm text-gray-500">{row.dni_paciente}</span>
    </div>
  );

  const sexoTemplate = (row: Paciente) => (
    <span className="text-gray-900">{row.sexo ?? '-'}</span>
  );

  const edadTemplate = (row: Paciente) => {
    const edad = calcularEdad(row.fecha_nacimiento_paciente);
    return <span className="text-gray-900">{edad ?? '-'}</span>;
  };

  const accionesTemplate = (row: Paciente) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-eye"
        className="p-button-text"
        tooltip="Ver"
        tooltipOptions={{ position: 'top' }}
        onClick={() => onView(row)}
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-text"
        tooltip="Editar"
        tooltipOptions={{ position: 'top' }}
        onClick={() => onEdit(row)}
      />
    </div>
  );

  return (
    <DataTable
      value={pacientes}
      loading={loading}
      globalFilterFields={globalFilterFields}
      filters={filters}
      emptyMessage="No se encontraron pacientes"
      paginator
      rows={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
      className="p-datatable-gridlines"
      stripedRows
      scrollable
    >
      <Column headerStyle={{ width: '3rem' }} body={(_, { rowIndex }) => <span>{rowIndex! + 1}</span>} />
      <Column
        field="nombre_paciente"
        header="Nombre y DNI del paciente"
        body={nombreDniTemplate}
        sortable
        style={{ minWidth: '260px' }}
      />
      <Column field="sexo" header="Sexo" body={sexoTemplate} style={{ minWidth: '120px' }} />
      <Column header="Edad" body={edadTemplate} style={{ minWidth: '100px' }} />
      <Column header="Acciones" body={accionesTemplate} exportable={false} style={{ minWidth: '140px' }} />
    </DataTable>
  );
}
