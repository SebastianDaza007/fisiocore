"use client";

import { FaCalendarAlt, FaClock, FaTrash, FaCheck, FaPlus, FaSearch, FaUserPlus } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";

export type Turno = {
  id: number;
  fecha: string;
  hora: string;
  estado: "disponible" | "ocupado";
  profesionalId: number;
  profesionalNombre: string;
  especialidad: string;
};

type Paciente = {
  dni: string;
  nombre: string;
  id: number;
};

type TipoConsulta = { id_tipo_consulta: number; nombre_tipo_consulta: string };
type ObraSocial = { id_obra_social: number; nombre_obra_social: string };
type Especialidad = { id_especialidad: number; nombre_especialidad: string };

type TurnosUIProps = {
  pacientes: Paciente[];
  pacienteSeleccionado: Paciente | null;
  setPacienteSeleccionado: (paciente: Paciente | null) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (val: boolean) => void;
  especialidadSeleccionada: string;
  setEspecialidadSeleccionada: (val: string) => void;
  profesionalSeleccionado: number | null;
  setProfesionalSeleccionado: (val: number | null) => void;
  profesionales: {
    id: number;
    nombre: string;
    especialidad: string;
    obras_sociales: { id_obra_social: number; nombre_obra_social: string }[];
  }[];
  loadingProfesionales: boolean;
  obraSocialSeleccionada: string;
  setObraSocialSeleccionada: (val: string) => void;
  tipoConsultaSeleccionada: number | null;
  setTipoConsultaSeleccionada: (val: number | null) => void;
  turnoSeleccionado: Turno | null;
  setTurnoSeleccionado: (turno: Turno | null) => void;
  turnosFiltrados: Turno[];
  handleLimpiar: () => void;
  handleAgendar: () => void;
  tiposConsulta: TipoConsulta[];
  loadingTurnos: boolean;
  loadingTipos: boolean;
};

