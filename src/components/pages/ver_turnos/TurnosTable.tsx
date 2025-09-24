"use client";

import React from "react";
import { Turno } from "./types";
import Button from "@/components/common/button";

const MOCK_TURNOS: Turno[] = [
  {
    id: "1",
    pacienteDni: "44444423",
    pacienteNombre: "Juan Doe",
    hora: "08:00",
    especialidad: "Kinesiologo",
    profesional: "Dr. Lautaro Papiruna",
    tipoConsulta: "Tratamiento",
    obraSocial: "Osde",
  },
  {
    id: "2",
    pacienteDni: "42224423",
    pacienteNombre: "A. Padrino",
    hora: "08:00",
    especialidad: "Fisioterapeuta",
    profesional: "Dr. Musa Rella",
    tipoConsulta: "Tratamiento",
    obraSocial: "Sin obra social",
  },
  {
    id: "3",
    pacienteDni: "42224423",
    pacienteNombre: "Juana Dai",
    hora: "09:00",
    especialidad: "Kinesiologo",
    profesional: "Dr. Lautaro Papiruna",
    tipoConsulta: "Otra Consulta",
    obraSocial: "IPS",
  },
];

type Props = {
  items?: Turno[];
};

export default function TurnosTable({ items = MOCK_TURNOS }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left font-semibold pb-3">Paciente</th>
              <th className="text-left font-semibold pb-3">Horario</th>
              <th className="text-left font-semibold pb-3">Especialidad</th>
              <th className="text-left font-semibold pb-3">Tipo de Consulta</th>
              <th className="text-left font-semibold pb-3">Obra social</th>
              <th className="text-left font-semibold pb-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="py-3">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium">{t.pacienteDni}</span>
                    <span className="text-gray-600">{t.pacienteNombre}</span>
                  </div>
                </td>
                <td className="py-3">{t.hora}</td>
                <td className="py-3">
                  <div className="flex flex-col">
                    <span className="text-gray-900">{t.especialidad}</span>
                    <span className="text-gray-600">{t.profesional}</span>
                  </div>
                </td>
                <td className="py-3">{t.tipoConsulta}</td>
                <td className="py-3">{t.obraSocial}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Button icon="pi pi-clock" rounded text aria-label="reprogramar" />
                    <Button icon="pi pi-check" rounded text aria-label="confirmar" severity="success" />
                    <Button icon="pi pi-ellipsis-h" rounded text aria-label="mas" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
