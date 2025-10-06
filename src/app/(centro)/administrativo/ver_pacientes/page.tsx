"use client";

import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api';
import { DataTableFilterMeta } from 'primereact/datatable';
import PacienteFilter from '../../../../components/pages/ver_pacientes/PacienteFilter';
import PacienteTable, { Paciente } from '../../../../components/pages/ver_pacientes/PacienteTable';
import PacienteInfoDialog from '../../../../components/pages/ver_pacientes/PacienteInfoDialog';

export default function VerPacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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

  const handleView = (p: Paciente) => {
    setSelectedPaciente(p);
    setIsInfoOpen(true);
  };

  const handleEdit = (p: Paciente) => {
    console.log('Editar paciente', p);
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Gestión de pacientes</h1>
            <p className="text-sm text-gray-600">Consulta, filtra y administra la información de tus pacientes.</p>
          </div>
          <Button
            icon="pi pi-user-plus"
            label="Dar de alta paciente"
            className="p-button-success shadow-sm text-sm md:text-base w-full sm:w-auto"
            onClick={() => console.log('Ir a alta de paciente')}
          />
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
        <PacienteInfoDialog
          isOpen={isInfoOpen}
          paciente={selectedPaciente}
          onClose={() => setIsInfoOpen(false)}
        />
      </div>
    </div>
  );
}
