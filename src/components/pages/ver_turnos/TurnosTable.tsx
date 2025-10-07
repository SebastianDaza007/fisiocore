import React, { useRef, useState } from "react";
import { Turno } from "./types";
import Button from "@/components/common/button";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { OverlayPanel } from "primereact/overlaypanel";

type Props = {
  items?: Turno[];
  onChangeEstado?: (idTurno: number, estado: string) => void;
};

// ✅ Chip de estado con colores
function EstadoChip({ estado }: { estado?: string }) {
  const base = "inline-flex px-2 py-1 rounded-full text-xs font-medium";

  switch (estado) {
    case "CONFIRMADO":
      return <span className={`${base} bg-green-100 text-green-700`}>Confirmado</span>;
    case "NO ASISTIDO":
      return <span className={`${base} bg-gray-200 text-gray-700`}>No Asistido</span>;
    case "EN ESPERA":
      return <span className={`${base} bg-blue-100 text-blue-700`}>En Espera</span>;
    case "CANCELADO":
      return <span className={`${base} bg-red-100 text-red-700`}>Cancelado</span>;
    case "COMPLETADO":
      return <span className={`${base} bg-emerald-200 text-emerald-800`}>Completado</span>;
    default:
      return <span className={`${base} bg-slate-100 text-slate-700`}>Pendiente</span>;
  }
}

export default function TurnosTable({ items = [], onChangeEstado }: Props) {
  const opRef = useRef<OverlayPanel>(null);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);

  // Menú dinámico según turno seleccionado
  const menuItems: MenuItem[] = [
    {
      label: "Marcar como No Asistido",
      icon: "pi pi-times-circle",
      command: () => {
        if (selectedTurno) onChangeEstado?.(selectedTurno.id, "NO ASISTIDO");
        opRef.current?.hide();
      },
    },
    {
      label: "Marcar como En Espera",
      icon: "pi pi-hourglass",
      command: () => {
        if (selectedTurno) onChangeEstado?.(selectedTurno.id, "EN ESPERA");
        opRef.current?.hide();
      },
    },
    {
      label: "Marcar como Cancelado",
      icon: "pi pi-ban",
      command: () => {
        if (selectedTurno) onChangeEstado?.(selectedTurno.id, "CANCELADO");
        opRef.current?.hide();
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* Overlay con menú */}
      <OverlayPanel ref={opRef}>
        <Menu model={menuItems} />
      </OverlayPanel>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-700 bg-gray-50">
              <th className="text-left font-semibold py-2 px-3 border-b">Paciente</th>
              <th className="text-left font-semibold py-2 px-3 border-b">Horario</th>
              <th className="text-left font-semibold py-2 px-3 border-b">Especialidad / Profesional</th>
              <th className="text-left font-semibold py-2 px-3 border-b">Tipo de Consulta</th>
              <th className="text-left font-semibold py-2 px-3 border-b">Obra social</th>
              <th className="text-left font-semibold py-2 px-3 border-b">Estado</th>
              <th className="text-left font-semibold py-2 px-3 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="py-8 text-center text-gray-500" colSpan={7}>
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
                  className={`border-b transition-colors hover:bg-gray-50 ${
                    idx % 2 ? "bg-gray-50/40" : "bg-white"
                  }`}
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
                    {/* Estado del turno */}
                    <EstadoChip estado={t.estado} />
                  </td>
                  <td className="py-3 px-3">
                    <Button
                      icon="pi pi-ellipsis-h"
                      rounded
                      text
                      aria-label="cambiar estado"
                      onClick={(e) => {
                        setSelectedTurno(t);
                        opRef.current?.toggle(e);
                      }}
                    />
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
