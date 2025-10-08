'use client'
import React, { useState, useEffect } from "react";
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useAuth } from "@/hooks/useAuth";
import { addLocale, locale as setLocale } from 'primereact/api';
import { CompletarTurnoDialog } from "../historial clinico/finalizar_turno/modal";
import { VerHistorialDialog } from "../historial clinico/ver_historial/modal";

addLocale('es', {
  firstDayOfWeek: 1,
  dayNames: ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],
  dayNamesShort: ['dom','lun','mar','mié','jue','vie','sáb'],
  dayNamesMin: ['D','L','M','X','J','V','S'],
  monthNames: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
  monthNamesShort: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
  today: 'Hoy',
  clear: 'Limpiar',
  weekHeader: 'Sm',
  dateFormat: 'dd/mm/yy'
});
setLocale('es');

interface Turno {
  id_turno: number;
  fecha_turno: string;
  hora_turno: string;
  estado_turno_id?: number;
  pacientes: {
    id_paciente: number;
    nombre_paciente: string;
    apellido_paciente: string;
    obras_sociales?: { nombre_obra_social: string }
  };
  tipos_consulta?: { nombre_tipo_consulta: string; id_tipo_consulta:number};
}

export default function Miagenda() {
  const { user } = useAuth(); 
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [date, setDate] = useState<Date | null>(null);
  const [selectedPaciente, setSelectedPaciente] = useState<number | null>(null);
  const [tiposConsulta, setTiposConsulta] = useState<{ value: number; label: string }[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<number | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTurnoId, setSelectedTurnoId] = useState<number | null>(null);
  const [modalHistorialOpen, setModalHistorialOpen] = useState(false);
  const [selectedPacienteHistorial, setSelectedPacienteHistorial] = useState<{
    id_paciente: number;
    pacienteInfo: {
      id_paciente: number;
      nombre_paciente: string;
      apellido_paciente: string;
      obras_sociales?: { nombre_obra_social: string };
    };
  } | null>(null);

  const [horariosProfesional, setHorariosProfesional] = useState<{
    hora_inicio: string;
    hora_fin: string;
  } | null>(null);

  // --- Cargar tipos de consulta y horarios del profesional ---
  useEffect(() => {
    const fetchTipos = async () => {
      const res = await fetch("/api/profesional/tipos_consulta");
      const data = await res.json();
      setTiposConsulta(
        data.map((t: { id_tipo_consulta: number; nombre_tipo_consulta: string }) => ({
          value: t.id_tipo_consulta,
          label: t.nombre_tipo_consulta
        }))
      );
    };
    fetchTipos();
  }, []);

  // Cargar horarios del profesional para el día seleccionado
  useEffect(() => {
    const fetchHorarios = async () => {
      if (!date || !user?.profesionalId) return;

      try {
        const diaSemana = date.getDay(); // 0=domingo, 1=lunes, etc.
        const diaId = diaSemana === 0 ? 7 : diaSemana; // Convertir domingo de 0 a 7

        const res = await fetch(`/api/profesional/${user.profesionalId}/horarios?diaId=${diaId}`);
        if (!res.ok) {
          setHorariosProfesional(null);
          return;
        }

        const data = await res.json();
        if (data && data.hora_inicio && data.hora_fin) {
          setHorariosProfesional({
            hora_inicio: data.hora_inicio,
            hora_fin: data.hora_fin
          });
        } else {
          setHorariosProfesional(null);
        }
      } catch (error) {
        console.error("Error al obtener horarios del profesional:", error);
        setHorariosProfesional(null);
      }
    };

    fetchHorarios();
  }, [date, user?.profesionalId]);

  const turnosFiltrados = turnos.filter(t => {
    const matchPaciente = selectedPaciente ? t.pacientes.id_paciente === selectedPaciente : true;
    const matchTipo = selectedTipo ? t.tipos_consulta?.id_tipo_consulta === selectedTipo : true;
    return matchPaciente && matchTipo;
  });

  // 📌 Para armar el calendario
  const dateTemplate = (dateMeta: { day: number; month: number; year: number }) => {
    const isSelected =
      date &&
      date.getDate() === dateMeta.day &&
      date.getMonth() === dateMeta.month &&
      date.getFullYear() === dateMeta.year;

    return (
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer ${isSelected ? "text-white " : ""}`}
      >
        {dateMeta.day}
      </div>
    );
  };

  // 📌 Para mostrar "lunes 30"
  const formatDateWithWeekday = (d: Date | null) => {
    if (!d) return "";
    const weekday = d.toLocaleDateString("es-ES", { weekday: "long" });
    const day = String(d.getDate()).padStart(2, "0");
    return `${weekday} ${day}`;
  };

  const displayedDate = date ?? new Date();

  // 📌 Función reutilizable para fetch de turnos
  const fetchTurnos = async () => {
    if (!date || !user?.profesionalId) return;
    const fechaISO = date.toISOString().split("T")[0];
    const res = await fetch(`/api/profesional/agenda_medico?fecha=${fechaISO}&profesionalId=${user.profesionalId}`);
    const data = await res.json();
    setTurnos(data.filter((t: { estado_turno_id: number }) => t.estado_turno_id === 5));
  };

  // 📌 Fetch de turnos con polling
  useEffect(() => {
    if (!date || !user?.profesionalId) return;
    fetchTurnos();
    const interval = setInterval(fetchTurnos, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, user?.profesionalId]);

  // 📌 Pacientes únicos para dropdown
  const pacientesDelDia = Array.from(
    new Map(
      turnos.map((t) => [
        t.pacientes.id_paciente,
        {
          value: t.pacientes.id_paciente,
          label: `${t.pacientes.nombre_paciente} ${t.pacientes.apellido_paciente}`
        }
      ])
    ).values()
  );

  // 📌 Generar slots de tiempo de 30 minutos basados en horarios del profesional
  const generateTimeSlots = () => {
    // Si no hay horarios configurados para este día, retornar array vacío
    if (!horariosProfesional) {
      return [];
    }

    // Parsear hora_inicio y hora_fin
    const parseHora = (horaStr: string) => {
      // Puede venir como "HH:mm:ss" o "1970-01-01T08:00:00.000Z"
      let hora = horaStr;
      if (horaStr.includes('T')) {
        // Es un timestamp ISO, extraer solo la hora
        hora = horaStr.substring(11, 16);
      } else if (horaStr.length > 5) {
        // Es "HH:mm:ss", tomar solo HH:mm
        hora = horaStr.substring(0, 5);
      }
      const [h, m] = hora.split(':').map(Number);
      return h * 60 + m; // minutos totales
    };

    const inicioMinutos = parseHora(horariosProfesional.hora_inicio);
    const finMinutos = parseHora(horariosProfesional.hora_fin);

    const slots = [];
    for (let minutos = inicioMinutos; minutos < finMinutos; minutos += 30) {
      const h = Math.floor(minutos / 60);
      const m = minutos % 60;
      const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      // Buscar si existe un turno en este horario
      const turno = turnosFiltrados.find(t => {
        const tHora = t.hora_turno instanceof Date
          ? t.hora_turno.toISOString().substring(11, 16)
          : typeof t.hora_turno === 'string'
            ? t.hora_turno.substring(0, 5)
            : '00:00';
        return tHora === horaStr;
      });

      slots.push({
        horario: horaStr,
        id: turno?.id_turno || null,
        paciente: turno
          ? `${turno.pacientes.nombre_paciente} ${turno.pacientes.apellido_paciente}`
          : '-',
        tipoConsulta: turno?.tipos_consulta?.nombre_tipo_consulta || '-',
        obraSocial: turno?.pacientes?.obras_sociales?.nombre_obra_social || '-',
        isEmpty: !turno,
      });
    }

    return slots;
  };

  const turnosData = generateTimeSlots();

  // Contador de pacientes que ya fueron atendidos hoy
  const [atendidosHoy, setAtendidosHoy] = useState<number>(0);

  useEffect(() => {
    if (!date || !user?.profesionalId) return;

    const fetchAtendidosHoy = async () => {
      const fechaISO = date.toISOString().split("T")[0];
      try {
        const res = await fetch(`/api/profesional/pacientes_atendidos?fecha=${fechaISO}&profesionalId=${user.profesionalId}`);
        const data = await res.json();
        setAtendidosHoy(data.atendidosHoy);
      } catch (error) {
        console.error("Error al obtener turnos atendidos hoy:", error);
      }
    };

    fetchAtendidosHoy();
  }, [date, user?.profesionalId]);

  const abrirModalCompletarTurno = (idTurno: number) => {
    setSelectedTurnoId(idTurno);
    setModalOpen(true);
  };

  const abrirModalHistorial = (turno: Turno) => {
    setSelectedPacienteHistorial({
      id_paciente: turno.pacientes.id_paciente,
      pacienteInfo: {
        ...turno.pacientes,
        obras_sociales: turno.pacientes.obras_sociales
      }
    });
    setModalHistorialOpen(true);
  };

  const cerrarModalHistorial = () => {
    setModalHistorialOpen(false);
    setSelectedPacienteHistorial(null);
  };

  const handleTurnoCompletado = () => {
    // Actualizar la lista de turnos
    fetchTurnos();
    // Actualizar contador de atendidos
    setAtendidosHoy(prev => prev + 1);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setSelectedTurnoId(null);
  };

  return (
    <div>
      <h1 className="text-black font-bold">Ver mis Turnos</h1>
      <div className="flex flex-wrap">
        {/* 📌 Calendario */}
        <div className="w-2/5 p-2">
          <Calendar
            value={date}
            onChange={(e) => setDate(e.value as Date)}
            inline
            dateTemplate={dateTemplate}
            className="w-full h-120"
            dateFormat="dd/mm/yy"
          />
        </div>

        {/* 📌 Tabla y filtros */}
        <div className="w-3/5 p-2">
          <Card title={`Turnos para ${formatDateWithWeekday(displayedDate)}`}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Pacientes atendidos */}
              <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-teal-600 rounded-full">
                  <i className="pi pi-check-circle text-white text-xl"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-0">Pacientes atendidos</p>
                  <p className="text-2xl font-bold text-teal-700 mb-0">{atendidosHoy}</p>
                </div>
              </div>

              {/* Pacientes restantes */}
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-600 rounded-full">
                  <i className="pi pi-clock text-white text-xl"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-0">Pacientes restantes</p>
                  <p className="text-2xl font-bold text-amber-700 mb-0">{turnosFiltrados.length}</p>
                </div>
              </div>
            </div>
            <Divider />

            <div className="card flex justify-content-center">
              {/* Dropdown pacientes */}
              <div className="ml-4 w-1/3">
                <Dropdown
                  value={selectedPaciente}
                  onChange={(e) => setSelectedPaciente(e.value)}
                  options={pacientesDelDia}
                  placeholder="Seleccione un paciente"
                  showClear
                  filter
                />
              </div>

              <div className="ml-8 w-1/3">
                <Dropdown
                  value={selectedTipo}
                  onChange={(e) => setSelectedTipo(e.value)}
                  options={tiposConsulta}
                  placeholder="Tipo de Consulta"
                  showClear
                />
              </div>

              <div className="ml-8 w-1/3 flex gap-2">
                <Button
                  icon="pi pi-filter-slash"
                  label="Limpiar filtros"
                  severity="secondary"
                  className="p-button-outlined"
                  onClick={() => { setSelectedPaciente(null); setSelectedTipo(null); }}
                />
                <Button
                  icon="pi pi-refresh"
                  severity="info"
                  className="p-button-outlined"
                  onClick={fetchTurnos}
                  tooltip="Refrescar turnos"
                  tooltipOptions={{ position: 'bottom' }}
                />
              </div>
            </div>
          </Card>

          {/* 📌 Tabla turnos */}
          <DataTable
            value={turnosData}
            tableStyle={{ minWidth: '50rem' }}
            className="pt-2"
            rowClassName={(data) => data.isEmpty ? 'bg-gray-100' : ''}
          >
            <Column
              field="horario"
              header="Horario"
              style={{ width: '120px' }}
              body={(rowData) => (
                <span className={`font-semibold ${rowData.isEmpty ? 'text-gray-400' : 'text-teal-700'}`}>
                  {rowData.horario}
                </span>
              )}
            />
            <Column
              field="paciente"
              header="Paciente"
              body={(rowData) => (
                <span className={rowData.isEmpty ? 'text-gray-400 italic' : ''}>
                  {rowData.isEmpty ? 'Disponible' : rowData.paciente}
                </span>
              )}
            />
            <Column
              field="tipoConsulta"
              header="Tipo de consulta"
              body={(rowData) => (
                <span className={rowData.isEmpty ? 'text-gray-400' : ''}>
                  {rowData.isEmpty ? '-' : rowData.tipoConsulta}
                </span>
              )}
            />
            <Column
              field="obraSocial"
              header="Obra social"
              body={(rowData) => (
                <span className={rowData.isEmpty ? 'text-gray-400' : ''}>
                  {rowData.isEmpty ? '-' : rowData.obraSocial}
                </span>
              )}
            />
            <Column
              header="Acciones"
              style={{ width: '150px' }}
              body={(rowData) => {
                if (rowData.isEmpty) {
                  return (
                    <span className="text-gray-400 text-sm italic">Sin turno</span>
                  );
                }

                // Encontrar el turno completo para pasar al modal de historial
                const turnoCompleto = turnos.find(t => t.id_turno === rowData.id);

                return (
                  <div className="flex gap-2">
                    {/* Botón Ver Historial */}
                    <Button
                      icon="pi pi-folder-open"
                      className="p-button-text p-button-info"
                      tooltip="Ver historial clínico"
                      tooltipOptions={{ position: 'top' }}
                      onClick={() => turnoCompleto && abrirModalHistorial(turnoCompleto)}
                    />

                    {/* Botón Completar Turno */}
                    <Button
                      icon="pi pi-check"
                      className="p-button-outlined p-button-success"
                      tooltip="Completar turno"
                      tooltipOptions={{ position: 'top' }}
                      onClick={() => abrirModalCompletarTurno(rowData.id)}
                    />
                  </div>
                );
              }}
            />
          </DataTable>
        </div>
      </div>

      <CompletarTurnoDialog
        isOpen={modalOpen}
        onClose={cerrarModal}
        turnoId={selectedTurnoId}
        onTurnoCompletado={handleTurnoCompletado}
      />

      <VerHistorialDialog
        isOpen={modalHistorialOpen}
        onClose={cerrarModalHistorial}
        pacienteId={selectedPacienteHistorial?.id_paciente}
        pacienteInfo={selectedPacienteHistorial?.pacienteInfo}
      />
    </div>
  );
}