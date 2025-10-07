"use client";

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { FilterMatchMode } from 'primereact/api';
import { DataTableFilterMeta } from 'primereact/datatable';
import { useAuth } from '@/hooks/useAuth';
import ProfesionalTable from '../../../../components/pages/ver_profesional/ProfesionalTable';
import ProfesionalFilter from '../../../../components/pages/ver_profesional/ProfesionalFilter';
import ProfesionalDetailsModal from '../../../../components/pages/ver_profesional/ProfesionalDetailsModal';
import EditProfesionalModal from '../../../../components/pages/ver_profesional/EditProfesionalModal';
import RegistrarProfesionalModal from '../../../../components/pages/ver_profesional/RegistrarProfesionalModal';

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
    id_horario: number;
    dias_semana: {
      id_dia: number;
      nombre_dia: string;
    };
    hora_inicio: string;
    hora_fin: string;
    duracion_turno: number;
  }>;
  profesionales_por_obras_sociales: Array<{
    id_profesional_obra: number;
    obra_social_id: number;
    obras_sociales: {
      id_obra_social: number;
      nombre_obra_social: string;
    };
  }>;
}

export default function VerProfesionalPage() {
  const { user } = useAuth();
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [especialidadFilter, setEspecialidadFilter] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
  const [selectedProfesional, setSelectedProfesional] = useState<Profesional | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    'especialidades.nombre_especialidad': { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
    estado: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
  });

  // Verificar si el usuario puede registrar profesionales (solo ADMIN o GERENTE)
  const canRegisterProfesional = user?.rol === 'ADMIN' || user?.rol === 'GERENTE';

  const fetchProfesionales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/listado_profesionales');
      if (!response.ok) {
        throw new Error('Error al obtener profesionales');
      }
      const data = await response.json();
      setProfesionales(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfesionales();
  }, []);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS }
    });
    setGlobalFilterValue(value);
  };

  const onEspecialidadFilterChange = (value: string | null) => {
    setFilters({
      ...filters,
      'especialidades.nombre_especialidad': { value, matchMode: FilterMatchMode.EQUALS }
    });
    setEspecialidadFilter(value);
  };

  const onEstadoFilterChange = (value: string | null) => {
    setFilters({
      ...filters,
      estado: { value, matchMode: FilterMatchMode.EQUALS }
    });
    setEstadoFilter(value);
  };

  const onClearFilters = () => {
    const clearedFilters: DataTableFilterMeta = {
      global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
      'especialidades.nombre_especialidad': { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
      estado: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
    };
    setFilters(clearedFilters);
    setGlobalFilterValue('');
    setEspecialidadFilter(null);
    setEstadoFilter(null);
  };

  const handleViewDetails = (profesional: Profesional) => {
    setSelectedProfesional(profesional);
    setShowDetailsModal(true);
  };

  const handleEdit = (profesional: Profesional) => {
    setSelectedProfesional(profesional);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    // Recargar la lista de profesionales después de guardar
    fetchProfesionales();
  };

  const globalFilterFields = [
    'usuarios.nombre_usuario',
    'usuarios.apellido_usuario',
    'usuarios.dni_usuario'
  ];

  // Get unique specialties from the data
  const availableEspecialidades = Array.from(
    new Set(profesionales.map(p => p.especialidades.nombre_especialidad))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header con título y botón */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Profesionales</h1>
            <p className="text-sm text-gray-600">Gestión de profesionales del centro médico</p>
          </div>
          {canRegisterProfesional && (
            <button
              onClick={() => setShowRegistroModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <i className="pi pi-user-plus"></i>
              <span>Registrar Nuevo Profesional</span>
            </button>
          )}
        </div>

        <ProfesionalFilter
          globalFilterValue={globalFilterValue}
          filters={filters}
          onGlobalFilterChange={onGlobalFilterChange}
          onRefresh={fetchProfesionales}
          onEspecialidadFilterChange={onEspecialidadFilterChange}
          onEstadoFilterChange={onEstadoFilterChange}
          onClearFilters={onClearFilters}
          especialidadFilter={especialidadFilter}
          estadoFilter={estadoFilter}
          availableEspecialidades={availableEspecialidades}
        />

        <Card className="shadow-lg">
          <ProfesionalTable
            profesionales={profesionales}
            loading={loading}
            filters={filters}
            globalFilterFields={globalFilterFields}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
        </Card>

        <ProfesionalDetailsModal
          visible={showDetailsModal}
          profesional={selectedProfesional}
          onHide={() => {
            setShowDetailsModal(false);
            setSelectedProfesional(null);
          }}
        />

        <EditProfesionalModal
          visible={showEditModal}
          profesional={selectedProfesional}
          onHide={() => {
            setShowEditModal(false);
            setSelectedProfesional(null);
          }}
          onSave={handleSaveEdit}
        />

        <RegistrarProfesionalModal
          visible={showRegistroModal}
          onHide={() => setShowRegistroModal(false)}
          onSave={() => {
            fetchProfesionales();
          }}
        />
      </div>
    </div>
  );
}