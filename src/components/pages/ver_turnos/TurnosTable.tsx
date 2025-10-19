import React, { useRef, useState } from "react";
import { Turno } from "./types";
import Button from "@/components/common/button";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { OverlayPanel } from "primereact/overlaypanel";

type Props = {
  items?: Turno[];
  onChangeEstado?: (idTurno: number, estado: string) => void;
  onReprogramar?: (turno: Turno) => void;
};

export default function TurnosTable({ items = [], onChangeEstado, onReprogramar }: Props) {
  const opRef = useRef<OverlayPanel>(null);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);

  // Menú dinámico según turno seleccionado
  const getMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [];

    // Solo mostrar "Reprogramar" si el estado es CONFIRMADO
    if (selectedTurno?.estado === "CONFIRMADO") {
      items.push({
        label: "Reprogramar",
        icon: "pi pi-calendar-plus",
        command: () => {
          if (selectedTurno) onReprogramar?.(selectedTurno);
          opRef.current?.hide();
        },
      });
      items.push({ separator: true });
    }

    // Opciones de cambio de estado (siempre disponibles)
    items.push(
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
      }
    );

    return items;
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* Overlay con menú */}
      <OverlayPanel ref={opRef}>
        <Menu model={getMenuItems()} />
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
                    <span className="text-gray-900">{t.hora}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="text-gray-900">{t.especialidad}</span>
                      <span className="text-gray-600">{t.profesional}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-gray-900">{t.tipoConsulta}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-gray-900">{t.obraSocial}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-gray-900">{t.estado}</span>
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
