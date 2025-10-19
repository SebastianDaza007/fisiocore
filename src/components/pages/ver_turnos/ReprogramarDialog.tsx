"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import Button from "@/components/common/button";
import type { Turno } from "./types";

type Props = {
  visible: boolean;
  turno: Turno | null;
  onHide: () => void;
  onConfirm: (turnoId: number, nuevaFecha: Date, nuevaHora: string) => Promise<void>;
};

type HorarioDisponible = {
  hora: string;
  disponible: boolean;
};

export default function ReprogramarDialog({ visible, turno, onHide, onConfirm }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHora, setSelectedHora] = useState<string>("");
  const [horarios, setHorarios] = useState<HorarioDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [diasLaborables, setDiasLaborables] = useState<number[]>([]);

  // Cargar días laborables del profesional
  useEffect(() => {
    if (!visible || !turno?.profesionalId) return;

    const fetchDiasLaborables = async () => {
      try {
        const res = await fetch(`/api/profesional/${turno.profesionalId}/dias-laborables`);
        if (!res.ok) return;
        const data = await res.json();
        setDiasLaborables(data.dias || []);
      } catch (error) {
        console.error("Error cargando días laborables:", error);
      }
    };

    fetchDiasLaborables();
  }, [visible, turno?.profesionalId]);

  // Reset cuando se abre el dialog
  useEffect(() => {
    if (visible && turno) {
      setSelectedDate(null);
      setSelectedHora("");
      setHorarios([]);
    }
  }, [visible, turno]);

  // Cargar horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    if (!selectedDate || !turno?.profesionalId) {
      setHorarios([]);
      return;
    }

    const fetchHorarios = async () => {
      setLoadingHorarios(true);
      try {
        const year = selectedDate.getFullYear();
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
        const day = selectedDate.getDate().toString().padStart(2, "0");
        const fechaStr = `${year}-${month}-${day}`;

        const res = await fetch(
          `/api/profesional/${turno.profesionalId}/horarios?fecha=${fechaStr}`
        );

        if (!res.ok) throw new Error("Error al cargar horarios");

        const data = await res.json();
        setHorarios(data.horarios || []);
      } catch (error) {
        console.error("Error cargando horarios:", error);
        setHorarios([]);
      } finally {
        setLoadingHorarios(false);
      }
    };

    fetchHorarios();
  }, [selectedDate, turno?.profesionalId]);

  const handleConfirm = async () => {
    if (!turno || !selectedDate || !selectedHora) return;

    setLoading(true);
    try {
      await onConfirm(turno.id, selectedDate, selectedHora);
      onHide();
    } catch (error) {
      console.error("Error al reprogramar:", error);
    } finally {
      setLoading(false);
    }
  };

  const isConfirmDisabled = !selectedDate || !selectedHora || loading;

  // Función para deshabilitar días no laborables
  // diasLaborables contiene IDs de BD: 1=lunes, 2=martes, ..., 7=domingo
  // Calendar getDay(): 0=domingo, 1=lunes, 2=martes, ..., 6=sábado
  const disabledDays = diasLaborables.length > 0
    ? [0, 1, 2, 3, 4, 5, 6].filter(day => {
        // Convertir día de Calendar (0-6) a día de BD (1-7)
        const diaBD = day === 0 ? 7 : day;
        return !diasLaborables.includes(diaBD);
      })
    : undefined;

  return (
    <Dialog
      header="Reprogramar Turno"
      visible={visible}
      onHide={onHide}
      style={{ width: "600px" }}
      modal
      dismissableMask
      className="dialog-reprogramar"
    >
      {turno && (
        <div className="space-y-4">
          {/* Información del turno */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Datos del turno</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Paciente:</span>
                <p className="font-medium text-gray-900">{turno.pacienteNombre}</p>
              </div>
              <div>
                <span className="text-gray-600">DNI:</span>
                <p className="font-medium text-gray-900">{turno.pacienteDni}</p>
              </div>
              <div>
                <span className="text-gray-600">Profesional:</span>
                <p className="font-medium text-gray-900">{turno.profesional}</p>
              </div>
              <div>
                <span className="text-gray-600">Especialidad:</span>
                <p className="font-medium text-gray-900">{turno.especialidad}</p>
              </div>
              <div>
                <span className="text-gray-600">Tipo de consulta:</span>
                <p className="font-medium text-gray-900">{turno.tipoConsulta}</p>
              </div>
              <div>
                <span className="text-gray-600">Horario actual:</span>
                <p className="font-medium text-teal-700">{turno.hora}</p>
              </div>
            </div>
          </div>

          {/* Selección de nueva fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva fecha <span className="text-red-500">*</span>
            </label>
            <Calendar
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.value as Date);
                setSelectedHora("");
              }}
              inline
              minDate={new Date()}
              dateFormat="dd/mm/yy"
              disabledDays={disabledDays}
              className="w-full"
            />
          </div>

          {/* Selección de horario */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo horario <span className="text-red-500">*</span>
              </label>

              {loadingHorarios ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="pi pi-spin pi-spinner text-2xl mb-2" />
                  <p>Cargando horarios disponibles...</p>
                </div>
              ) : horarios.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <i className="pi pi-calendar-times text-2xl mb-2" />
                  <p>No hay horarios disponibles para esta fecha</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  {horarios.map((h) => (
                    <button
                      key={h.hora}
                      type="button"
                      disabled={!h.disponible}
                      onClick={() => setSelectedHora(h.hora)}
                      className={`
                        px-3 py-2 rounded-md text-sm font-medium transition-all
                        ${
                          !h.disponible
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : selectedHora === h.hora
                            ? "bg-teal-700 text-white shadow-md"
                            : "bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-300"
                        }
                      `}
                    >
                      {h.hora}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resumen de cambios */}
          {selectedDate && selectedHora && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <i className="pi pi-info-circle text-teal-700 text-lg mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-teal-900 mb-1">
                    Nuevo turno programado para:
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-semibold">
                      {selectedDate.toLocaleDateString("es-AR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    {" a las "}
                    <span className="font-semibold">{selectedHora}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              severity="secondary"
              outlined
              onClick={onHide}
              disabled={loading}
            />
            <Button
              label={loading ? "Guardando..." : "Confirmar reprogramación"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
              severity="success"
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
}
