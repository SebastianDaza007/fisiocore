"use client";

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { FilterMatchMode } from 'primereact/api';
import ProfesionalTable from '../../../components/pages/ver_profesional/ProfesionalTable';
import ProfesionalFilter from '../../../components/pages/ver_profesional/ProfesionalFilter';
import ProfesionalDetailsModal from '../../../components/pages/ver_profesional/ProfesionalDetailsModal';

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

export default function VerProfesionalPage() {
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedProfesional, setSelectedProfesional] = useState<Profesional | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
  });

  const fetchProfesionales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profesional');
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
    const _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const handleViewDetails = (profesional: Profesional) => {
    setSelectedProfesional(profesional);
    setShowDetailsModal(true);
  };

  const handleEdit = (profesional: Profesional) => {
    console.log('Editar profesional:', profesional);
  };

  const globalFilterFields = [
    'usuarios.nombre_usuario',
    'usuarios.apellido_usuario',
    'usuarios.dni_usuario',
    'matricula_profesional',
    'especialidades.nombre_especialidad'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <ProfesionalFilter
          globalFilterValue={globalFilterValue}
          filters={filters}
          onGlobalFilterChange={onGlobalFilterChange}
          onRefresh={fetchProfesionales}
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
      </div>
    </div>
  );
}