export function TurnosUI({
  pacientes,
  pacienteSeleccionado,
  setPacienteSeleccionado,
  isDialogOpen,
  setIsDialogOpen,
  especialidadSeleccionada,
  setEspecialidadSeleccionada,
  profesionalSeleccionado,
  setProfesionalSeleccionado,
  profesionales,
  loadingProfesionales,
  obraSocialSeleccionada,
  setObraSocialSeleccionada,
  tipoConsultaSeleccionada,
  setTipoConsultaSeleccionada,
  turnoSeleccionado,
  setTurnoSeleccionado,
  turnosFiltrados,
  handleLimpiar,
  handleAgendar,
  tiposConsulta,
  loadingTurnos,
  loadingTipos,
}: TurnosUIProps) {
  const [busqueda, setBusqueda] = useState("");
  const [pacientesFiltrados, setPacientesFiltrados] = useState<Paciente[]>([]);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [obrasSocialesFiltradas, setObrasSocialesFiltradas] = useState<ObraSocial[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loadingObras, setLoadingObras] = useState(true);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);

  // ------------------- Filtrado dinámico de pacientes -------------------
  useEffect(() => {
    const busquedaLimpia = busqueda.trim().toLowerCase();
    if (!busquedaLimpia) {
      setPacientesFiltrados([]);
    } else {
      setPacientesFiltrados(
        pacientes.filter((p) =>
          p.nombre.toLowerCase().includes(busquedaLimpia) ||
          p.dni.includes(busquedaLimpia)
        )
      );
    }
  }, [busqueda, pacientes]);

  // ------------------- Fetch obras sociales -------------------
  useEffect(() => {
    const fetchObrasSociales = async () => {
      try {
        const res = await fetch("/api/obras_sociales");
        if (res.ok) setObrasSociales(await res.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingObras(false);
      }
    };
    fetchObrasSociales();
  }, []);

  // ------------------- Fetch especialidades -------------------
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const res = await fetch("/api/especialidades");
        if (res.ok) setEspecialidades(await res.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingEspecialidades(false);
      }
    };
    fetchEspecialidades();
  }, []);

  // ------------------- Filtrar obras sociales según profesional seleccionado -------------------
  useEffect(() => {
    if (profesionalSeleccionado) {
      const profesional = profesionales.find((p) => p.id === profesionalSeleccionado);
      if (profesional && profesional.obras_sociales && profesional.obras_sociales.length > 0) {
        setObrasSocialesFiltradas(profesional.obras_sociales);
      } else {
        setObrasSocialesFiltradas(obrasSociales);
      }
    } else {
      setObrasSocialesFiltradas(obrasSociales);
    }
  }, [profesionalSeleccionado, profesionales, obrasSociales]);

  // ------------------- Cerrar dropdown de pacientes al hacer click afuera -------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setMostrarOpciones(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ------------------- Render -------------------
  return (
    <div className="flex w-full h-full bg-white rounded-xl shadow-lg overflow-hidden p-6">
      {/* Columna izquierda */}
      <div className="w-1/2 pr-6 space-y-6 overflow-y-auto">
        {/* Paciente - DISEÑO 50/50 */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FaSearch className="text-blue-600" />
            Seleccionar Paciente
          </h2>
          
          <div className="flex gap-3 items-start">
            {/* Búsqueda - 50% */}
            <div className="flex-1 relative" ref={wrapperRef}>
              <div className="relative">
                <input
                  type="text"
                  value={pacienteSeleccionado ? pacienteSeleccionado.nombre : busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPacienteSeleccionado(null);
                    setMostrarOpciones(true);
                  }}
                  onFocus={() => setMostrarOpciones(true)}
                  placeholder="Buscar paciente..."
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
                />
                <FaSearch className="absolute left-3 top-3.5 text-gray-800" />
              </div>

              {mostrarOpciones && pacientesFiltrados.length > 0 && (
                <ul className="absolute left-0 top-full bg-white border border-gray-300 rounded-lg w-full mt-1 max-h-60 overflow-auto shadow-xl z-50">
                  {pacientesFiltrados.map((p) => (
                    <li
                      key={p.id}
                      className="p-3 hover:bg-blue-50 cursor-pointer text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors"
                      onClick={() => {
                        setPacienteSeleccionado(p);
                        setBusqueda("");
                        setMostrarOpciones(false);
                      }}
                    >
                      <div className="font-medium text-gray-900">{p.nombre}</div>
                      <div className="text-sm text-gray-600">DNI: {p.dni}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Botón Registrar - 50% */}
            <button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex-1 min-w-0"
            >
              <FaUserPlus size={16} className="flex-shrink-0" />
              <span className="whitespace-nowrap text-sm font-semibold">Registrar Nuevo Paciente</span>
            </button>
          </div>

          {/* Paciente seleccionado */}
          {pacienteSeleccionado && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-semibold text-green-800 text-sm">{pacienteSeleccionado.nombre}</p>
                  <p className="text-xs text-green-600">DNI: {pacienteSeleccionado.dni}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Datos del turno */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" />
            Datos del Turno
          </h2>

          {/* Especialidad */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700 text-sm">Especialidad</label>
            {loadingEspecialidades ? (
              <div className="p-3 bg-gray-100 rounded-lg animate-pulse">Cargando especialidades...</div>
            ) : (
              <select
                value={especialidadSeleccionada}
                onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-700"
              >
                <option value="">Seleccione una especialidad</option>
                {especialidades.map((esp) => (
                  <option key={esp.id_especialidad} value={esp.nombre_especialidad}>
                    {esp.nombre_especialidad}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Profesional */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700 text-sm">Profesional</label>
            {loadingProfesionales ? (
              <div className="p-3 bg-gray-100 rounded-lg animate-pulse">Cargando profesionales...</div>
            ) : (
              <select
                value={profesionalSeleccionado || ""}
                onChange={(e) =>
                  setProfesionalSeleccionado(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-700"
              >
                <option value="">Todos los profesionales</option>
                {profesionales
                  .filter((p) =>
                    !especialidadSeleccionada ? true : p.especialidad === especialidadSeleccionada
                  )
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.especialidad})
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Tipo de consulta */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700 text-sm">Tipo de consulta</label>
            {loadingTipos ? (
              <div className="p-3 bg-gray-100 rounded-lg animate-pulse">Cargando tipos de consulta...</div>
            ) : (
              <select
                value={tipoConsultaSeleccionada || ""}
                onChange={(e) =>
                  setTipoConsultaSeleccionada(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-700"
              >
                <option value="">Seleccione el tipo de consulta</option>
                {tiposConsulta && tiposConsulta.length > 0 ? (
                  tiposConsulta.map((tipo) => (
                    <option key={tipo.id_tipo_consulta} value={tipo.id_tipo_consulta}>
                      {tipo.nombre_tipo_consulta}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No hay tipos de consulta disponibles</option>
                )}
              </select>
            )}
          </div>

          {/* Obra social */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700 text-sm">Obra Social</label>
            {loadingObras ? (
              <div className="p-3 bg-gray-100 rounded-lg animate-pulse">Cargando obras sociales...</div>
            ) : (
              <select
                value={obraSocialSeleccionada}
                onChange={(e) => setObraSocialSeleccionada(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-700"
                disabled={!profesionalSeleccionado}
              >
                <option value="">
                  {profesionalSeleccionado
                    ? "Seleccione una obra social"
                    : "Primero seleccione un profesional"}
                </option>
                {obrasSocialesFiltradas.map((obra) => (
                  <option key={obra.id_obra_social} value={obra.nombre_obra_social}>
                    {obra.nombre_obra_social}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Fecha</label>
              <div className="relative">
                <input
                  type="text"
                  value={turnoSeleccionado?.fecha || ""}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 pr-10"
                  placeholder="Seleccione turno"
                />
                <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Hora</label>
              <div className="relative">
                <input
                  type="text"
                  value={turnoSeleccionado?.hora || ""}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 pr-10"
                  placeholder="Seleccione turno"
                />
                <FaClock className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleLimpiar}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
            >
              <FaTrash size={14} />
              Limpiar
            </button>
            <button
              onClick={handleAgendar}
              disabled={!turnoSeleccionado || !pacienteSeleccionado || !tipoConsultaSeleccionada}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
            >
              <FaCheck size={14} />
              Confirmar Turno
            </button>
          </div>
        </div>
      </div>

      {/* Columna derecha - Turnos */}
      <div className="w-1/2 pl-6 overflow-y-auto">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-full">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Turnos Disponibles</h2>
          
          {loadingTurnos ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Cargando turnos disponibles...</div>
            </div>
          ) : turnosFiltrados.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 text-gray-900">
                    <th className="p-3 text-left text-sm font-semibold">Fecha</th>
                    <th className="p-3 text-left text-sm font-semibold">Hora</th>
                    <th className="p-3 text-left text-sm font-semibold">Especialidad</th>
                    <th className="p-3 text-left text-sm font-semibold">Profesional</th>
                    <th className="p-3 text-left text-sm font-semibold">Estado</th>
                    <th className="p-3 text-center text-sm font-semibold">Seleccionar</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {turnosFiltrados.map((turno) => {
                    const profesional = profesionales.find(
                      (p) => p.id === turno.profesionalId
                    );
                    return (
                      <tr
                        key={turno.id}
                        onClick={() => {
                          if (turno.estado !== "ocupado") {
                            setTurnoSeleccionado(turno);
                          }
                        }}
                        className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                          turnoSeleccionado?.id === turno.id ? 'bg-blue-100' : ''
                        } ${turno.estado !== "ocupado" ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                      >
                        <td className="p-3 text-gray-900 text-sm">
                          {turno.fecha}
                        </td>
                        <td className="p-3 text-gray-900 text-sm">
                          {turno.hora}
                        </td>
                        <td className="p-3 text-gray-900 text-sm">
                          {turno.especialidad}
                        </td>
                        <td className="p-3 text-gray-900 text-sm">
                          {profesional?.nombre || turno.profesionalNombre || "-"}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            turno.estado === "ocupado"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-600 text-white"
                          }`}>
                            {turno.estado}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="radio"
                            name="turnoSeleccionado"
                            disabled={turno.estado === "ocupado"}
                            checked={turnoSeleccionado?.id === turno.id}
                            onChange={() => setTurnoSeleccionado(turno)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 pointer-events-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 bg-gray-100 rounded-lg">
              <FaCalendarAlt className="text-2xl mb-2 text-gray-400" />
              <p>No hay turnos disponibles</p>
              <p className="text-sm mt-1">Intente ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}