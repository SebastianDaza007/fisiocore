"use client";

import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

interface Profesional {
  id_profesional: number;
  matricula_profesional: string;
  estado: string;
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
  filters: DataTableFilterMeta;
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

  const nombreCompletoTemplate = (rowData: Profesional) => {
    return (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">
          {rowData.usuarios.nombre_usuario} {rowData.usuarios.apellido_usuario}
        </span>
        <span className="text-sm text-gray-500">DNI: {rowData.usuarios.dni_usuario}</span>
      </div>
    );
  };

  const especialidadTemplate = (rowData: Profesional) => {
    return (
      <span className="text-gray-900">
        {rowData.especialidades.nombre_especialidad}
      </span>
    );
  };

  const obraSocialTemplate = (rowData: Profesional) => {
    return (
      <div className="flex flex-col gap-1">
        {rowData.profesionales_por_obras_sociales.map((relacion, index) => (
          <span key={index} className="text-gray-900">
            {relacion.obras_sociales.nombre_obra_social}
          </span>
        ))}
      </div>
    );
  };

  const estadoTemplate = (rowData: Profesional) => {
    return (
      <span className="text-gray-900">
        {rowData.estado}
      </span>
    );
  };

  const accionesTemplate = (rowData: Profesional) => {
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
    <>
      <style jsx global>{`
        .profesional-table .p-paginator .p-paginator-current {
          background-color: transparent !important;
          color: #1f2937 !important;
          font-weight: 500;
        }
        .profesional-table .p-paginator {
          color: #1f2937 !important;
        }
        .profesional-table .p-paginator .p-paginator-pages .p-paginator-page {
          color: #1f2937 !important;
        }
        .profesional-table .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
          background-color: #0c645a !important;
          color: white !important;
        }
      `}</style>
      <DataTable
        value={profesionales}
        loading={loading}
        globalFilterFields={globalFilterFields}
        filters={filters}
        emptyMessage="No se encontraron profesionales"
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        className="p-datatable-gridlines profesional-table"
        stripedRows
        scrollable
      >
      <Column
        field="usuarios.nombre_usuario"
        header="Nombre del Profesional"
        body={nombreCompletoTemplate}
        sortable
        style={{ minWidth: '250px' }}
      />
      <Column
        field="especialidades.nombre_especialidad"
        header="Especialidad"
        body={especialidadTemplate}
        style={{ minWidth: '150px' }}
      />
      <Column
        header="Obra Social"
        body={obraSocialTemplate}
        style={{ minWidth: '200px' }}
      />
      <Column
        field="estado"
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
    </>
  );
}