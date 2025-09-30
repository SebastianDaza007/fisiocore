"use client";

import { useState, useEffect } from "react";
import { RegistrarPacienteDialog } from "./Modal";
import { TurnosUI, Turno } from "./turnoscomp";

export default function TurnosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<number | null>(null);
  const [obraSocialSeleccionada, setObraSocialSeleccionada] = useState("");
  const [tipoConsultaSeleccionada, setTipoConsultaSeleccionada] = useState<number | null>(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);

  const [pacientes, setPacientes] = useState<{ dni: string; nombre: string; id: number }[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<{ dni: string; nombre: string; id: number } | null>(null);
  const [loadingPacientes, setLoadingPacientes] = useState(false);

  const [profesionales, setProfesionales] = useState<{
    id: number;
    nombre: string;
    especialidad: string;
    obras_sociales: { id_obra_social: number; nombre_obra_social: string }[];
  }[]>([]);
  const [loadingProfesionales, setLoadingProfesionales] = useState(false);

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);

  const [tiposConsulta, setTiposConsulta] = useState<{ id_tipo_consulta: number; nombre_tipo_consulta: string }[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  // NUEVO: Estado para el popup de éxito
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // ------------------- Fetch Pacientes -------------------
  useEffect(() => {
    const fetchPacientes = async () => {
      setLoadingPacientes(true);
      try {
        const res = await fetch("/api/paciente");
        if (res.ok) {
          const data = await res.json();
          const pacientesFormateados = data.map((p: any) => ({
            id: p.id_paciente,
            dni: p.dni_paciente,
            nombre: `${p.nombre_paciente} ${p.apellido_paciente}`,
          }));
          setPacientes(pacientesFormateados);
        } else {
          console.error("Error en respuesta de pacientes:", res.status);
        }
      } catch (error) {
        console.error("Error al traer pacientes:", error);
      } finally {
        setLoadingPacientes(false);
      }
    };
    fetchPacientes();
  }, []);

  // ------------------- Fetch Profesionales -------------------
  useEffect(() => {
    const fetchProfesionales = async () => {
      setLoadingProfesionales(true);
      try {
        const res = await fetch("/api/profesional");
        if (res.ok) {
          const data = await res.json();
          setProfesionales(data);
        } else {
          console.error("Error en respuesta de profesionales:", res.status);
        }
      } catch (error) {
        console.error("Error al traer profesionales:", error);
      } finally {
        setLoadingProfesionales(false);
      }
    };
    fetchProfesionales();
  }, []);

  // ------------------- Fetch Tipos de Consulta -------------------
  useEffect(() => {
    const fetchTiposConsulta = async () => {
      setLoadingTipos(true);
      try {
        const res = await fetch("/api/tipos_consulta");
        if (res.ok) {
          const data = await res.json();
          setTiposConsulta(data);
        } else {
          console.error("Error en respuesta de tipos consulta:", res.status);
        }
      } catch (error) {
        console.error("Error al traer tipos de consulta:", error);
      } finally {
        setLoadingTipos(false);
      }
    };
    fetchTiposConsulta();
  }, []);

  // ------------------- Fetch Slots Disponibles -------------------
  useEffect(() => {
    const fetchTurnos = async () => {
      setLoadingTurnos(true);
      try {
        const resSlots = await fetch("/api/horarios_prof");
        if (resSlots.ok) {
          const slotsData = await resSlots.json();
          
          const turnosFormateados: Turno[] = slotsData.map((s: any, idx: number) => ({
            id: s.id || idx + 1,
            fecha: s.fecha,
            hora: s.hora,
            especialidad: s.especialidad,
            estado: "disponible",
            profesionalId: Number(s.profesional_id),
            profesionalNombre: s.profesional_nombre || "",
          }));

          setTurnos(turnosFormateados);
        } else {
          console.error("Error en respuesta de horarios_prof:", resSlots.status);
          setTurnos([]);
        }
      } catch (error) {
        console.error("Error al traer slots disponibles:", error);
        setTurnos([]);
      } finally {
        setLoadingTurnos(false);
      }
    };
    fetchTurnos();
  }, []);

  // ------------------- Filtrado dinámico -------------------
  const turnosFiltrados = turnos.filter((t) => {
    let coincide = true;
    if (profesionalSeleccionado) {
      coincide = coincide && t.profesionalId === profesionalSeleccionado;
    }
    if (especialidadSeleccionada) {
      coincide = coincide && t.especialidad.toLowerCase().includes(especialidadSeleccionada.toLowerCase());
    }
    return coincide;
  });

  // ------------------- Handlers -------------------
  const handleLimpiar = () => {
    setTurnoSeleccionado(null);
    setPacienteSeleccionado(null);
    setEspecialidadSeleccionada("");
    setProfesionalSeleccionado(null);
    setObraSocialSeleccionada("");
    setTipoConsultaSeleccionada(null);
  };

  // MODIFICADO: handleAgendar con popup de éxito
  const handleAgendar = async () => {
    if (!turnoSeleccionado) {
      alert("❌ Selecciona un turno primero");
      return;
    }
    if (!pacienteSeleccionado) {
      alert("❌ Selecciona un paciente primero");
      return;
    }
    if (!tipoConsultaSeleccionada) {
      alert("❌ Selecciona un tipo de consulta");
      return;
    }

    try {
      const datosTurno = {
        paciente_id: pacienteSeleccionado.id,
        profesional_id: turnoSeleccionado.profesionalId,
        fecha_turno: turnoSeleccionado.fecha,
        hora_turno: turnoSeleccionado.hora,
        tipo_consulta_id: tipoConsultaSeleccionada,
        creado_por_usuario_id: 1
      };

      const res = await fetch("/api/turno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosTurno),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Mostrar popup de éxito en lugar del alert
        setShowSuccessPopup(true);
        
        // Remover el turno agendado de la lista
        setTurnos(prevTurnos => 
          prevTurnos.filter(t => t.id !== turnoSeleccionado.id)
        );
        
        // Ocultar popup después de 3 segundos y limpiar formulario
        setTimeout(() => {
          setShowSuccessPopup(false);
          handleLimpiar();
        }, 3000);
        
      } else {
        alert(`❌ Error al confirmar turno: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al confirmar turno:", error);
      alert("❌ Ocurrió un error al confirmar el turno");
    }
  };

  // ------------------- Render -------------------
  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 overflow-hidden">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Agendar Turnos</h1>
        <p className="text-gray-600">Selecciona un paciente y un turno disponible</p>
      </div>

      <TurnosUI
        pacientes={pacientes}
        pacienteSeleccionado={pacienteSeleccionado}
        setPacienteSeleccionado={setPacienteSeleccionado}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        especialidadSeleccionada={especialidadSeleccionada}
        setEspecialidadSeleccionada={setEspecialidadSeleccionada}
        profesionalSeleccionado={profesionalSeleccionado}
        setProfesionalSeleccionado={setProfesionalSeleccionado}
        profesionales={profesionales}
        loadingProfesionales={loadingProfesionales}
        obraSocialSeleccionada={obraSocialSeleccionada}
        setObraSocialSeleccionada={setObraSocialSeleccionada}
        tipoConsultaSeleccionada={tipoConsultaSeleccionada}
        setTipoConsultaSeleccionada={setTipoConsultaSeleccionada}
        turnoSeleccionado={turnoSeleccionado}
        setTurnoSeleccionado={setTurnoSeleccionado}
        turnosFiltrados={turnosFiltrados}
        handleLimpiar={handleLimpiar}
        handleAgendar={handleAgendar}
        tiposConsulta={tiposConsulta}
        loadingTurnos={loadingTurnos}
        loadingTipos={loadingTipos}
      />

      {/* NUEVO: Popup de éxito */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">¡Turno Confirmado!</h3>
              <p className="text-gray-600 mb-4">
                El turno para {pacienteSeleccionado?.nombre} ha sido agendado exitosamente.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full animate-progress"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Cerrando automáticamente...</p>
            </div>
          </div>
        </div>
      )}

      <RegistrarPacienteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onPacienteRegistrado={() => {
          window.location.reload();
        }}
      />

      {/* Estilos para la animación de progreso */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
      `}</style>
    </div>
  );
}