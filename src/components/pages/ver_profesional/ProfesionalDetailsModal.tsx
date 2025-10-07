"use client";

import { Dialog } from 'primereact/dialog';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';

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
    hora_inicio: string | Date;
    hora_fin: string | Date;
    duracion_turno: number;
  }>;
  profesionales_por_obras_sociales: Array<{
    obras_sociales: {
      nombre_obra_social: string;
    };
  }>;
}

interface ProfesionalDetailsModalProps {
  visible: boolean;
  profesional: Profesional | null;
  onHide: () => void;
}

export default function ProfesionalDetailsModal({
  visible,
  profesional,
  onHide
}: ProfesionalDetailsModalProps) {

  if (!profesional) return null;

  const formatTime = (time: string | Date) => {
    try {
      if (time instanceof Date) {
        // Si es un objeto Date, extraer las horas y minutos
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else if (typeof time === 'string') {
        // Si es un timestamp ISO (ej: "1970-01-01T08:00:00.000Z")
        if (time.includes('T')) {
          const dateObj = new Date(time);
          const hours = dateObj.getUTCHours().toString().padStart(2, '0');
          const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        }
        // Si es formato "HH:mm:ss"
        const timeParts = time.split(':');
        if (timeParts.length >= 2) {
          return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
        }
      }
      return 'Hora inválida';
    } catch (error) {
      console.error('Error formateando hora:', error, time);
      return 'Hora inválida';
    }
  };

  const headerContent = (
    <div className="flex items-center gap-3">
      <div className="bg-blue-100 p-2 rounded-full">
        <i className="pi pi-user text-blue-600 text-xl"></i>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800 m-0">
          {profesional.usuarios.nombre_usuario} {profesional.usuarios.apellido_usuario}
        </h3>
        <p className="text-sm text-gray-600 m-0">Detalles del profesional</p>
      </div>
    </div>
  );

  return (
    <Dialog
      header={headerContent}
      visible={visible}
      onHide={onHide}
      style={{ width: '90vw', maxWidth: '800px' }}
      modal
      draggable={false}
      resizable={false}
      className="p-fluid"
    >
      <div className="space-y-4">
        {/* Información Personal */}
        <Card className="shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <i className="pi pi-id-card text-gray-600"></i>
            <h4 className="text-lg font-semibold text-gray-800 m-0">Información Personal</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
              <p className="text-gray-900 font-semibold">{profesional.usuarios.nombre_usuario}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Apellido</label>
              <p className="text-gray-900 font-semibold">{profesional.usuarios.apellido_usuario}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">DNI</label>
              <p className="text-gray-900">{profesional.usuarios.dni_usuario}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <p className="text-gray-900">{profesional.usuarios.email_usuario}</p>
            </div>
          </div>
        </Card>

        {/* Información Profesional */}
        <Card className="shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <i className="pi pi-briefcase text-gray-600"></i>
            <h4 className="text-lg font-semibold text-gray-800 m-0">Información Profesional</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Matrícula</label>
              <Badge value={profesional.matricula_profesional} severity="info" className="text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Especialidad</label>
              <Badge
                value={profesional.especialidades.nombre_especialidad}
                severity="success"
                className="text-sm"
              />
            </div>
          </div>
        </Card>

        {/* Obras Sociales */}
        <Card className="shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <i className="pi pi-heart text-gray-600"></i>
            <h4 className="text-lg font-semibold text-gray-800 m-0">Obras Sociales</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {profesional.profesionales_por_obras_sociales.length > 0 ? (
              profesional.profesionales_por_obras_sociales.map((relacion, index) => (
                <Badge
                  key={index}
                  value={relacion.obras_sociales.nombre_obra_social}
                  severity="warning"
                  className="text-sm"
                />
              ))
            ) : (
              <p className="text-gray-500 italic">No hay obras sociales asociadas</p>
            )}
          </div>
        </Card>

        {/* Horarios de Atención */}
        <Card className="shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <i className="pi pi-clock text-gray-600"></i>
            <h4 className="text-lg font-semibold text-gray-800 m-0">Horarios de Atención</h4>
          </div>
          <div className="space-y-3">
            {profesional.horarios_profesionales.length > 0 ? (
              profesional.horarios_profesionales.map((horario, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <i className="pi pi-calendar text-blue-600"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 m-0">
                        {horario.dias_semana.nombre_dia}
                      </p>
                      <p className="text-sm text-gray-600 m-0">
                        {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fin)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    value={`${horario.duracion_turno} min`}
                    severity="info"
                    className="text-xs"
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No hay horarios configurados</p>
            )}
          </div>
        </Card>

        {/* Información Adicional */}
        {/* <Card className="shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <i className="pi pi-info-circle text-gray-600"></i>
            <h4 className="text-lg font-semibold text-gray-800 m-0">Estado y Estadísticas</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <i className="pi pi-check-circle text-green-600 text-2xl mb-2"></i>
              <p className="text-sm text-gray-600 m-0">Estado</p>
              <Badge value="Activo" severity="success" className="mt-1" />
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <i className="pi pi-calendar-plus text-blue-600 text-2xl mb-2"></i>
              <p className="text-sm text-gray-600 m-0">Turnos del mes</p>
              <p className="text-lg font-bold text-blue-600 m-0">--</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <i className="pi pi-star text-purple-600 text-2xl mb-2"></i>
              <p className="text-sm text-gray-600 m-0">Calificación</p>
              <p className="text-lg font-bold text-purple-600 m-0">--</p>
            </div>
          </div>
        </Card> */}
      </div>
    </Dialog>
  );
}