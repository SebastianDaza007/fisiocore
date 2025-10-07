"use client";

import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';

interface ObraSocial {
  id_obra_social: number;
  nombre_obra_social: string;
}

interface Especialidad {
  id_especialidad: number;
  nombre_especialidad: string;
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

interface RegistrarProfesionalModalProps {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
}

export default function RegistrarProfesionalModal({
  visible,
  onHide,
  onSave
}: RegistrarProfesionalModalProps) {
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
//  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [especialidadId, setEspecialidadId] = useState<number | null>(null);
  const [selectedObrasSociales, setSelectedObrasSociales] = useState<number[]>([]);
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [horarios, setHorarios] = useState<Record<number, HorarioDia>>({});
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useRef<Toast>(null);

  const diasSemana: DiaSemana[] = [
    { id_dia: 1, nombre_dia: 'Lunes' },
    { id_dia: 2, nombre_dia: 'Martes' },
    { id_dia: 3, nombre_dia: 'Miércoles' },
    { id_dia: 4, nombre_dia: 'Jueves' },
    { id_dia: 5, nombre_dia: 'Viernes' }
  ];

  // Cargar obras sociales y especialidades al abrir el modal
  useEffect(() => {
    if (visible) {
      fetchObrasSociales();
      fetchEspecialidades();
    }
  }, [visible]);

  // Limpiar formulario cuando se cierra el modal
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setDni('');
    setNombre('');
    setApellido('');
//    setFechaNacimiento(null);
    setEmail('');
    setMatricula('');
    setEspecialidadId(null);
    setSelectedObrasSociales([]);
    setHorarios({});
    setPassword('');
    setShowPassword(false);
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    toast.current?.show({
      severity: 'success',
      summary: 'Contraseña Generada',
      detail: 'Se ha generado una contraseña segura',
      life: 2000
    });
  };

  const fetchObrasSociales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/obras_sociales');
      if (!response.ok) throw new Error('Error al obtener obras sociales');
      const data = await response.json();
      setObrasSociales(data);

      // Preseleccionar "Particular" (ID 7) automáticamente
      const particular = data.find((os: ObraSocial) => os.id_obra_social === 7);
      if (particular) {
        setSelectedObrasSociales([7]);
      }
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

  const fetchEspecialidades = async () => {
    try {
      const response = await fetch('/api/especialidades');
      if (!response.ok) throw new Error('Error al obtener especialidades');
      const data = await response.json();
      setEspecialidades(data);
    } catch (error) {
      console.error('Error:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las especialidades',
        life: 3000
      });
    }
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

