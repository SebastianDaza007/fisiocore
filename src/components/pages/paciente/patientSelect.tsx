'use client';
import React, { useEffect, useState } from 'react';

interface Paciente {
  id_paciente: number;
  dni_paciente: string;
  nombre_paciente: string;
  apellido_paciente: string;
}

interface Props {
  selected?: { id_paciente?: number; nombre?: string } | null;
  onSelect: (p: { id_paciente?: number; nombre?: string } | null) => void;
  onOpenAdd: () => void;
}

export default function PatientSelect({ selected, onSelect, onOpenAdd }: Props) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPacientes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/paciente');
      if (res.ok) {
        const data = await res.json();
        setPacientes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
    const handler = () => fetchPacientes();
    window.addEventListener('paciente:registrado', handler);
    return () => window.removeEventListener('paciente:registrado', handler);
  }, []);

  const filtered = pacientes.filter((p) => {
    const full = `${p.nombre_paciente} ${p.apellido_paciente} ${p.dni_paciente}`.toLowerCase();
    return full.includes(q.toLowerCase());
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Paciente</label>
      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Buscar por nombre o DNI"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={onOpenAdd} className="px-3 py-2 bg-blue-600 text-white rounded">Agregar paciente</button>
      </div>

      <div className="mt-3">
        {loading ? <div>Cargando...</div> : (
          <ul className="max-h-40 overflow-auto border rounded p-2">
            {filtered.map((p) => (
              <li key={p.id_paciente} className={`p-2 rounded hover:bg-gray-100 cursor-pointer ${selected?.id_paciente === p.id_paciente ? 'bg-gray-100' : ''}`}
                  onClick={() => onSelect({ id_paciente: p.id_paciente, nombre: `${p.nombre_paciente} ${p.apellido_paciente}` })}>
                <div className="text-sm font-medium">{p.nombre_paciente} {p.apellido_paciente}</div>
                <div className="text-xs text-gray-500">DNI: {p.dni_paciente}</div>
              </li>
            ))}
            {filtered.length === 0 && <div className="text-sm text-gray-500">No hay pacientes</div>}
          </ul>
        )}
      </div>
    </div>
  );
}
