"use client";

import { useState, useEffect } from "react";
import { RegistrarPacienteDialog } from "../paciente/Modal";
import { TurnosUI } from "./turnoscomp";

export type Turno = {
  id: number;
  fecha: string;
  hora: string;
  especialidad: string;
  estado: "disponible" | "ocupado";
};

export default function TurnosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
  const [obraSocialSeleccionada, setObraSocialSeleccionada] = useState("");
  const [tipoConsultaSeleccionada, setTipoConsultaSeleccionada] = useState("");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);

  // Pacientes traídos desde la base de datos
  const [pacientes, setPacientes] = useState<{ dni: string; nombre: string }[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<{ dni: string; nombre: string } | null>(null);
  const [loadingPacientes, setLoadingPacientes] = useState(false);

  // Traer pacientes desde API al abrir la página
  useEffect(() => {
    const fetchPacientes = async () => {
      setLoadingPacientes(true);
      try {
        const res = await fetch("/api/paciente");
        if (res.ok) {
          const data = await res.json();
          const pacientesFormateados = data.map((p: any) => ({
            dni: p.dni_paciente,
            nombre: `${p.nombre_paciente} ${p.apellido_paciente}`,
          }));
          setPacientes(pacientesFormateados);
        } else {
          console.error("Error al traer pacientes:", res.statusText);
        }
      } catch (error) {
        console.error("Error al traer pacientes:", error);
      } finally {
        setLoadingPacientes(false);
      }
    };

    fetchPacientes();
  }, []);

  // Turnos de ejemplo
  const turnos: Turno[] = [
    { id: 1, fecha: "Jueves 25/9", hora: "10:00", especialidad: "Kinesiólogo", estado: "disponible" },
    { id: 2, fecha: "Viernes 26/9", hora: "11:30", especialidad: "Fisioterapeuta", estado: "disponible" },
    { id: 3, fecha: "Viernes 26/9", hora: "14:00", especialidad: "Quiropráctico", estado: "disponible" },
 
  ];

  const turnosFiltrados = especialidadSeleccionada
    ? turnos.filter((t) => t.especialidad === especialidadSeleccionada)
    : [];

  // Limpiar todo el formulario
  const handleLimpiar = () => {
    setTurnoSeleccionado(null);
    setPacienteSeleccionado(null);
    setEspecialidadSeleccionada("");
    setObraSocialSeleccionada("");
    setTipoConsultaSeleccionada("");
  };

  // Simulación de agendar
  const handleAgendar = () => {
    if (!turnoSeleccionado) {
      alert("Selecciona un turno primero");
      return;
    }
    if (!pacienteSeleccionado) {
      alert("Selecciona un paciente primero");
      return;
    }

    alert(
      `Agendado:\nPaciente: ${pacienteSeleccionado.nombre} (DNI: ${pacienteSeleccionado.dni})\nEspecialidad: ${especialidadSeleccionada}\nObra Social: ${obraSocialSeleccionada}\nTipo de consulta: ${tipoConsultaSeleccionada}\nFecha: ${turnoSeleccionado.fecha}\nHora: ${turnoSeleccionado.hora}`
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 overflow-hidden">
      <TurnosUI
        pacientes={pacientes}  
        pacienteSeleccionado={pacienteSeleccionado} 
        setPacienteSeleccionado={setPacienteSeleccionado}  
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        especialidadSeleccionada={especialidadSeleccionada}
        setEspecialidadSeleccionada={setEspecialidadSeleccionada}
        obraSocialSeleccionada={obraSocialSeleccionada}
        setObraSocialSeleccionada={setObraSocialSeleccionada}
        tipoConsultaSeleccionada={tipoConsultaSeleccionada}
        setTipoConsultaSeleccionada={setTipoConsultaSeleccionada}
        turnoSeleccionado={turnoSeleccionado}
        setTurnoSeleccionado={setTurnoSeleccionado}
        turnosFiltrados={turnosFiltrados}
        handleLimpiar={handleLimpiar}
        handleAgendar={handleAgendar}
      />

      {/* Modal de nuevo paciente */}
      <RegistrarPacienteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onPacienteRegistrado={() => console.log("Paciente registrado")}
      />
    </div>
  );
}
