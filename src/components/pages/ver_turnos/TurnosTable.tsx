import React from "react";
import { Turno } from "./types";
import Button from "@/components/common/button";

type Props = {
  items?: Turno[];
};

export default function TurnosTable({ items = [] }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-700 bg-gray-50">
              <th className="text-left font-semibold py-2 px-3 border-b border-gray-100">Paciente</th>
              <th className="text-left font-semibold py-2 px-3 border-b border-gray-100">Horario</th>
              <th className="text-left font-semibold py-2 px-3 border-b border-gray-100">Especialidad / Profesional</th>
              <th className="text-left font-semibold py-2 px-3 border-b border-gray-100">Tipo de Consulta</th>
              <th className="text-left font-semibold py-2 px-3 border-b border-gray-100">Obra social</th>
              <th className="text-left font-semibold py-2 px-3 border-b border-gray-100">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr className="border-t border-gray-100">
                <td className="py-8 text-center text-gray-500" colSpan={6}>
                  <div className="flex flex-col items-center gap-2">
                    <i className="pi pi-calendar text-2xl text-gray-400" />
                    <span>No hay turnos para los filtros seleccionados.</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((t, idx) => (
                <tr
                  key={t.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 ? "bg-gray-50/40" : "bg-white"}`}
                >
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">{t.pacienteDni}</span>
                      <span className="text-gray-600">{t.pacienteNombre}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                      <i className="pi pi-clock mr-1 text-xs" />
                      <span className="tabular-nums">{t.hora}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="text-gray-900">{t.especialidad}</span>
                      <span className="text-gray-600">{t.profesional}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      {t.tipoConsulta}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      {t.obraSocial}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Button icon="pi pi-clock" rounded text aria-label="reprogramar" />
                      <Button icon="pi pi-check" rounded text aria-label="confirmar" severity="success" />
                      <Button icon="pi pi-ellipsis-h" rounded text aria-label="mas" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