  const formatDateToTime = (date: Date | null): string | null => {
    if (!date) return null;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}:00`;
  };

  const handleSave = async () => {
    // Validaciones
    if (!dni || dni.length !== 8) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'El DNI debe tener 8 dígitos',
        life: 3000
      });
      return;
    }

    if (!nombre || nombre.trim() === '') {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre es obligatorio',
        life: 3000
      });
      return;
    }

    if (!apellido || apellido.trim() === '') {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'El apellido es obligatorio',
        life: 3000
      });
      return;
    }

/*    if (!fechaNacimiento) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'La fecha de nacimiento es obligatoria',
        life: 3000
      });
      return;
    }
*/

    if (!email || !email.includes('@')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'El email no es válido',
        life: 3000
      });
      return;
    }

    if (!matricula || matricula.trim() === '') {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'La matrícula es obligatoria',
        life: 3000
      });
      return;
    }

    if (!especialidadId) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar una especialidad',
        life: 3000
      });
      return;
    }

    if (!password || password.trim().length < 6) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña debe tener al menos 6 caracteres',
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

    // Validar que "Particular" (ID 7) esté siempre seleccionada
    if (!selectedObrasSociales.includes(7)) {
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

      const response = await fetch('/api/profesional/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni,
          nombre,
          apellido,
          //fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0],
          email,
          matricula,
          especialidad_id: especialidadId,
          obras_sociales: selectedObrasSociales,
          horarios: horariosData,
          password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar profesional');
      }

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Profesional registrado correctamente',
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
        detail: error instanceof Error ? error.message : 'Error al registrar profesional',
        life: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  // Template personalizado para las opciones del MultiSelect
  const itemTemplate = (option: ObraSocial) => {
    const isParticular = option.id_obra_social === 7;
    return (
      <div className="flex align-items-center">
        <span className={isParticular ? 'font-semibold' : ''}>
          {option.nombre_obra_social}
          {isParticular && <span className="ml-2 text-xs text-teal-600">(Obligatoria)</span>}
        </span>
      </div>
    );
  };

  const headerContent = (
    <div className="flex items-center gap-3">
      <div className="bg-teal-100 p-2 rounded-full">
        <i className="pi pi-user-plus text-teal-600 text-xl"></i>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800 m-0">
          Registrar Nuevo Profesional
        </h3>
        <p className="text-sm text-gray-600 m-0">
          Complete los datos del profesional
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
        label="Registrar"
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
        style={{ width: '95vw', maxWidth: '1400px' }}
        footer={footerContent}
        modal
        draggable={false}
        resizable={false}
        className="p-fluid"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Columna Izquierda - Todas las Cards */}
          <div className="space-y-4">
            {/* Datos Personales */}
            <Card className="shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <i className="pi pi-id-card text-teal-600"></i>
                <h4 className="text-lg font-semibold text-gray-800 m-0">
                  Datos Personales
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
                    DNI *
                  </label>
                  <InputText
                    id="dni"
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="12345678"
                    maxLength={8}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <InputText
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Juan"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <InputText
                      id="apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Pérez"
                      className="w-full"
                    />
                  </div>
                {/*</div>
                <div>
                  <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento *
                  </label>
                  <Calendar
                    id="fechaNacimiento"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.value as Date)}
                    dateFormat="dd/mm/yy"
                    placeholder="dd/mm/aaaa"
                    className="w-full"
                    showIcon
                    maxDate={new Date()}
                  />*/}
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
                    type="email"
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Datos Profesionales */}
            <Card className="shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <i className="pi pi-briefcase text-teal-600"></i>
                <h4 className="text-lg font-semibold text-gray-800 m-0">
                  Datos Profesionales
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-2">
                    Matrícula *
                  </label>
                  <InputText
                    id="matricula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="MP 12345"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidad *
                  </label>
                  <Dropdown
                    id="especialidad"
                    value={especialidadId}
                    options={especialidades}
                    onChange={(e) => setEspecialidadId(e.value)}
                    optionLabel="nombre_especialidad"
                    optionValue="id_especialidad"
                    placeholder="Seleccione una especialidad"
                    filter
                    className="w-full"
                  />
                </div>
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
                    // Asegurar que "Particular" (ID 7) siempre esté seleccionada
                    if (!e.value.includes(7)) {
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
                  itemTemplate={itemTemplate}
                />
                <small className="text-gray-500 mt-2 block">
                  * La obra social &quot;Particular&quot; está seleccionada por defecto y no puede ser removida
                </small>
              </div>
            </Card>

          </div>

          {/* Columna Derecha - Horarios de Atención y Contraseña */}
          <div className="space-y-4">
            {/* Horarios de Atención */}
            <Card className="shadow-sm">
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

            {/* Contraseña */}
            <Card className="shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <i className="pi pi-lock text-teal-600"></i>
                <h4 className="text-lg font-semibold text-gray-800 m-0">
                  Contraseña *
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña del Usuario
                  </label>
                  <div className="p-inputgroup">
                    <InputText
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      type={showPassword ? "text" : "password"}
                    />
                    <Button
                      icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-button-text"
                      type="button"
                      tooltip={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      tooltipOptions={{ position: 'top' }}
                    />
                    <Button
                      icon="pi pi-lock"
                      onClick={generatePassword}
                      className="bg-teal-600 hover:bg-teal-700 border-teal-600"
                      type="button"
                      tooltip="Generar Contraseña"
                      tooltipOptions={{ position: 'top' }}
                    />
                  </div>
                  <small className="text-gray-500 mt-2 block">
                    * Mínimo 6 caracteres. Use el botón para generar una contraseña segura.
                  </small>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Dialog>
    </>
  );
}
