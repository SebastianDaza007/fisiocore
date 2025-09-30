'use client';
import React, { useState } from 'react';

interface Props {
  paciente: { id_paciente?: number; nombre?: string } | null;
}

export default function TurnoForm({ paciente }: Props) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paciente?.id_paciente) {
      setMsg('Seleccione un paciente o agregue uno.');
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: paciente.id_paciente,
          profesional_id: 1, // reemplazar según contexto / auth
          fecha_turno: fecha, // 'YYYY-MM-DD'
          hora_turno: hora,   // 'HH:MM' o 'HH:MM:SS'
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setMsg('Turno creado correctamente');
        setFecha(''); setHora('');
      } else {
        setMsg(json?.error || 'Error creando turno');
      }
    } catch (err) {
      console.error(err);
      setMsg('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700">Paciente seleccionado</label>
        <div className="p-2 border rounded">{paciente?.nombre ?? <span className="text-gray-500">Ninguno</span>}</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="p-2 border rounded w-full"/>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Hora</label>
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="p-2 border rounded w-full"/>
      </div>

      {msg && <div className="text-sm text-red-600">{msg}</div>}

      <div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
          {loading ? 'Guardando...' : 'Crear Turno'}
        </button>
      </div>
    </form>
  );
}
