"use client";

import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { Calendar } from 'primereact/calendar';
import { useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

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
    hora_inicio: string | Date;
    hora_fin: string | Date;
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

interface ObraSocial {
  id_obra_social: number;
  nombre_obra_social: string;
}

interface DiaSemana {
  id_dia: number;
  nombre_dia: string;
}

interface HorarioDia {
  enabled: boolean;
  horaDesde: Date | null;
  horaHasta: Date | null;
  duracionTurno: number;
}

interface EditProfesionalModalProps {
  visible: boolean;
  profesional: Profesional | null;
  onHide: () => void;
  onSave: () => void;
}

const diasSemana: DiaSemana[] = [
  { id_dia: 1, nombre_dia: 'Lunes' },
  { id_dia: 2, nombre_dia: 'Martes' },
  { id_dia: 3, nombre_dia: 'Miércoles' },
  { id_dia: 4, nombre_dia: 'Jueves' },
  { id_dia: 5, nombre_dia: 'Viernes' }
];

export default function EditProfesionalModal({
  visible,
  profesional,
  onHide,
  onSave
}: EditProfesionalModalProps) {
  const [email, setEmail] = useState('');
  const [selectedObrasSociales, setSelectedObrasSociales] = useState<number[]>([]);
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [horarios, setHorarios] = useState<Record<number, HorarioDia>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useRef<Toast>(null);

  // Cargar obras sociales al abrir el modal
  useEffect(() => {
    if (visible) {
      fetchObrasSociales();
    }
  }, [visible]);

  // Inicializar datos cuando cambia el profesional
  useEffect(() => {
    if (profesional && visible) {
      // Cargar email
      setEmail(profesional.usuarios.email_usuario);

      // Cargar obras sociales seleccionadas
      const obrasSocialesIds = profesional.profesionales_por_obras_sociales.map(
        (os) => os.obras_sociales.id_obra_social
      );
      setSelectedObrasSociales(obrasSocialesIds);

      // Cargar horarios existentes
      const horariosMap: Record<number, HorarioDia> = {};

      // Inicializar todos los días deshabilitados
      diasSemana.forEach((dia) => {
        horariosMap[dia.id_dia] = {
          enabled: false,
          horaDesde: null,
          horaHasta: null,
          duracionTurno: 30
        };
      });

      // Cargar horarios existentes
      profesional.horarios_profesionales.forEach((horario) => {
        const diaId = horario.dias_semana.id_dia;
        const horaDesde = parseTimeToDate(horario.hora_inicio);
        const horaHasta = parseTimeToDate(horario.hora_fin);

        horariosMap[diaId] = {
          enabled: true,
          horaDesde,
          horaHasta,
          duracionTurno: horario.duracion_turno
        };
      });

      setHorarios(horariosMap);
    }
  }, [profesional, visible]);

  const fetchObrasSociales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/obras_sociales');
      if (!response.ok) throw new Error('Error al obtener obras sociales');
      const data = await response.json();
      setObrasSociales(data);
    } catch (error) {
      console.error('Error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las obras sociales',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const parseTimeToDate = (time: string | Date): Date | null => {
    try {
      if (time instanceof Date) {
        return time;
      } else if (typeof time === 'string') {
        // Si es un timestamp ISO (ej: "1970-01-01T08:00:00.000Z")
        if (time.includes('T')) {
          const dateObj = new Date(time);
          const hours = dateObj.getUTCHours();
          const minutes = dateObj.getUTCMinutes();
          const newDate = new Date();
          newDate.setHours(hours, minutes, 0, 0);
          return newDate;
        }
        // Si es formato "HH:mm:ss"
        const timeParts = time.split(':');
        if (timeParts.length >= 2) {
          const hours = parseInt(timeParts[0]);
          const minutes = parseInt(timeParts[1]);
          const newDate = new Date();
          newDate.setHours(hours, minutes, 0, 0);
          return newDate;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parseando hora:', error, time);
      return null;
    }
  };

  const formatDateToTime = (date: Date | null): string | null => {
    if (!date) return null;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  const handleHorarioToggle = (diaId: number, enabled: boolean) => {
    setHorarios((prev) => ({
      ...prev,
      [diaId]: {
        ...prev[diaId],
        enabled,
        horaDesde: enabled ? (prev[diaId]?.horaDesde || null) : null,
        horaHasta: enabled ? (prev[diaId]?.horaHasta || null) : null,
        duracionTurno: prev[diaId]?.duracionTurno || 30
      }
    }));
  };

  const handleHorarioChange = (diaId: number, field: 'horaDesde' | 'horaHasta' | 'duracionTurno', value: Date | number | null) => {
    setHorarios((prev) => ({
      ...prev,
      [diaId]: {
        ...prev[diaId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!profesional) return;

    // Validaciones
    if (!email || !email.includes('@')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'El email no es válido',
        life: 3000
      });
      return;
    }

    if (selectedObrasSociales.length === 0) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar al menos una obra social',
        life: 3000
      });
      return;
    }

    // Validar que "Particular" esté siempre seleccionada
    const particularOS = obrasSociales.find(os => os.nombre_obra_social === 'Particular');
    if (particularOS && !selectedObrasSociales.includes(particularOS.id_obra_social)) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'La obra social "Particular" debe estar siempre seleccionada',
        life: 3000
      });
      return;
    }

    // Validar horarios habilitados
    const horariosHabilitados = Object.entries(horarios).filter(([_, h]) => h.enabled);
    for (const [diaId, horario] of horariosHabilitados) {
      if (!horario.horaDesde || !horario.horaHasta) {
        const dia = diasSemana.find(d => d.id_dia === parseInt(diaId));
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: `Debe completar las horas para ${dia?.nombre_dia}`,
          life: 3000
        });
        return;
      }

      if (horario.horaDesde >= horario.horaHasta) {
        const dia = diasSemana.find(d => d.id_dia === parseInt(diaId));
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: `La hora de inicio debe ser menor a la hora de fin para ${dia?.nombre_dia}`,
          life: 3000
        });
        return;
      }
    }

    try {
      setSaving(true);

      // Preparar datos de horarios
      const horariosData = Object.entries(horarios)
        .filter(([_, h]) => h.enabled && h.horaDesde && h.horaHasta)
        .map(([diaId, h]) => ({
          dia_semana_id: parseInt(diaId),
          hora_inicio: formatDateToTime(h.horaDesde),
          hora_fin: formatDateToTime(h.horaHasta),
          duracion_turno: h.duracionTurno
        }));

      const response = await fetch(`/api/profesional/${profesional.id_profesional}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          obras_sociales: selectedObrasSociales,
          horarios: horariosData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar profesional');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Profesional actualizado correctamente',
        life: 3000
      });

      // Esperar un momento para que se vea el toast
      setTimeout(() => {
        onSave();
        onHide();
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Error al actualizar profesional',
        life: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  if (!profesional) return null;

  // Encontrar "Particular" para deshabilitar su checkbox
  const particularOS = obrasSociales.find(os => os.nombre_obra_social === 'Particular');

  const headerContent = (
    <div className="flex items-center gap-3">
      <div className="bg-teal-100 p-2 rounded-full">
        <i className="pi pi-user-edit text-teal-600 text-xl"></i>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800 m-0">
          Editar Profesional
        </h3>
        <p className="text-sm text-gray-600 m-0">
          {profesional.usuarios.nombre_usuario} {profesional.usuarios.apellido_usuario}
        </p>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={saving}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={handleSave}
        loading={saving}
        className="bg-teal-600 hover:bg-teal-700 border-teal-600"
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <style jsx global>{`
        /* Estilos personalizados para MultiSelect - Mejorar contraste */
        .p-multiselect-panel .p-multiselect-item.p-highlight {
          background-color: #0f766e !important; /* teal-700 más oscuro */
          color: white !important;
        }

        .p-multiselect-panel .p-multiselect-item.p-highlight:hover {
          background-color: #115e59 !important; /* teal-800 aún más oscuro */
          color: white !important;
        }

        /* Chips seleccionados en el input */
        .p-multiselect-token {
          background-color: #0f766e !important; /* teal-700 */
          color: white !important;
        }

        .p-multiselect-token .p-multiselect-token-icon {
          color: white !important;
        }
      `}</style>
      <Dialog
        header={headerContent}
        visible={visible}
        onHide={onHide}
        style={{ width: '95vw', maxWidth: '1200px' }}
        footer={footerContent}
        modal
        draggable={false}
        resizable={false}
        className="p-fluid"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Columna Izquierda - Información de Contacto y Obras Sociales */}
          <div className="lg:col-span-1 space-y-4">
            {/* Información de Contacto */}
            <Card className="shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <i className="pi pi-envelope text-teal-600"></i>
                <h4 className="text-lg font-semibold text-gray-800 m-0">
                  Información de Contacto
                </h4>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <InputText
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full"
                />
              </div>
            </Card>

            {/* Obras Sociales */}
            <Card className="shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <i className="pi pi-heart text-teal-600"></i>
                <h4 className="text-lg font-semibold text-gray-800 m-0">
                  Obras Sociales *
                </h4>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccione Obras Sociales
                </label>
                <MultiSelect
                  value={selectedObrasSociales}
                  options={obrasSociales}
                  onChange={(e) => {
                    // Asegurar que "Particular" siempre esté seleccionada
                    if (particularOS && !e.value.includes(particularOS.id_obra_social)) {
                      toast.current?.show({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'La obra social "Particular" no puede ser desmarcada',
                        life: 3000
                      });
                      return;
                    }
                    setSelectedObrasSociales(e.value);
                  }}
                  optionLabel="nombre_obra_social"
                  optionValue="id_obra_social"
                  placeholder="Seleccione obras sociales"
                  filter
                  className="w-full"
                  display="chip"
                  loading={loading}
                />
                <small className="text-gray-500 mt-2 block">
                  * La obra social "Particular" es obligatoria
                </small>
              </div>
            </Card>
          </div>

          {/* Columna Derecha - Horarios de Atención */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm h-full">
              <div className="flex items-center gap-2 mb-4">
                <i className="pi pi-clock text-teal-600"></i>
                <h4 className="text-lg font-semibold text-gray-800 m-0">
                  Horarios de Atención
                </h4>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {diasSemana.map((dia) => {
                  const horario = horarios[dia.id_dia] || {
                    enabled: false,
                    horaDesde: null,
                    horaHasta: null,
                    duracionTurno: 30
                  };

                  return (
                    <div
                      key={dia.id_dia}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        horario.enabled
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <InputSwitch
                            checked={horario.enabled}
                            onChange={(e) => handleHorarioToggle(dia.id_dia, e.value || false)}
                          />
                          <label className="font-semibold text-gray-800">
                            {dia.nombre_dia}
                          </label>
                        </div>
                      </div>

                      {horario.enabled && (
                        <div className="grid grid-cols-2 gap-3 ml-12">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Desde
                            </label>
                            <Calendar
                              value={horario.horaDesde}
                              onChange={(e) => handleHorarioChange(dia.id_dia, 'horaDesde', e.value as Date)}
                              timeOnly
                              hourFormat="24"
                              placeholder="HH:mm"
                              className="w-full"
                              stepMinute={15}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Hasta
                            </label>
                            <Calendar
                              value={horario.horaHasta}
                              onChange={(e) => handleHorarioChange(dia.id_dia, 'horaHasta', e.value as Date)}
                              timeOnly
                              hourFormat="24"
                              placeholder="HH:mm"
                              className="w-full"
                              stepMinute={15}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </Dialog>
    </>
  );
}
