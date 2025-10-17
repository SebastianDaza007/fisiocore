"use client";

import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
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
  const [loading, setLoading] = useState(false);
  const [originalEmail, setOriginalEmail] = useState<string>("");
  const [originalDomicilio, setOriginalDomicilio] = useState<string>("");
  const [originalTelefono, setOriginalTelefono] = useState<string>("");
  const [originalObra, setOriginalObra] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [changesPreview, setChangesPreview] = useState<string[]>([]);
  const [pendingPayload, setPendingPayload] = useState<{
    id_paciente: number;
    email_paciente?: string | null;
    direccion_paciente?: string | null;
    telefono_paciente?: string | null;
    obra_social?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !paciente) return;

    // Cargar datos completos del paciente desde la BD
    const loadPacienteData = async () => {
      try {
        setLoading(true);
        const [osRes, pacientesRes] = await Promise.all([
          fetch('/api/obras_sociales'),
          fetch('/api/paciente'),
        ]);

        // Cargar opciones de obras sociales
        const osData = await osRes.json();
        const opts: ObraOption[] = Array.isArray(osData)
          ? osData.map((o: { nombre_obra_social: string }) => ({ label: o.nombre_obra_social, value: o.nombre_obra_social }))
          : [];
        setObraOptions(opts);

        // Buscar datos completos del paciente
        if (pacientesRes.ok) {
          const list = await pacientesRes.json();
          const found = Array.isArray(list)
            ? list.find((p: {
                id_paciente: number;
                email_paciente?: string | null;
                direccion_paciente?: string | null;
                telefono_paciente?: string | null;
                obras_sociales?: { nombre_obra_social: string };
              }) => Number(p.id_paciente) === Number(paciente.id_paciente))
            : null;

          if (found) {
            // Cargar datos del paciente desde la BD
            const emailBD = found.email_paciente ?? "";
            const domicilioBD = found.direccion_paciente ?? "";
            const telefonoBD = found.telefono_paciente ?? "";
            const obraBD = found.obras_sociales?.nombre_obra_social ?? null;

            setEmail(emailBD);
            setDomicilio(domicilioBD);
            setTelefono(telefonoBD);
            setObra(obraBD);

            // Guardar valores originales para comparación
            setOriginalEmail(emailBD);
            setOriginalDomicilio(domicilioBD);
            setOriginalTelefono(telefonoBD);
            setOriginalObra(obraBD);
          }
        }
      } catch (e) {
        console.error('Error cargando datos del paciente:', e);
        setObraOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPacienteData();
  }, [isOpen, paciente]);

  if (!isOpen || !paciente) return null;

  const nombreCompleto = `${paciente.nombre_paciente} ${paciente.apellido_paciente}`.trim();

  const handleSave = async () => {
    const norm = (v: string | null | undefined) => {
      const t = typeof v === 'string' ? v.trim() : v ?? null;
      return t === '' ? null : t;
    };

    // Usar los valores originales cargados desde la BD
    const oldEmail = norm(originalEmail);
    const newEmail = norm(email);
    const oldDom = norm(originalDomicilio);
    const newDom = norm(domicilio);
    const oldTel = norm(originalTelefono);
    const newTel = norm(telefono);
    const oldObra = norm(originalObra);
    const newObra = norm(obra);

    const changes: string[] = [];
    if (oldEmail !== newEmail) changes.push(`- Correo: ${oldEmail ?? '-'} -> ${newEmail ?? '-'}`);
    if (oldDom !== newDom) changes.push(`- Domicilio: ${oldDom ?? '-'} -> ${newDom ?? '-'}`);
    if (oldTel !== newTel) changes.push(`- Teléfono: ${oldTel ?? '-'} -> ${newTel ?? '-'}`);
    if (oldObra !== newObra) changes.push(`- Obra social: ${oldObra ?? '-'} -> ${newObra ?? '-'}`);

    if (changes.length === 0) {
      window.alert('No hay cambios para guardar.');
      return;
    }

    // Construir payload solo con campos modificados
    const payload: {
      id_paciente: number;
      email_paciente?: string | null;
      direccion_paciente?: string | null;
      telefono_paciente?: string | null;
      obra_social?: string | null;
    } = { id_paciente: paciente.id_paciente };

    if (oldEmail !== newEmail) payload.email_paciente = newEmail;
    if (oldDom !== newDom) payload.direccion_paciente = newDom;
    if (oldTel !== newTel) payload.telefono_paciente = newTel;
    if (oldObra !== newObra) payload.obra_social = newObra;

    // Mostrar ventana blanca (modal) con detalle de cambios
    setChangesPreview(changes);
    setPendingPayload(payload);
    setConfirmVisible(true);
  };

  const handleConfirmAccept = async () => {
    if (!pendingPayload) return;
    try {
      setSaving(true);
      await onSave(pendingPayload);
      setConfirmVisible(false);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      setPendingPayload(null);
      setChangesPreview([]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={() => { if (!confirmVisible) onClose(); }}
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
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <i className="pi pi-spin pi-spinner text-3xl text-teal-600"></i>
              <span className="ml-3 text-gray-600">Cargando datos...</span>
            </div>
          ) : (
            <>
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
                    disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm text-gray-700">Teléfono*</label>
                <InputText
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="XXXXXXXXXX"
                  className="w-full"
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </>
          )}

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
            disabled={saving || loading}
          />
        </div>
      </div>
      {/* Confirm Dialog */}
      <Dialog
        visible={confirmVisible}
        onHide={() => setConfirmVisible(false)}
        header="Confirmar cambios"
        style={{ width: '32rem' }}
        modal
        closable={!saving}
      >
        <div className="space-y-3">
          <p className="text-gray-700">Vas a registrar los siguientes cambios en los datos del paciente:</p>
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            {changesPreview.map((c, idx) => (
              <div key={idx} className="text-sm text-gray-800 whitespace-pre-wrap">{c}</div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            label="Cancelar"
            className="p-button-danger p-button-outlined w-full sm:w-auto"
            onClick={() => setConfirmVisible(false)}
            disabled={saving}
          />
          <Button
            label={saving ? "Guardando..." : "Confirmar"}
            icon="pi pi-check"
            className="p-button-success w-full sm:w-auto"
            onClick={handleConfirmAccept}
            disabled={saving}
          />
        </div>
      </Dialog>
    </div>
  );
}
