"use client";

import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Paciente } from "./PacienteTable";

interface PacienteEditDialogProps {
  isOpen: boolean;
  paciente: Paciente | null;
  onClose: () => void;
  onSave: (payload: {
    id_paciente: number;
    email_paciente?: string | null;
    direccion_paciente?: string | null;
    telefono_paciente?: string | null;
    obra_social?: string | null; // nombre simple por ahora
  }) => Promise<void> | void;
}

type ObraOption = { label: string; value: string };

export default function PacienteEditDialog({ isOpen, paciente, onClose, onSave }: PacienteEditDialogProps) {
  const [email, setEmail] = useState<string>("");
  const [domicilio, setDomicilio] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [obra, setObra] = useState<string | null>(null);
  const [obraOptions, setObraOptions] = useState<ObraOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !paciente) return;
    setEmail(paciente.email_paciente ?? "");
    setDomicilio(paciente.direccion_paciente ?? "");
    setTelefono(paciente.telefono_paciente ?? "");

    // Cargar obras sociales reales y preseleccionar la del paciente si está disponible
    const loadObras = async () => {
      try {
        const [osRes, pacientesRes] = await Promise.all([
          fetch('/api/obras_sociales'),
          fetch('/api/paciente'),
        ]);
        const osData = await osRes.json();
        const opts: ObraOption[] = Array.isArray(osData)
          ? osData.map((o: any) => ({ label: o.nombre_obra_social, value: o.nombre_obra_social }))
          : [];
        setObraOptions(opts);

        let currentObra: string | null = null;
        if (pacientesRes.ok) {
          const list = await pacientesRes.json();
          const found = Array.isArray(list)
            ? list.find((p: any) => Number(p.id_paciente) === Number(paciente.id_paciente))
            : null;
          currentObra = found?.obras_sociales?.nombre_obra_social ?? null;
        }
        setObra(currentObra);
      } catch (e) {
        console.error(e);
        setObraOptions([]);
        setObra(null);
      }
    };
    loadObras();
  }, [isOpen, paciente]);

  if (!isOpen || !paciente) return null;

  const nombreCompleto = `${paciente.nombre_paciente} ${paciente.apellido_paciente}`.trim();

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        id_paciente: paciente.id_paciente,
        email_paciente: email || null,
        direccion_paciente: domicilio || null,
        telefono_paciente: telefono || null,
        obra_social: obra || null,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-gray-900">Editar datos de {nombreCompleto || "-"}</h3>
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
          <div className="space-y-3">
            <label className="text-sm text-gray-700">Correo*</label>
            <span className="p-input-icon-left w-full">
              <i className="pi pi-envelope text-gray-700" style={{ paddingLeft: '1rem' }} />
              <InputText
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@paciente"
                className="w-full"
                style={{ paddingLeft: '2.5rem' }}
              />
            </span>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-gray-700">Domicilio*</label>
            <InputText
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
              placeholder="Domicilio del paciente"
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm text-gray-700">Teléfono*</label>
            <InputText
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="XXXXXXXXXX"
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm text-gray-700">Obra social</label>
            <Dropdown
              value={obra}
              options={obraOptions}
              onChange={(e) => setObra(e.value)}
              placeholder="Seleccionar"
              className="w-full"
              filter
              showClear
              emptyMessage="Sin obras sociales"
            />
          </div>

          <div className="pt-2">
            <Button
              className="w-full p-button-secondary"
              label="Solicitar edición de datos sensibles"
              icon="pi pi-shield"
              type="button"
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
          <Button
            label="Cancelar"
            className="p-button-danger p-button-outlined w-full sm:w-1/2"
            onClick={onClose}
            type="button"
          />
          <Button
            label={saving ? "Guardando..." : "Registrar"}
            icon="pi pi-check"
            className="p-button-success w-full sm:w-1/2"
            onClick={handleSave}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}
