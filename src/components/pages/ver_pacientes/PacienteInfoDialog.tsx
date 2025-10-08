"use client";

import React, { useEffect, useState } from "react";
import { Paciente } from "./PacienteTable";

interface PacienteInfoDialogProps {
  isOpen: boolean;
  paciente: Paciente | null;
  onClose: () => void;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
}

function formatShortDate(value?: string | Date | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  // Formato: "DD/MM/YYYY"
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function calcularEdad(fecha?: string | Date | null): number | null {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - d.getFullYear();
  const m = hoy.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) edad--;
  return edad;
}

const ItemRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
    <span className="text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

type FullPaciente = {
  id_paciente: number;
  telefono_paciente?: string | null;
  email_paciente?: string | null;
  direccion_paciente?: string | null;
  obras_sociales?: { nombre_obra_social: string } | null;
};

type TurnoInfo = {
  id?: string | number;
  fecha?: string;
  profesional?: string;
  hora?: string;
  tipoConsulta?: string;
};

const PacienteInfoDialog: React.FC<PacienteInfoDialogProps> = ({ isOpen, paciente, onClose }) => {
  const [obraSocialNombre, setObraSocialNombre] = useState<string | null>(null);
  const [obraLoading, setObraLoading] = useState(false);
  const [fullPaciente, setFullPaciente] = useState<FullPaciente | null>(null);
  const [turnos, setTurnos] = useState<TurnoInfo[]>([]);
  const [turnosLoading, setTurnosLoading] = useState(false);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [isOpen, onClose]);

  // Cargar datos completos del paciente (teléfono, email, obra social) desde /api/paciente
  useEffect(() => {
    const loadFull = async () => {
      if (!isOpen || !paciente) return;
      try {
        setObraLoading(true);
        const res = await fetch('/api/paciente');
        if (!res.ok) throw new Error('No se pudo obtener pacientes');
        const list = await res.json();
        const found = Array.isArray(list)
          ? list.find((p: FullPaciente) => Number(p.id_paciente) === Number(paciente.id_paciente))
          : null;
        setFullPaciente(found || null);
        const nombreObra: string | null = found?.obras_sociales?.nombre_obra_social ?? null;
        setObraSocialNombre(nombreObra);
      } catch (e) {
        console.error(e);
        setFullPaciente(null);
        setObraSocialNombre(null);
      } finally {
        setObraLoading(false);
      }
    };
    loadFull();
  }, [isOpen, paciente]);

  // Cargar últimos turnos por DNI usando /api/ver_turnos?q=<dni>
  useEffect(() => {
    const loadTurnos = async () => {
      if (!isOpen || !paciente?.dni_paciente) return;
      try {
        setTurnosLoading(true);
        const url = `/api/ver_turnos?q=${encodeURIComponent(paciente.dni_paciente)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('No se pudo obtener turnos');
        const data = await res.json();
        const items: TurnoInfo[] = data?.items ?? [];
        // Tomar los últimos 5 (API ordena ascendente)
        const last = items.slice(-5).reverse();
        setTurnos(last);
      } catch (e) {
        console.error(e);
        setTurnos([]);
      } finally {
        setTurnosLoading(false);
      }
    };
    loadTurnos();
  }, [isOpen, paciente?.dni_paciente]);

  if (!isOpen || !paciente) return null;

  const nombreCompleto = `${paciente.nombre_paciente} ${paciente.apellido_paciente}`.trim();
  const edad = calcularEdad(paciente.fecha_nacimiento_paciente);
  const obraSocialDisplay = obraLoading
    ? 'Cargando...'
    : (obraSocialNombre ?? fullPaciente?.obras_sociales?.nombre_obra_social ?? '-');

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-gray-900">Información del paciente</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Card de datos */}
          <div className="rounded-lg border border-gray-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <i className="pi pi-user text-lg" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{nombreCompleto || "-"}</div>
                <div className="text-sm text-gray-500">{paciente.dni_paciente || "-"}</div>
              </div>
            </div>

            {/* Grid info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <ItemRow label="Edad" value={edad ?? "-"} />
              <ItemRow label="DNI" value={paciente.dni_paciente || "-"} />
              <ItemRow label="Sexo" value={paciente.sexo || "-"} />
              <ItemRow label="Fecha de nacimiento" value={formatDate(paciente.fecha_nacimiento_paciente)} />
              <ItemRow label="Teléfono" value={fullPaciente?.telefono_paciente ?? paciente.telefono_paciente ?? "-"} />
              <ItemRow label="Correo" value={fullPaciente?.email_paciente ?? paciente.email_paciente ?? "-"} />
              <ItemRow label="Domicilio" value={fullPaciente?.direccion_paciente ?? paciente.direccion_paciente ?? "-"} />
              <ItemRow
                label="Obra Social"
                value={
                  <span className={
                    `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ` +
                    (obraSocialDisplay && obraSocialDisplay !== '-' &&obraSocialDisplay !== 'Cargando...'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200')
                  }>
                    {obraSocialDisplay}
                  </span>
                }
              />
            </div>
          </div>

          {/* Últimos turnos */}
          <div className="rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="pi pi-history text-gray-600" />
              <span className="text-sm font-semibold text-gray-900">Últimos turnos</span>
            </div>
            {turnosLoading ? (
              <p className="text-sm text-gray-500">Cargando turnos...</p>
            ) : turnos.length === 0 ? (
              <p className="text-sm text-gray-500">Sin información de turnos disponible.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {turnos.map((t, idx: number) => (
                  <li key={t.id ?? idx} className="py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="pi pi-calendar text-teal-600 text-xs"></i>
                        <span className="text-xs font-semibold text-gray-600">
                          {formatShortDate(t.fecha) || '-'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <i className="pi pi-clock text-teal-600 text-xs"></i>
                        <span className="text-xs font-semibold text-gray-600">
                          {t.hora ?? '--:--'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-800">
                        <span className="font-medium">{t.profesional || 'Profesional'}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full border whitespace-nowrap ${
                      (t.tipoConsulta ?? '').toLowerCase().includes('consul')
                        ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                        : (t.tipoConsulta ?? '').toLowerCase().includes('control')
                          ? 'bg-orange-100 text-orange-900 border-orange-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {t.tipoConsulta || 'Tipo de consulta'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PacienteInfoDialog;
