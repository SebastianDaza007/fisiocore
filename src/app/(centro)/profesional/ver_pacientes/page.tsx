"use client";

import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api';
import { DataTableFilterMeta } from 'primereact/datatable';
import PacienteFilter from '../../../../components/pages/ver_historialXProf/PacienteFilter';
import PacienteTable, { Paciente } from '../../../../components/pages/ver_historialXProf/PacienteTable';
import PacienteEditDialog from '../../../../components/pages/ver_historialXProf/PacienteEditDialog';
import { VerHistorialDialog } from '../historial clinico/ver_historial/modal';

export default function VerPacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editPaciente, setEditPaciente] = useState<Paciente | null>(null);
  const [pacienteInfo, setPacienteInfo] = useState<any>(null);

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [sexoFilter, setSexoFilter] = useState<string | null>(null);

  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    sexo: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
  });

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      // Usa el endpoint consolidado para listado con joins
      const res = await fetch('/api/ver_pacientes');
      if (!res.ok) throw new Error('Error al obtener pacientes');
      const data = await res.json();
      setPacientes(data.items ?? data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
    setGlobalFilterValue(value);
  };

  const onSexoFilterChange = (value: string | null) => {
    setFilters({
      ...filters,
      sexo: { value, matchMode: FilterMatchMode.EQUALS },
    });
    setSexoFilter(value);
  };

  const onClearFilters = () => {
    const cleared: DataTableFilterMeta = {
      global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      sexo: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
    };
    setFilters(cleared);
    setGlobalFilterValue('');
    setSexoFilter(null);
  };

  const handleView = async (p: Paciente) => {
    setSelectedPaciente(p);
    // Inicial: usar datos disponibles en la fila
    setPacienteInfo({
      id_paciente: p.id_paciente,
      nombre_paciente: p.nombre_paciente,
      apellido_paciente: p.apellido_paciente,
      dni_paciente: p.dni_paciente,
      email_paciente: p.email_paciente ?? undefined,
      telefono_paciente: p.telefono_paciente ?? '',
      obras_sociales: { nombre_obra_social: '' },
    });
    setIsHistorialOpen(true);

    // Enriquecer con datos completos desde /api/paciente
    try {
      const res = await fetch('/api/paciente');
      if (res.ok) {
        const list = await res.json();
        const found = Array.isArray(list)
          ? list.find((fp: any) => Number(fp.id_paciente) === Number(p.id_paciente))
          : null;
        if (found) {
          setPacienteInfo((prev: any) => ({
            ...(prev || {}),
            email_paciente: found.email_paciente ?? prev?.email_paciente ?? undefined,
            telefono_paciente: found.telefono_paciente ?? prev?.telefono_paciente ?? '',
            obras_sociales: found.obras_sociales?.nombre_obra_social
              ? { nombre_obra_social: found.obras_sociales.nombre_obra_social }
              : prev?.obras_sociales ?? { nombre_obra_social: '' },
          }));
        }
      }
    } catch (_) {
      // silencioso
    }
  };

  const handleEdit = (p: Paciente) => {
    setEditPaciente(p);
    setIsEditOpen(true);
  };

  const globalFilterFields = [
    'nombre_paciente',
    'apellido_paciente',
    'dni_paciente',
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Mis pacientes</h1>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
          <PacienteFilter
            globalFilterValue={globalFilterValue}
            sexoFilter={sexoFilter}
            onGlobalFilterChange={onGlobalFilterChange}
            onSexoFilterChange={onSexoFilterChange}
            onClearFilters={onClearFilters}
            onRefresh={fetchPacientes}
          />
        </div>

        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <PacienteTable
              pacientes={pacientes}
              loading={loading}
              filters={filters}
              globalFilterFields={globalFilterFields}
              onView={handleView}
              onEdit={handleEdit}
            />
          </div>
        </Card>
        {selectedPaciente && pacienteInfo && (
          <VerHistorialDialog
            isOpen={isHistorialOpen}
            onClose={() => setIsHistorialOpen(false)}
            pacienteId={selectedPaciente.id_paciente}
            pacienteInfo={pacienteInfo}
          />
        )}
        <PacienteEditDialog
          isOpen={isEditOpen}
          paciente={editPaciente}
          onClose={() => setIsEditOpen(false)}
          onSave={async (payload) => {
            // TODO: Reemplazar con endpoint real de actualización
            try {
              await fetch('/api/paciente', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              }).catch(() => {}); // silencioso si no existe aún
            } finally {
              await fetchPacientes();
            }
          }}
        />
      </div>
    </div>
  );
}

