"use client";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';

interface Profesional {
  id_profesional: number;
  matricula_profesional: string;
  usuarios: {
    nombre_usuario: string;
    apellido_usuario: string;
    dni_usuario: string;
    email_usuario: string;
  };
  especialidades: {
    nombre_especialidad: string;
  };
  horarios_profesionales: Array<{
    dias_semana: {
      nombre_dia: string;
    };
    hora_inicio: string;
    hora_fin: string;
    duracion_turno: number;
  }>;
  profesionales_por_obras_sociales: Array<{
    obras_sociales: {
      nombre_obra_social: string;
    };
  }>;
}

interface ProfesionalTableProps {
  profesionales: Profesional[];
  loading: boolean;
  filters: any;
  globalFilterFields: string[];
  onViewDetails: (profesional: Profesional) => void;
  onEdit: (profesional: Profesional) => void;
}

export default function ProfesionalTable({
  profesionales,
  loading,
  filters,
  globalFilterFields,
  onViewDetails,
  onEdit
}: ProfesionalTableProps) {

  const nombreTemplate = (rowData: Profesional) => {
    return (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">
          {rowData.usuarios.nombre_usuario}
        </span>
        <span className="text-sm text-gray-500">DNI: {rowData.usuarios.dni_usuario}</span>
      </div>
    );
  };

  const apellidoTemplate = (rowData: Profesional) => {
    return (
      <span className="font-medium text-gray-800">
        {rowData.usuarios.apellido_usuario}
      </span>
    );
  };

  const especialidadTemplate = (rowData: Profesional) => {
    return (
      <Badge
        value={rowData.especialidades.nombre_especialidad}
        severity="success"
        className="text-sm"
      />
    );
  };

  const obraSocialTemplate = (rowData: Profesional) => {
    return (
      <div className="flex flex-col gap-1">
        {rowData.profesionales_por_obras_sociales.map((relacion, index) => (
          <Badge
            key={index}
            value={relacion.obras_sociales.nombre_obra_social}
            severity="warning"
            className="text-xs mr-1 mb-1"
          />
        ))}
      </div>
    );
  };

  const estadoTemplate = () => {
    return (
      <Badge
        value="Activo"
        severity="success"
        className="text-sm"
      />
    );
  };

  const accionesTemplate = (rowData: Profesional) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-outlined p-button-info p-button-sm"
          tooltip="Ver detalles"
          onClick={() => onViewDetails(rowData)}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-outlined p-button-warning p-button-sm"
          tooltip="Editar"
          onClick={() => onEdit(rowData)}
        />
      </div>
    );
  };

  return (
    <DataTable
      value={profesionales}
      loading={loading}
      globalFilterFields={globalFilterFields}
      filters={filters}
      emptyMessage="No se encontraron profesionales"
      paginator
      rows={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
      className="p-datatable-gridlines"
      stripedRows
      scrollable
    >
      <Column
        field="usuarios.nombre_usuario"
        header="Nombre"
        body={nombreTemplate}
        sortable
        style={{ minWidth: '180px' }}
      />
      <Column
        field="usuarios.apellido_usuario"
        header="Apellido"
        body={apellidoTemplate}
        sortable
        style={{ minWidth: '150px' }}
      />
      <Column
        field="especialidades.nombre_especialidad"
        header="Especialidad"
        body={especialidadTemplate}
        sortable
        style={{ minWidth: '150px' }}
      />
      <Column
        header="Obra Social"
        body={obraSocialTemplate}
        style={{ minWidth: '200px' }}
      />
      <Column
        header="Estado"
        body={estadoTemplate}
        style={{ minWidth: '100px' }}
      />
      <Column
        header="Acciones"
        body={accionesTemplate}
        exportable={false}
        style={{ minWidth: '120px' }}
      />
    </DataTable>
  );
}