"use client";

import { FaCalendarAlt, FaClock, FaTrash, FaCheck, FaPlus } from "react-icons/fa";
import { Turno } from "./page";
import { useEffect, useState, useRef } from "react";

type TurnosUIProps = {
  pacientes: { dni: string; nombre: string }[];
  pacienteSeleccionado: { dni: string; nombre: string } | null;
  setPacienteSeleccionado: (paciente: { dni: string; nombre: string } | null) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (val: boolean) => void;
  especialidadSeleccionada: string;
  setEspecialidadSeleccionada: (val: string) => void;
  obraSocialSeleccionada: string;
  setObraSocialSeleccionada: (val: string) => void;
  tipoConsultaSeleccionada: string;
  setTipoConsultaSeleccionada: (val: string) => void;
  turnoSeleccionado: Turno | null;
  setTurnoSeleccionado: (turno: Turno) => void;
  turnosFiltrados: Turno[];
  handleLimpiar: () => void;
  handleAgendar: () => void;
};

type TipoConsulta = {
  id_tipo_consulta: number;
  nombre_tipo_consulta: string;
};

type ObraSocial = {
  id_obra_social: number;
  nombre_obra_social: string;
};

type Especialidad = {
  id_especialidad: number;
  nombre_especialidad: string;
};

export function TurnosUI({
  pacientes,
  pacienteSeleccionado,
  setPacienteSeleccionado,
  isDialogOpen,
  setIsDialogOpen,
  especialidadSeleccionada,
  setEspecialidadSeleccionada,
  obraSocialSeleccionada,
  setObraSocialSeleccionada,
  tipoConsultaSeleccionada,
  setTipoConsultaSeleccionada,
  turnoSeleccionado,
  setTurnoSeleccionado,
  turnosFiltrados,
  handleLimpiar,
  handleAgendar,
}: TurnosUIProps) {
  const [busqueda, setBusqueda] = useState("");
  const [pacientesFiltrados, setPacientesFiltrados] = useState<{ dni: string; nombre: string }[]>([]);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [tiposConsulta, setTiposConsulta] = useState<TipoConsulta[]>([]);
  const [loadingObras, setLoadingObras] = useState(true);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);
  const [loadingTipos, setLoadingTipos] = useState(true);

  // Filtrado dinámico por NOMBRE
  useEffect(() => {
    const busquedaLimpia = busqueda.trim().toLowerCase();
    if (!busquedaLimpia) {
      setPacientesFiltrados([]);
    } else {
      setPacientesFiltrados(
        pacientes.filter((p) => p.nombre.toLowerCase().includes(busquedaLimpia))
      );
    }
  }, [busqueda, pacientes]);

  // Cargar tipos de consulta
  useEffect(() => {
    const fetchTiposConsulta = async () => {
      try {
        const res = await fetch("/api/tipos_consulta");
        if (res.ok) {
          const data: TipoConsulta[] = await res.json();
          setTiposConsulta(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingTipos(false);
      }
    };
    fetchTiposConsulta();
  }, []);

  // Cargar obras sociales
  useEffect(() => {
    const fetchObrasSociales = async () => {
      try {
        const res = await fetch("/api/obras_sociales");
        if (res.ok) {
          const data: ObraSocial[] = await res.json();
          setObrasSociales(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingObras(false);
      }
    };
    fetchObrasSociales();
  }, []);

  // Cargar especialidades
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const res = await fetch("/api/especialidades");
        if (res.ok) {
          const data: Especialidad[] = await res.json();
          setEspecialidades(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingEspecialidades(false);
      }
    };
    fetchEspecialidades();
  }, []);

  // Cerrar lista si clickeo afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setMostrarOpciones(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex w-full h-full bg-white rounded-lg shadow-lg overflow-hidden p-8">
      {/* Columna izquierda */}
      <div className="w-1/2 pr-8 space-y-6 overflow-y-auto">
        {/* Paciente */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Paciente</h2>
          <div className="flex items-center gap-2 mb-2 relative text-gray-800" ref={wrapperRef}>
            <input
              type="text"
              value={pacienteSeleccionado ? pacienteSeleccionado.nombre : busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPacienteSeleccionado(null);
                setMostrarOpciones(true);
              }}
              onFocus={() => setMostrarOpciones(true)}
              placeholder="Ingrese nombre del paciente"
              className="flex-1 p-2 border border-gray-800 rounded-lg"
            />
            <button
              onClick={() => setIsDialogOpen(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              title="Agregar nuevo paciente"
            >
              <FaPlus size={20} />
            </button>

            {/* Lista autocompletado */}
            {mostrarOpciones && pacientesFiltrados.length > 0 && (
              <ul className="absolute left-0 top-full bg-white border border-gray-300 rounded-lg w-full mt-1 max-h-60 overflow-auto shadow-lg z-50">
                {pacientesFiltrados.map((p, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                    onClick={() => {
                      setPacienteSeleccionado(p);
                      setBusqueda("");
                      setMostrarOpciones(false);
                    }}
                  >
                    {p.nombre} - {p.dni}
                  </li>
                ))}
              </ul>
            )}
            {mostrarOpciones && pacientesFiltrados.length === 0 && busqueda.length > 0 && (
              <p className="text-gray-500 mt-1 absolute top-full bg-white p-2 rounded shadow">
                No hay coincidencias
              </p>
            )}
          </div>

          {pacienteSeleccionado && (
            <p className="text-gray-700 mt-2">DNI: {pacienteSeleccionado.dni}</p>
          )}
        </div>

        {/* Datos del turno */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Datos del Turno</h2>

          {/* Especialidad */}
          <label className="block mb-2 font-medium text-gray-700">Especialidad</label>
          {loadingEspecialidades ? (
            <p className="text-gray-500 mb-4">Cargando especialidades...</p>
          ) : (
            <select
              value={especialidadSeleccionada}
              onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
              className="w-full p-2 border rounded-lg text-gray-800 mb-4"
            >
              <option value="">Seleccione una especialidad</option>
              {especialidades.map((esp) => (
                <option key={esp.id_especialidad} value={esp.nombre_especialidad}>
                  {esp.nombre_especialidad}
                </option>
              ))}
            </select>
          )}

          {/* Tipo de consulta */}
          <label className="block mb-2 font-medium text-gray-700">Tipo de consulta</label>
          {loadingTipos ? (
            <p className="text-gray-500 mb-4">Cargando tipos de consulta...</p>
          ) : (
            <select
              value={tipoConsultaSeleccionada}
              onChange={(e) => setTipoConsultaSeleccionada(e.target.value)}
              className="w-full p-2 border rounded-lg text-gray-800 mb-4"
            >
              <option value="">Seleccione el tipo de consulta</option>
              {tiposConsulta.map((tipo) => (
                <option key={tipo.id_tipo_consulta} value={tipo.nombre_tipo_consulta}>
                  {tipo.nombre_tipo_consulta}
                </option>
              ))}
            </select>
          )}

          {/* Obra social */}
          <label className="block mb-2 font-medium text-gray-700">Obra Social</label>
          {loadingObras ? (
            <p className="text-gray-500 mb-4">Cargando obras sociales...</p>
          ) : (
            <select
              value={obraSocialSeleccionada}
              onChange={(e) => setObraSocialSeleccionada(e.target.value)}
              className="w-full p-2 border rounded-lg text-gray-800 mb-4"
            >
              <option value="">Seleccione una obra social</option>
              {obrasSociales.map((obra) => (
                <option key={obra.id_obra_social} value={obra.nombre_obra_social}>
                  {obra.nombre_obra_social}
                </option>
              ))}
            </select>
          )}

          {/* Fecha y hora */}
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label className="block mb-2 font-medium text-gray-700">Fecha</label>
              <div className="relative">
                <input
                  type="text"
                  value={turnoSeleccionado?.fecha || ""}
                  readOnly
                  className="w-full p-2 border rounded-lg text-gray-800 pr-10 bg-gray-100"
                />
                <FaCalendarAlt className="absolute right-3 top-3 text-gray-600" />
              </div>
            </div>
            <div className="w-1/2">
              <label className="block mb-2 font-medium text-gray-700">Hora</label>
              <div className="relative">
                <input
                  type="text"
                  value={turnoSeleccionado?.hora || ""}
                  readOnly
                  className="w-full p-2 border rounded-lg text-gray-800 pr-10 bg-gray-100"
                />
                <FaClock className="absolute right-3 top-3 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              onClick={handleLimpiar}
              className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
            >
              <FaTrash /> Limpiar formulario
            </button>
            <button
              onClick={handleAgendar}
              className="flex-1 flex items-center justify-center gap-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FaCheck /> Agendar turno
            </button>
          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="w-1/2 pl-8 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Próximos turnos</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-300 text-gray-900">
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Horario</th>
              <th className="p-2 text-left">Especialidad</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2 text-center">Seleccionar</th>
            </tr>
          </thead>
          <tbody>
            {turnosFiltrados.map((turno) => (
              <tr key={turno.id} className="hover:bg-gray-100">
                <td className="p-2 text-gray-900 border-b border-gray-300">{turno.fecha}</td>
                <td className="p-2 text-gray-900 border-b border-gray-300">{turno.hora}</td>
                <td className="p-2 text-gray-900 border-b border-gray-300">{turno.especialidad}</td>
                <td
                  className={`p-2 capitalize border-b border-gray-300 ${
                    turno.estado === "ocupado"
                      ? "text-red-600 font-semibold"
                      : "text-green-600 font-semibold"
                  }`}
                >
                  {turno.estado}
                </td>
                <td className="p-2 text-center border-b border-gray-300">
                  <input
                    type="checkbox"
                    disabled={turno.estado === "ocupado"}
                    checked={turnoSeleccionado?.id === turno.id}
                    onChange={() => setTurnoSeleccionado(turno)}
                  />
                </td>
              </tr>
            ))}
            {turnosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 p-4">
                  No hay turnos disponibles para esta especialidad
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
