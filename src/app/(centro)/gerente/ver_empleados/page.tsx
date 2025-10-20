"use client";

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { FilterMatchMode } from 'primereact/api';
import { DataTableFilterMeta } from 'primereact/datatable';
import { useAuth } from '@/hooks/useAuth';
import EmpleadoTable from '../../../../components/pages/ver_empleados/EmpleadoTable';
import EmpleadoFilter from '../../../../components/pages/ver_empleados/EmpleadoFilter';
import EmpleadoDetailsModal from '../../../../components/pages/ver_empleados/EmpleadoDetailsModal';
import EditEmpleadoModal from '../../../../components/pages/ver_empleados/EditEmpleadoModal';
import RegistrarEmpleadoModal from '../../../../components/pages/ver_empleados/RegistrarEmpleadoModal';

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
  turnos: Array<{
    id_turno: number;
    fecha_turno: Date;
  }>;
  cantidadTurnos: number;
}

export default function VerEmpleadosPage() {
  const { user } = useAuth();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [rolFilter, setRolFilter] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    'roles.nombre_rol': { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
    estado: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
  });

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/listado_empleados');
      if (!response.ok) {
        throw new Error('Error al obtener empleados');
      }
      const data = await response.json();

      // Aplicar estados guardados en localStorage
      const estadosGuardados = JSON.parse(localStorage.getItem('empleadosEstados') || '{}');
      const empleadosConEstado = data.map((emp: Empleado) => ({
        ...emp,
        estado: estadosGuardados[emp.id_usuario] || emp.estado
      }));

      setEmpleados(empleadosConEstado);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS }
    });
    setGlobalFilterValue(value);
  };

  const onRolFilterChange = (value: string | null) => {
    setFilters({
      ...filters,
      'roles.nombre_rol': { value, matchMode: FilterMatchMode.EQUALS }
    });
    setRolFilter(value);
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
      'roles.nombre_rol': { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
      estado: { value: null as string | null, matchMode: FilterMatchMode.EQUALS },
    };
    setFilters(clearedFilters);
    setGlobalFilterValue('');
    setRolFilter(null);
    setEstadoFilter(null);
  };

  const handleViewDetails = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setShowDetailsModal(true);
  };

  const handleEdit = (empleado: Empleado) => {
    setSelectedEmpleado(empleado);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    // Recargar la lista de empleados después de guardar
    fetchEmpleados();
  };

  const globalFilterFields = [
    'nombre_usuario',
    'apellido_usuario',
    'dni_usuario',
    'email_usuario'
  ];

  // Get unique roles from the data
  const availableRoles = Array.from(
    new Set(empleados.map(e => e.roles.nombre_rol))
  );

  // Verificar si el usuario puede registrar empleados (solo ADMIN o GERENTE)
  const canRegisterEmpleado = user?.rol === 'ADMIN' || user?.rol === 'GERENTE';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Listado de Empleados</h1>
            <p className="text-gray-600 mt-1">Usuarios administrativos del sistema</p>
          </div>
          {canRegisterEmpleado && (
            <button
              onClick={() => setShowRegistroModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <i className="pi pi-user-plus"></i>
              <span>Registrar Nuevo Empleado</span>
            </button>
          )}
        </div>

        <EmpleadoFilter
          globalFilterValue={globalFilterValue}
          filters={filters}
          onGlobalFilterChange={onGlobalFilterChange}
          onRefresh={fetchEmpleados}
          onRolFilterChange={onRolFilterChange}
          onEstadoFilterChange={onEstadoFilterChange}
          onClearFilters={onClearFilters}
          rolFilter={rolFilter}
          estadoFilter={estadoFilter}
          availableRoles={availableRoles}
        />

        <Card className="shadow-lg">
          <EmpleadoTable
            empleados={empleados}
            loading={loading}
            filters={filters}
            globalFilterFields={globalFilterFields}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
        </Card>

        <EmpleadoDetailsModal
          visible={showDetailsModal}
          empleado={selectedEmpleado}
          onHide={() => {
            setShowDetailsModal(false);
            setSelectedEmpleado(null);
          }}
        />

        <EditEmpleadoModal
          visible={showEditModal}
          empleado={selectedEmpleado}
          onHide={() => {
            setShowEditModal(false);
            setSelectedEmpleado(null);
          }}
          onSave={handleSaveEdit}
        />

        <RegistrarEmpleadoModal
          visible={showRegistroModal}
          onHide={() => setShowRegistroModal(false)}
          onSave={() => {
            fetchEmpleados();
          }}
        />
      </div>
    </div>
  );
}
